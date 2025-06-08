import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Award, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: "participant",
      title: "Participant",
      description: "Join hackathons, form teams, and build amazing projects",
      icon: <Users className="w-6 h-6" />,
      features: [
        "Join hackathons",
        "Form teams",
        "Submit projects",
        "Win prizes",
      ],
      badge: "Popular",
    },
    {
      id: "judge",
      title: "Judge",
      description:
        "Evaluate projects and provide expert feedback to participants",
      icon: <Award className="w-6 h-6" />,
      features: [
        "Review submissions",
        "Score projects",
        "Give feedback",
        "Select winners",
      ],
      badge: "Expert",
    },
    {
      id: "organizer",
      title: "Organizer",
      description: "Create and manage hackathons, set challenges and prizes",
      icon: <Building className="w-6 h-6" />,
      features: [
        "Create hackathons",
        "Manage events",
        "Set prizes",
        "Invite judges",
      ],
      badge: "Host",
    },
  ];

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }

    if (!user) {
      setError("Please sign in to continue");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ role: selectedRole }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        navigate(`/profile/${selectedRole}`);
      } else {
        setError(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Role selection error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Choose Your Role</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Select how you'd like to participate in the VHack community
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 max-w-md mx-auto">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 border ${
                selectedRole === role.id
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-white/70">{role.icon}</div>
                  <Badge className="bg-white/10 border-white/20 text-white/90 hover:bg-white/20">
                    {role.badge}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white text-xl">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-white/60 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            size="lg"
            className="px-8 py-4 bg-white text-zinc-950 hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
