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
  AreaChart,
  Area,
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
  TbCode,
  TbTargetArrow,
  TbUserCheck,
  TbAward,
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const ParticipantAnalytics = () => {
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
        `${import.meta.env.VITE_API_URL}/participant/analytics?timeRange=${timeRange}`,
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
      totalHackathons: 8,
      totalTeams: 12,
      totalProjects: 10,
      completedProjects: 7,
      avgTeamSize: 3.8,
      winRate: 25,
    },
    monthlyData: [
      { month: "Jan", teams: 1, projects: 1, hackathons: 1 },
      { month: "Feb", teams: 0, projects: 0, hackathons: 0 },
      { month: "Mar", teams: 2, projects: 2, hackathons: 2 },
      { month: "Apr", teams: 1, projects: 1, hackathons: 1 },
      { month: "May", teams: 3, projects: 2, hackathons: 2 },
      { month: "Jun", teams: 2, projects: 2, hackathons: 2 },
    ],
    progressData: [
      { month: "Jan", teams: 1, projects: 1 },
      { month: "Feb", teams: 1, projects: 1 },
      { month: "Mar", teams: 3, projects: 3 },
      { month: "Apr", teams: 4, projects: 4 },
      { month: "May", teams: 7, projects: 6 },
      { month: "Jun", teams: 9, projects: 8 },
    ],
    participationStatus: [
      { name: "Completed", value: 5, color: "#86efac" },
      { name: "Ongoing", value: 2, color: "#7dd3fc" },
      { name: "Upcoming", value: 1, color: "#fbbf24" },
    ],
    roleDistribution: [
      { role: "Team Leader", count: 4, color: "#fbbf24" },
      { role: "Team Member", count: 8, color: "#7dd3fc" },
    ],
    topPerformances: [
      { projectName: "AI Assistant", hackathonName: "AI Innovation Challenge", rank: 1, teamName: "Code Warriors" },
      { projectName: "Smart Campus", hackathonName: "IoT Solutions Hack", rank: 2, teamName: "Tech Innovators" },
      { projectName: "EcoTracker", hackathonName: "Sustainability Challenge", rank: 3, teamName: "Green Coders" },
    ],
    engagementMetrics: [
      { metric: "Completion Rate", value: 87, trend: 12 },
      { metric: "Team Formation", value: 75, trend: 8 },
      { metric: "Leadership Rate", value: 33, trend: 15 },
      { metric: "Success Rate", value: 25, trend: 20 },
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

  const { overview, monthlyData, progressData, participationStatus, roleDistribution, topPerformances, engagementMetrics } = analyticsData;

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
              My Analytics
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg">
              Track your hackathon journey and performance
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
            title="Teams Joined"
            value={overview.totalTeams}
            trend={23}
            icon={TbUsers}
          />
          <StatCard
            title="Projects"
            value={overview.totalProjects}
            trend={18}
            icon={TbCode}
          />
          <StatCard
            title="Completed"
            value={overview.completedProjects}
            trend={12}
            icon={TbUserCheck}
          />
          <StatCard
            title="Avg Team Size"
            value={overview.avgTeamSize}
            trend={5}
            icon={TbUsers}
          />
          <StatCard
            title="Win Rate"
            value={overview.winRate}
            trend={8}
            icon={TbTrophy}
            suffix="%"
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Monthly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbChartBar className="w-5 h-5 lg:w-6 lg:h-6" />
                  Monthly Activity
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
                      <Bar dataKey="teams" fill="#7dd3fc" radius={[2, 2, 0, 0]} name="Teams" />
                      <Bar dataKey="projects" fill="#86efac" radius={[2, 2, 0, 0]} name="Projects" />
                      <Bar dataKey="hackathons" fill="#f9a8d4" radius={[2, 2, 0, 0]} name="Hackathons" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbTrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                  Cumulative Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={progressData}
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
                      <Area
                        type="monotone"
                        dataKey="teams"
                        stackId="1"
                        stroke="#7dd3fc"
                        fill="#7dd3fc"
                        fillOpacity={0.6}
                        name="Teams"
                      />
                      <Area
                        type="monotone"
                        dataKey="projects"
                        stackId="1"
                        stroke="#86efac"
                        fill="#86efac"
                        fillOpacity={0.6}
                        name="Projects"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Participation Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbTargetArrow className="w-5 h-5 lg:w-6 lg:h-6" />
                  Participation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={participationStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {participationStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mt-4">
                  {participationStatus.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-zinc-400 text-xs sm:text-sm">{entry.name}</span>
                      <span className="text-zinc-500 text-xs">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbUsers className="w-5 h-5 lg:w-6 lg:h-6" />
                  Team Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={roleDistribution}
                      margin={{ top: 20, right: 15, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="role" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        radius={[2, 2, 0, 0]}
                        name="Count"
                      >
                        {roleDistribution.map((entry, index) => (
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
          {/* Top Performances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg lg:text-xl">
                  <TbAward className="w-5 h-5 lg:w-6 lg:h-6" />
                  Top Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {topPerformances && topPerformances.length > 0 ? topPerformances.map((performance, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0 ${
                        performance.rank === 1 ? 'bg-yellow-500' : 
                        performance.rank === 2 ? 'bg-gray-400' : 'bg-yellow-600'
                      }`}>
                        {performance.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{performance.projectName}</p>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          {performance.hackathonName} • Team: {performance.teamName}
                        </p>
                      </div>
                    </div>
                    <Badge className={`px-2 py-1 text-xs sm:text-sm flex-shrink-0 ml-2 ${
                      performance.rank === 1 ? 'bg-yellow-600 text-white border-yellow-500' :
                      performance.rank === 2 ? 'bg-gray-600 text-white border-gray-500' :
                      'bg-yellow-700 text-white border-yellow-600'
                    }`}>
                      🏆 {performance.rank === 1 ? '1st' : performance.rank === 2 ? '2nd' : '3rd'}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <TbAward className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No awards yet - keep participating!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Engagement Metrics */}
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
                {engagementMetrics.map((metric, index) => (
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
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{metric.value}%</p>
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

export default ParticipantAnalytics;