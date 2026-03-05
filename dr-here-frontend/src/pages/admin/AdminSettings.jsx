import "./AdminSettings.css";
import { useTheme } from "../../context/ThemeContext.jsx";

function AdminSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Admin Settings</h1>
        <p>Configure how the admin dashboard looks.</p>
      </div>

      <div className="settings-card">
        <h2>Appearance</h2>
        <p className="settings-description">
          Switch between light and dark themes. This applies to the entire admin module.
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

export default AdminSettings;

