import { Component } from "react";
import ReactDOM from "react-dom";

class Portal extends Component {
  render() {
    const { children, node } = this.props;
    if (!node) return null;
    return ReactDOM.createPortal(children, node);
  }
}

export default Portal;
