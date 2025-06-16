import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Calendar, Users, Trophy, ExternalLink } from "lucide-react";

const ParticipantHackathons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/hackathons`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        setHackathons(data.data?.hackathons || []);
      } catch (err) {
        toast.error("Failed to load hackathons");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHackathons();
  }, [user]);

  const getStatus = (hackathon) => {
    if (!hackathon.timelines) return "upcoming";
    const now = new Date();
    const regEnd = new Date(hackathon.timelines.registrationEnd);
    const hackEnd = new Date(hackathon.timelines.hackathonEnd);
    if (regEnd > now) return "upcoming";
    if (hackEnd > now) return "ongoing";
    return "completed";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Discover Hackathons
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join hackathons, form teams, and submit your projects!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {hackathons.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-16">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              No hackathons found.
            </div>
          ) : (
            hackathons.map((hackathon, idx) => (
              <motion.div
                key={hackathon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 flex flex-col"
              >
                {hackathon.bannerImageUrl && (
                  <div className="h-40 bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden">
                    <img
                      src={hackathon.bannerImageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                        getStatus(hackathon) === "upcoming"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : getStatus(hackathon) === "ongoing"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }`}
                    >
                      {getStatus(hackathon).charAt(0).toUpperCase() +
                        getStatus(hackathon).slice(1)}
                    </span>
                    <ExternalLink className="h-5 w-5 text-white/60" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {hackathon.title}
                  </h3>
                  <p className="text-purple-300 text-sm font-medium mb-2">
                    {hackathon.theme}
                  </p>
                  <p className="text-white/70 text-sm line-clamp-3 mb-4">
                    {hackathon.description}
                  </p>
                  <div className="space-y-2 text-sm text-white/80 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>
                        {new Date(
                          hackathon.timelines?.hackathonStart
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          hackathon.timelines?.hackathonEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span>
                        Team Size: {hackathon.teamSettings?.minTeamSize} -{" "}
                        {hackathon.teamSettings?.maxTeamSize}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/participant/hackathon/${hackathon._id}`)
                    }
                    className="w-full mt-auto py-2 px-4 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParticipantHackathons;