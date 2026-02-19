import "./ProfileVolunteer.css";
import { useNavigate, Link } from "react-router-dom";

const ProfileVolunteer = () => {
  const navigate = useNavigate()
  const handleLogout = () => {
    // Remove stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Optional: clear everything (use only if you store nothing else)


    // Redirect to login page
    navigate("/login");
  };
  return (
    <div className="profile-container p-6 relative">
      <div className="absolute top-6 left-6">
        <Link to="/">
          <img src="/logo.svg" alt="SkillBridge Logo" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="profile-header">
        <img
          src="https://via.placeholder.com/120"
          alt="Volunteer"
          className="profile-img"
        />
        <h2>Kushagra Singh</h2>
        <span className="role-badge volunteer">Volunteer</span>
      </div>

      <div className="profile-card">
        <h3>Personal Information</h3>
        <p><strong>Email:</strong> kushagra@gmail.com</p>
        <p><strong>Phone:</strong> 98xxxxxxx</p>
        <p><strong>Location:</strong> Lucknow</p>
      </div>

      <div className="profile-card">
        <h3>Skills & Interests</h3>
        <div className="tags">
          <span>Teaching</span>
          <span>Event Management</span>
          <span>Social Work</span>
        </div>
      </div>

      <div className="profile-card">
        <h3>Availability</h3>
        <p>Weekends</p>
        <p>10:00 AM – 4:00 PM</p>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileVolunteer;
