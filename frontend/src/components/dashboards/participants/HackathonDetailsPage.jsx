import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Trophy,
  ArrowLeft,
  Clock,
  MapPin,
  Globe,
  Target,
  Gift,
  UserPlus,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const HackathonDetailsPage = () => {
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
        console.log("Hackathon Data:", hackData);
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
        }
      } catch (err) {
        toast.error("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDetails();
  }, [user, hackathonId]);

  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const description = form.description.value;
    setActionLoading(true);
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
        toast.success("Team created successfully!");
        setTeam(data.data);
        setShowCreate(false);
        // Navigate to team dashboard after 1 second
        setTimeout(() => {
          navigate(`/participant/hackathon/${hackathonId}/team`);
        }, 1000);
      } else {
        toast.error(data.error || "Error creating team");
      }
    } catch (err) {
      toast.error("Error creating team");
    } finally {
      setActionLoading(false);
    }
  };

  // Join Team
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim().toUpperCase();
    setActionLoading(true);
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
        toast.success("Successfully joined team!");
        setTeam(data.data);
        setShowJoin(false);
        // Navigate to team dashboard after 1 second
        setTimeout(() => {
          navigate(`/participant/hackathon/${hackathonId}/team`);
        }, 1000);
      } else {
        toast.error(data.error || "Error joining team");
      }
    } catch (err) {
      toast.error("Error joining team");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatus = () => {
    if (!hackathon?.timelines) return "upcoming";
    const now = new Date();
    const regEnd = new Date(hackathon.timelines.registrationEnd);
    const hackEnd = new Date(hackathon.timelines.hackathonEnd);
    if (regEnd > now) return "upcoming";
    if (hackEnd > now) return "ongoing";
    return "completed";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "ongoing":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const getTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Hackathon not found</h2>
          <p className="text-white/70 mb-6">This hackathon may have been removed or doesn't exist</p>
          <Button onClick={() => navigate("/dashboard")}>
            Go Back to Hackathons
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatus();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathons
            </Button>
          </div>
          {team && (
            <Button
              onClick={() => navigate(`/participant/hackathon/${hackathonId}/team`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Go to Team Dashboard
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-zinc-950 border-white/5 overflow-hidden">
                {hackathon.bannerImageUrl && (
                  <div className="h-60 relative overflow-hidden">
                    <img
                      src={hackathon.bannerImageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <Badge className={`${getStatusColor(status)} border mb-2`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      <h1 className="text-4xl font-bold text-white mb-2">{hackathon.title}</h1>
                      <p className="text-purple-300 text-lg font-medium">{hackathon.theme}</p>
                    </div>
                  </div>
                )}
                {!hackathon.bannerImageUrl && (
                  <CardHeader className="bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${getStatusColor(status)} border`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-4xl font-bold text-white mb-2">
                      {hackathon.title}
                    </CardTitle>
                    <p className="text-purple-300 text-lg font-medium">{hackathon.theme}</p>
                  </CardHeader>
                )}
              </Card>
            </motion.div>

            {/* Team Status */}
            {team ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-300">
                          You're registered for this hackathon!
                        </h3>
                        <p className="text-green-200/80">
                          Team: <span className="font-medium">{team.name}</span> • 
                          Code: <span className="font-mono">{team.joinCode}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-300">
                          Ready to participate?
                        </h3>
                        <p className="text-blue-200/80">
                          Create a new team or join an existing one to get started.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowCreate(!showCreate);
                          setShowJoin(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {showCreate ? "Cancel" : "Create Team"}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowJoin(!showJoin);
                          setShowCreate(false);
                        }}
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {showJoin ? "Cancel" : "Join Team"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Create Team Form */}
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-zinc-950 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Create Your Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateTeam} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Team Name
                        </label>
                        <Input
                          name="name"
                          placeholder="Enter your team name"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Team Description
                        </label>
                        <Textarea
                          name="description"
                          placeholder="Describe your team and goals..."
                          required
                          className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading ? "Creating..." : "Create Team"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Join Team Form */}
            {showJoin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-zinc-950 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Join a Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJoinTeam} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Team Join Code
                        </label>
                        <Input
                          name="code"
                          placeholder="Enter 6-character team code"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white uppercase font-mono"
                          maxLength={6}
                        />
                        <p className="text-xs text-white/60 mt-1">
                          Ask your team leader for the join code
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading ? "Joining..." : "Join Team"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">About This Hackathon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 leading-relaxed mb-4">
                    {hackathon.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Theme</p>
                        <p className="text-purple-300">{hackathon.theme}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Team Size</p>
                        <p className="text-blue-300">
                          {hackathon.teamSettings?.minTeamSize} - {hackathon.teamSettings?.maxTeamSize} members
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Problem Statements */}
            {team && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="bg-zinc-950 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Problem Statements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {new Date() >= new Date(hackathon.timelines?.hackathonStart) ? (
                      <div className="space-y-4">
                        <p className="text-white/80 leading-relaxed">
                          {hackathon.problemStatements}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Problem statements are now available for registered participants</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">Problem statements will be available when the hackathon starts</p>
                              <p className="text-white/60 text-sm mt-1">
                                Starting on {new Date(hackathon.timelines?.hackathonStart).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Prizes */}
            {hackathon.prizes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-zinc-950 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Prizes & Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hackathon.prizes.firstPrize && (
                        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🥇</span>
                            <h4 className="font-semibold text-yellow-300">First Prize</h4>
                          </div>
                          <p className="text-white/80">{hackathon.prizes.firstPrize}</p>
                        </div>
                      )}
                      {hackathon.prizes.secondPrize && (
                        <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🥈</span>
                            <h4 className="font-semibold text-gray-300">Second Prize</h4>
                          </div>
                          <p className="text-white/80">{hackathon.prizes.secondPrize}</p>
                        </div>
                      )}
                      {hackathon.prizes.thirdPrize && (
                        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🥉</span>
                            <h4 className="font-semibold text-orange-300">Third Prize</h4>
                          </div>
                          <p className="text-white/80">{hackathon.prizes.thirdPrize}</p>
                        </div>
                      )}
                      {hackathon.prizes.participantPrize && (
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-300">Participation Prize</h4>
                          </div>
                          <p className="text-white/80">{hackathon.prizes.participantPrize}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Status</span>
                    <Badge className={`${getStatusColor(status)} border`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Time Left</span>
                    <span className="text-white font-semibold">
                      {getTimeLeft(hackathon.timelines?.hackathonEnd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Team Size</span>
                    <span className="text-white font-semibold">
                      {hackathon.teamSettings?.minTeamSize} - {hackathon.teamSettings?.maxTeamSize}
                    </span>
                  </div>
                  {team && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Your Team</span>
                      <Badge className="bg-green-500/20 text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Registered
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Registration Ends</span>
                    <span className="text-white">
                      {new Date(hackathon.timelines?.registrationEnd).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Hackathon Starts</span>
                    <span className="text-white">
                      {new Date(hackathon.timelines?.hackathonStart).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Submission Deadline</span>
                    <span className="text-white">
                      {new Date(hackathon.timelines?.hackathonEnd).toLocaleDateString()}
                    </span>
                  </div>
                  {hackathon.timelines?.resultsDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Results</span>
                      <span className="text-white">
                        {new Date(hackathon.timelines.resultsDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {(hackathon.organizerName|| hackathon.organizerId?.email || "O")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {hackathon.organizerName|| hackathon.organizerId?.email || "Anonymous"}
                      </p>
                      <p className="text-white/60 text-sm">Event Organizer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailsPage;