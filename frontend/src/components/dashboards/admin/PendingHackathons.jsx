import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import {
  Clock,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PendingHackathons = () => {
  const [pendingHackathons, setPendingHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchPendingHackathons();
    }
  }, [user]);

  const fetchPendingHackathons = async () => {
    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/pending-hackathons`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch pending hackathons"
        );
      }

      const data = await response.json();
      setPendingHackathons(data);
    } catch (error) {
      toast.error("Failed to fetch pending hackathons");
      console.error("Error fetching pending hackathons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hackathonId) => {
    setActionLoading((prev) => ({ ...prev, [hackathonId]: "approving" }));
    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/hackathons/${hackathonId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve hackathon");
      }

      toast.success("Hackathon approved successfully!");
      fetchPendingHackathons();
    } catch (error) {
      toast.error("Failed to approve hackathon");
      console.error("Error approving hackathon:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [hackathonId]: null }));
    }
  };

  const handleReject = async (hackathonId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setActionLoading((prev) => ({ ...prev, [hackathonId]: "rejecting" }));
    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/hackathons/${hackathonId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject hackathon");
      }

      toast.success("Hackathon rejected successfully!");
      fetchPendingHackathons();
    } catch (error) {
      toast.error("Failed to reject hackathon");
      console.error("Error rejecting hackathon:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [hackathonId]: null }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        {/* Header - REMOVED LOGOUT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pending Approvals
            </h1>
            <p className="text-gray-400 mt-2">
              Review and approve hackathons awaiting admin approval
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <span className="text-yellow-400 font-medium">
              {pendingHackathons.length} Pending
            </span>
          </div>
        </motion.div>

        {/* Rest of the component stays the same... */}
        {pendingHackathons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 max-w-md mx-auto">
              <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                No Pending Approvals
              </h3>
              <p className="text-gray-400">All hackathons are up to date!</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6"
          >
            {pendingHackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                  {hackathon.bannerImageUrl && (
                    <img
                      src={hackathon.bannerImageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-medium">
                      Pending Approval
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title and Organizer */}
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {hackathon.title}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Organized by:{" "}
                      <span className="text-white">
                        {hackathon.organizerId?.displayName || "Unknown"}
                      </span>{" "}
                      ({hackathon.organizerId?.email || "Unknown"})
                    </p>
                    {hackathon.theme && (
                      <p className="text-blue-400 text-sm font-medium mt-1">
                        Theme: {hackathon.theme}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300">{hackathon.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {hackathon.timelines && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(hackathon.timelines.hackathonStart)} -{" "}
                          {formatDate(hackathon.timelines.hackathonEnd)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{hackathon.location || "Virtual"}</span>
                    </div>
                    {hackathon.teamSettings && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>
                          Max {hackathon.teamSettings.maxTeamSize} per team
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Trophy className="h-4 w-4" />
                      <span>{hackathon.judges?.length || 0} Judges</span>
                    </div>
                  </div>

                  {/* Judges */}
                  {hackathon.judges && hackathon.judges.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Judges:</h4>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.judges.map((judge) => (
                          <span
                            key={judge._id}
                            className="bg-white/10 text-gray-300 border border-white/20 px-3 py-1 rounded-full text-sm"
                          >
                            {judge.displayName || judge.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prize Pool */}
                  {hackathon.prizes && hackathon.prizes.length > 0 && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">
                        ₹{hackathon.prizes[0].amount} Prize Pool
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => handleApprove(hackathon._id)}
                      disabled={actionLoading[hackathon._id]}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {actionLoading[hackathon._id] === "approving" ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(hackathon._id)}
                      disabled={actionLoading[hackathon._id]}
                      className="bg-red-600 hover:bg-red-700 text-white flex-1"
                    >
                      {actionLoading[hackathon._id] === "rejecting" ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PendingHackathons;
