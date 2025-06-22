import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbChevronDown,
  TbChevronUp,
  TbStar,
  TbUsers,
  TbCalendar,
  TbCode,
  TbLink,
  TbEye,
  TbFolder,
  TbUser,
  TbClock,
  TbTrophy,
  TbMessageCircle,
  TbBrain,
} from "react-icons/tb";
import { MdOpenInNew, MdPlayArrow, MdCode, MdGroup } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AIProjectAnalysis from "@/components/AIProjectAnalysis"; // Adjust the import path as necessary

const ProjectCard = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [selectedProjectForAI, setSelectedProjectForAI] = useState(null);
  const { hackathon } = project;

  // Add this function to calculate final score
  const calculateFinalScore = () => {
    if (!project.scores || project.scores.length === 0) {
      return null;
    }

    const totalScore = project.scores.reduce((sum, score) => {
      return sum + (score.totalScore || 0);
    }, 0);

    return totalScore / project.scores.length;
  };

  // Get the final score (either from project.finalScore or calculate it)
  const finalScore = project.finalScore || calculateFinalScore();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-600 text-white border-yellow-500";
      case "judging":
        return "bg-blue-600 text-white border-blue-500";
      case "judged":
        return "bg-green-600 text-white border-green-500";
      default:
        return "bg-zinc-600 text-zinc-200 border-zinc-500";
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-white mb-2 flex items-center gap-2">
              <TbFolder className="w-5 h-5 text-blue-400" />
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-zinc-400 text-sm mb-3">
              <div className="flex items-center gap-1">
                <TbUsers className="w-4 h-4" />
                <span>{project.team?.name || "Solo Project"}</span>
              </div>
              <div className="flex items-center gap-1">
                <TbUser className="w-4 h-4" />
                <span>{project.builders?.length || 1} member(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <TbCalendar className="w-4 h-4" />
                <span>Submitted {formatDate(project.submittedAt)}</span>
              </div>
            </div>
            <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <Badge
              className={`${getStatusColor(
                project.status
              )} border px-2 py-1 text-xs`}
            >
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            {finalScore && finalScore > 0 && (
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {finalScore.toFixed(1)}
                </div>
                <div className="text-xs text-zinc-400">Final Score</div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Technologies Preview */}
        {project.technologies?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 5).map((tech, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-zinc-300 border-zinc-600 bg-zinc-800/50"
                >
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 5 && (
                <Badge
                  variant="outline"
                  className="text-zinc-400 border-zinc-600"
                >
                  +{project.technologies.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex gap-2 mb-4">
          {project.links?.github && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-zinc-600 hover:border-zinc-500"
            >
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdCode className="w-4 h-4 mr-1" />
                GitHub
              </a>
            </Button>
          )}
          {/* ADD THIS NEW BUTTON HERE */}
          <Button
            onClick={() => {
              setSelectedProjectForAI(project);
              setAiAnalysisOpen(true);
            }}
            variant="outline"
            size="sm"
            className="bg-purple-600/20 border-purple-600/50 text-purple-400 hover:bg-purple-600/30"
          >
            <TbBrain className="w-4 h-4 mr-1" />
            AI Analysis
          </Button>
          {project.links?.live && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-zinc-600 hover:border-zinc-500"
            >
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TbLink className="w-4 h-4 mr-1" />
                Live Demo
              </a>
            </Button>
          )}
          {project.links?.video && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-zinc-600 hover:border-zinc-500"
            >
              <a
                href={project.links.video}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MdPlayArrow className="w-4 h-4 mr-1" />
                Video
              </a>
            </Button>
          )}
        </div>

        {/* Judge Scores Summary (Collapsed View) */}
        {!isExpanded && project.scores && project.scores.length > 0 && (
          <div className="mb-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TbStar className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-sm">
                  Judged by {project.scores.length} judge(s)
                </span>
              </div>
              <div className="text-white font-bold">
                {finalScore ? finalScore.toFixed(1) : "N/A"}
              </div>
            </div>
          </div>
        )}

        {/* No Scores Message */}
        {!isExpanded && (!project.scores || project.scores.length === 0) && (
          <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
            <TbClock className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
            <p className="text-zinc-400 text-sm">Not scored yet</p>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="w-full text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-600/30 hover:border-blue-500"
        >
          {isExpanded ? (
            <>
              <TbChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <TbChevronDown className="w-4 h-4 mr-2" />
              View Full Details
            </>
          )}
        </Button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-6">
                {/* Problem Statement */}
                {project.problemStatement && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <TbCode className="w-4 h-4 text-purple-400" />
                      Problem Statement
                    </h4>
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {project.problemStatement}
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <TbFolder className="w-4 h-4 text-blue-400" />
                    Project Description
                  </h4>
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Challenges */}
                {project.challenges && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <TbTrophy className="w-4 h-4 text-orange-400" />
                      Challenges Faced
                    </h4>
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {project.challenges}
                      </p>
                    </div>
                  </div>
                )}

                {/* All Technologies */}
                {project.technologies?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <TbCode className="w-4 h-4 text-green-400" />
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-zinc-300 border-zinc-600 bg-zinc-800/50"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Links */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <TbLink className="w-4 h-4 text-cyan-400" />
                    Project Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.links?.github && (
                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">
                            GitHub Repository
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-blue-400 hover:text-white"
                          >
                            <a
                              href={project.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MdOpenInNew className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {project.links?.live && (
                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">
                            Live Demo
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-blue-400 hover:text-white"
                          >
                            <a
                              href={project.links.live}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MdOpenInNew className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {project.links?.video && (
                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">
                            Demo Video
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-blue-400 hover:text-white"
                          >
                            <a
                              href={project.links.video}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MdOpenInNew className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                    {project.links?.presentation && (
                      <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 text-sm">
                            Presentation
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-blue-400 hover:text-white"
                          >
                            <a
                              href={project.links.presentation}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MdOpenInNew className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                {project.builders?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <MdGroup className="w-4 h-4 text-purple-400" />
                      Team Members
                    </h4>
                    <div className="space-y-2">
                      {project.builders.map((builder, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={builder.user?.photoURL} />
                            <AvatarFallback className="bg-purple-600 text-white text-sm">
                              {builder.user?.displayName?.charAt(0) ||
                                builder.user?.email?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">
                              {builder.user?.displayName ||
                                builder.user?.email ||
                                "Anonymous"}
                            </p>
                            <p className="text-zinc-400 text-xs">
                              {builder.role === "creator"
                                ? "Project Creator"
                                : "Collaborator"}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs px-2 py-1 ${
                              builder.role === "creator"
                                ? "bg-yellow-600 text-white border-yellow-500"
                                : "bg-zinc-700 text-zinc-300 border-zinc-600"
                            }`}
                          >
                            {builder.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Images */}
                {project.images?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <TbEye className="w-4 h-4 text-pink-400" />
                      Project Images ({project.images.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={image.caption || `Project image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-zinc-800 group-hover:border-zinc-600 transition-colors"
                          />
                          {image.caption && (
                            <div className="mt-2">
                              <p className="text-zinc-400 text-xs">
                                {image.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Judge Scores */}
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <TbStar className="w-4 h-4 text-yellow-400" />
                    Judge Evaluations
                  </h4>

                  {project.scores && project.scores.length > 0 ? (
                    <div className="space-y-4">
                      {/* Individual Judge Scores */}
                      {project.scores.map((score, index) => (
                        <div
                          key={index}
                          className="p-4 bg-zinc-900 rounded-lg border border-zinc-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={score.judge?.photoURL} />
                                <AvatarFallback className="bg-purple-600 text-white text-sm">
                                  {score.judge?.displayName?.charAt(0) || "J"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium text-sm">
                                  {score.judge?.displayName ||
                                    "Anonymous Judge"}
                                </p>
                                <p className="text-zinc-400 text-xs">
                                  Scored on {formatDate(score.submittedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">
                                {score.totalScore}
                              </div>
                              <div className="text-xs text-zinc-400">
                                /{" "}
                                {score.criteria?.reduce(
                                  (sum, c) => sum + (c.maxScore || 10),
                                  0
                                ) || "N/A"}
                              </div>
                            </div>
                          </div>

                          {/* Criteria Breakdown */}
                          {score.criteria && score.criteria.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              {score.criteria.map((criteria, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 bg-zinc-800 rounded border border-zinc-700"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-zinc-300 text-sm font-medium">
                                      {criteria.title}
                                    </span>
                                    <span className="text-white font-bold text-sm">
                                      {criteria.score}/{criteria.maxScore || 10}
                                    </span>
                                  </div>
                                  <div className="mt-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${
                                          (criteria.score /
                                            (criteria.maxScore || 10)) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Feedback */}
                          {score.feedback && (
                            <div className="border-t border-zinc-700 pt-3">
                              <div className="flex items-start gap-2">
                                <TbMessageCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                                <div>
                                  <h5 className="text-white text-sm font-medium mb-1">
                                    Judge Feedback
                                  </h5>
                                  <p className="text-zinc-300 text-sm leading-relaxed">
                                    {score.feedback}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Final Score Summary */}
                      <div className="p-4 bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-lg border border-blue-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-medium">
                              Final Score
                            </h5>
                            <p className="text-blue-300 text-sm">
                              Average of {project.scores.length} judge
                              {project.scores.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {finalScore ? finalScore.toFixed(1) : "N/A"}
                            </div>
                            <div className="text-zinc-400 text-sm">
                              {project.rank && `Rank: #${project.rank}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center">
                      <TbClock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400 mb-1">No scores yet</p>
                      <p className="text-zinc-500 text-sm">
                        Judges will score this project during the judging period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      {aiAnalysisOpen && (
        <AIProjectAnalysis
          project={selectedProjectForAI}
          hackathon={hackathon}
          isOpen={aiAnalysisOpen}
          onClose={() => {
            setAiAnalysisOpen(false);
            setSelectedProjectForAI(null);
          }}
          userRole="organizer"
        />
      )}
    </Card>
  );
};

export default ProjectCard;
