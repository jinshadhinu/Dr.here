import "./PatientSettings.css";
import { useTheme } from "../../context/ThemeContext.jsx";

function PatientSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Personalize how Dr.Here looks and feels.</p>
      </div>

      <div className="settings-card">
        <h2>Appearance</h2>
        <p className="settings-description">
          Choose between light and dark theme. This will apply to your entire patient portal.
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

export default PatientSettings;

