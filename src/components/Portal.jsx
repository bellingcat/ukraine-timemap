import React from "react";
import ReactDOM from "react-dom";

class Portal extends React.Component {
  render() {
    const { children, node } = this.props;
    if (!node) return null;
    return ReactDOM.createPortal(children, node);
  }
}

export default Portal;
