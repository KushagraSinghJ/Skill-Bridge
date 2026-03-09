// import "./ProfileNGO.css";
// import { useNavigate, Link } from "react-router-dom";

// const ProfileNGO = () => {

//   const navigate = useNavigate()
//   const handleLogout = () => {
//     // Remove stored auth data
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("role");

//     // Optional: clear everything (use only if you store nothing else)
//     // localStorage.clear();

//     // Redirect to login page
//     navigate("/login");
//   };
//   return (
//     <div className="profile-container p-6 relative">
//       <div className="absolute top-6 left-6">
//         <Link to="/">
//           <img src="/logo.svg" alt="SkillBridge Logo" className="h-8 w-auto" />
//         </Link>
//       </div>
//       <div className="profile-header">
//         <img
//           src="https://via.placeholder.com/120"
//           alt="NGO"
//           className="profile-img"
//         />
//         <h2>Helping Hands Foundation</h2>
//         <span className="role-badge ngo">NGO</span>
//       </div>

//       <div className="profile-card">
//         <h3>Organization Details</h3>
//         <p><strong>Email:</strong> helpinghands@gmail.com</p>
//         <p><strong>Phone:</strong> 9123456780</p>
//         <p><strong>Address:</strong> Cuttack, Odisha</p>
//       </div>

//       <div className="profile-card">
//         <h3>About NGO</h3>
//         <p>
//           We work towards education and empowerment of underprivileged
//           communities through volunteer-driven programs.
//         </p>
//       </div>
//       {/* profile card */}

//       <div className="profile-card">
//         <h3>Volunteer Requirements</h3>
//         <ul>
//           <li>Teaching Volunteers</li>
//           <li>Event Coordinators</li>
//           <li>Social Media Volunteers</li>
//         </ul>
//       </div>

//       <div className="profile-actions">
//         <button>Edit Profile</button>
//         <button className="logout" onClick={handleLogout}>Logout</button>
//       </div>
//     </div>
//   );
// };

// export default ProfileNGO;
import React, { useState, useEffect } from "react";
import "./ProfileNGO.css";
import { useNavigate } from "react-router-dom";

const ProfileNGO = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/user/me", {
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://via.placeholder.com/120"
          alt="NGO"
          className="profile-img"
        />
        <h2>{userData.username}</h2>
        <span className="role-badge ngo">{userData.role}</span>
      </div>

      <div className="profile-card">
        <h3>Organization Details</h3>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Location:</strong> {userData.location || "Not specified"}</p>
      </div>

      <div className="profile-card">
        <h3>About NGO</h3>
        <p>
          {userData.organization_description || "No description available."}
        </p>
      </div>

      <div className="profile-actions">
        <button>Edit Profile</button>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default ProfileNGO;
