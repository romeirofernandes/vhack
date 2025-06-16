import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import HackathonCard from "./HackathonCard";
import { Search, Calendar, Trophy, Users } from "lucide-react";
import { toast } from "react-hot-toast";

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchPublishedHackathons();
  }, []);

  useEffect(() => {
    filterHackathons();
  }, [hackathons, searchTerm, filterType]);

  const fetchPublishedHackathons = async () => {
    try {
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/hackathons/published`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hackathons");
      }

      const data = await response.json();
      setHackathons(data.hackathons || []);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error("Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  const filterHackathons = () => {
    let filtered = hackathons;

    if (searchTerm) {
      filtered = filtered.filter(
        (hackathon) =>
          hackathon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          hackathon.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      const now = new Date();
      switch (filterType) {
        case "upcoming":
          filtered = filtered.filter(
            (h) => new Date(h.timelines?.registrationEnd) > now
          );
          break;
        case "ongoing":
          filtered = filtered.filter(
            (h) =>
              new Date(h.timelines?.registrationEnd) <= now &&
              new Date(h.timelines?.hackathonEnd) > now
          );
          break;
        case "completed":
          filtered = filtered.filter(
            (h) => new Date(h.timelines?.hackathonEnd) <= now
          );
          break;
      }
    }

    setFilteredHackathons(filtered);
  };

  const getHackathonStatus = (hackathon) => {
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
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Discover Hackathons
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join amazing hackathons, collaborate with talented developers, and
            build innovative solutions
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {["all", "upcoming", "ongoing", "completed"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  filterType === type
                    ? "bg-white text-zinc-950 font-medium"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {hackathons.length}
            </div>
            <div className="text-gray-400">Total Hackathons</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {
                hackathons.filter((h) => getHackathonStatus(h) === "upcoming")
                  .length
              }
            </div>
            <div className="text-gray-400">Upcoming</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {
                hackathons.filter((h) => getHackathonStatus(h) === "ongoing")
                  .length
              }
            </div>
            <div className="text-gray-400">Ongoing</div>
          </div>
        </motion.div>

        {/* Hackathons Grid */}
        {filteredHackathons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No Hackathons Found
            </h3>
            <p className="text-gray-400">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "No published hackathons available at the moment"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <HackathonCard
                  hackathon={hackathon}
                  status={getHackathonStatus(hackathon)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
