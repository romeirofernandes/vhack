import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdCode,
  MdCalendarToday,
  MdGroup,
  MdLaunch,
  MdFileUpload,
  MdFilterList,
  MdSearch,
  MdImage,
  MdArrowBack,
} from "react-icons/md";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import ProjectEditor from "./ProjectEditor";
import CreateProjectForm from "./CreateProjectForm";
import ProjectView from "./ProjectView";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects?${params}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProjects(data.data.projects);
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Projects fetch error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies?.some((tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // If viewing a specific project, show ProjectView component
  if (viewingProject) {
    return (
      <ProjectView
        project={viewingProject}
        onBack={() => setViewingProject(null)}
        onEdit={(project) => {
          setViewingProject(null);
          setEditingProject(project);
        }}
        onUpdate={fetchProjects}
        onError={setError}
        onSuccess={setSuccess}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white mx-auto"></div>
          <p className="text-white/60">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-white/60">
            Manage and showcase your hackathon projects
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-white text-zinc-950 hover:bg-white/90 font-medium">
              <MdAdd className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl h-[90vh] bg-zinc-900/95 backdrop-blur-sm border-white/10 text-white">
            <DialogHeader className="border-b border-white/10 pb-4">
              <DialogTitle className="text-white text-xl">
                Create New Project
              </DialogTitle>
            </DialogHeader>
            <CreateProjectForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchProjects();
                setSuccess("Project created successfully!");
              }}
              onError={setError}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert className="bg-red-950/40 border-red-800/50">
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert className="bg-emerald-950/40 border-emerald-800/50">
            <AlertDescription className="text-emerald-300">
              {success}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, technologies..."
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white hover:bg-white/10 focus:border-white/40">
            <MdFilterList className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              All Projects
            </SelectItem>
            <SelectItem value="draft" className="text-white hover:bg-white/10">
              Draft
            </SelectItem>
            <SelectItem
              value="submitted"
              className="text-white hover:bg-white/10"
            >
              Submitted
            </SelectItem>
            <SelectItem
              value="judging"
              className="text-white hover:bg-white/10"
            >
              Under Review
            </SelectItem>
            <SelectItem value="judged" className="text-white hover:bg-white/10">
              Judged
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProjectCard
                project={project}
                onView={() => setViewingProject(project)}
                onEdit={() => setEditingProject(project)}
                onUpdate={fetchProjects}
                onError={setError}
                onSuccess={setSuccess}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <MdCode className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {searchTerm ? "No projects match your search" : "No projects yet"}
          </h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search terms or filters"
              : "Start building amazing projects and showcase your skills to the world"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-zinc-950 hover:bg-white/90 font-medium"
            >
              <MdAdd className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </motion.div>
      )}

      {/* Project Editor Modal */}
      <ProjectEditor
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onUpdate={fetchProjects}
        onSuccess={setSuccess}
        onError={setError}
      />
    </div>
  );
};

// Enhanced Project Card Component
const ProjectCard = ({
  project,
  onView,
  onEdit,
  onUpdate,
  onError,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
        onUpdate();
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

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/8 transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-4" onClick={onView}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg mb-2 group-hover:text-white/90 transition-colors line-clamp-1">
              {project.title}
            </CardTitle>
            <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
            <Badge
              className={`${getStatusColor(
                project.status
              )} text-xs font-medium px-2 py-1`}
            >
              {project.status}
            </Badge>
            {project.isPublic && (
              <MdVisibility
                className="w-4 h-4 text-white/40"
                title="Public project"
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" onClick={onView}>
        {/* Project Images Preview */}
        {project.images && project.images.length > 0 && (
          <div className="flex items-center gap-2 text-white/50">
            <MdImage className="w-4 h-4" />
            <span className="text-sm">
              {project.images.length} image
              {project.images.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/10 text-white/70 text-xs border-white/10 hover:bg-white/15"
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white/70 text-xs border-white/10"
              >
                +{project.technologies.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Project Meta Info */}
        <div className="space-y-2 text-sm text-white/50">
          {project.hackathon && (
            <div className="flex items-center gap-2">
              <MdCalendarToday className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.hackathon.title}</span>
            </div>
          )}
          {project.team && (
            <div className="flex items-center gap-2">
              <MdGroup className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.team.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 flex-shrink-0" />
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* External Links */}
        {(project.links?.github || project.links?.live) && (
          <div className="flex items-center gap-2">
            {project.links?.github && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.github, "_blank");
                }}
              >
                <FaGithub className="w-4 h-4" />
              </Button>
            )}
            {project.links?.live && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.live, "_blank");
                }}
              >
                <MdLaunch className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      <div className="p-6 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          {project.status === "draft" && (
            <>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  submitProject();
                }}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 flex-1 font-medium"
              >
                <MdFileUpload className="w-4 h-4 mr-1" />
                {loading ? "Publishing..." : "Publish"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <MdEdit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject();
                }}
                disabled={loading}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <MdDelete className="w-4 h-4" />
              </Button>
            </>
          )}
          {project.status === "submitted" && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-zinc-800 hover:bg-white/40 hover:text-white hover:border-white/30 flex-1 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <MdEdit className="w-4 h-4 mr-1" />
              Edit Details
            </Button>
          )}
          {(project.status === "judging" || project.status === "judged") && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-1"
              onClick={onView}
            >
              <MdVisibility className="w-4 h-4 mr-1" />
              View Results
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Projects;
