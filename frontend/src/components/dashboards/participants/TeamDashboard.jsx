import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Users, Copy, Send } from "lucide-react";

const TeamDashboard = () => {
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/teams/hackathon/${hackathonId}/my`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (data.success) setTeam(data.data);
        else toast.error("Failed to load team");
      } catch (err) {
        toast.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTeam();
  }, [user, hackathonId]);

  const handleCopy = () => {
    if (team?.joinCode) {
      navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Project submission logic placeholder
  const handleSubmitProject = () => {
    toast.success("Project submission coming soon!");
  };

  if (loading || !team) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Your Team</h1>
        <div className="bg-zinc-900 rounded-lg p-6 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-semibold">{team.name}</div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-mono">
                {team.joinCode}
              </span>
              <button
                onClick={handleCopy}
                className="ml-2 p-1 rounded hover:bg-zinc-800"
                title="Copy Code"
              >
                <Copy className="h-4 w-4 text-white" />
              </button>
              {copied && (
                <span className="text-green-400 text-xs ml-2">Copied!</span>
              )}
            </div>
          </div>
          <div className="text-white/70 mb-2">{team.description}</div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-sm">
              Members:{" "}
              {team.members
                .map((m) => m.user.displayName || m.user.email)
                .join(", ")}
            </span>
          </div>
        </div>
        <button
          onClick={handleSubmitProject}
          className="w-full py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          <Send className="h-5 w-5" />
          Submit Project
        </button>
      </div>
    </div>
  );
};

export default TeamDashboard;