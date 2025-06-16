import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Users,
  Copy,
  Send,
  ArrowLeft,
  Calendar,
  Trophy,
  Clock,
  MapPin,
  ExternalLink,
  Crown,
  Share2,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TeamDashboard = () => {
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        
        // Fetch team data
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
        
        // Fetch hackathon data
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

        if (teamData.success) setTeam(teamData.data);
        if (hackData.success) setHackathon(hackData.data);
        
        if (!teamData.success) toast.error("Failed to load team");
        if (!hackData.success) toast.error("Failed to load hackathon");
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, hackathonId]);

  const handleCopy = () => {
    if (team?.joinCode) {
      navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSubmitProject = () => {
    toast.success("Project submission coming soon!");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading your team dashboard...</p>
        </div>
      </div>
    );
  }

  if (!team || !hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-white/70 mb-6">Unable to load your team or hackathon data</p>
          <Button onClick={() => navigate("/participant/hackathons")}>
            Go Back to Hackathons
          </Button>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate("/participant/hackathons")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Team Dashboard
              </h1>
              <p className="text-white/60 mt-1">Manage your team and submissions</p>
            </div>
          </div>
          <Button
            onClick={handleSubmitProject}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Project
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Team Info & Hackathon Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80">{team.description}</p>
                  
                  {/* Team Code */}
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div>
                      <p className="text-sm text-white/60">Team Join Code</p>
                      <p className="font-mono text-lg text-purple-300">{team.joinCode}</p>
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Team Members ({team.members.length})
                    </h4>
                    <div className="space-y-2">
                      {team.members.map((member, index) => (
                        <div
                          key={member.user._id}
                          className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                              {(member.user.displayName || member.user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {member.user.displayName || member.user.email}
                              </p>
                              <p className="text-xs text-white/60">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {member.role === "leader" && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Leader
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hackathon Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Hackathon Details</CardTitle>
                    <Badge className={`${getStatusColor(hackathon.status)} border`}>
                      {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Banner */}
                  {hackathon.bannerImageUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={hackathon.bannerImageUrl}
                        alt={hackathon.title}
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}

                  {/* Basic Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{hackathon.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                      <Badge className="bg-purple-500/20 text-purple-300">{hackathon.theme}</Badge>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {hackathon.teamSettings?.minTeamSize} - {hackathon.teamSettings?.maxTeamSize} members
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed">{hackathon.description}</p>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Hackathon Period</span>
                      </div>
                      <p className="text-white text-sm">
                        {new Date(hackathon.timelines?.hackathonStart).toLocaleDateString()} - {" "}
                        {new Date(hackathon.timelines?.hackathonEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Time Remaining</span>
                      </div>
                      <p className="text-white text-sm">
                        {getTimeLeft(hackathon.timelines?.hackathonEnd)}
                      </p>
                    </div>
                  </div>

                  {/* Prizes */}
                  {hackathon.prizes && (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Prizes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hackathon.prizes.firstPrize && (
                          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <p className="font-medium text-yellow-300">🥇 First Prize</p>
                            <p className="text-sm text-white/80">{hackathon.prizes.firstPrize}</p>
                          </div>
                        )}
                        {hackathon.prizes.secondPrize && (
                          <div className="p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                            <p className="font-medium text-gray-300">🥈 Second Prize</p>
                            <p className="text-sm text-white/80">{hackathon.prizes.secondPrize}</p>
                          </div>
                        )}
                        {hackathon.prizes.thirdPrize && (
                          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <p className="font-medium text-orange-300">🥉 Third Prize</p>
                            <p className="text-sm text-white/80">{hackathon.prizes.thirdPrize}</p>
                          </div>
                        )}
                        {hackathon.prizes.participantPrize && (
                          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="font-medium text-blue-300">🎁 Participation Prize</p>
                            <p className="text-sm text-white/80">{hackathon.prizes.participantPrize}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleSubmitProject}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    onClick={() => navigate(`/participant/hackathon/${hackathonId}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Hackathon
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    onClick={handleCopy}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Team Code
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Team Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Team Size</span>
                    <span className="text-white font-semibold">{team.members.length}/{hackathon.teamSettings?.maxTeamSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Created</span>
                    <span className="text-white font-semibold">
                      {new Date(team.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Project Status</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      <FileText className="w-3 h-3 mr-1" />
                      Not Submitted
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Registration Status</span>
                    <Badge className="bg-green-500/20 text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Registered
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Important Dates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-zinc-950 border-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Important Dates</CardTitle>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;