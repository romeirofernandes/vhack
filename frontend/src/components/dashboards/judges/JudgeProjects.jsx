import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../../contexts/AuthContext";
import ProjectScoring from "./ProjectScoring";
import { toast } from "react-hot-toast";
import {
  MdAssignment,
  MdTimer,
  MdCheckCircle,
  MdGroup,
  MdArrowBack,
  MdStar,
  MdInfo
} from "react-icons/md";

const JudgeProjects = ({ hackathon,onBack }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [judgingOpen, setJudgingOpen] = useState(false);
  const [mongoUserId, setMongoUserId] = useState(null);

useEffect(() => {
  const getMongoId = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/mongo-id`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setMongoUserId(data.mongoId);
      }
    } catch (error) {
      console.error("Error getting mongo ID:", error);
    }
  };

  if (user) {
    getMongoId();
  }
}, [user]);
  if (!hackathon) {
    return (
      <div className="text-zinc-400 p-8 text-center">
        No hackathon selected.
      </div>
    );
  }

  useEffect(() => {
    fetchProjects();
  }, [hackathon]);

  const fetchProjects = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `http://localhost:8000/projects/hackathon/${hackathon._id}/submitted`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProjects(data.data.projects);
        setJudgingOpen(data.data.hackathon.judgingOpen);
      } else {
        toast.error(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const getProjectStatus = (project) => {
  if (!mongoUserId) return "pending"; // Wait for ID
  
  const judgeScore = project.scores?.find(score => {
    if (!score?.judge) return false;
    
    const judgeId = typeof score.judge === "object" 
      ? score.judge._id?.toString() 
      : score.judge?.toString();
      
    return judgeId === mongoUserId;
  });
  
  return judgeScore ? "scored" : "pending";
};
  const handleScoreSubmitted = () => {
    fetchProjects();
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Score Project</h2>
        </div>
        
        <ProjectScoring
          project={selectedProject}
          hackathon={hackathon}
          onScoreSubmitted={handleScoreSubmitted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {hackathon.title} - Projects
        </h2>
        <p className="text-zinc-400">
          Review and score submitted projects
        </p>
      </div>

      {/* Judging Status */}
      {!judgingOpen && (
        <Alert className="bg-yellow-950/40 border-yellow-800/50">
          <MdTimer className="w-4 h-4" />
          <AlertDescription className="text-yellow-300">
            Judging will open after the submission deadline ends.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <MdAssignment className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Scored</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => getProjectStatus(p) === "scored").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <MdTimer className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {projects.filter(p => getProjectStatus(p) === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project) => {
          const status = getProjectStatus(project);
          return (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {project.title}
                        </h3>
                        <Badge
                          className={`${
                            status === "scored"
                              ? "bg-green-600 text-white"
                              : "bg-yellow-600 text-white"
                          }`}
                        >
                          {status === "scored" ? "Scored" : "Pending"}
                        </Badge>
                      </div>
                      
                      <p className="text-zinc-300 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-zinc-400 text-sm">
                        <div className="flex items-center gap-1">
                          <MdGroup className="w-4 h-4" />
                          <span>{project.team?.name || "Solo"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MdStar className="w-4 h-4" />
                          <span>{project.builders?.length || 1} member(s)</span>
                        </div>
                      </div>

                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setSelectedProject(project)}
                        disabled={!judgingOpen}
                        className={`${
                          status === "scored"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white`}
                      >
                        {status === "scored" ? "View Score" : "Score Project"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-8 text-center">
            <MdInfo className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Projects Submitted
            </h3>
            <p className="text-zinc-400">
              No projects have been submitted for this hackathon yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JudgeProjects;