export default function Navbar() {
  return (
    <div className="navbar">
      <h3>Hospital Booking Admin</h3>
      <button onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }}>
        Logout
      </button>
    </div>
  );
}
