import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SelectRole from "./pages/SelectRole";
import ParticipantProfile from "./pages/ParticipantProfile";
import JudgeProfile from "./pages/JudgeProfile";
import OrganizerProfile from "./pages/OrganizerProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes */}
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
                <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                  <h1 className="text-4xl">Dashboard - Coming Soon</h1>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
