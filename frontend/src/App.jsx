import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SelectRole from "./pages/SelectRole";
import ParticipantProfile from "./pages/CreateParticipantProfile";
import JudgeProfile from "./pages/CreateJudgeProfile";
import OrganizerProfile from "./pages/CreateOrganizerProfile";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import OrganizerDashboard from "./components/dashboards/OrganizerDashboard";
import CreateHackathon from "./components/dashboards/organizer/CreateHackathon";
import AllotJudges from "./components/dashboards/organizer/AllotJudges";
import ViewHackathonDetails from "./components/dashboards/organizer/ViewHackathonDetails";
import EditHackathon from "./components/dashboards/organizer/EditHackathon";
import ParticipantHackathons from "./components/dashboards/participants/ParticipantHackathons";
import HackathonDetailsPage from "./components/dashboards/participants/HackathonDetailsPage";
import TeamDashboard from "./components/dashboards/participants/TeamDashboard";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/select-role"
            element={
              <ProtectedRoute>
                <SelectRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/participant"
            element={
              <ProtectedRoute requiresRole={false}>
                <ParticipantProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/judge"
            element={
              <ProtectedRoute requiresRole={false}>
                <JudgeProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/organizer"
            element={
              <ProtectedRoute requiresRole={false}>
                <OrganizerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiresRole={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute requiresRole={true}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create-hackathon"
            element={
              <ProtectedRoute requiresRole={true}>
                <CreateHackathon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/hackathon/:hackathonId/allot-judges"
            element={
              <ProtectedRoute requiresRole={true}>
                <AllotJudges />
              </ProtectedRoute>
            }
          />
          <Route path="/organizer/hackathon/:hackathonId" element={<ViewHackathonDetails />} />
          <Route path="/organizer/hackathon/:hackathonId/edit" element={<EditHackathon />} />
          <Route path="/participant/hackathon/:hackathonId" element={<HackathonDetailsPage />} />
          <Route path="/participant/hackathon/:hackathonId/team" element={<TeamDashboard />} />
          <Route
            path="/judge/dashboard"
            element={
              <ProtectedRoute requiresRole={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiresRole={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-white/70">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
