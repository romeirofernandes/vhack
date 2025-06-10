import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../../contexts/AuthContext";

const CreateProjectForm = ({ onSuccess, onError }) => {
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
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      onError("Please fill in the required fields (title and description)");
      return;
    }

    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean),
          links: {
            github: formData.githubUrl,
            live: formData.liveUrl,
            demo: formData.liveUrl,
            video: formData.videoUrl,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        onError(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Create project error:", error);
      onError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto"
    >
      <div>
        <Label className="text-white/80">Project Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="bg-white/5 border-white/20 text-white"
          placeholder="Enter your project title"
          required
        />
      </div>

      <div>
        <Label className="text-white/80">Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="bg-white/5 border-white/20 text-white"
          placeholder="Describe what your project does and its key features..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label className="text-white/80">Problem Statement</Label>
        <Textarea
          value={formData.problemStatement}
          onChange={(e) => handleChange("problemStatement", e.target.value)}
          className="bg-white/5 border-white/20 text-white"
          placeholder="What problem does this project solve?"
          rows={2}
        />
      </div>

      <div>
        <Label className="text-white/80">Technologies Used</Label>
        <Input
          value={formData.technologies}
          onChange={(e) => handleChange("technologies", e.target.value)}
          className="bg-white/5 border-white/20 text-white"
          placeholder="React, Node.js, MongoDB (comma separated)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white/80">GitHub Repository</Label>
          <Input
            value={formData.githubUrl}
            onChange={(e) => handleChange("githubUrl", e.target.value)}
            className="bg-white/5 border-white/20 text-white"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label className="text-white/80">Live Demo</Label>
          <Input
            value={formData.liveUrl}
            onChange={(e) => handleChange("liveUrl", e.target.value)}
            className="bg-white/5 border-white/20 text-white"
            placeholder="https://your-project.com"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => handleChange("isPublic", e.target.checked)}
          className="rounded border-white/20"
        />
        <Label htmlFor="isPublic" className="text-white/80">
          Make project publicly visible
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-white text-zinc-950 hover:bg-white/90"
        >
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
