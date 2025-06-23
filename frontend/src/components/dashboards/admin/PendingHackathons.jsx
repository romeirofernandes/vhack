import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Alert, AlertDescription } from "../../ui/alert";
import { MdPerson, MdClose } from "react-icons/md";
import {
  TbTrophy,
  TbClock,
  TbMapPin,
  TbUsers,
  TbCalendar,
  TbCheck,
  TbX,
  TbEye,
  TbAlertTriangle,
  TbCircleCheck,
} from "react-icons/tb";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";

const PendingHackathons = () => {
  const [pendingHackathons, setPendingHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const { user } = useAuth();

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
      setPendingHackathons([]);
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
      // Notify parent to refresh dashboard
      window.dispatchEvent(new CustomEvent("hackathonStatusChanged"));
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
      // Notify parent to refresh dashboard
      window.dispatchEvent(new CustomEvent("hackathonStatusChanged"));
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading pending hackathons...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pending Approvals
            </h1>
            <p className="text-zinc-400">
              Review and approve hackathons awaiting admin approval
            </p>
          </div>
          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 px-4 py-2">
            <TbClock className="w-4 h-4 mr-2" />
            {pendingHackathons.length} Pending
          </Badge>
        </div>

        {/* Alert for pending items */}
        {pendingHackathons.length > 0 && (
          <Alert className="bg-yellow-900/20 border-yellow-600/30">
            <TbAlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              {pendingHackathons.length} hackathon
              {pendingHackathons.length !== 1 ? "s" : ""} require
              {pendingHackathons.length === 1 ? "s" : ""} your approval to go
              live.
            </AlertDescription>
          </Alert>
        )}

        {pendingHackathons.length === 0 ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TbCircleCheck className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                All Caught Up!
              </h3>
              <p className="text-zinc-400 text-center">
                No hackathons are waiting for approval at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingHackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-zinc-950 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 h-full">
                  <CardContent className="p-3 space-y-4">
                    {/* Title and Theme */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {hackathon.title}
                      </h3>
                      {hackathon.theme && (
                        <Badge
                          variant="outline"
                          className="border-blue-600/30 text-blue-400 text-xs"
                        >
                          {hackathon.theme}
                        </Badge>
                      )}
                    </div>

                    {/* Organizer */}
                    <div className="p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <MdPerson className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm truncate">
                            {hackathon.organizerId?.displayName || "Unknown"}
                          </div>
                          <div className="text-zinc-400 text-xs truncate">
                            {formatDateShort(hackathon.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-zinc-900/30 rounded border border-zinc-800">
                        <div className="flex items-center gap-1 text-blue-400 mb-1">
                          <TbCalendar className="w-3 h-3" />
                          <span className="font-medium">Start</span>
                        </div>
                        <div className="text-zinc-300">
                          {formatDateShort(hackathon.timelines?.hackathonStart)}
                        </div>
                      </div>
                      <div className="p-2 bg-zinc-900/30 rounded border border-zinc-800">
                        <div className="flex items-center gap-1 text-purple-400 mb-1">
                          <TbUsers className="w-3 h-3" />
                          <span className="font-medium">Team</span>
                        </div>
                        <div className="text-zinc-300">
                          Max {hackathon.teamSettings?.maxTeamSize || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setSelectedHackathon(hackathon)}
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <TbEye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleApprove(hackathon._id)}
                        disabled={actionLoading[hackathon._id]}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading[hackathon._id] === "approving" ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <TbCheck className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(hackathon._id)}
                        disabled={actionLoading[hackathon._id]}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {actionLoading[hackathon._id] === "rejecting" ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <TbX className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedHackathon && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHackathon(null)}
          >
            <motion.div
              className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedHackathon.title}
                  </h2>
                  <p className="text-zinc-400 mt-1">Review Hackathon Details</p>
                </div>
                <Button
                  onClick={() => setSelectedHackathon(null)}
                  variant="default"
                  size="sm"
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  <MdClose className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Theme and Organizer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <h3 className="text-white font-medium mb-2">Theme</h3>
                    <Badge
                      variant="outline"
                      className="border-blue-600/30 text-blue-400"
                    >
                      {selectedHackathon.theme || "No theme specified"}
                    </Badge>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <h3 className="text-white font-medium mb-2">Organizer</h3>
                    <div className="flex items-center gap-2">
                      <MdPerson className="w-4 h-4 text-zinc-400" />
                      <div>
                        <div className="text-white font-medium">
                          {selectedHackathon.organizerId?.displayName ||
                            "Unknown"}
                        </div>
                        <div className="text-zinc-400 text-sm">
                          {selectedHackathon.organizerId?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                  <h3 className="text-white font-medium mb-2">Description</h3>
                  <p className="text-zinc-300 leading-relaxed">
                    {selectedHackathon.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TbCalendar className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">
                        Timeline
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-zinc-300">
                      <div>
                        Reg:{" "}
                        {formatDateShort(
                          selectedHackathon.timelines?.registrationStart
                        )}
                      </div>
                      <div>
                        Event:{" "}
                        {formatDateShort(
                          selectedHackathon.timelines?.hackathonStart
                        )}
                      </div>
                      <div>
                        End:{" "}
                        {formatDateShort(
                          selectedHackathon.timelines?.hackathonEnd
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TbMapPin className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">
                        Location
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300">
                      {selectedHackathon.location || "Not specified"}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TbUsers className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-medium">
                        Team Size
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300">
                      Max {selectedHackathon.teamSettings?.maxTeamSize || "N/A"}{" "}
                      members
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TbTrophy className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-medium">
                        Judges
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300">
                      {selectedHackathon.judges?.length || 0} assigned
                    </div>
                  </div>
                </div>

                {/* Judges List */}
                {selectedHackathon.judges &&
                  selectedHackathon.judges.length > 0 && (
                    <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <TbUsers className="w-4 h-4" />
                        Assigned Judges
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedHackathon.judges.map((judge) => (
                          <Badge
                            key={judge._id}
                            variant="outline"
                            className="border-zinc-600 text-zinc-300"
                          >
                            {judge.displayName || judge.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Prizes */}
                {selectedHackathon.prizes && (
                  <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <TbTrophy className="w-4 h-4 text-yellow-400" />
                      Prize Pool
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedHackathon.prizes.firstPrize && (
                        <div className="text-center p-3 bg-zinc-800/50 rounded">
                          <div className="text-yellow-400 font-medium mb-1">
                            🥇 1st Place
                          </div>
                          <div className="text-zinc-300">
                            {selectedHackathon.prizes.firstPrize}
                          </div>
                        </div>
                      )}
                      {selectedHackathon.prizes.secondPrize && (
                        <div className="text-center p-3 bg-zinc-800/50 rounded">
                          <div className="text-gray-400 font-medium mb-1">
                            🥈 2nd Place
                          </div>
                          <div className="text-zinc-300">
                            {selectedHackathon.prizes.secondPrize}
                          </div>
                        </div>
                      )}
                      {selectedHackathon.prizes.thirdPrize && (
                        <div className="text-center p-3 bg-zinc-800/50 rounded">
                          <div className="text-orange-400 font-medium mb-1">
                            🥉 3rd Place
                          </div>
                          <div className="text-zinc-300">
                            {selectedHackathon.prizes.thirdPrize}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-zinc-800">
                  <Button
                    onClick={() => handleApprove(selectedHackathon._id)}
                    disabled={actionLoading[selectedHackathon._id]}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading[selectedHackathon._id] === "approving" ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <TbCheck className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleReject(selectedHackathon._id)}
                    disabled={actionLoading[selectedHackathon._id]}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {actionLoading[selectedHackathon._id] === "rejecting" ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Rejecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <TbX className="w-4 h-4" />
                        <span>Reject</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PendingHackathons;
