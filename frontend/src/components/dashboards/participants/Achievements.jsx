import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AchievementCard from "./AchievementCard";
import { useAuth } from "../../../contexts/AuthContext";

// React Icons
import {
  FiAward,
  FiCheckCircle,
  FiLock,
  FiUser,
  FiUsers,
  FiSend,
  FiTarget,
  FiStar,
  FiFlag,
  FiZap,
} from "react-icons/fi";

const Achievements = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [summary, setSummary] = useState({});
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAchievements();
    // eslint-disable-next-line
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/achievements`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAchievements(data.data.achievements);
        setStats(data.data.stats);
        setSummary(data.data.summary);
      } else {
        setError(data.error || "Failed to fetch achievements");
      }
    } catch (error) {
      console.error("Achievements fetch error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // All icons from react-icons/fi
  const categories = [
    { id: "all", label: "All", icon: <FiAward /> },
    { id: "unlocked", label: "Unlocked", icon: <FiCheckCircle /> },
    { id: "locked", label: "Locked", icon: <FiLock /> },
    { id: "beginner", label: "Beginner", icon: <FiUser /> },
    { id: "participation", label: "Participation", icon: <FiZap /> },
    { id: "submission", label: "Submission", icon: <FiSend /> },
    { id: "collaboration", label: "Collaboration", icon: <FiUsers /> },
    { id: "expertise", label: "Expertise", icon: <FiTarget /> },
    { id: "milestone", label: "Milestone", icon: <FiFlag /> },
    { id: "special", label: "Special", icon: <FiStar /> },
  ];

  const filteredAchievements =
    selectedFilter === "all"
      ? achievements
      : selectedFilter === "unlocked"
      ? achievements.filter((a) => a.unlocked)
      : selectedFilter === "locked"
      ? achievements.filter((a) => !a.unlocked)
      : achievements.filter((a) => a.category === selectedFilter);

  const getStatCard = (title, value, icon, description) => (
  <Card className="bg-zinc-900 border-zinc-800 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-white/70">{title}</div>
          {description && (
            <div className="text-xs text-white/50">{description}</div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 mx-auto mb-4"></div>
          <p className="text-white/70">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <FiAward className="w-8 h-8 text-yellow-400" />
                Achievements
              </h1>
              <p className="text-white/70 mt-2">
                Track your progress and unlock rewards on your vHack journey
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {summary.unlocked || 0}/{summary.total || 0}
            </div>
            <div className="text-sm text-white/70">Achievements Unlocked</div>
            <Badge className="bg-yellow-900/70 text-yellow-200 mt-2 border border-yellow-700">
              {summary.percentage || 0}% Complete
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 mb-6">
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {getStatCard(
            "Hackathons Joined",
            stats.hackathonsJoined || 0,
            <FiZap className="text-white w-8 h-8" />,
            "Total events participated"
          )}
          {getStatCard(
            "Projects Submitted",
            stats.projectsSubmitted || 0,
            <FiSend className="text-white w-8 h-8" />,
            "Completed submissions"
          )}
          {getStatCard(
            "Prizes Won",
            stats.prizesWon || 0,
            <FiAward className="text-white w-8 h-8" />,
            "Top 3 finishes"
          )}
          {getStatCard(
            "Technologies Used",
            stats.technologiesUsed || 0,
            <FiStar className="text-white w-8 h-8" />,
            "Different tech stack"
          )}
        </div>

        {/* Progress Bar */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FiTarget className="w-5 h-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  Overall Achievement Progress
                </span>
                <span className="text-white font-semibold">
                  {summary.percentage || 0}%
                </span>
              </div>
              {/* Solid color progress bar, no gradient */}
              <div className="w-full bg-zinc-800 rounded-full h-4 border border-zinc-700">
                <motion.div
                  className="bg-blue-500 h-4 rounded-full transition-all"
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.percentage || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {summary.unlocked || 0}
                  </div>
                  <div className="text-white/60">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {(summary.total || 0) - (summary.unlocked || 0)}
                  </div>
                  <div className="text-white/60">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {
                      achievements.filter(
                        (a) => a.rarity === "rare" && a.unlocked
                      ).length
                    }
                  </div>
                  <div className="text-white/60">Rare</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {
                      achievements.filter(
                        (a) => a.rarity === "legendary" && a.unlocked
                      ).length
                    }
                  </div>
                  <div className="text-white/60">Legendary</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all border ${
                  selectedFilter === category.id
                    ? "bg-white text-zinc-950 border-white shadow"
                    : "bg-zinc-900 border-zinc-800 text-white/70 hover:bg-zinc-800 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
                {category.id === "unlocked" && (
                  <Badge className="bg-green-600 text-white text-xs border border-green-700 ml-1">
                    {achievements.filter((a) => a.unlocked).length}
                  </Badge>
                )}
                {category.id === "locked" && (
                  <Badge className="bg-red-600 text-white text-xs border border-red-700 ml-1">
                    {achievements.filter((a) => !a.unlocked).length}
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <FiAward className="text-6xl mb-4 text-yellow-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No achievements found
            </h3>
            <p className="text-white/60">
              Try selecting a different category or start participating in
              hackathons!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;