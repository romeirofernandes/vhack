import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TbChartBar,
  TbUsers,
  TbCalendar,
  TbTrophy,
  TbTrendingUp,
  TbTrendingDown,
  TbEye,
  TbClock,
  TbTargetArrow,
  TbStar,
  TbAward,
  TbScale,
  TbBrain,
  TbClipboardCheck,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const JudgeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState("6months");
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/judge/analytics?timeRange=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        toast.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Mock data for development
      setAnalyticsData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => ({
    overview: {
      totalHackathons: 12,
      projectsJudged: 48,
      pendingReviews: 3,
      averageScore: 7.8,
      completionRate: 94,
      expertise: 8,
    },
    monthlyData: [
      { month: "Jan", projectsJudged: 5, hackathons: 2, averageScore: 76 },
      { month: "Feb", projectsJudged: 3, hackathons: 1, averageScore: 82 },
      { month: "Mar", projectsJudged: 8, hackathons: 3, averageScore: 78 },
      { month: "Apr", projectsJudged: 6, hackathons: 2, averageScore: 80 },
      { month: "May", projectsJudged: 12, hackathons: 4, averageScore: 75 },
      { month: "Jun", projectsJudged: 9, hackathons: 3, averageScore: 81 },
    ],
    scoringTrends: [
      { month: "Jan", innovation: 78, technical: 82, userExperience: 75, businessImpact: 73 },
      { month: "Feb", innovation: 85, technical: 79, userExperience: 88, businessImpact: 76 },
      { month: "Mar", innovation: 72, technical: 85, userExperience: 78, businessImpact: 82 },
      { month: "Apr", innovation: 88, technical: 83, userExperience: 85, businessImpact: 78 },
      { month: "May", innovation: 76, technical: 88, userExperience: 72, businessImpact: 85 },
      { month: "Jun", innovation: 92, technical: 86, userExperience: 89, businessImpact: 83 },
    ],
    categoryDistribution: [
      { category: "AI/ML", count: 12, color: "#7dd3fc" },
      { category: "Web Development", count: 15, color: "#86efac" },
      { category: "Mobile Apps", count: 8, color: "#fbbf24" },
      { category: "IoT", count: 6, color: "#f9a8d4" },
      { category: "Blockchain", count: 7, color: "#a78bfa" },
    ],
    scoringDistribution: [
      { range: "0-20", count: 1, color: "#fca5a5" },
      { range: "21-40", count: 3, color: "#fdba74" },
      { range: "41-60", count: 8, color: "#fbbf24" },
      { range: "61-80", count: 22, color: "#86efac" },
      { range: "81-100", count: 14, color: "#7dd3fc" },
    ],
    topRatedProjects: [
      { projectName: "AI-Powered Climate Monitor", hackathonName: "Climate Tech Challenge", teamName: "EcoInnovators", score: 95, feedback: "Outstanding implementation with real-world impact" },
      { projectName: "Blockchain Voting System", hackathonName: "Democracy Tech", teamName: "VoteSecure", score: 92, feedback: "Excellent security considerations and user experience" },
      { projectName: "Mental Health Companion", hackathonName: "HealthTech Hackathon", teamName: "MindCare", score: 90, feedback: "Innovative approach to mental health support" },
      { projectName: "Smart City Dashboard", hackathonName: "Urban Innovation", teamName: "CityTech", score: 88, feedback: "Comprehensive solution with great scalability" },
      { projectName: "Education AR Platform", hackathonName: "EdTech Revolution", teamName: "LearnAR", score: 87, feedback: "Creative use of AR technology in education" },
    ],
    performanceMetrics: [
      { metric: "Completion Rate", value: 94, trend: 8 },
      { metric: "Avg Response Time", value: 18, trend: -12, suffix: "hrs" },
      { metric: "Scoring Consistency", value: 87, trend: 5 },
      { metric: "Review Thoroughness", value: 92, trend: 15 },
    ],
  });

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const StatCard = ({ title, value, trend, icon: Icon, suffix = "" }) => (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-zinc-400 text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {formatNumber(value)}
              {suffix}
            </p>
            {trend !== undefined && (
              <div className="flex items-center mt-1 sm:mt-2">
                {trend > 0 ? (
                  <TbTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1" />
                ) : (
                  <TbTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mr-1" />
                )}
                <span
                  className={`text-xs sm:text-sm ${
                    trend > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-2 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex-shrink-0 ml-2">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-zinc-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl backdrop-blur-sm">
          <p className="text-white font-semibold mb-3 text-sm">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-zinc-300 text-sm font-medium">{entry.name}:</span>
                </div>
                <span className="text-white font-bold text-sm">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const { overview, monthlyData, scoringTrends, categoryDistribution, scoringDistribution, topRatedProjects, performanceMetrics } = analyticsData;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-3">
              Judge Analytics
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg">
              Insights into your judging performance and impact
            </p>
          </div>
          <div className="flex items-center justify-center lg:justify-end space-x-2">
            {["3months", "6months", "1year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  timeRange === range
                    ? "bg-zinc-700 text-white border border-zinc-600"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {range === "3months" ? "3M" : range === "6months" ? "6M" : "1Y"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
        >
          <StatCard
            title="Hackathons"
            value={overview.totalHackathons}
            trend={15}
            icon={TbCalendar}
          />
          <StatCard
            title="Projects Judged"
            value={overview.projectsJudged}
            trend={23}
            icon={TbClipboardCheck}
          />
          <StatCard
            title="Pending Reviews"
            value={overview.pendingReviews}
            trend={-18}
            icon={TbClock}
          />
          <StatCard
            title="Avg Score Given"
            value={overview.averageScore}
            trend={5}
            icon={TbStar}
            suffix="/10"
          />
          <StatCard
            title="Completion Rate"
            value={overview.completionRate}
            trend={8}
            icon={TbTargetArrow}
            suffix="%"
          />
          <StatCard
            title="Expertise Areas"
            value={overview.expertise}
            trend={12}
            icon={TbBrain}
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Monthly Judging Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbChartBar className="w-5 h-5 lg:w-6 lg:h-6" />
                  Monthly Judging Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={monthlyData}
                      margin={{ top: 20, right: 15, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="projectsJudged" fill="#7dd3fc" radius={[2, 2, 0, 0]} name="Projects Judged" />
                      <Bar dataKey="hackathons" fill="#86efac" radius={[2, 2, 0, 0]} name="Hackathons" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scoring Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbTrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                  Scoring Trends by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={scoringTrends}
                      margin={{ top: 20, right: 15, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="innovation" stroke="#f9a8d4" strokeWidth={2} name="Innovation" />
                      <Line type="monotone" dataKey="technical" stroke="#7dd3fc" strokeWidth={2} name="Technical" />
                      <Line type="monotone" dataKey="userExperience" stroke="#86efac" strokeWidth={2} name="UX" />
                      <Line type="monotone" dataKey="businessImpact" stroke="#fbbf24" strokeWidth={2} name="Business Impact" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbTargetArrow className="w-5 h-5 lg:w-6 lg:h-6" />
                  Project Categories Judged
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mt-4">
                  {categoryDistribution.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-zinc-400 text-xs sm:text-sm">{entry.category}</span>
                      <span className="text-zinc-500 text-xs">({entry.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scoring Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbScale className="w-5 h-5 lg:w-6 lg:h-6" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={scoringDistribution}
                      margin={{ top: 20, right: 15, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="range" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        radius={[2, 2, 0, 0]}
                        name="Projects"
                      >
                        {scoringDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Top Rated Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbAward className="w-5 h-5 lg:w-6 lg:h-6" />
                  Top Rated Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {topRatedProjects && topRatedProjects.length > 0 ? topRatedProjects.map((project, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0 ${
                        index < 3 ? 'bg-yellow-500' : 'bg-zinc-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{project.projectName}</p>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          {project.hackathonName} • {project.teamName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <TbStar className="w-4 h-4 text-yellow-400" />
                      <Badge className="bg-yellow-600 text-white border border-yellow-500 px-2 py-1 text-xs sm:text-sm">
                        {project.score}/100
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <TbAward className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No projects judged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbEye className="w-5 h-5 lg:w-6 lg:h-6" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm sm:text-base">{metric.metric}</p>
                      <div className="flex items-center mt-1">
                        {metric.trend > 0 ? (
                          <TbTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1" />
                        ) : (
                          <TbTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mr-1" />
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
                            metric.trend > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {metric.trend > 0 ? "+" : ""}{metric.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {metric.value}{metric.suffix || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JudgeAnalytics;