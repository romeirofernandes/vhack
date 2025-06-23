import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TbTrophy,
  TbMedal,
  TbAward,
  TbChevronDown,
  TbChevronUp,
  TbCrown,
  TbSparkles,
  TbUsers,
  TbStar,
  TbCalendar,
  TbEye,
  TbEyeOff,
} from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";

const HackathonResults = ({ hackathonId, userRole = "participant" }) => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPodium, setShowPodium] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [resultsAvailable, setResultsAvailable] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [hackathonId, user]);

  useEffect(() => {
    if (showPodium && results.length >= 3) {
      // Animate podium pieces sequentially
      const timer1 = setTimeout(() => setAnimationStage(1), 300); // 3rd place
      const timer2 = setTimeout(() => setAnimationStage(2), 600); // 2nd place
      const timer3 = setTimeout(() => setAnimationStage(3), 900); // 1st place
      const timer4 = setTimeout(() => setAnimationStage(4), 1200); // Confetti

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [showPodium, results]);

  const fetchResults = async () => {
    if (!user || !hackathonId) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/results/hackathon/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setResults(data.results);
          setHackathon(data.hackathon);
          setResultsAvailable(true);

          // Auto-show podium if results are fresh (within 24 hours)
          const resultsDate = new Date(data.hackathon.resultsDate);
          const now = new Date();
          const hoursSinceResults = (now - resultsDate) / (1000 * 60 * 60);

          if (hoursSinceResults < 24 && data.results.length >= 3) {
            setShowPodium(true);
          }
        }
      } else if (response.status === 403) {
        // Results not yet available
        setResultsAvailable(false);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPodiumHeight = (position) => {
    switch (position) {
      case 1:
        return "h-40";
      case 2:
        return "h-32";
      case 3:
        return "h-24";
      default:
        return "h-20";
    }
  };

  const getPodiumColor = (position) => {
    switch (position) {
      case 1:
        return "from-yellow-600 to-yellow-400 border-yellow-300";
      case 2:
        return "from-gray-600 to-gray-400 border-gray-300";
      case 3:
        return "from-orange-700 to-orange-500 border-orange-400";
      default:
        return "from-zinc-700 to-zinc-500 border-zinc-400";
    }
  };

  const getPodiumIcon = (position) => {
    switch (position) {
      case 1:
        return <TbTrophy className="w-10 h-10 text-white" />;
      case 2:
        return <TbMedal className="w-8 h-8 text-white" />;
      case 3:
        return <TbAward className="w-8 h-8 text-white" />;
      default:
        return <TbStar className="w-6 h-6 text-white" />;
    }
  };

  const getTeamBadgeColor = (position) => {
    switch (position) {
      case 1:
        return "from-yellow-400 to-orange-400 text-black";
      case 2:
        return "from-gray-400 to-gray-300 text-black";
      case 3:
        return "from-orange-600 to-orange-500 text-white";
      default:
        return "from-zinc-600 to-zinc-500 text-white";
    }
  };

  if (loading) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading results...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resultsAvailable) {
    const resultsDate = hackathon?.resultsDate
      ? new Date(hackathon.resultsDate)
      : null;
    const now = new Date();
    const isResultsTime = resultsDate && now >= resultsDate;

    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TbTrophy className="w-5 h-5 text-yellow-400" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <TbCalendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">
              Results Not Available Yet
            </h3>
            {resultsDate ? (
              <p className="text-zinc-400 mb-4">
                Results will be announced on {resultsDate.toLocaleDateString()}{" "}
                at {resultsDate.toLocaleTimeString()}
              </p>
            ) : (
              <p className="text-zinc-400 mb-4">
                Results announcement date not set
              </p>
            )}
            <Badge
              className={`${
                isResultsTime ? "bg-orange-600" : "bg-zinc-600"
              } text-white`}
            >
              {isResultsTime ? "Processing Results..." : "Scheduled"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TbTrophy className="w-5 h-5 text-yellow-400" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <TbUsers className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">
              No Results Available
            </h3>
            <p className="text-zinc-400">No projects have been judged yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topThree = results.slice(0, 3);
  const [first, second, third] = topThree;

  return (
    <div className="space-y-6">
      {/* Podium Section */}
      {results.length >= 3 && (
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-zinc-900/50 transition-colors"
            onClick={() => setShowPodium(!showPodium)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <TbTrophy className="w-5 h-5 text-yellow-400" />
                🎉 Winners Podium
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                  Top 3
                </Badge>
                {showPodium ? (
                  <TbChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <TbChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            </div>
          </CardHeader>

          <AnimatePresence>
            {showPodium && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent className="px-6 pb-6">
                  {/* Podium Display */}
                  <div className="relative">
                    <div className="flex items-end justify-center gap-4 h-80 mb-6">
                      {/* 2nd Place */}
                      {second && (
                        <motion.div
                          initial={{ y: 100, opacity: 0 }}
                          animate={
                            animationStage >= 2 ? { y: 0, opacity: 1 } : {}
                          }
                          transition={{
                            duration: 0.6,
                            type: "spring",
                            bounce: 0.3,
                          }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={animationStage >= 2 ? { scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mb-4 text-center"
                          >
                            <div
                              className={`bg-gradient-to-r ${getTeamBadgeColor(
                                2
                              )} px-4 py-2 rounded-full font-bold text-sm mb-2`}
                            >
                              {second.team?.name || second.title}
                            </div>
                            <div className="text-zinc-300 text-xs">
                              {second.finalScore
                                ? `${second.finalScore.toFixed(1)} pts`
                                : "Score: N/A"}
                            </div>
                          </motion.div>

                          <div
                            className={`bg-gradient-to-t ${getPodiumColor(
                              2
                            )} ${getPodiumHeight(
                              2
                            )} w-24 rounded-t-lg border-2 flex flex-col items-center justify-end pb-4 relative`}
                          >
                            <div className="absolute -top-8 bg-gray-500 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white">
                              {getPodiumIcon(2)}
                            </div>
                            <div className="text-white font-bold text-2xl">
                              2
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* 1st Place */}
                      {first && (
                        <motion.div
                          initial={{ y: 100, opacity: 0 }}
                          animate={
                            animationStage >= 3 ? { y: 0, opacity: 1 } : {}
                          }
                          transition={{
                            duration: 0.6,
                            type: "spring",
                            bounce: 0.3,
                          }}
                          className="flex flex-col items-center relative"
                        >
                          {/* Crown */}
                          <motion.div
                            initial={{ y: -20, rotate: -20, opacity: 0 }}
                            animate={
                              animationStage >= 4
                                ? { y: -40, rotate: 0, opacity: 1 }
                                : {}
                            }
                            transition={{ duration: 0.5 }}
                            className="absolute -top-16 text-6xl"
                          >
                            👑
                          </motion.div>

                          <motion.div
                            initial={{ scale: 0 }}
                            animate={animationStage >= 3 ? { scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mb-4 text-center"
                          >
                            <div
                              className={`bg-gradient-to-r ${getTeamBadgeColor(
                                1
                              )} px-6 py-3 rounded-full font-bold text-lg mb-2`}
                            >
                              {first.team?.name || first.title}
                            </div>
                            <div className="text-yellow-300 text-sm font-semibold">
                              {first.finalScore
                                ? `${first.finalScore.toFixed(1)} pts`
                                : "Score: N/A"}
                            </div>
                          </motion.div>

                          <div
                            className={`bg-gradient-to-t ${getPodiumColor(
                              1
                            )} ${getPodiumHeight(
                              1
                            )} w-28 rounded-t-lg border-2 flex flex-col items-center justify-end pb-4 relative`}
                          >
                            <div className="absolute -top-8 bg-yellow-500 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white">
                              {getPodiumIcon(1)}
                            </div>
                            <div className="text-white font-bold text-3xl">
                              1
                            </div>
                          </div>

                          {/* Winner Sparkles */}
                          {animationStage >= 4 && (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="absolute -top-20 -right-8 text-yellow-400"
                              >
                                <TbSparkles className="w-6 h-6" />
                              </motion.div>
                              <motion.div
                                animate={{ rotate: -360 }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="absolute -top-16 -left-8 text-yellow-400"
                              >
                                <TbSparkles className="w-4 h-4" />
                              </motion.div>
                            </>
                          )}
                        </motion.div>
                      )}

                      {/* 3rd Place */}
                      {third && (
                        <motion.div
                          initial={{ y: 100, opacity: 0 }}
                          animate={
                            animationStage >= 1 ? { y: 0, opacity: 1 } : {}
                          }
                          transition={{
                            duration: 0.6,
                            type: "spring",
                            bounce: 0.3,
                          }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={animationStage >= 1 ? { scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mb-4 text-center"
                          >
                            <div
                              className={`bg-gradient-to-r ${getTeamBadgeColor(
                                3
                              )} px-4 py-2 rounded-full font-bold text-sm mb-2`}
                            >
                              {third.team?.name || third.title}
                            </div>
                            <div className="text-zinc-300 text-xs">
                              {third.finalScore
                                ? `${third.finalScore.toFixed(1)} pts`
                                : "Score: N/A"}
                            </div>
                          </motion.div>

                          <div
                            className={`bg-gradient-to-t ${getPodiumColor(
                              3
                            )} ${getPodiumHeight(
                              3
                            )} w-24 rounded-t-lg border-2 flex flex-col items-center justify-end pb-4 relative`}
                          >
                            <div className="absolute -top-8 bg-orange-600 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white">
                              {getPodiumIcon(3)}
                            </div>
                            <div className="text-white font-bold text-2xl">
                              3
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Prize Information */}
                    {hackathon?.prizes && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {hackathon.prizes.firstPrize && (
                          <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-600/30">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🥇</div>
                              <div className="text-yellow-300 font-semibold">
                                First Prize
                              </div>
                              <div className="text-yellow-100 text-sm">
                                {hackathon.prizes.firstPrize}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {hackathon.prizes.secondPrize && (
                          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-gray-500/30">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🥈</div>
                              <div className="text-gray-300 font-semibold">
                                Second Prize
                              </div>
                              <div className="text-gray-100 text-sm">
                                {hackathon.prizes.secondPrize}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {hackathon.prizes.thirdPrize && (
                          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-600/30">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl mb-2">🥉</div>
                              <div className="text-orange-300 font-semibold">
                                Third Prize
                              </div>
                              <div className="text-orange-100 text-sm">
                                {hackathon.prizes.thirdPrize}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader
          className="cursor-pointer hover:bg-zinc-900/50 transition-colors"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <TbUsers className="w-5 h-5 text-blue-400" />
              Full Leaderboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                {results.length} Projects
              </Badge>
              {showLeaderboard ? (
                <>
                  <TbEye className="w-4 h-4 text-zinc-400" />
                  <TbChevronUp className="w-5 h-5 text-zinc-400" />
                </>
              ) : (
                <>
                  <TbEyeOff className="w-4 h-4 text-zinc-400" />
                  <TbChevronDown className="w-5 h-5 text-zinc-400" />
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {results.map((project, index) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:border-zinc-600 ${
                        index < 3
                          ? "bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30"
                          : "bg-zinc-900/50 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              index === 0
                                ? "bg-yellow-500 text-black"
                                : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                ? "bg-orange-500 text-white"
                                : "bg-zinc-700 text-white"
                            }`}
                          >
                            {index < 3 ? (
                              <span>
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </span>
                            ) : (
                              <span>#{project.rank || index + 1}</span>
                            )}
                          </div>

                          {/* Project Info */}
                          <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              {project.team?.name || project.title}
                              {index < 3 && (
                                <TbCrown className="w-4 h-4 text-yellow-400" />
                              )}
                            </h3>
                            <p className="text-zinc-400 text-sm">
                              {project.description}
                            </p>
                            {project.technologies && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies
                                  .slice(0, 3)
                                  .map((tech, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                {project.technologies.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{project.technologies.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {project.finalScore
                              ? project.finalScore.toFixed(1)
                              : "N/A"}
                          </div>
                          <div className="text-zinc-400 text-sm">points</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default HackathonResults;
