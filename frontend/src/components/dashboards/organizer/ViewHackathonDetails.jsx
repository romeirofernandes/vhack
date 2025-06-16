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
  TbCheck,
  TbX,
  TbAlertCircle,
  TbSend,
  TbAlertTriangle,
  TbSettings,
  TbChartBar,
  TbCode,
  TbCrown,
  TbCalendarStats,
} from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const ViewHackathonDetails = () => {
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathonDetails();
    fetchTeamsAndParticipants();
  }, [hackathonId]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
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

  const fetchTeamsAndParticipants = async () => {
    try {
      const idToken = await user.getIdToken();

      // Fetch teams for this hackathon
      const teamsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/hackathon/${hackathonId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (teamsRes.data.success) {
        const teamsData = teamsRes.data.data || [];
        setTeams(teamsData);

        // Extract all participants from teams
        const allParticipants = teamsData.flatMap((team) =>
          team.members.map((member) => ({
            ...member.user,
            teamName: team.name,
            teamId: team._id,
            role: member.role,
            joinedAt: member.joinedAt,
          }))
        );
        setParticipants(allParticipants);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
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
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
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
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        { status: "pending_approval" },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        toast.success("Hackathon submitted for approval!");
        fetchHackathonDetails();
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
        return "bg-zinc-700 text-zinc-200 border-zinc-600";
      case "pending_approval":
        return "bg-yellow-600 text-white border-yellow-500";
      case "published":
        return "bg-green-600 text-white border-green-500";
      case "ongoing":
        return "bg-blue-600 text-white border-blue-500";
      case "completed":
        return "bg-zinc-600 text-zinc-200 border-zinc-500";
      default:
        return "bg-zinc-700 text-zinc-200 border-zinc-600";
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading hackathon details...</div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <TbAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Hackathon Not Found
          </h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            The hackathon you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-zinc-950 hover:bg-zinc-200 border-2 border-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:border-gradient-to-r hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{
              borderImage:
                "linear-gradient(45deg, #8b5cf6, #3b82f6, #06b6d4) 1",
            }}
          >
            <TbArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200"
            >
              <TbArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {hackathon.title}
              </h1>
              <p className="text-zinc-400">
                Organized by {hackathon.organizerName || "You"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate(`/organizer/hackathon/${hackathonId}/allot-judges`)}
              className="relative overflow-hidden bg-zinc-900 border border-blue-500/20 text-blue-400 hover:text-white transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center">
                <TbUserPlus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Manage Judges
              </div>
            </Button>
            <Button
              onClick={() => navigate(`/organizer/hackathon/${hackathonId}/edit`)}
              className="relative overflow-hidden bg-zinc-900 border border-purple-500/20 text-purple-400 hover:text-white transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center">
                <TbEdit className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Edit
              </div>
            </Button>
            <Button
              onClick={handleDeleteHackathon}
              disabled={actionLoading}
              className="relative overflow-hidden bg-zinc-900 border border-red-500/20 text-red-400 hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center">
                <TbTrash className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                {actionLoading ? "Deleting..." : "Delete"}
              </div>
            </Button>
          </div>
        </motion.div>

        {/* Hero Section with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge
                      className={`${getStatusColor(
                        hackathon.status
                      )} font-medium px-3 py-1 border`}
                    >
                      {hackathon.status.charAt(0).toUpperCase() +
                        hackathon.status.slice(1)}
                    </Badge>
                    <span className="text-zinc-400">
                      Theme: {hackathon.theme}
                    </span>
                    <span className="text-zinc-400">
                      {getDaysLeft(hackathon.timelines?.hackathonEnd)} days left
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {hackathon.description}
                  </p>
                </div>
                {hackathon.bannerImageUrl && (
                  <div className="w-40 h-24 rounded-lg overflow-hidden bg-zinc-800">
                    <img
                      src={hackathon.bannerImageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {teams.length}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">Teams</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {participants.length}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">
                    Participants
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {hackathon.judges?.length || 0}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">
                    Judges
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {hackathon.teamSettings?.maxTeamSize || "N/A"}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">
                    Max Team Size
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {hackathon.invitedJudges?.length || 0}
                  </div>
                  <div className="text-zinc-400 text-sm font-medium">
                    Pending Invites
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          {[
            { id: "overview", label: "Overview", icon: TbEye },
            { id: "teams", label: "Teams", icon: TbUsers },
            { id: "participants", label: "Participants", icon: TbUsers },
            { id: "timeline", label: "Timeline", icon: TbCalendar },
            { id: "settings", label: "Settings", icon: TbSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-zinc-700 text-white border border-zinc-600"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Judges Section */}
                <Card className="bg-zinc-950 border-zinc-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <TbUsers className="w-5 h-5 mr-2" />
                        <span className="text-xl">Judges</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-600 text-white border border-green-500 px-2 py-1 text-xs">
                          {hackathon.judges?.length || 0} Accepted
                        </Badge>
                        <Badge className="bg-yellow-600 text-white border border-yellow-500 px-2 py-1 text-xs">
                          {hackathon.invitedJudges?.length || 0} Pending
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Accepted Judges */}
                    {hackathon.judges && hackathon.judges.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <TbCheck className="w-4 h-4 mr-2 text-green-400" />
                          Accepted Judges
                        </h4>
                        <div className="space-y-3">
                          {hackathon.judges.map((judge) => (
                            <div
                              key={judge._id}
                              className="flex items-center space-x-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
                            >
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={judge.photoURL} />
                                <AvatarFallback className="bg-green-600 text-white">
                                  {judge.displayName?.charAt(0) ||
                                    judge.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-white">
                                  {judge.displayName || "Anonymous"}
                                </p>
                                <p className="text-sm text-zinc-400">
                                  {judge.email}
                                </p>
                              </div>
                              <Badge className="bg-green-600 text-white border border-green-500 px-2 py-1 text-xs">
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
                          <h4 className="font-semibold text-white mb-3 flex items-center">
                            <TbClock className="w-4 h-4 mr-2 text-yellow-400" />
                            Pending Invitations
                          </h4>
                          <div className="space-y-3">
                            {hackathon.invitedJudges.map((judge) => (
                              <div
                                key={judge._id}
                                className="flex items-center space-x-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
                              >
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={judge.photoURL} />
                                  <AvatarFallback className="bg-yellow-600 text-white">
                                    {judge.displayName?.charAt(0) ||
                                      judge.email?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-semibold text-white">
                                    {judge.displayName || "Anonymous"}
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    {judge.email}
                                  </p>
                                </div>
                                <Badge className="bg-yellow-600 text-white border border-yellow-500 px-2 py-1 text-xs">
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
                          <TbUsers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                          <p className="text-zinc-500 mb-4">
                            No judges added yet
                          </p>
                          <Button
                            onClick={() =>
                              navigate(
                                `/organizer/hackathon/${hackathonId}/allot-judges`
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <TbUserPlus className="w-4 h-4 mr-2" />
                            Add Judges
                          </Button>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Team Settings */}
                <Card className="bg-zinc-950 border-zinc-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-xl">
                      <TbUsers className="w-5 h-5" />
                      Team Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {hackathon.teamSettings?.minTeamSize || 1}
                        </div>
                        <div className="text-zinc-400 text-sm font-medium">
                          Min Team Size
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {hackathon.teamSettings?.maxTeamSize || 4}
                        </div>
                        <div className="text-zinc-400 text-sm font-medium">
                          Max Team Size
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {hackathon.teamSettings?.allowSolo ? "Yes" : "No"}
                        </div>
                        <div className="text-zinc-400 text-sm font-medium">
                          Solo Allowed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-zinc-950 border-zinc-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hackathon.status === "draft" && (
                      <>
                        {!canSubmitForApproval() && (
                          <div className="p-3 bg-zinc-900 border border-yellow-600 rounded-lg">
                            <div className="flex items-start">
                              <TbAlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                              <div>
                                <p className="font-medium text-yellow-300 text-sm mb-1">
                                  Ready for Submission?
                                </p>
                                <p className="text-xs text-yellow-200">
                                  {!hackathon.judges ||
                                  hackathon.judges.length === 0
                                    ? "Add judges before submitting."
                                    : "Waiting for judge acceptances."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleSubmitForApproval}
                          disabled={!canSubmitForApproval() || actionLoading}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed"
                        >
                          <TbSend className="w-4 h-4 mr-2" />
                          {actionLoading
                            ? "Submitting..."
                            : "Submit for Approval"}
                        </Button>
                      </>
                    )}

                    {hackathon.status === "pending_approval" && (
                      <div className="p-4 bg-zinc-900 border border-blue-600 rounded-lg text-center">
                        <TbClock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="font-medium text-blue-300 text-sm mb-1">
                          Pending Approval
                        </p>
                        <p className="text-xs text-blue-200">
                          Under admin review
                        </p>
                      </div>
                    )}

                    {hackathon.status === "published" && (
                      <div className="p-4 bg-zinc-900 border border-green-600 rounded-lg text-center">
                        <TbCheck className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="font-medium text-green-300 text-sm mb-1">
                          Published
                        </p>
                        <p className="text-xs text-green-200">
                          Live and accepting registrations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Prizes */}
                {hackathon.prizes && (
                  <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white flex items-center text-xl">
                        <TbTrophy className="w-5 h-5 mr-2" />
                        Prize Pool
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hackathon.prizes.firstPrize && (
                        <div className="p-3 bg-zinc-900 border border-yellow-600 rounded-lg">
                          <div className="font-semibold text-yellow-300 text-sm mb-1">
                            🥇 First Prize
                          </div>
                          <div className="text-zinc-300 text-sm">
                            {hackathon.prizes.firstPrize}
                          </div>
                        </div>
                      )}
                      {hackathon.prizes.secondPrize && (
                        <div className="p-3 bg-zinc-900 border border-zinc-600 rounded-lg">
                          <div className="font-semibold text-zinc-300 text-sm mb-1">
                            🥈 Second Prize
                          </div>
                          <div className="text-zinc-400 text-sm">
                            {hackathon.prizes.secondPrize}
                          </div>
                        </div>
                      )}
                      {hackathon.prizes.thirdPrize && (
                        <div className="p-3 bg-zinc-900 border border-orange-600 rounded-lg">
                          <div className="font-semibold text-orange-300 text-sm mb-1">
                            🥉 Third Prize
                          </div>
                          <div className="text-zinc-300 text-sm">
                            {hackathon.prizes.thirdPrize}
                          </div>
                        </div>
                      )}
                      {hackathon.prizes.participantPrize && (
                        <div className="p-3 bg-zinc-900 border border-blue-600 rounded-lg">
                          <div className="font-semibold text-blue-300 text-sm mb-1">
                            🎁 Participation
                          </div>
                          <div className="text-zinc-300 text-sm">
                            {hackathon.prizes.participantPrize}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                <Card className="bg-zinc-950 border-zinc-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">
                      Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm font-medium">
                        Created:
                      </span>
                      <span className="text-white text-sm">
                        {new Date(hackathon.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm font-medium">
                        Last Updated:
                      </span>
                      <span className="text-white text-sm">
                        {new Date(hackathon.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === "teams" && (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xl">
                    <TbUsers className="w-5 h-5" />
                    Registered Teams ({teams.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-12">
                    <TbUsers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No teams registered yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <div
                        key={team._id}
                        className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">
                            {team.name}
                          </h4>
                          <Badge className="bg-zinc-700 text-zinc-300 border border-zinc-600 px-2 py-1 text-xs">
                            <TbCode className="w-3 h-3 mr-1" />
                            {team.joinCode}
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                          {team.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                          <span>{team.members.length} members</span>
                          <span>
                            Created{" "}
                            {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {team.members.slice(0, 3).map((member) => (
                            <div
                              key={member.user._id}
                              className="w-6 h-6 bg-zinc-700 border border-zinc-600 rounded-full flex items-center justify-center text-xs text-white relative"
                              title={
                                member.user.displayName || member.user.email
                              }
                            >
                              {member.role === "leader" && (
                                <TbCrown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                              )}
                              {(member.user.displayName ||
                                member.user.email)[0].toUpperCase()}
                            </div>
                          ))}
                          {team.members.length > 3 && (
                            <div className="w-6 h-6 bg-zinc-600 border border-zinc-500 rounded-full flex items-center justify-center text-xs text-zinc-300">
                              +{team.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <TbUsers className="w-5 h-5" />
                  All Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-12">
                    <TbUsers className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">
                      No participants registered yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={`${participant._id}-${participant.teamId}`}
                        className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-700 border border-zinc-600 rounded-full flex items-center justify-center text-sm font-medium text-white relative">
                            {participant.role === "leader" && (
                              <TbCrown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                            )}
                            {(participant.displayName ||
                              participant.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {participant.displayName || participant.email}
                            </div>
                            <div className="text-zinc-400 text-xs">
                              Team: {participant.teamName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`border px-2 py-1 text-xs ${
                              participant.role === "leader"
                                ? "bg-yellow-600 text-white border-yellow-500"
                                : "bg-zinc-700 text-zinc-300 border-zinc-600"
                            }`}
                          >
                            {participant.role}
                          </Badge>
                          <div className="text-xs text-zinc-500 mt-1">
                            Joined{" "}
                            {new Date(
                              participant.joinedAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-xl">
                  <TbCalendar className="w-5 h-5 mr-2" />
                  Hackathon Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hackathon.timelines && (
                  <>
                    <div className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-white mb-1">
                          Registration Opens
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {formatDate(hackathon.timelines.registrationStart)}
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white border border-green-500 px-2 py-1 text-xs">
                        Start
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-white mb-1">
                          Registration Ends
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {formatDate(hackathon.timelines.registrationEnd)}
                        </p>
                      </div>
                      <Badge className="bg-yellow-600 text-white border border-yellow-500 px-2 py-1 text-xs">
                        Deadline
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-white mb-1">
                          Hackathon Starts
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {formatDate(hackathon.timelines.hackathonStart)}
                        </p>
                      </div>
                      <Badge className="bg-blue-600 text-white border border-blue-500 px-2 py-1 text-xs">
                        Event
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-white mb-1">
                          Hackathon Ends
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {formatDate(hackathon.timelines.hackathonEnd)}
                        </p>
                      </div>
                      <Badge className="bg-red-600 text-white border border-red-500 px-2 py-1 text-xs">
                        End
                      </Badge>
                    </div>

                    {hackathon.timelines.resultsDate && (
                      <div className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <div>
                          <p className="font-semibold text-white mb-1">
                            Results Announcement
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {formatDate(hackathon.timelines.resultsDate)}
                          </p>
                        </div>
                        <Badge className="bg-purple-600 text-white border border-purple-500 px-2 py-1 text-xs">
                          Results
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">
                    Hackathon Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium">
                      Current Status
                    </span>
                    <Badge
                      className={`${getStatusColor(
                        hackathon.status
                      )} border px-2 py-1 text-xs`}
                    >
                      {hackathon.status.charAt(0).toUpperCase() +
                        hackathon.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium">
                      Created
                    </span>
                    <span className="text-white text-sm">
                      {formatDate(hackathon.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm font-medium">
                      Last Updated
                    </span>
                    <span className="text-white text-sm">
                      {formatDate(hackathon.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">
                    Management Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() =>
                      navigate(`/organizer/hackathon/${hackathonId}/edit`)
                    }
                  >
                    <TbEdit className="w-4 h-4 mr-2" />
                    Edit Hackathon Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    onClick={() =>
                      navigate(
                        `/organizer/hackathon/${hackathonId}/allot-judges`
                      )
                    }
                  >
                    <TbUserPlus className="w-4 h-4 mr-2" />
                    Manage Judges
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    onClick={handleDeleteHackathon}
                  >
                    <TbTrash className="w-4 h-4 mr-2" />
                    Delete Hackathon
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ViewHackathonDetails;
