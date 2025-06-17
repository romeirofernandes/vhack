import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MdAdd,
  MdClose,
  MdSave,
  MdFileUpload,
  MdImage,
  MdDelete,
  MdEdit,
  MdLink,
  MdCode,
  MdAssignment,
  MdPublic,
  MdLock,
  MdCloudUpload,
  MdArrowBack,
} from "react-icons/md";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaVideo,
  FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

const ProjectEditor = ({
  project,
  isOpen,
  onClose,
  onUpdate,
  onSuccess,
  onError,
  hackathonId,
  teamId,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: "",
    challenges: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    videoUrl: "",
    presentationUrl: "",
    isPublic: true,
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTech, setNewTech] = useState("");
  const [techArray, setTechArray] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        problemStatement: project.problemStatement || "",
        challenges: project.challenges || "",
        technologies: project.technologies?.join(", ") || "",
        githubUrl: project.links?.github || "",
        liveUrl: project.links?.live || "",
        videoUrl: project.links?.video || "",
        presentationUrl: project.links?.presentation || "",
        isPublic: project.isPublic !== undefined ? project.isPublic : true,
        images: project.images || [],
      });
      setTechArray(project.technologies || []);
    } else {
      // Reset form for new project
      setFormData({
        title: "",
        description: "",
        problemStatement: "",
        challenges: "",
        technologies: "",
        githubUrl: "",
        liveUrl: "",
        videoUrl: "",
        presentationUrl: "",
        isPublic: true,
        images: [],
      });
      setTechArray([]);
    }
    setError("");
    setSuccess("");
  }, [project]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "technologies") {
      // Update tech array when typing
      const techs = value
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech);
      setTechArray(techs);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !techArray.includes(newTech.trim())) {
      const updatedTechs = [...techArray, newTech.trim()];
      setTechArray(updatedTechs);
      setFormData((prev) => ({
        ...prev,
        technologies: updatedTechs.join(", "),
      }));
      setNewTech("");
    }
  };

  const removeTechnology = (index) => {
    const updatedTechs = techArray.filter((_, i) => i !== index);
    setTechArray(updatedTechs);
    setFormData((prev) => ({
      ...prev,
      technologies: updatedTechs.join(", "),
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const idToken = await user.getIdToken();
      const uploadedImages = [];

      for (const file of files) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            body: uploadFormData,
          }
        );

        const data = await response.json();
        if (data.success) {
          uploadedImages.push({
            url: data.data.url,
            publicId: data.data.publicId,
            filename: file.name,
            caption: "",
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
      setSuccess(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageCaption = (index, caption) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, caption } : img
      ),
    }));
  };

  const saveProject = async (publish = false) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        problemStatement: formData.problemStatement.trim(),
        challenges: formData.challenges.trim(),
        technologies: techArray,
        links: {
          github: formData.githubUrl.trim(),
          live: formData.liveUrl.trim(),
          video: formData.videoUrl.trim(),
          presentation: formData.presentationUrl.trim(),
        },
        isPublic: formData.isPublic,
        images: formData.images,
        hackathonId: hackathonId || null, // <-- add this
        teamId: teamId || null, // <-- add this
      };

      const url = project
        ? `${import.meta.env.VITE_API_URL}/projects/${project._id}`
        : `${import.meta.env.VITE_API_URL}/projects`;

      const method = project ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
        onSuccess(
          project
            ? "Project updated successfully!"
            : "Project created successfully!"
        );

        if (publish && data.data.project) {
          await submitProject(data.data.project._id);
        } else {
          onClose();
        }
      } else {
        setError(data.error || "Failed to save project");
      }
    } catch (error) {
      console.error("Save project error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitProject = async (projectId = null) => {
    const id = projectId || project._id;
    if (!id) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${id}/submit`,
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
        onSuccess("Project published successfully!");
        onClose();
      } else {
        setError(data.error || "Failed to publish project");
      }
    } catch (error) {
      console.error("Submit project error:", error);
      setError("Failed to publish project. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-none bg-zinc-900/95 backdrop-blur-sm border-white/10 text-white p-0 overflow-y-auto sm:max-w-[95vw]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="h-full flex flex-col"
        >
          {/* Header - Matching ProjectView */}
          <div className="p-8 space-y-8 flex-shrink-0">
            {/* Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
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
              >
                <Alert className="bg-emerald-950/40 border-emerald-800/50">
                  <AlertDescription className="text-emerald-300">
                    {success}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-white/10 hover:text-white p-2"
                >
                  <MdArrowBack className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {project ? "Edit Project" : "Create New Project"}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    {formData.isPublic ? (
                      <div className="flex items-center gap-1 text-white/50">
                        <MdPublic className="w-4 h-4" />
                        <span className="text-sm">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-white/50">
                        <MdLock className="w-4 h-4" />
                        <span className="text-sm">Private</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => saveProject(false)}
                  disabled={loading}
                  className="border-white/20 text-zinc-800 hover:bg-white/40 hover:text-white hover:border-white/30 transition-colors duration-200"
                >
                  <MdSave className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={() => saveProject(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  <MdFileUpload className="w-4 h-4 mr-2" />
                  {loading ? "Publishing..." : "Save & Publish"}
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Matching ProjectView Layout */}
          <div className="flex-1 overflow-hidden px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-4">
                {/* Basic Information */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MdAssignment className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-white/80 font-medium"
                      >
                        Project Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Enter your project title..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-white/80 font-medium"
                      >
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        placeholder="Describe your project, what it does, and its key features..."
                        rows={4}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Problem Statement */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Problem Statement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.problemStatement}
                      onChange={(e) =>
                        handleChange("problemStatement", e.target.value)
                      }
                      placeholder="What problem does your project solve? Why is it important?"
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Challenges */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Challenges & Solutions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.challenges}
                      onChange={(e) =>
                        handleChange("challenges", e.target.value)
                      }
                      placeholder="What challenges did you face while building this project? How did you overcome them?"
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Project Images */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MdImage className="w-5 h-5" />
                      Project Gallery ({formData.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/30 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-white/10 rounded-full p-3">
                            <MdCloudUpload className="w-6 h-6 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white/80 font-medium">
                              {uploadingImage
                                ? "Uploading..."
                                : "Upload Project Images"}
                            </p>
                            <p className="text-white/50 text-sm">
                              Click to browse or drag and drop images
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                          >
                            <div className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                              <img
                                src={image.url}
                                alt={`Project image ${index + 1}`}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-600/80 text-white hover:bg-red-600 rounded-full p-1"
                              >
                                <MdDelete className="w-4 h-4" />
                              </Button>
                            </div>
                            <Input
                              value={image.caption || ""}
                              onChange={(e) =>
                                updateImageCaption(index, e.target.value)
                              }
                              placeholder="Add image caption..."
                              className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 overflow-y-auto">
                {/* Project Settings */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Project Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-y-auto max-h-full">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white/80 font-medium flex items-center gap-2">
                          {formData.isPublic ? (
                            <MdPublic className="w-4 h-4" />
                          ) : (
                            <MdLock className="w-4 h-4" />
                          )}
                          Public Project
                        </Label>
                        <p className="text-white/50 text-sm">
                          {formData.isPublic
                            ? "Anyone can view this project"
                            : "Only you and your team can view this project"}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isPublic}
                        onCheckedChange={(checked) =>
                          handleChange("isPublic", checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Technologies */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MdCode className="w-5 h-5" />
                      Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology..."
                        className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                        onKeyPress={(e) => e.key === "Enter" && addTechnology()}
                      />
                      <Button
                        type="button"
                        onClick={addTechnology}
                        className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                        variant="outline"
                      >
                        <MdAdd className="w-4 h-4" />
                      </Button>
                    </div>

                    {techArray.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techArray.map((tech, index) => (
                          <Badge
                            key={index}
                            className="bg-white/10 text-white/80 border-white/20 hover:bg-white/15 pr-1"
                          >
                            {tech}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0 hover:bg-red-500/20"
                              onClick={() => removeTechnology(index)}
                            >
                              <MdClose className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-white/60 text-sm">
                        Or enter comma-separated:
                      </Label>
                      <Textarea
                        value={formData.technologies}
                        onChange={(e) =>
                          handleChange("technologies", e.target.value)
                        }
                        placeholder="React, Node.js, MongoDB..."
                        rows={2}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Project Links */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MdLink className="w-5 h-5" />
                      Project Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2">
                        <FaGithub className="w-4 h-4" />
                        GitHub Repository
                      </Label>
                      <Input
                        value={formData.githubUrl}
                        onChange={(e) =>
                          handleChange("githubUrl", e.target.value)
                        }
                        placeholder="https://github.com/username/repo"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2">
                        <FaExternalLinkAlt className="w-4 h-4" />
                        Live Demo URL
                      </Label>
                      <Input
                        value={formData.liveUrl}
                        onChange={(e) =>
                          handleChange("liveUrl", e.target.value)
                        }
                        placeholder="https://your-project.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2">
                        <FaVideo className="w-4 h-4" />
                        Video Demo
                      </Label>
                      <Input
                        value={formData.videoUrl}
                        onChange={(e) =>
                          handleChange("videoUrl", e.target.value)
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2">
                        <FaFileAlt className="w-4 h-4" />
                        Presentation
                      </Label>
                      <Input
                        value={formData.presentationUrl}
                        onChange={(e) =>
                          handleChange("presentationUrl", e.target.value)
                        }
                        placeholder="https://docs.google.com/presentation/..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditor;
