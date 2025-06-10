import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MdAdd,
  MdDelete,
  MdImage,
  MdSave,
  MdPublish,
  MdClose,
  MdCloudUpload,
} from "react-icons/md";
import { FaGithub, FaExternalLinkAlt, FaYoutube } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

const ProjectEditor = ({ project, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: "",
    challenges: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    videoUrl: "",
    isPublic: true,
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        liveUrl: project.links?.demo || project.links?.live || "",
        videoUrl: project.links?.video || "",
        isPublic: project.isPublic ?? true,
        images: project.images || [],
      });
    }
  }, [project]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const idToken = await user.getIdToken();
      const formDataImg = new FormData();
      formDataImg.append("image", file);

      // Upload via your backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          body: formDataImg,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data.url) {
        const newImage = {
          url: data.data.url,
          publicId: data.data.publicId,
          caption: "",
          uploadedAt: new Date(),
          filename: data.data.originalName,
        };

        setFormData({
          ...formData,
          images: [...formData.images, newImage],
        });

        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const updateImageCaption = (index, caption) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], caption };
    setFormData({ ...formData, images: newImages });
  };

  const saveProject = async (publish = false) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const idToken = await user.getIdToken();
      const projectData = {
        ...formData,
        technologies: formData.technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        links: {
          github: formData.githubUrl,
          demo: formData.liveUrl,
          live: formData.liveUrl,
          video: formData.videoUrl,
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects/${project._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        }
      );

      const data = await response.json();
      if (data.success) {
        if (publish) {
          await submitProject();
        } else {
          setSuccess("Project saved successfully!");
          setTimeout(() => setSuccess(""), 3000);
          onUpdate();
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

  const submitProject = async () => {
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
        setSuccess("Project published successfully!");
        setTimeout(() => {
          setSuccess("");
          onUpdate();
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Failed to publish project");
      }
    } catch (error) {
      console.error("Submit project error:", error);
      setError("Failed to publish project");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Edit Project: {project?.title}
            </DialogTitle>
            <Badge
              className={
                project?.status === "draft"
                  ? "bg-gray-900/50 text-gray-200"
                  : project?.status === "submitted"
                  ? "bg-blue-900/50 text-blue-200"
                  : "bg-green-900/50 text-green-200"
              }
            >
              {project?.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alerts */}
          {error && (
            <Alert className="bg-red-900/20 border-red-800/50">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900/20 border-green-800/50">
              <AlertDescription className="text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/80">Project Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="Enter your project title"
                />
              </div>

              <div>
                <Label className="text-white/80">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="Describe what your project does and its key features..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-white/80">Problem Statement</Label>
                <Textarea
                  value={formData.problemStatement}
                  onChange={(e) =>
                    handleChange("problemStatement", e.target.value)
                  }
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="What problem does this project solve? What inspired you to build it?"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-white/80">Challenges & Solutions</Label>
                <Textarea
                  value={formData.challenges}
                  onChange={(e) => handleChange("challenges", e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="What challenges did you face and how did you overcome them?"
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-white/80">Technologies Used</Label>
                <Input
                  value={formData.technologies}
                  onChange={(e) => handleChange("technologies", e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="React, Node.js, MongoDB, Python (comma separated)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Project Images</CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    disabled={uploadingImage}
                  >
                    <MdCloudUpload className="w-4 h-4 mr-2" />
                    {uploadingImage ? "Uploading..." : "Add Image"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.images.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/20 rounded-lg">
                  <MdImage className="w-12 h-12 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50">No images added yet</p>
                  <p className="text-white/40 text-sm">
                    Add screenshots, demos, architecture diagrams, or UI mockups
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group bg-white/5 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-40 object-cover cursor-pointer"
                        onClick={() => window.open(image.url, "_blank")}
                      />
                      <div className="p-3 space-y-2">
                        <Input
                          value={image.caption || ""}
                          onChange={(e) =>
                            updateImageCaption(index, e.target.value)
                          }
                          placeholder="Add caption (optional)..."
                          className="bg-white/5 border-white/20 text-white text-xs h-8"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 w-full"
                          onClick={() => removeImage(index)}
                        >
                          <MdDelete className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Links */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 flex items-center gap-2">
                    <FaGithub className="w-4 h-4" />
                    GitHub Repository
                  </Label>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => handleChange("githubUrl", e.target.value)}
                    className="bg-white/5 border-white/20 text-white mt-1"
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div>
                  <Label className="text-white/80 flex items-center gap-2">
                    <FaExternalLinkAlt className="w-4 h-4" />
                    Live Demo
                  </Label>
                  <Input
                    value={formData.liveUrl}
                    onChange={(e) => handleChange("liveUrl", e.target.value)}
                    className="bg-white/5 border-white/20 text-white mt-1"
                    placeholder="https://your-project.vercel.app"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/80 flex items-center gap-2">
                  <FaYoutube className="w-4 h-4" />
                  Video Demo (Optional)
                </Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  className="bg-white/5 border-white/20 text-white mt-1"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleChange("isPublic", e.target.checked)}
                  className="rounded border-white/20"
                />
                <Label htmlFor="isPublic" className="text-white/80">
                  Make project publicly visible in showcase
                </Label>
              </div>
              <p className="text-white/50 text-sm mt-2">
                Public projects can be viewed by other users and judges
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 sticky bottom-0 bg-zinc-900 py-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
              disabled={loading}
            >
              <MdClose className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => saveProject(false)}
                disabled={loading}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                <MdSave className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Draft"}
              </Button>

              {project?.status === "draft" && (
                <Button
                  onClick={() => saveProject(true)}
                  disabled={loading}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <MdPublish className="w-4 h-4 mr-2" />
                  {loading ? "Publishing..." : "Publish Project"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditor;
