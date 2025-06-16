import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

const HackathonCard = ({ hackathon, status }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "ongoing":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      case "ongoing":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleRegister = async (e) => {
    e.stopPropagation();

    if (status === "completed") {
      toast.error("This hackathon has already ended");
      return;
    }

    if (status === "ongoing") {
      toast.error("Registration has closed for this hackathon");
      return;
    }

    // Navigate to registration page or open registration modal
    navigate(`/hackathon/${hackathon._id}/register`);
  };

  const handleViewDetails = () => {
    navigate(`/hackathon/${hackathon._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300">
        {/* Banner Image */}
        {hackathon.bannerImageUrl && (
          <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden">
            <img
              src={hackathon.bannerImageUrl}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                status
              )}`}
            >
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <ExternalLink className="h-5 w-5 text-white/60 group-hover:text-white/80 transition-colors" />
          </div>

          {/* Title and Theme */}
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              {hackathon.title}
            </h3>
            <p className="text-purple-300 text-sm font-medium mt-1">
              {hackathon.theme}
            </p>
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm line-clamp-3">
            {hackathon.description}
          </p>

          {/* Details */}
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>
                {formatDate(hackathon.timelines.hackathonStart)} -{" "}
                {formatDate(hackathon.timelines.hackathonEnd)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span>{hackathon.location || "Virtual"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span>
                Max {hackathon.teamSettings.maxTeamSize} per team •
                {hackathon.teamSettings.maxTeams
                  ? ` ${hackathon.teamSettings.maxTeams} teams`
                  : " Unlimited teams"}
              </span>
            </div>

            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span>₹{hackathon.prizes[0].amount} Prize Pool</span>
              </div>
            )}
          </div>

          {/* Registration Status */}
          <div className="pt-4 border-t border-white/10">
            {status === "upcoming" && (
              <div className="text-sm text-white/70 mb-3">
                Registration ends:{" "}
                {formatDate(hackathon.timelines.registrationEnd)}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={status === "completed" || status === "ongoing"}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                status === "upcoming"
                  ? "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
                  : "bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
            >
              {status === "upcoming" && "Register Now"}
              {status === "ongoing" && "Registration Closed"}
              {status === "completed" && "Hackathon Ended"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HackathonCard;
