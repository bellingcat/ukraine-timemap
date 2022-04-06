import React from "react";
import { drag as d3Drag, select } from "d3";

class TimelineCategories extends React.Component {
  constructor(props) {
    super(props);
    this.grabRef = React.createRef();
    this.state = {
      isInitialized: false,
    };
  }

  componentDidUpdate() {
    if (!this.state.isInitialized) {
      const drag = d3Drag()
        .on("start", this.props.onDragStart)
        .on("drag", this.props.onDrag)
        .on("end", this.props.onDragEnd);

      select(this.grabRef.current).call(drag);

      this.setState({ isInitialized: true });
    }
  }

  renderCategory(cat, idx) {
    const { features, dims } = this.props;
    const strokeWidth = 1; // dims.trackHeight / (this.props.categories.length + 1)
    if (
      features.GRAPH_NONLOCATED &&
      features.GRAPH_NONLOCATED.categories &&
      features.GRAPH_NONLOCATED.categories.includes(cat)
    ) {
      return null;
    }

    return (
      <>
        <g
          className="tick"
          style={{ strokeWidth }}
          opacity="0.5"
          transform={`translate(0,${this.props.getCategoryY(cat)})`}
        >
          <line x1={dims.marginLeft} x2={dims.width - dims.width_controls} />
        </g>
        <g
          className="tick"
          opacity="1"
          transform={`translate(0,${this.props.getCategoryY(cat)})`}
        >
          <text x={dims.marginLeft - 5} dy="0.32em">
            {cat}
          </text>
        </g>
      </>
    );
  }

  render() {
    const { dims, categories, fallbackLabel } = this.props;
    const categoriesExist = categories && categories.length > 0;
    const renderedCategories = categoriesExist
      ? categories.map((cat, idx) => this.renderCategory(cat, idx))
      : this.renderCategory(fallbackLabel, 0);

    return (
      <g className="yAxis">
        {renderedCategories}
        <rect
          ref={this.grabRef}
          className="drag-grabber"
          x={dims.marginLeft}
          y={dims.marginTop}
          width={Math.max(
            0,
            dims.width - dims.marginLeft - dims.width_controls
          )}
          height={dims.contentHeight}
        />
      </g>
    );
  }
}

export default TimelineCategories;
