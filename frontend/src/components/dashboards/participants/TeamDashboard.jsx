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
  ExternalLink,
  Crown,
  Share2,
  User,
  FileText,
  CheckCircle,
  Edit,
  Plus,
  Target,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProjectEditor from "./ProjectEditor";

const TeamDashboard = () => {
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showProjectEditor, setShowProjectEditor] = useState(false);

  // Fetch team, hackathon, and project
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

        // Fetch team project for this hackathon
        let projectData = null;
        if (teamData.success) {
          const projRes = await fetch(
            `${import.meta.env.VITE_API_URL}/teams/${hackathonId}/project`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const projJson = await projRes.json();
          if (projJson.success && projJson.data) {
            projectData = projJson.data;
          }
        }

        if (teamData.success) setTeam(teamData.data);
        if (hackData.success) setHackathon(hackData.data);
        setProject(projectData);

        if (!teamData.success) toast.error("Failed to load team");
        if (!hackData.success) toast.error("Failed to load hackathon");
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, hackathonId, showProjectEditor]);

  // Helpers
  const now = new Date();
  const hackStart = new Date(hackathon?.timelines?.hackathonStart);
  const hackEnd = new Date(hackathon?.timelines?.hackathonEnd);
  const canEditOrSubmit = now >= hackStart && now <= hackEnd;

  const handleCopy = () => {
    if (team?.joinCode) {
      navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Team code copied to clipboard!");
    }
  };

  const handleSubmitProject = async () => {
    if (!project) {
      toast.error("Create your project first!");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${project._id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Project submitted successfully!");
        setProject({ ...project, status: "submitted" });
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Submission failed");
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

  const getStatus = () => {
    if (!hackathon?.timelines) return "upcoming";
    const now = new Date();
    const regEnd = new Date(hackathon.timelines.registrationEnd);
    const hackEnd = new Date(hackathon.timelines.hackathonEnd);
    if (regEnd > now) return "upcoming";
    if (hackEnd > now) return "ongoing";
    return "completed";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "ongoing":
        return "default";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-800 border-t-white mx-auto"></div>
          <p className="text-neutral-400">Loading team dashboard...</p>
        </div>
      </div>
    );
  }

  if (!team || !hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Team not found</h2>
          <p className="text-neutral-400">
            Unable to load your team or hackathon data
          </p>
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-3">
            {!project && canEditOrSubmit && (
              <Button
                onClick={() => setShowProjectEditor(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
            {project && canEditOrSubmit && (
              <Button
                onClick={() => setShowProjectEditor(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            )}
            {project && canEditOrSubmit && (
              <Button
                onClick={handleSubmitProject}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {project.status === "submitted" ? "Resubmit" : "Submit Project"}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Project Editor Modal */}
        {showProjectEditor && (
          <ProjectEditor
            isOpen={showProjectEditor}
            onClose={() => setShowProjectEditor(false)}
            project={project}
            hackathonId={hackathonId}
            teamId={team._id}
            onUpdate={() => {}}
            onSuccess={() => {
              setShowProjectEditor(false);
              setTimeout(() => window.location.reload(), 500);
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      {team.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-green-600/30 text-green-400"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active Team
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-neutral-300 leading-relaxed">
                    {team.description}
                  </p>

                  {/* Team Join Code */}
                  <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white mb-1">
                          Team Join Code
                        </p>
                        <p className="font-mono text-lg text-blue-400">
                          {team.joinCode}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Share this code with your teammates
                        </p>
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Team Members ({team.members.length})
                    </h4>
                    <div className="space-y-3">
                      {team.members.map((member) => (
                        <div
                          key={member.user._id}
                          className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-white font-semibold border border-neutral-700">
                              {(member.user.displayName ||
                                member.user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {member.user.displayName || member.user.email}
                              </p>
                              <p className="text-xs text-neutral-400">
                                Joined{" "}
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {member.role === "leader" && (
                            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
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

            {/* Project Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    Project Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">
                            {project.title}
                          </h3>
                          <p className="text-neutral-400 text-sm">
                            {project.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            project.status === "submitted"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            project.status === "submitted"
                              ? "bg-green-600/20 text-green-400 border-green-600/30"
                              : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                          }
                        >
                          {project.status === "submitted"
                            ? "Submitted"
                            : "Draft"}
                        </Badge>
                      </div>
                      {project.status === "submitted" && (
                        <Alert className="border-green-600/20 bg-green-600/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-200">
                            Your project has been successfully submitted and is
                            under review.
                          </AlertDescription>
                        </Alert>
                      )}
                      {!canEditOrSubmit && project.status !== "submitted" && (
                        <Alert className="border-yellow-600/20 bg-yellow-600/10">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-200">
                            Submission period has ended. Your project remains as
                            a draft.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-neutral-400">
                        No project created yet.
                      </p>
                      {canEditOrSubmit ? (
                        <Button
                          onClick={() => setShowProjectEditor(true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Project
                        </Button>
                      ) : (
                        <Alert className="border-yellow-200/20 bg-yellow-600/10">
                          <Clock className="h-4 w-4 border-yellow-200" />
                          <AlertDescription className="text-yellow-200">
                            Project creation is only available during the
                            hackathon period.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Hackathon Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Hackathon Details
                    </CardTitle>
                    <Badge variant={getStatusVariant(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Banner */}
                  {hackathon.bannerImageUrl && (
                    <div className="h-48 relative overflow-hidden rounded-lg">
                      <img
                        src={hackathon.bannerImageUrl}
                        alt={hackathon.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
                    </div>
                  )}

                  {/* Basic Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {hackathon.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                        <Target className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Theme
                          </p>
                          <p className="text-orange-400">{hackathon.theme}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Team Size
                          </p>
                          <p className="text-blue-400">
                            {hackathon.teamSettings?.minTeamSize} -{" "}
                            {hackathon.teamSettings?.maxTeamSize} members
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-300 leading-relaxed mt-4">
                      {hackathon.description}
                    </p>
                  </div>

                  {/* Prizes */}
                  {hackathon.prizes && (
                    <div>
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Prizes & Rewards
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hackathon.prizes.firstPrize && (
                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🥇</span>
                              <h4 className="font-semibold text-yellow-400">
                                First Prize
                              </h4>
                            </div>
                            <p className="text-neutral-300">
                              {hackathon.prizes.firstPrize}
                            </p>
                          </div>
                        )}
                        {hackathon.prizes.secondPrize && (
                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🥈</span>
                              <h4 className="font-semibold text-neutral-300">
                                Second Prize
                              </h4>
                            </div>
                            <p className="text-neutral-300">
                              {hackathon.prizes.secondPrize}
                            </p>
                          </div>
                        )}
                        {hackathon.prizes.thirdPrize && (
                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🥉</span>
                              <h4 className="font-semibold text-orange-400">
                                Third Prize
                              </h4>
                            </div>
                            <p className="text-neutral-300">
                              {hackathon.prizes.thirdPrize}
                            </p>
                          </div>
                        )}
                        {hackathon.prizes.participantPrize && (
                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Gift className="w-5 h-5 text-blue-400" />
                              <h4 className="font-semibold text-blue-400">
                                Participation Prize
                              </h4>
                            </div>
                            <p className="text-neutral-300">
                              {hackathon.prizes.participantPrize}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300"
                    onClick={() =>
                      navigate(`/participant/hackathon/${hackathonId}`)
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Hackathon Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300"
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
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Team Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Team Size</span>
                    <span className="text-white font-medium">
                      {team.members.length}/
                      {hackathon.teamSettings?.maxTeamSize}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Created</span>
                    <span className="text-white font-medium">
                      {new Date(
                        team.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Project Status</span>
                    <Badge
                      variant={
                        project?.status === "submitted"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        project?.status === "submitted"
                          ? "bg-green-600/20 text-green-400 border-green-600/30"
                          : project
                          ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                          : "bg-neutral-600/20 text-neutral-400 border-neutral-600/30"
                      }
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {project
                        ? project.status === "submitted"
                          ? "Submitted"
                          : "Draft"
                        : "Not Created"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Registration</span>
                    <Badge
                      variant="outline"
                      className="border-green-600/30 text-green-400"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
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
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Registration Ends</span>
                    <span className="text-white font-medium">
                      {new Date(
                        hackathon.timelines?.registrationEnd
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Hackathon Starts</span>
                    <span className="text-white font-medium">
                      {new Date(
                        hackathon.timelines?.hackathonStart
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">
                      Submission Deadline
                    </span>
                    <span className="text-white font-medium">
                      {new Date(
                        hackathon.timelines?.hackathonEnd
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Time Remaining</span>
                    <span className="text-white font-medium">
                      {getTimeLeft(hackathon.timelines?.hackathonEnd)}
                    </span>
                  </div>
                  {hackathon.timelines?.resultsDate && (
                    <>
                      <Separator className="bg-neutral-800" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Results</span>
                        <span className="text-white font-medium">
                          {new Date(
                            hackathon.timelines.resultsDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </>
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
