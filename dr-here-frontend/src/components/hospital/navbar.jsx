import "./navbar.css";
import { logoutHospital } from "../../utils/hospital";

const handleLogout = () => {
  logoutHospital();
  navigate("/login");

};

import { getHospital } from "../../utils/hospital";

const hospital = getHospital();
<span>{hospital?.name}</span>



function Navbar() {
  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <h1 className="nav-title">Dr.Here</h1>
      </div>

      <div className="nav-right">
        <span className="hospital-name">City Hospital</span>
        <img
          src="/profile.png"
          className="profile-img"
          alt="Profile"
        />
      </div>
    </nav>
  );
}

export default Navbar;
