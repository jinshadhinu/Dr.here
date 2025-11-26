import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Settings() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <h1>Settings</h1>
      </div>
    </div>
  );
}
