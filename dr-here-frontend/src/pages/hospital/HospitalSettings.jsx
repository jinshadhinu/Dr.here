import "./HospitalSettings.css";
import { useTheme } from "../../context/ThemeContext.jsx";

function HospitalSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Hospital Settings</h1>
        <p>Control how the hospital panel appears.</p>
      </div>

      <div className="settings-card">
        <h2>Appearance</h2>
        <p className="settings-description">
          Choose a theme for this device. The dark theme is easier on the eyes in low-light environments.
        </p>

        <div className="settings-row">
          <div className="settings-label">Theme</div>
          <div className="theme-toggle-group" role="group" aria-label="Theme selection">
            <button
              type="button"
              className={`theme-toggle ${theme === "light" ? "active" : ""}`}
              onClick={theme === "light" ? undefined : toggleTheme}
            >
              Light
            </button>
            <button
              type="button"
              className={`theme-toggle ${theme === "dark" ? "active" : ""}`}
              onClick={theme === "dark" ? undefined : toggleTheme}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalSettings;

