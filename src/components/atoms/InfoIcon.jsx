import React from "react";

const CoverIcon = ({ isActive, isDisabled, onClickHandler }) => {
  let classes = isActive ? "action-button enabled" : "action-button";
  if (isDisabled) {
    classes = "action-button disabled";
  }

  return (
    <button className={classes} onClick={onClickHandler}>
      <i className="material-icons">info</i>
    </button>
  );
};

export default CoverIcon;
