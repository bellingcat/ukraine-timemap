import createEventSchema from "./eventSchema";
import siteSchema from "./siteSchema";
import associationsSchema from "./associationsSchema";
import sourceSchema from "./sourceSchema";
import regionSchema from "./regionSchema";
import shapeSchema from "./shapeSchema";

import { calcDatetime, capitalize } from "../../common/utilities";

/*
 * Create an error notification object
 * Types: ['error', 'warning', 'good', 'neural']
 */
function makeError(type, id, message) {
  return {
    type: "error",
    id,
    message: `${type} ${id}: ${message}`,
  };
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function findDuplicateAssociations(associations) {
  const seenSet = new Set([]);
  const duplicates = [];
  associations.forEach((item) => {
    if (seenSet.has(item.id)) {
      duplicates.push({
        id: item.id,
        error: makeError(
          "Association",
          item.id,
          "association was found more than once. Ignoring duplicate."
        ),
      });
    } else {
      seenSet.add(item.id);
    }
  });
  return duplicates;
}

/*
 * Validate domain schema
 */
export function validateDomain(domain, features) {
  const sanitizedDomain = {
    events: [],
    sites: [],
    associations: [],
    sources: {},
    regions: [],
    shapes: [],
    notifications: domain ? domain.notifications : null,
  };

  if (domain === undefined) {
    return sanitizedDomain;
  }

  const discardedDomain = {
    events: [],
    sites: [],
    associations: [],
    sources: [],
    regions: [],
    shapes: [],
  };

  function validateArrayItem(item, domainKey, schema) {
    const result = schema.validate(item);
    if (result.error != null) {
      const id = item.id || "-";
      const domainStr = capitalize(domainKey);
      const error = makeError(domainStr, id, result.error.message);

      discardedDomain[domainKey].push(Object.assign(item, { error }));
    } else {
      sanitizedDomain[domainKey].push(item);
    }
  }

  function validateArray(items, domainKey, schema) {
    items.forEach((item) => {
      if (domainKey === "events" && item.date === "" && item.time === "")
        return;
      validateArrayItem(item, domainKey, schema);
    });
  }

  function validateObject(obj, domainKey, itemSchema) {
    Object.keys(obj).forEach((key) => {
      if (key === "") return;
      const vl = obj[key];
      const result = itemSchema.validate(vl);
      if (result.error != null) {
        const id = vl.id || "-";
        const domainStr = capitalize(domainKey);
        discardedDomain[domainKey].push({
          ...vl,
          error: makeError(domainStr, id, result.error.message),
        });
      } else {
        sanitizedDomain[domainKey][key] = vl;
      }
    });
  }

  if (!Array.isArray(features.CUSTOM_EVENT_FIELDS)) {
    features.CUSTOM_EVENT_FIELDS = [];
  }

  const eventSchema = createEventSchema(features.CUSTOM_EVENT_FIELDS);
  validateArray(domain.events, "events", eventSchema);
  validateArray(domain.sites, "sites", siteSchema);
  validateArray(domain.associations, "associations", associationsSchema);
  validateObject(domain.sources, "sources", sourceSchema);
  validateArray(domain.regions, "regions", regionSchema);
  validateArray(domain.shapes, "shapes", shapeSchema);

  // NB: [lat, lon] array is best format for projecting into map
  sanitizedDomain.regions = sanitizedDomain.regions.map((region) => ({
    name: region.name,
    points: region.items.map((coords) => coords.replace(/\s/g, "").split(",")),
  }));

  sanitizedDomain.shapes = sanitizedDomain.shapes.reduce((acc, val) => {
    if (!val.shape) {
      discardedDomain.shapes.push({
        ...val,
        error: makeError(
          "events",
          val.id,
          "Invalid event shape. Please specify a shape for this type of event."
        ),
      });
    } else {
      acc.push(val);
    }
    return acc;
  }, []);

  const duplicateAssociations = findDuplicateAssociations(domain.associations);
  // Duplicated associations
  if (duplicateAssociations.length > 0) {
    sanitizedDomain.notifications.push({
      message:
        "Associations are required to be unique. Ignoring duplicates for now.",
      items: duplicateAssociations,
      type: "error",
    });
  }
  sanitizedDomain.associations = domain.associations;

  // append events with datetime and sort
  sanitizedDomain.events = sanitizedDomain.events.filter((event, idx) => {
    let errorMsg = "";
    event.civId = event.id;
    event.id = idx;
    // event.associations comes in as a [association.ids...]; convert to actual association objects
    event.associations = event.associations.reduce((acc, id) => {
      const foundAssociation = sanitizedDomain.associations.find(
        (elem) => elem.id === id
      );
      if (foundAssociation) acc.push(foundAssociation);
      return acc;
    }, []);

    if (event.shape) {
      const relatedShapeObj = sanitizedDomain.shapes.find(
        (elem) => elem.id === event.shape
      );
      if (!relatedShapeObj)
        errorMsg =
          "Failed to find related shape. Please verify shape type for event.";
      else {
        event.shape = relatedShapeObj;
      }
    }
    // if lat, long come in with commas, replace with decimal format
    event.latitude = event.latitude.replace(",", ".");
    event.longitude = event.longitude.replace(",", ".");

    event.datetime = calcDatetime(event.date, event.time);
    if (!isValidDate(event.datetime))
      errorMsg =
        "Invalid date. It's been dropped, as otherwise timemap won't work as expected.";

    if (errorMsg) {
      discardedDomain.events.push({
        ...event,
        error: makeError("events", event.id, errorMsg),
      });
      return false;
    }
    return true;
  });

  sanitizedDomain.events.sort((a, b) => a.datetime - b.datetime);

  // Message the number of failed items in domain
  Object.keys(discardedDomain).forEach((disc) => {
    const len = discardedDomain[disc].length;
    if (len) {
      sanitizedDomain.notifications.push({
        message: `${len} invalid ${disc} not displayed.`,
        items: discardedDomain[disc],
        type: "error",
      });
    }
  });
  return sanitizedDomain;
}
