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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HackathonResults from "../../results/HackathonResults";

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teams`, {
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
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Team created successfully!");
        setTeam(data.data);
        setShowCreate(false);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/teams/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Successfully joined team!");
        setTeam(data.data);
        setShowJoin(false);
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

  const getStatusVariant = (status) => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "ongoing":
        return "default";
      case "completed":
        return "destructive";
      default:
        return "secondary";
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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-800 border-t-white mx-auto"></div>
          <p className="text-neutral-400">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Hackathon not found</h2>
          <p className="text-neutral-400">
            This hackathon may have been removed or doesn't exist
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
            Back to Hackathons
          </Button>
          {team && (
            <Button
              onClick={() =>
                navigate(`/participant/hackathon/${hackathonId}/team`)
              }
              className="bg-zinc-900 text-white hover:bg-zinc-800 border border-neutral-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Go to Team Dashboard
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                {hackathon.bannerImageUrl ? (
                  <div className="h-64 relative overflow-hidden rounded-t-lg">
                    <img
                      src={hackathon.bannerImageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge
                        variant={getStatusVariant(status)}
                        className="mb-4"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        {hackathon.title}
                      </h1>
                      <p className="text-neutral-300 text-lg">
                        {hackathon.theme}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusVariant(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-4xl font-bold text-white mb-3">
                        {hackathon.title}
                      </CardTitle>
                      <p className="text-neutral-300 text-lg">
                        {hackathon.theme}
                      </p>
                    </div>
                  </CardHeader>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {team ? (
                <Card className="bg-zinc-950 border-green-600/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">
                          You're registered for this hackathon!
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-300">
                            <span>Team:</span>
                            <span className="font-medium text-white">
                              {team.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-300">
                            <span>Join Code:</span>
                            <span className="font-mono bg-neutral-800 px-2 py-1 rounded text-green-400 border border-neutral-700">
                              {team.joinCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-950 border-neutral-800">
                  <CardContent className="px-8 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-lg">
                        Ready to participate?
                      </h3>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => {
                            setShowCreate(!showCreate);
                            setShowJoin(false);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-6"
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
                          className="border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300 px-6"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {showJoin ? "Cancel" : "Join Team"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Create Team Form */}
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-zinc-950 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Create Your Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateTeam} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Team Name
                        </label>
                        <Input
                          name="name"
                          placeholder="Enter your team name"
                          required
                          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400 mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Team Description
                        </label>
                        <Textarea
                          name="description"
                          placeholder="Describe your team and goals..."
                          required
                          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400 min-h-[120px] mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-zinc-950 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white">Join a Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleJoinTeam} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Team Join Code
                        </label>
                        <Input
                          name="code"
                          placeholder="Enter 6-character team code"
                          required
                          className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400 uppercase font-mono mt-1"
                          maxLength={6}
                        />
                        <p className="text-xs text-neutral-400">
                          Ask your team leader for the join code
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full border-neutral-700 text-neutral-800 bg-white hover:bg-neutral-800 hover:text-white transition-all duration-300"
                      >
                        {actionLoading ? "Joining..." : "Join Team"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    About This Hackathon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-neutral-300 leading-relaxed">
                    {hackathon.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                      <Target className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-white">Theme</p>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Problem Statements */}
            {(team ||
              hackathon.judges?.some((judge) => judge._id === user.uid)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="bg-zinc-950 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Problem Statements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hackathon.judges?.some(
                      (judge) => judge._id === user.uid
                    ) ? (
                      <div className="space-y-4">
                        <p className="text-neutral-300 leading-relaxed">
                          {hackathon.problemStatements}
                        </p>
                        <Alert className="border-blue-600/20 bg-blue-600/10">
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertDescription className="text-blue-200">
                            As a judge, you have full access to the problem
                            statements
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : new Date() >=
                      new Date(hackathon.timelines?.hackathonStart) ? (
                      <div className="space-y-4">
                        <p className="text-neutral-300 leading-relaxed">
                          {hackathon.problemStatements}
                        </p>
                        <Alert className="border-green-600/20 bg-green-600/10">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-200">
                            Problem statements are now available for registered
                            participants
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <Alert className="border-yellow-600/20 bg-yellow-600/10">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-yellow-200">
                          <div className="font-medium">
                            Problem statements will be available when the
                            hackathon starts
                          </div>
                          <div className="text-sm mt-1">
                            Starting on{" "}
                            {new Date(
                              hackathon.timelines?.hackathonStart
                            ).toLocaleDateString()}
                          </div>
                        </AlertDescription>
                      </Alert>
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
                <Card className="bg-zinc-950 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Prizes & Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results Section - Add this new section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <HackathonResults
                hackathonId={hackathonId}
                userRole="participant"
              />
            </motion.div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Status</span>
                    <Badge variant={getStatusVariant(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <Separator className="bg-neutral-800" />
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Time Left</span>
                    <span className="text-white font-medium">
                      {getTimeLeft(hackathon.timelines?.hackathonEnd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Team Size</span>
                    <span className="text-white font-medium">
                      {hackathon.teamSettings?.minTeamSize} -{" "}
                      {hackathon.teamSettings?.maxTeamSize}
                    </span>
                  </div>
                  {team && (
                    <>
                      <Separator className="bg-neutral-800" />
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Your Team</span>
                        <Badge
                          variant="outline"
                          className="border-green-600/30 text-green-400"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Registered
                        </Badge>
                      </div>
                    </>
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

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-zinc-950 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-white font-semibold border border-neutral-700">
                      {(hackathon.organizerName ||
                        hackathon.organizerId?.email ||
                        "O")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {hackathon.organizerName ||
                          hackathon.organizerId?.email ||
                          "Anonymous"}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Event Organizer
                      </p>
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
