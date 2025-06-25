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
} from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const Analytics = () => {
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
        `${import.meta.env.VITE_API_URL}/organizer/analytics?timeRange=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      console.log("Analytics response:", response.data);
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
      totalParticipants: 456,
      totalTeams: 89,
      avgTeamSize: 4.2,
      completionRate: 78,
      avgRating: 4.6,
    },
    monthlyData: [
      { month: "Jan", hackathons: 2, participants: 45, teams: 9 },
      { month: "Feb", hackathons: 1, participants: 32, teams: 6 },
      { month: "Mar", hackathons: 3, participants: 78, teams: 15 },
      { month: "Apr", hackathons: 2, participants: 56, teams: 11 },
      { month: "May", hackathons: 1, participants: 41, teams: 8 },
      { month: "Jun", hackathons: 3, participants: 89, teams: 17 },
    ],
    participantGrowth: [
      { month: "Jan", participants: 45, growth: 12 },
      { month: "Feb", participants: 77, growth: 18 },
      { month: "Mar", participants: 155, growth: 28 },
      { month: "Apr", participants: 211, growth: 22 },
      { month: "May", participants: 252, growth: 15 },
      { month: "Jun", participants: 341, growth: 26 },
    ],
    hackathonStatus: [
      { name: "Completed", value: 7, color: "#86efac" },
      { name: "Ongoing", value: 2, color: "#7dd3fc" },
      { name: "Draft", value: 3, color: "#fbbf24" },
    ],
    teamSizeDistribution: [
      { size: "1", count: 8, color: "#fca5a5" },
      { size: "2-3", count: 23, color: "#fdba74" },
      { size: "4-5", count: 41, color: "#86efac" },
      { size: "6+", count: 17, color: "#7dd3fc" },
    ],
    topPerformingHackathons: [
      { name: "AI Innovation Challenge", participants: 89, teams: 17, rating: 4.8 },
      { name: "Web3 BuildThon", participants: 78, teams: 15, rating: 4.6 },
      { name: "Mobile App Contest", participants: 67, teams: 13, rating: 4.7 },
      { name: "IoT Solutions Hack", participants: 56, teams: 11, rating: 4.5 },
    ],
    engagementMetrics: [
      { metric: "Registration Rate", value: 85, trend: 12 },
      { metric: "Completion Rate", value: 78, trend: -5 },
      { metric: "Team Formation", value: 92, trend: 8 },
      { metric: "Submission Rate", value: 73, trend: 15 },
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

  const { overview, monthlyData, participantGrowth, hackathonStatus, teamSizeDistribution, topPerformingHackathons, engagementMetrics } = analyticsData;

  return (
  <div className="min-h-screen bg-zinc-950 text-white">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6"
      >
        <div className="text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 lg:mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm lg:text-base xl:text-lg">
            Insights into your hackathon performance
          </p>
        </div>
        <div className="flex items-center justify-center lg:justify-end space-x-1 sm:space-x-2">
          {["3months", "6months", "1year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 sm:px-3 lg:px-4 xl:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6"
      >
        <StatCard
          title="Total Hackathons"
          value={overview.totalHackathons}
          trend={15}
          icon={TbCalendar}
        />
        <StatCard
          title="Total Participants"
          value={overview.totalParticipants}
          trend={23}
          icon={TbUsers}
        />
        <StatCard
          title="Teams Formed"
          value={overview.totalTeams}
          trend={18}
          icon={TbCode}
        />
        <StatCard
          title="Avg Rating"
          value={overview.avgRating}
          trend={8}
          icon={TbTrophy}
          suffix="/5"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Monthly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbChartBar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Monthly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 lg:px-6">
              <div className="h-48 sm:h-56 lg:h-64 xl:h-72 2xl:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlyData}
                    margin={{ top: 15, right: 10, left: 5, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="participants" fill="#7dd3fc" radius={[2, 2, 0, 0]} name="Participants" />
                    <Bar dataKey="teams" fill="#86efac" radius={[2, 2, 0, 0]} name="Teams" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Participant Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Participant Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 lg:px-6">
              <div className="h-48 sm:h-56 lg:h-64 xl:h-72 2xl:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={participantGrowth}
                    margin={{ top: 15, right: 10, left: 5, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="participants"
                      stroke="#f9a8d4"
                      fill="#f9a8d4"
                      fillOpacity={0.3}
                      name="Cumulative Participants"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hackathon Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbTargetArrow className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Hackathon Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 lg:px-6">
              <div className="h-48 sm:h-56 lg:h-64 xl:h-72 2xl:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={hackathonStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {hackathonStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
                {hackathonStatus.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-1 sm:space-x-2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
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
      
        {/* Team Size Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbUsers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Team Size Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 lg:px-6">
              <div className="h-48 sm:h-56 lg:h-64 xl:h-72 2xl:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={teamSizeDistribution}
                    margin={{ top: 15, right: 10, left: 5, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis 
                      dataKey="size" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10 }}
                      domain={[0, 'dataMax + 1']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      radius={[2, 2, 0, 0]}
                      name="Teams"
                    >
                      {teamSizeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 lg:gap-3 xl:gap-4 mt-3 sm:mt-4">
                {teamSizeDistribution.map((entry, index) => (
                  <div key={index} className="text-center p-2 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 rounded-full mx-auto mb-1 sm:mb-2"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="text-white font-bold text-xs sm:text-sm lg:text-base xl:text-lg">{entry.count}</div>
                    <div className="text-zinc-400 text-xs">
                      {entry.size} member{entry.size !== "1" ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Top Performing Hackathons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbTrophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Top Performing Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4">
              {topPerformingHackathons.map((hackathon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-zinc-700 border border-zinc-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-xs sm:text-sm lg:text-base truncate">{hackathon.name}</p>
                      <p className="text-xs sm:text-sm text-zinc-400">
                        {hackathon.participants} participants • {hackathon.teams} teams
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white border border-yellow-500 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm flex-shrink-0 ml-2">
                    ⭐ {hackathon.rating}
                  </Badge>
                </div>
              ))}
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
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <TbEye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4">
              {engagementMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-xs sm:text-sm lg:text-base">{metric.metric}</p>
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
                  <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{metric.value}%</p>
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

export default Analytics;