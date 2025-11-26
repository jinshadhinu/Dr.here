import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <h1>Dashboard</h1>
      </div>
    </div>
  );
}
