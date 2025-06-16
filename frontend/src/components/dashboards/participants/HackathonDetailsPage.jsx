import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Calendar, Users, Trophy } from "lucide-react";

const HackathonDetailsPage = () => {
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        // Get hackathon details
        const hackRes = await fetch(
          `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const hackData = await hackRes.json();
        setHackathon(hackData.data);

        // Get user's team for this hackathon
        const teamRes = await fetch(
          `${import.meta.env.VITE_API_URL}/teams/hackathon/${hackathonId}/my`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const teamData = await teamRes.json();
        if (teamData.success && teamData.data) {
          setTeam(teamData.data);
          // If user is in a team, redirect to team dashboard
          navigate(`/participant/hackathon/${hackathonId}/team`);
        }
      } catch (err) {
        toast.error("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDetails();
    // eslint-disable-next-line
  }, [user, hackathonId]);

  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/teams`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            hackathonId,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Team created!");
        setTeam(data.data);
        navigate(`/participant/hackathon/${hackathonId}/team`);
      } else {
        toast.error(data.error || "Error creating team");
      }
    } catch (err) {
      toast.error("Error creating team");
    } finally {
      setLoading(false);
    }
  };

  // Join Team
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim().toUpperCase();
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/teams/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Joined team!");
        setTeam(data.data);
        navigate(`/participant/hackathon/${hackathonId}/team`);
      } else {
        toast.error(data.error || "Error joining team");
      }
    } catch (err) {
      toast.error("Error joining team");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{hackathon.title}</h1>
          <div className="flex gap-3 mb-2">
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
              {hackathon.theme}
            </span>
            <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              {hackathon.status}
            </span>
          </div>
          <p className="text-white/70 mb-4">{hackathon.description}</p>
          <div className="flex gap-6 text-sm text-white/80 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>
                {new Date(hackathon.timelines?.hackathonStart).toLocaleDateString()} -{" "}
                {new Date(hackathon.timelines?.hackathonEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span>
                Team Size: {hackathon.teamSettings?.minTeamSize} - {hackathon.teamSettings?.maxTeamSize}
              </span>
            </div>
          </div>
        </div>

        {/* Team Actions */}
        {!team && (
          <div className="mb-8 flex gap-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setShowCreate((v) => !v);
                setShowJoin(false);
              }}
            >
              {showCreate ? "Cancel" : "Create Team"}
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setShowJoin((v) => !v);
                setShowCreate(false);
              }}
            >
              {showJoin ? "Cancel" : "Join Team"}
            </button>
          </div>
        )}

        {/* Create Team Form */}
        {showCreate && !team && (
          <form onSubmit={handleCreateTeam} className="mb-6 space-y-3">
            <input
              name="name"
              placeholder="Team Name"
              required
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <textarea
              name="description"
              placeholder="Team Description"
              required
              className="w-full p-2 rounded bg-zinc-800 text-white"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {/* Join Team Form */}
        {showJoin && !team && (
          <form onSubmit={handleJoinTeam} className="mb-6 space-y-3">
            <input
              name="code"
              placeholder="Enter Team Code"
              required
              className="w-full p-2 rounded bg-zinc-800 text-white uppercase"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default HackathonDetailsPage;