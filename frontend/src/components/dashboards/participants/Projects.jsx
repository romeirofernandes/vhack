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
} from "react-icons/md";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";
import ProjectEditor from "./ProjectEditor";
import CreateProjectForm from "./CreateProjectForm";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
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
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-white/70">Manage your hackathon projects</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-white text-zinc-950 hover:bg-white/90">
              <MdAdd className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Project
              </DialogTitle>
            </DialogHeader>
            <CreateProjectForm
              onSuccess={() => {
                setShowCreateModal(false);
                fetchProjects();
                setSuccess("Project created successfully!");
                setTimeout(() => setSuccess(""), 3000);
              }}
              onError={setError}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-900/20 border-red-800/50">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-800/50">
          <AlertDescription className="text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 bg-white/5 border-white/20 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
            <MdFilterList className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="judging">Under Review</SelectItem>
            <SelectItem value="judged">Judged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onEdit={() => setEditingProject(project)}
            onUpdate={fetchProjects}
            onError={setError}
            onSuccess={setSuccess}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <MdCode className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">
            {searchTerm ? "No projects match your search" : "No projects yet"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-zinc-950 hover:bg-white/90"
            >
              Create Your First Project
            </Button>
          )}
        </div>
      )}

      {/* Project Editor Modal */}
      <ProjectEditor
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onUpdate={fetchProjects}
      />
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, onEdit, onUpdate, onError, onSuccess }) => {
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
        setTimeout(() => onSuccess(""), 3000);
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
    if (!confirm("Are you sure you want to delete this project?")) return;

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
        setTimeout(() => onSuccess(""), 3000);
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
        return "bg-gray-900/50 text-gray-200";
      case "submitted":
        return "bg-blue-900/50 text-blue-200";
      case "judging":
        return "bg-yellow-900/50 text-yellow-200";
      case "judged":
        return "bg-green-900/50 text-green-200";
      default:
        return "bg-gray-900/50 text-gray-200";
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2 group-hover:text-white/90 transition-colors">
              {project.title}
            </CardTitle>
            <p className="text-white/70 text-sm line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            {project.isPublic && (
              <MdVisibility className="w-4 h-4 text-white/50" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Images Preview */}
        {project.images && project.images.length > 0 && (
          <div className="flex items-center gap-2">
            <MdImage className="w-4 h-4 text-white/50" />
            <span className="text-white/60 text-sm">
              {project.images.length} image
              {project.images.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white/10 text-white/80 text-xs"
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge
                variant="secondary"
                className="bg-white/10 text-white/80 text-xs"
              >
                +{project.technologies.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Project Info */}
        <div className="space-y-2 text-sm text-white/60">
          {project.hackathon && (
            <div className="flex items-center gap-2">
              <MdCalendarToday className="w-4 h-4" />
              <span>{project.hackathon.title}</span>
            </div>
          )}
          {project.team && (
            <div className="flex items-center gap-2">
              <MdGroup className="w-4 h-4" />
              <span>{project.team.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4" />
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Links */}
        {(project.links?.github || project.links?.live) && (
          <div className="flex items-center gap-2">
            {project.links?.github && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white p-1"
                onClick={() => window.open(project.links.github, "_blank")}
              >
                <FaGithub className="w-4 h-4" />
              </Button>
            )}
            {project.links?.live && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white p-1"
                onClick={() => window.open(project.links.live, "_blank")}
              >
                <MdLaunch className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {project.status === "draft" && (
            <>
              <Button
                size="sm"
                onClick={submitProject}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
              >
                <MdFileUpload className="w-4 h-4 mr-1" />
                {loading ? "Publishing..." : "Publish"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={onEdit}
              >
                <MdEdit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
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
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1"
              onClick={onEdit}
            >
              <MdEdit className="w-4 h-4 mr-1" />
              Edit Details
            </Button>
          )}
          {(project.status === "judging" || project.status === "judged") && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1"
            >
              <MdVisibility className="w-4 h-4 mr-1" />
              View Results
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Projects;
