import marked from "marked";

const fontSize = window.innerWidth > 1000 ? 14 : 18;

const Popup = ({
  content = [],
  styles = {},
  isOpen = true,
  onClose,
  title,
  theme = "light",
  children,
}) => (
  <div>
    <div
      className={`infopopup__bg ${isOpen ? "" : "hidden"}`}
      onClick={onClose}
    ></div>
    <div
      className={`infopopup ${isOpen ? "" : "hidden"} ${
        theme === "dark" ? "dark" : "light"
      }`}
      style={{ ...styles, fontSize }}
    >
      <div className="legend-header">
        <button
          onClick={onClose}
          className="side-menu-burg over-white is-active"
        >
          <span />
        </button>
        <h2>{title}</h2>
      </div>
      {content.map((t, idx) => (
        <div key={idx} dangerouslySetInnerHTML={{ __html: marked(t) }} />
      ))}
      {children}
    </div>
  </div>
);

export default Popup;
