import React from "react";
import { useAuth } from "../contexts/AuthContext";
import ParticipantDashboard from "../components/dashboards/ParticipantDashboard";
import JudgeDashboard from "../components/dashboards/JudgeDashboard";
import OrganizerDashboard from "../components/dashboards/OrganizerDashboard";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/select-role" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case "participant":
      return <ParticipantDashboard />;
    case "judge":
      return <JudgeDashboard />;
    case "organizer":
      return <OrganizerDashboard />;
    default:
      return <Navigate to="/select-role" replace />;
  }
};

export default Dashboard;
