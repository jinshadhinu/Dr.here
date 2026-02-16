import { useNavigate } from "react-router-dom";
import "./StatCard.css";

function StatCard({ title, value, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={handleClick}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default StatCard;
