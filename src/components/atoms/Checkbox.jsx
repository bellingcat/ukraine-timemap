import { DEFAULT_CHECKBOX_COLOR } from "../../common/constants";

const Checkbox = ({ label, isActive, onClickCheckbox, color, styleProps }) => {
  const checkboxColor = color ? color : DEFAULT_CHECKBOX_COLOR;
  const baseStyles = {
    checkboxStyles: {
      background: isActive ? checkboxColor : "none",
      border: `1px solid ${checkboxColor}`,
    },
  };
  const containerStyles = styleProps ? styleProps.containerStyles : {};
  const checkboxStyles = styleProps
    ? styleProps.checkboxStyles
    : baseStyles.checkboxStyles;

  const generatedId = label.toLowerCase().replaceAll(" ", "-");
  const onClickCheckboxWrapper = (e) => {
    // stop propagation in order to call method only one time
    e.stopPropagation();
    onClickCheckbox(e);
  };
  return (
    <div
      className={isActive ? "item active" : "item"}
      onClick={onClickCheckboxWrapper}
    >
      <button id={generatedId} onClick={onClickCheckboxWrapper}>
        <div className="border" style={containerStyles}>
          <div className="checkbox" style={checkboxStyles} />
        </div>
      </button>
      <label htmlFor={generatedId} style={{ color: color }}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
