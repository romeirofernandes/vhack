import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TbCalendar,
  TbUsers,
  TbTrophy,
  TbArrowLeft,
  TbEdit,
  TbTrash,
  TbUserPlus,
  TbEye,
  TbClock,
  TbMapPin,
  TbMail,
  TbCheck,
  TbX,
  TbAlertCircle,
  TbSend,
  TbAlertTriangle,
} from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const ViewHackathonDetails = () => {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathonDetails();
  }, [hackathonId]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/hackathons/${hackathonId}`, // Fixed URL
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setHackathon(response.data.data);
      } else {
        toast.error("Failed to fetch hackathon details");
      }
    } catch (error) {
      console.error("Error fetching hackathon:", error);
      toast.error("Error fetching hackathon details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHackathon = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this hackathon? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/hackathons/${hackathonId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        toast.success("Hackathon deleted successfully");
        navigate("/dashboard");
      } else {
        toast.error("Failed to delete hackathon");
      }
    } catch (error) {
      console.error("Error deleting hackathon:", error);
      toast.error("Error deleting hackathon");
    } finally {
      setActionLoading(false);
    }
  };

  const canSubmitForApproval = () => {
    // Check if hackathon has judges and no pending invitations
    const hasJudges = hackathon.judges && hackathon.judges.length > 0;
    const noPendingInvites =
      !hackathon.invitedJudges || hackathon.invitedJudges.length === 0;
    const isDraft = hackathon.status === "draft";

    return hasJudges && noPendingInvites && isDraft;
  };

  const handleSubmitForApproval = async () => {
    try {
      setActionLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/hackathons/${hackathonId}`,
        { status: "pending_approval" },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        toast.success("Hackathon submitted for approval!");
        fetchHackathonDetails(); // Refresh data
      } else {
        toast.error("Failed to submit hackathon");
      }
    } catch (error) {
      console.error("Error submitting hackathon:", error);
      toast.error("Error submitting hackathon for approval");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-900/50 text-gray-200";
      case "upcoming":
        return "bg-blue-900/50 text-blue-200";
      case "ongoing":
        return "bg-green-900/50 text-green-200";
      case "completed":
        return "bg-purple-900/50 text-purple-200";
      default:
        return "bg-gray-900/50 text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysLeft = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading hackathon details...</div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <TbAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Hackathon Not Found
          </h2>
          <p className="text-white/70 mb-6">
            The hackathon you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-zinc-950 hover:bg-white/90"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <TbArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  {hackathon.title}
                </h1>
                <p className="text-zinc-400 mt-2">
                  Organized by {hackathon.organizerName}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() =>
                  navigate(`/organizer/hackathon/${hackathonId}/allot-judges`)
                }
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <TbUserPlus className="w-4 h-4 mr-2" />
                Add Judges
              </Button>
              <Button
                onClick={() =>
                  navigate(`/organizer/hackathon/${hackathonId}/edit`)
                }
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-950/30"
              >
                <TbEdit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDeleteHackathon}
                disabled={actionLoading}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-950/30"
              >
                <TbTrash className="w-4 h-4 mr-2" />
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>

          {/* Rest of your existing JSX remains the same */}
          {/* Status and Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Badge className={`${getStatusColor(hackathon.status)} mb-2`}>
                  {hackathon.status.charAt(0).toUpperCase() +
                    hackathon.status.slice(1)}
                </Badge>
                <p className="text-sm text-white/70">Status</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {hackathon.participants?.length || 0}
                </div>
                <p className="text-sm text-white/70">Participants</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {hackathon.judges?.length || 0}
                </div>
                <p className="text-sm text-white/70">Judges</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {getDaysLeft(
                    hackathon.timelines?.hackathonStart || hackathon.startDate
                  )}
                </div>
                <p className="text-sm text-white/70">Days to Start</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 leading-relaxed">
                    {hackathon.description}
                  </p>
                  <div className="mt-4 flex items-center space-x-4">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/20">
                      Theme: {hackathon.theme}
                    </Badge>
                    {hackathon.bannerImageUrl && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/20">
                        <TbEye className="w-3 h-3 mr-1" />
                        Has Banner
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TbCalendar className="w-5 h-5 mr-2" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hackathon.timelines && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">
                            Registration Opens
                          </p>
                          <p className="text-sm text-white/70">
                            {formatDate(hackathon.timelines.registrationStart)}
                          </p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300">
                          Start
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">
                            Registration Ends
                          </p>
                          <p className="text-sm text-white/70">
                            {formatDate(hackathon.timelines.registrationEnd)}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          Deadline
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">
                            Hackathon Starts
                          </p>
                          <p className="text-sm text-white/70">
                            {formatDate(hackathon.timelines.hackathonStart)}
                          </p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300">
                          Event
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">
                            Hackathon Ends
                          </p>
                          <p className="text-sm text-white/70">
                            {formatDate(hackathon.timelines.hackathonEnd)}
                          </p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-300">
                          End
                        </Badge>
                      </div>

                      {hackathon.timelines.resultsDate && (
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-white">
                              Results Announcement
                            </p>
                            <p className="text-sm text-white/70">
                              {formatDate(hackathon.timelines.resultsDate)}
                            </p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300">
                            Results
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Judges Section */}
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <TbUsers className="w-5 h-5 mr-2" />
                      Judges
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-300">
                        {hackathon.judges?.length || 0} Accepted
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-300">
                        {hackathon.invitedJudges?.length || 0} Pending
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Accepted Judges */}
                  {hackathon.judges && hackathon.judges.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3 flex items-center">
                        <TbCheck className="w-4 h-4 mr-2 text-green-400" />
                        Accepted Judges
                      </h4>
                      <div className="space-y-3">
                        {hackathon.judges.map((judge) => (
                          <div
                            key={judge._id}
                            className="flex items-center space-x-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={judge.photoURL} />
                              <AvatarFallback className="bg-green-500/20 text-green-300">
                                {judge.displayName?.charAt(0) ||
                                  judge.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                {judge.displayName || "Anonymous"}
                              </p>
                              <p className="text-sm text-white/70">
                                {judge.email}
                              </p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-300">
                              <TbCheck className="w-3 h-3 mr-1" />
                              Accepted
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Invitations */}
                  {hackathon.invitedJudges &&
                    hackathon.invitedJudges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center">
                          <TbClock className="w-4 h-4 mr-2 text-yellow-400" />
                          Pending Invitations
                        </h4>
                        <div className="space-y-3">
                          {hackathon.invitedJudges.map((judge) => (
                            <div
                              key={judge._id}
                              className="flex items-center space-x-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20"
                            >
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={judge.photoURL} />
                                <AvatarFallback className="bg-yellow-500/20 text-yellow-300">
                                  {judge.displayName?.charAt(0) ||
                                    judge.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-white">
                                  {judge.displayName || "Anonymous"}
                                </p>
                                <p className="text-sm text-white/70">
                                  {judge.email}
                                </p>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-300">
                                <TbClock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {(!hackathon.judges || hackathon.judges.length === 0) &&
                    (!hackathon.invitedJudges ||
                      hackathon.invitedJudges.length === 0) && (
                      <div className="text-center py-8">
                        <TbUsers className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/50">No judges added yet</p>
                        <Button
                          onClick={() =>
                            navigate(
                              `/organizer/hackathon/${hackathonId}/allot-judges`
                            )
                          }
                          className="mt-3 bg-purple-500 hover:bg-purple-600"
                        >
                          <TbUserPlus className="w-4 h-4 mr-2" />
                          Add Judges
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prizes */}
              {hackathon.prizes && (
                <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TbTrophy className="w-5 h-5 mr-2" />
                      Prizes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hackathon.prizes.firstPrize && (
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="font-medium text-yellow-300">
                          🥇 First Prize
                        </p>
                        <p className="text-sm text-white/80">
                          {hackathon.prizes.firstPrize}
                        </p>
                      </div>
                    )}
                    {hackathon.prizes.secondPrize && (
                      <div className="p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                        <p className="font-medium text-gray-300">
                          🥈 Second Prize
                        </p>
                        <p className="text-sm text-white/80">
                          {hackathon.prizes.secondPrize}
                        </p>
                      </div>
                    )}
                    {hackathon.prizes.thirdPrize && (
                      <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <p className="font-medium text-orange-300">
                          🥉 Third Prize
                        </p>
                        <p className="text-sm text-white/80">
                          {hackathon.prizes.thirdPrize}
                        </p>
                      </div>
                    )}
                    {hackathon.prizes.participantPrize && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="font-medium text-blue-300">
                          🎁 Participation Prize
                        </p>
                        <p className="text-sm text-white/80">
                          {hackathon.prizes.participantPrize}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Team Settings */}
              {hackathon.teamSettings && (
                <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Team Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Min Team Size:</span>
                      <span className="text-white font-medium">
                        {hackathon.teamSettings.minTeamSize || 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Max Team Size:</span>
                      <span className="text-white font-medium">
                        {hackathon.teamSettings.maxTeamSize || 4}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Solo Allowed:</span>
                      <Badge
                        className={
                          hackathon.teamSettings.allowSolo
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }
                      >
                        {hackathon.teamSettings.allowSolo ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hackathon.status === "draft" && (
                    <>
                      {!canSubmitForApproval() && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center">
                            <TbAlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Ready for Submission?
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                {!hackathon.judges ||
                                hackathon.judges.length === 0
                                  ? "Add and get acceptance from at least one judge before submitting for approval."
                                  : "Waiting for all invited judges to accept their invitations."}
                              </p>
                              {hackathon.invitedJudges &&
                                hackathon.invitedJudges.length > 0 && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    {hackathon.invitedJudges.length}{" "}
                                    invitation(s) still pending
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleSubmitForApproval}
                        disabled={!canSubmitForApproval() || actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <TbSend className="w-4 h-4 mr-2" />
                        {actionLoading
                          ? "Submitting..."
                          : "Submit for Admin Approval"}
                      </Button>

                      <Button
                        onClick={() =>
                          navigate(`/organizer/hackathon/${hackathonId}/edit`)
                        }
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <TbEdit className="w-4 h-4 mr-2" />
                        Edit Details
                      </Button>
                    </>
                  )}

                  {hackathon.status === "pending_approval" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <TbClock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-800">
                        Pending Admin Approval
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your hackathon is under review by administrators
                      </p>
                    </div>
                  )}

                  {hackathon.status === "published" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <TbCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">
                        Published
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Your hackathon is live and accepting registrations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Created:</span>
                    <span className="text-white text-sm">
                      {new Date(hackathon.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Last Updated:</span>
                    <span className="text-white text-sm">
                      {new Date(hackathon.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewHackathonDetails;
