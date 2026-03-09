import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
=======
>>>>>>> origin/main

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
<<<<<<< HEAD
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import CreateOpportunity from "./pages/CreateOpportunity";
import EditOpportunity from "./pages/EditOpportunity";
import ProfileEdit from "./pages/ProfileEdit";
import BrowseOpportunities from "./pages/BrowseOpportunities";
import MessagesPage from "./pages/MessagesPage";
import VolunteersPage from "./pages/VolunteersPage";
import NGORecentApplications from "./pages/NGORecentApplications";
import NGOOpportunitiesPage from "./pages/NGOOpportunitiesPage";
import NotificationsPage from "./pages/NotificationsPage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected NGO Routes */}
          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute role="ngo">
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-opportunity"
            element={
              <ProtectedRoute role="ngo">
                <CreateOpportunity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteers"
            element={
              <ProtectedRoute role="ngo">
                <VolunteersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo-recent-applications"
            element={
              <ProtectedRoute role="ngo">
                <NGORecentApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo-opportunities"
            element={
              <ProtectedRoute role="ngo">
                <NGOOpportunitiesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-opportunity/:id"
            element={
              <ProtectedRoute role="ngo">
                <EditOpportunity />
              </ProtectedRoute>
            }
          />

          {/* Protected Volunteer Routes */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute role="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/opportunities"
            element={
              <ProtectedRoute role="volunteer">
                <BrowseOpportunities />
              </ProtectedRoute>
            }
          />

          {/* Common Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
=======
import ProfileNGO from "./components/ProfileNgo";
import ProfileVolunteer from "./components/ProfileVolunteer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-ngo" element={<ProfileNGO />} />
        <Route path="/profile-volunteer" element={<ProfileVolunteer />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
>>>>>>> origin/main
  );
};

export default App;
<<<<<<< HEAD
=======


>>>>>>> origin/main
