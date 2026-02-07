import LabSubNav from "../components/LabSubNav";
import "../lab.css";

export default function LabDashboard() {
  return (
    <div className="lab-root">
      <header>
        <h1>Welcome to the Dashboard</h1>
        <p>You have successfully logged in.</p>
        <LabSubNav />
      </header>
    </div>
  );
}
