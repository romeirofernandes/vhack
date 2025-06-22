import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TbArrowLeft, TbFolder, TbSearch, TbFilter, TbSortDescending } from "react-icons/tb";
import { MdAssignment } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import ProjectCard from "./ProjectCard";
import axios from "axios";

const SubmittedProjects = ({ hackathon, onBack }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("submittedAt");
  const { user } = useAuth();

  useEffect(() => {
    fetchSubmittedProjects();
  }, [hackathon._id]);

  const fetchSubmittedProjects = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/hackathon/${hackathon._id}/submitted`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching submitted projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.team?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "score":
          return (b.finalScore || 0) - (a.finalScore || 0);
        case "submittedAt":
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

  const getStatusCount = (status) => {
    return projects.filter(p => status === "all" ? true : p.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading submitted projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="text-zinc-800 hover:bg-zinc-800 hover:text-white"
            >
              <TbArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathon
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Submitted Projects</h1>
              <p className="text-zinc-400">{hackathon.title}</p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white border border-blue-500">
            {projects.length} Project{projects.length !== 1 ? 's' : ''}
          </Badge>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {getStatusCount("all")}
              </div>
              <div className="text-zinc-400 text-sm">Total Submissions</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {getStatusCount("submitted")}
              </div>
              <div className="text-zinc-400 text-sm">Awaiting Review</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {getStatusCount("judging")}
              </div>
              <div className="text-zinc-400 text-sm">Under Review</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {getStatusCount("judged")}
              </div>
              <div className="text-zinc-400 text-sm">Completed</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                placeholder="Search projects, teams, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="judging">Judging</option>
              <option value="judged">Judged</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="submittedAt">Latest First</option>
              <option value="title">Title A-Z</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredProjects.length === 0 ? (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-12 text-center">
                <MdAssignment className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {projects.length === 0 ? "No Projects Submitted" : "No Projects Found"}
                </h3>
                <p className="text-zinc-400">
                  {projects.length === 0 
                    ? "Projects will appear here once participants submit them."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubmittedProjects;