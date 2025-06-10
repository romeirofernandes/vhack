import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdFileUpload,
  MdCalendarToday,
  MdGroup,
  MdCode,
  MdLaunch,
  MdVisibility,
  MdVisibilityOff,
  MdImage,
  MdClose,
  MdNavigateNext,
  MdNavigateBefore,
  MdStar,
  MdEmojiEvents,
  MdAssignment,
} from "react-icons/md";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaVideo,
  FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

const ProjectView = ({
  project,
  onBack,
  onEdit,
  onUpdate,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, index: 0 });
  const { user } = useAuth();

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-zinc-800/60 text-zinc-200 border-zinc-700/40";
      case "submitted":
        return "bg-blue-900/50 text-blue-200 border-blue-800/40";
      case "judging":
        return "bg-yellow-900/50 text-yellow-200 border-yellow-800/40";
      case "judged":
        return "bg-emerald-900/50 text-emerald-200 border-emerald-800/40";
      default:
        return "bg-zinc-800/60 text-zinc-200 border-zinc-700/40";
    }
  };

  const submitProject = async () => {
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${project._id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onUpdate();
        onSuccess("Project submitted successfully!");
      } else {
        onError(data.error || "Failed to submit project");
      }
    } catch (error) {
      console.error("Submit project error:", error);
      onError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${project._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onBack();
        onSuccess("Project deleted successfully!");
      } else {
        onError(data.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Delete project error:", error);
      onError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ImageModal = () => (
    <Dialog
      open={imageModal.open}
      onOpenChange={(open) => setImageModal({ ...imageModal, open })}
    >
      <DialogContent className="max-w-5xl h-[90vh] bg-zinc-900/95 backdrop-blur-sm border-white/10 p-0">
        <div className="relative h-full flex flex-col">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {imageModal.index + 1} of {project.images?.length || 0}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageModal({ ...imageModal, open: false })}
              className="bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
            >
              <MdClose className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4">
            <img
              src={project.images?.[imageModal.index]?.url}
              alt={
                project.images?.[imageModal.index]?.caption || "Project image"
              }
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {project.images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setImageModal({
                      ...imageModal,
                      index:
                        imageModal.index > 0
                          ? imageModal.index - 1
                          : project.images.length - 1,
                    })
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full p-3"
                >
                  <MdNavigateBefore className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setImageModal({
                      ...imageModal,
                      index:
                        imageModal.index < project.images.length - 1
                          ? imageModal.index + 1
                          : 0,
                    })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full p-3"
                >
                  <MdNavigateNext className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {project.images?.[imageModal.index]?.caption && (
            <div className="p-4 border-t border-white/10">
              <p className="text-white/80 text-center">
                {project.images[imageModal.index].caption}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10 hover:text-white p-2"
          >
            <MdArrowBack className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge
                className={`${getStatusColor(project.status)} font-medium`}
              >
                {project.status}
              </Badge>
              {project.isPublic ? (
                <div className="flex items-center gap-1 text-white/50">
                  <MdVisibility className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-white/50">
                  <MdVisibilityOff className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {project.status === "draft" && (
            <>
              <Button
                onClick={submitProject}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                <MdFileUpload className="w-4 h-4 mr-2" />
                {loading ? "Publishing..." : "Publish Project"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(project)}
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
              >
                <MdEdit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={deleteProject}
                disabled={loading}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <MdDelete className="w-4 h-4" />
              </Button>
            </>
          )}
          {project.status === "submitted" && (
            <Button
              variant="outline"
              onClick={() => onEdit(project)}
              className="border-white/20 text-zinc-800 hover:bg-white/40 hover:text-white hover:border-white/30 transition-colors duration-200"
            >
              <MdEdit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdAssignment className="w-5 h-5" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Problem Statement */}
          {project.problemStatement && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {project.problemStatement}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Challenges */}
          {project.challenges && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Challenges Faced</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {project.challenges}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Images */}
          {project.images?.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdImage className="w-5 h-5" />
                  Project Gallery ({project.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setImageModal({ open: true, index })}
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `Project image ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <MdLaunch className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">View Full Size</p>
                        </div>
                      </div>
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white/90 text-sm line-clamp-2">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scores and Feedback */}
          {project.status === "judged" && project.scores?.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdEmojiEvents className="w-5 h-5" />
                  Judging Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.finalScore && (
                  <div className="text-center p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-800/30">
                    <div className="text-3xl font-bold text-yellow-200 mb-2">
                      {project.finalScore.toFixed(1)}/100
                    </div>
                    <p className="text-yellow-300/80">Final Score</p>
                    {project.rank && (
                      <div className="mt-2">
                        <Badge className="bg-yellow-900/50 text-yellow-200 border-yellow-800/40">
                          Rank #{project.rank}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {project.scores.map((score, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={score.judge?.photoURL} />
                            <AvatarFallback className="bg-white/10 text-white text-sm">
                              {score.judge?.displayName?.charAt(0) || "J"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white/80 font-medium">
                            {score.judge?.displayName || "Anonymous Judge"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdStar className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">
                            {score.totalScore}/100
                          </span>
                        </div>
                      </div>

                      {score.criteria?.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {score.criteria.map((criterion, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-white/70">
                                {criterion.name}
                              </span>
                              <span className="text-white/90">
                                {criterion.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {score.overallFeedback && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-white/70 text-sm leading-relaxed">
                            {score.overallFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Links */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.links?.github && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => window.open(project.links.github, "_blank")}
                >
                  <FaGithub className="w-4 h-4 mr-2" />
                  View Code
                </Button>
              )}
              {project.links?.live && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => window.open(project.links.live, "_blank")}
                >
                  <MdLaunch className="w-4 h-4 mr-2" />
                  Live Demo
                </Button>
              )}
              {project.links?.video && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => window.open(project.links.video, "_blank")}
                >
                  <FaVideo className="w-4 h-4 mr-2" />
                  Video Demo
                </Button>
              )}
              {project.links?.presentation && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() =>
                    window.open(project.links.presentation, "_blank")
                  }
                >
                  <FaFileAlt className="w-4 h-4 mr-2" />
                  Presentation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdCode className="w-5 h-5" />
                  Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge
                      key={index}
                      className="bg-white/10 text-white/80 border-white/20 hover:bg-white/15"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Info */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.hackathon && (
                <div className="flex items-center gap-3">
                  <MdCalendarToday className="w-4 h-4 text-white/50 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      Hackathon
                    </p>
                    <p className="text-white/60 text-sm">
                      {project.hackathon.title}
                    </p>
                  </div>
                </div>
              )}

              {project.team && (
                <div className="flex items-center gap-3">
                  <MdGroup className="w-4 h-4 text-white/50 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">Team</p>
                    <p className="text-white/60 text-sm">{project.team.name}</p>
                  </div>
                </div>
              )}

              <Separator className="bg-white/10" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Created</span>
                  <span className="text-white/80">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Last Updated</span>
                  <span className="text-white/80">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {project.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Submitted</span>
                    <span className="text-white/80">
                      {new Date(project.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          {project.builders?.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.builders.map((builder, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={builder.user?.photoURL} />
                      <AvatarFallback className="bg-white/10 text-white text-sm">
                        {builder.user?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-medium truncate">
                        {builder.user?.displayName || "Unknown User"}
                      </p>
                      {builder.role && (
                        <p className="text-white/50 text-xs capitalize">
                          {builder.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ImageModal />
    </motion.div>
  );
};

export default ProjectView;
