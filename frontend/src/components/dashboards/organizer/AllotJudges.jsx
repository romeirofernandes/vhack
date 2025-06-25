import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TbSearch,
  TbUserPlus,
  TbUsers,
  TbMail,
  TbUserCheck,
  TbArrowLeft,
} from "react-icons/tb";
import { MdInfo } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const AllotJudges = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [hackathonData, setHackathonData] = useState(null);
  const [invitedJudges, setInvitedJudges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const navigate = useNavigate();

  // Fetch hackathon data to get invited judges
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/hackathons`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (response.data.success) {
          const filteredData = response.data.data.hackathons.find(
            (hackathon) => hackathon._id === hackathonId
          );
          if (!filteredData) {
            toast.error("Hackathon not found");
            return;
          }
          setHackathonData(filteredData);
          // Extract invited judge IDs
          const invitedJudgeIds =
            filteredData.invitedJudges?.map((judge) =>
              typeof judge === "string" ? judge : judge._id
            ) || [];
          const acceptedJudgeIds =
            filteredData.judges?.map((judge) =>
              typeof judge === "string" ? judge : judge._id
            ) || [];

          // Combine both invited and accepted judges
          const allInvitedIds = [...invitedJudgeIds, ...acceptedJudgeIds];
          setInvitedJudges(allInvitedIds);
        } else {
          toast.error("Failed to fetch hackathon data");
        }
      } catch (error) {
        toast.error("Error fetching hackathon data");
      }
    };

    if (hackathonId && user) {
      fetchHackathonData();
    }
  }, [hackathonId, user]);

  const filterAlreadyInvitedJudges = (judgesList) => {
    return judgesList.filter((judge) => {
      const judgeId = typeof judge === "string" ? judge : judge._id;
      return !invitedJudges.includes(judgeId);
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter an email to search");
      return;
    }

    setIsLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/judge/search?email=${searchQuery}&role=judge`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        if (response.data.users.length === 0) {
          toast.error("No users found with this email");
          setFilteredJudges([]);
        } else {
          // Filter out already invited judges
          const availableJudges = filterAlreadyInvitedJudges(
            response.data.users
          );
          setFilteredJudges(availableJudges);

          const totalFound = response.data.users.length;
          const availableCount = availableJudges.length;
          const alreadyInvited = totalFound - availableCount;

          if (availableCount === 0) {
            toast.info(
              `Found ${totalFound} judge(s) but all are already invited to this hackathon`
            );
          } else if (alreadyInvited > 0) {
            toast.success(
              `Found ${availableCount} available judge(s) (${alreadyInvited} already invited)`
            );
          } else {
            toast.success(`Found ${availableCount} available judge(s)`);
          }
        }
      } else {
        toast.error(response.data.error || "Failed to search users");
        setFilteredJudges([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error searching users");
      setFilteredJudges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteJudge = async (judgeId) => {
    setIsInviting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/judge/hackathon/${hackathonId}/invite`,
        { judgeId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Judge invited successfully");

        // Add the invited judge to the list to filter them out
        setInvitedJudges((prev) => [...prev, judgeId]);

        // Remove the judge from filtered judges list
        setFilteredJudges((prev) =>
          prev.filter((judge) => judge._id !== judgeId)
        );

        // Refresh hackathon data
        const hackathonResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/hackathons`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (hackathonResponse.data.success) {
          const filteredData = hackathonResponse.data.data.hackathons.find(
            (hackathon) => hackathon._id === hackathonId
          );
          if (!filteredData) {
            toast.error("Hackathon not found");
            return;
          }
          setHackathonData(filteredData);
        }
      } else {
        toast.error(response.data.error || "Failed to invite judge");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error inviting judge");
    } finally {
      setIsInviting(false);
    }
  };

  const isJudgeAlreadyInvited = (judgeId) => {
    return invitedJudges.includes(judgeId);
  };

  useEffect(() => {
    const fetchJudges = async () => {
      setIsLoading(true);
      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/judge`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (response.data.success) {
          setJudges(response.data.judges);
          // Filter out already invited judges
          const availableJudges = filterAlreadyInvitedJudges(
            response.data.judges
          );
          setFilteredJudges(availableJudges);
        } else {
          toast.error(response.data.error || "Failed to fetch judges");
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Error fetching judges");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && invitedJudges.length >= 0) {
      // Only fetch when we have invited judges data
      fetchJudges();
    }
  }, [hackathonId, user, invitedJudges]);

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="ghost"
            className="bg-zinc-900 text-white hover:bg-zinc-800 border border-neutral-700 hover:text-white text-sm sm:text-base"
            onClick={() => navigate("/organizer/dashboard")}
          >
            <TbArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Page Title */}
          <div className="text-center space-y-3 mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Invite Judges</h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Search and invite qualified judges to evaluate projects in your
              hackathon
              {hackathonData && (
                <span className="block text-sm mt-2 text-white/60">
                  {hackathonData.title}
                </span>
              )}
            </p>
          </div>

          {/* Stats Card */}
          {hackathonData && (
            <Card className="bg-zinc-950 border-white/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                        <TbUserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">
                          Invited Judges
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-400">
                          {invitedJudges.length}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <TbUsers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm sm:text-base">Accepted</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-400">
                          {hackathonData.judges?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  {hackathonData.invitedJudges?.length > 0 && (
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 px-2 sm:px-3 py-1 text-xs sm:text-sm self-start sm:self-center">
                      {hackathonData.invitedJudges.length} pending invitations
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Search Section */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Search Card */}
              <Card className="bg-zinc-950 border-white/10">
                <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-white text-lg sm:text-xl">
                      Search Judges
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Search for judges by their email address to invite
                          them
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <Input
                        type="email"
                        placeholder="Enter judge's email address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 pl-10 sm:pl-12 text-sm sm:text-base"
                      />
                      <TbSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="bg-blue-600 text-white hover:bg-blue-700 h-10 sm:h-12 px-4 sm:px-8 text-sm sm:text-base"
                    >
                      {isLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Judges List */}
              <Card className="bg-zinc-950 border-white/10">
                <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-white text-lg sm:text-xl">
                      Available Judges
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Judges who haven't been invited to this hackathon yet
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/70 text-sm sm:text-base">Searching for judges...</p>
                    </div>
                  ) : filteredJudges.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <TbUsers className="w-8 h-8 sm:w-12 sm:h-12 text-white/30 mx-auto mb-4" />
                      <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                        No available judges found
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto px-4">
                        {searchQuery
                          ? "Try searching with a different email or all judges matching this search are already invited"
                          : "Search for judges using their email address to send invitations"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredJudges.map((judge) => (
                        <motion.div
                          key={judge._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 gap-3 sm:gap-4"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600/20 border-2 border-blue-600/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-lg font-medium text-white">
                                {judge.displayName?.charAt(0) ||
                                  judge.email?.charAt(0)}
                              </span>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h3 className="font-medium text-white text-sm sm:text-base truncate">
                                {judge.displayName || "Anonymous Judge"}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs w-fit">
                                  {judge.email}
                                </Badge>
                                {judge.profile?.expertise && (
                                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs w-fit">
                                    {judge.profile.expertise}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleInviteJudge(judge._id)}
                            disabled={
                              isInviting || isJudgeAlreadyInvited(judge._id)
                            }
                            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed h-9 sm:h-10 px-3 sm:px-6 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <TbMail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {isJudgeAlreadyInvited(judge._id)
                              ? "Already Invited"
                              : "Send Invite"}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-1">
              <Card className="bg-zinc-950 border-white/10 lg:sticky lg:top-6">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">
                    Invitation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4 text-white/70">
                    <p className="text-xs sm:text-sm">
                      Invite qualified judges to evaluate projects submitted to
                      your hackathon. Already invited judges are automatically
                      filtered out from search results.
                    </p>

                    <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 space-y-2 sm:space-y-3">
                      <h4 className="font-medium text-white text-xs sm:text-sm">
                        Best Practices:
                      </h4>
                      <ul className="space-y-1 sm:space-y-2 text-xs text-white/60">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>
                            Search judges by their registered email address
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Invite 3-5 judges for balanced evaluation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Consider judges with relevant expertise</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>
                            Judges can be invited until hackathon starts
                          </span>
                        </li>
                      </ul>
                    </div>

                    {hackathonData && (
                      <div className="bg-green-600/10 p-3 sm:p-4 rounded-lg border border-green-600/20 space-y-2">
                        <h4 className="font-medium text-green-400 text-xs sm:text-sm">
                          Current Status:
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Judges Accepted:
                            </span>
                            <span className="text-green-400 font-medium">
                              {hackathonData.judges?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Invitations Pending:
                            </span>
                            <span className="text-yellow-400 font-medium">
                              {hackathonData.invitedJudges?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Total Invited:
                            </span>
                            <span className="text-white font-medium">
                              {invitedJudges.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default AllotJudges;
