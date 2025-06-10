import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MdAdd,
  MdClose,
  MdSave,
  MdFileUpload,
  MdImage,
  MdDelete,
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

const CreateProjectForm = ({ isOpen, onClose, onSuccess, onError }) => {
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "technologies") {
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

  const createProject = async (publish = false) => {
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
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess("Project created successfully!");

        if (publish && data.data.project) {
          await submitProject(data.data.project._id);
        } else {
          onClose();
          resetForm();
        }
      } else {
        setError(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Create project error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitProject = async (projectId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onSuccess("Project created and published successfully!");
        onClose();
        resetForm();
      } else {
        setError(data.error || "Failed to publish project");
      }
    } catch (error) {
      console.error("Submit project error:", error);
      setError("Failed to publish project. Please try again.");
    }
  };

  const resetForm = () => {
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
    setNewTech("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-[95vw] bg-zinc-900/95 backdrop-blur-sm border-white/10 text-white p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <div className="p-6 space-y-4 flex-shrink-0">
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
                  onClick={handleClose}
                  className="text-white hover:bg-white/10 hover:text-white p-2"
                >
                  <MdArrowBack className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Create New Project
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
                  onClick={() => createProject(false)}
                  disabled={loading}
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <MdSave className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Save Draft"}
                </Button>
                <Button
                  onClick={() => createProject(true)}
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  <MdFileUpload className="w-4 h-4 mr-2" />
                  {loading ? "Publishing..." : "Create & Publish"}
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-4 max-h-full">
                {/* Basic Information */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MdAssignment className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                      rows={3}
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
                      rows={3}
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
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/30 transition-colors">
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
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-white/10 rounded-full p-2">
                            <MdCloudUpload className="w-5 h-5 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white/80 font-medium text-sm">
                              {uploadingImage
                                ? "Uploading..."
                                : "Upload Project Images"}
                            </p>
                            <p className="text-white/50 text-xs">
                              Click to browse or drag and drop images
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-600/80 text-white hover:bg-red-600 rounded-full p-1 h-6 w-6"
                              >
                                <MdDelete className="w-3 h-3" />
                              </Button>
                            </div>
                            <Input
                              value={image.caption || ""}
                              onChange={(e) =>
                                updateImageCaption(index, e.target.value)
                              }
                              placeholder="Add image caption..."
                              className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-xs"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 overflow-y-auto max-h-full">
                {/* Project Settings */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">
                      Project Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white/80 font-medium flex items-center gap-2 text-sm">
                          {formData.isPublic ? (
                            <MdPublic className="w-4 h-4" />
                          ) : (
                            <MdLock className="w-4 h-4" />
                          )}
                          Public Project
                        </Label>
                        <p className="text-white/50 text-xs">
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
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <MdCode className="w-4 h-4" />
                      Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology..."
                        className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                        onKeyPress={(e) => e.key === "Enter" && addTechnology()}
                      />
                      <Button
                        type="button"
                        onClick={addTechnology}
                        className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-8 w-8 p-0"
                        variant="outline"
                      >
                        <MdAdd className="w-4 h-4" />
                      </Button>
                    </div>

                    {techArray.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {techArray.map((tech, index) => (
                          <Badge
                            key={index}
                            className="bg-white/10 text-white/80 border-white/20 hover:bg-white/15 pr-1 text-xs"
                          >
                            {tech}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-3 w-3 p-0 hover:bg-red-500/20"
                              onClick={() => removeTechnology(index)}
                            >
                              <MdClose className="w-2 h-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">
                        Or enter comma-separated:
                      </Label>
                      <Textarea
                        value={formData.technologies}
                        onChange={(e) =>
                          handleChange("technologies", e.target.value)
                        }
                        placeholder="React, Node.js, MongoDB..."
                        rows={2}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 resize-none text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Project Links */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <MdLink className="w-4 h-4" />
                      Project Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2 text-sm">
                        <FaGithub className="w-3 h-3" />
                        GitHub Repository
                      </Label>
                      <Input
                        value={formData.githubUrl}
                        onChange={(e) =>
                          handleChange("githubUrl", e.target.value)
                        }
                        placeholder="https://github.com/username/repo"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2 text-sm">
                        <FaExternalLinkAlt className="w-3 h-3" />
                        Live Demo URL
                      </Label>
                      <Input
                        value={formData.liveUrl}
                        onChange={(e) =>
                          handleChange("liveUrl", e.target.value)
                        }
                        placeholder="https://your-project.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2 text-sm">
                        <FaVideo className="w-3 h-3" />
                        Video Demo
                      </Label>
                      <Input
                        value={formData.videoUrl}
                        onChange={(e) =>
                          handleChange("videoUrl", e.target.value)
                        }
                        placeholder="https://youtube.com/watch?v=..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80 font-medium flex items-center gap-2 text-sm">
                        <FaFileAlt className="w-3 h-3" />
                        Presentation
                      </Label>
                      <Input
                        value={formData.presentationUrl}
                        onChange={(e) =>
                          handleChange("presentationUrl", e.target.value)
                        }
                        placeholder="https://docs.google.com/presentation/..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm"
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

export default CreateProjectForm;
