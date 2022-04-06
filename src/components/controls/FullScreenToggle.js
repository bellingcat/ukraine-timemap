import React from "react";
import screenfull from "screenfull";
import { ToolbarButton } from "./atoms/ToolbarButton";
import { translateTo } from "../translate.js";

export class FullscreenToggle extends React.Component {
  constructor(props) {
    super(props);

    this.onFullscreenStateChange = this.onFullscreenStateChange.bind(this);

    this.state = {
      isFullscreen: screenfull.isFullscreen,
    };
  }

  componentDidMount() {
    screenfull.on("change", this.onFullscreenStateChange);
  }

  componentWillUnmount() {
    screenfull.off("change", this.onFullscreenStateChange);
  }

  onFullscreenStateChange(evt) {
    this.setState({ isFullscreen: screenfull.isFullscreen });
  }

  onToggleFullscreen() {
    screenfull.toggle().catch(console.warn);
  }

  render() {
    if (!screenfull.isEnabled) return null;

    const translate = translateTo(this.props.language);
    const { isFullscreen } = this.state;

    return (
      <ToolbarButton
        isActive={isFullscreen}
        label={
          isFullscreen
            ? translate("toolbar.fullscreen_exit")
            : translate("toolbar.fullscreen_enter")
        }
        iconKey={isFullscreen ? "fullscreen_exit" : "fullscreen"}
        onClick={this.onToggleFullscreen}
      />
    );
  }
}
