import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Users() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <h1>Users List</h1>
      </div>
    </div>
  );
}
