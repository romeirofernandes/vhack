import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdSettings,
  MdPerson,
  MdAdd,
  MdCalendarToday,
  MdGroup,
  MdBarChart,
  MdLogout,
  MdTrendingUp,
  MdTimer,
  MdLeaderboard,
  MdCheckCircle,
  MdFlashOn,
  MdNotifications,
  MdEvent,
  MdAnalytics,
} from "react-icons/md";
import { TbCode, TbSparkles, TbRocket } from "react-icons/tb";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Profile from "./organizer/Profile";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import MyHackathons from "./organizer/MyHackathons";
import Analytics from "./organizer/Analytics";


const OrganizerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    }
    if (activeSection === "hackathons") {
      fetchHackathons();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/organizer/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setDashboardData(res.data.data);
        setError("");
      } else {
        setError(res.data.message || "Error loading dashboard");
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathons = async () => {
    try {
      const idToken = await user.getIdToken();
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/my/hackathons`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setHackathons(response.data.data.hackathons);
      } else {
        toast.error(response.data.message || "Error fetching hackathons");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching hackathons");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "My Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("hackathons"),
    },
    {
      label: "Analytics",
      href: "#",
      icon: <MdBarChart className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("analytics"),
    },
    {
      label: "Profile",
      href: "#",
      icon: <MdPerson className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
  ];

  const renderDashboardContent = () => {
    if (!dashboardData) return null;

    const {
      stats,
      recentActivity,
      upcomingEvents,
      todoList,
      insights,
      leaderboard,
    } = dashboardData;

    // Prepare chart data for top performers
    const chartData = leaderboard.slice(0, 5).map((participant, index) => ({
      name:
        participant.displayName?.split(" ")[0] ||
        participant.email.split("@")[0],
      submissions: participant.submissions || 0,
    }));

    const chartConfig = {
      submissions: {
        label: "Submissions",
        color: "hsl(var(--chart-1))",
      },
    };

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center py-8 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h1 className="text-3xl font-bold text-white mb-3">
            Organizer Dashboard
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Manage your hackathons, track performance, and inspire innovation
            across your community.
          </p>
        </div>
   {/* Quick Actions - Clean Horizontal Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 h-14 bg-white text-zinc-950 hover:bg-zinc-100 font- hover:scale-[0.97] transition-all duration-300 justify-center"
            onClick={() => navigate("/organizer/create-hackathon")}
          >
            <MdEvent className="w-5 h-5" />
            Create Hackathon
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-14 bg-white text-zinc-950 hover:bg-zinc-100 font-medium hover:scale-[0.97] transition-all duration-300 justify-center"
            onClick={() => setActiveSection("profile")}
          >
            <MdGroup className="w-5 h-5" />
            View Profile
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-14 bg-white text-zinc-950 hover:bg-zinc-100 font-medium hover:scale-[0.97] transition-all duration-300 justify-center"
            onClick={() => setActiveSection("analytics")}
          >
            <MdAnalytics className="w-5 h-5" />
            View Analytics
          </Button>
        </div>

        {/* Stats Overview - Keep as is */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <MdCalendarToday className="w-8 h-8 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Active: {stats.activeEvents}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalHackathons}
            </div>
            <div className="text-blue-300 text-sm">Total Hackathons</div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <MdGroup className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                All Events
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalParticipants}
            </div>
            <div className="text-green-300 text-sm">Total Participants</div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <MdTrendingUp className="w-8 h-8 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Success
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.successRate}%
            </div>
            <div className="text-purple-300 text-sm">Completion Rate</div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <MdTimer className="w-8 h-8 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Live Now
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.activeEvents}
            </div>
            <div className="text-orange-300 text-sm">Active Events</div>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          activity.type === "registration"
                            ? "bg-green-400"
                            : activity.type === "submission"
                            ? "bg-blue-400"
                            : "bg-purple-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {activity.message}
                        </p>
                        <p className="text-zinc-400 text-xs mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MdNotifications className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400 mb-4">No recent activity</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
                      onClick={() => navigate("/organizer/create-hackathon")}
                    >
                      Create Your First Event
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers Chart */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <MdLeaderboard className="w-5 h-5 text-zinc-400" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="submissions"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MdLeaderboard className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-400">No participants yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "hackathons":
        return (
          <MyHackathons
            hackathons={hackathons}
            loading={loading}
            navigate={navigate}
          />
        );
      case "create-event":
        return <CreateEvent />;
      case "participants":
        return <Participants />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return renderDashboardContent();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-400 mx-auto mb-4"></div>
          <div className="text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-zinc-950 w-full flex-1 mx-auto border border-white/10 h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <motion.div
              className="font-normal flex items-center text-sm text-white py-1 relative z-20"
              animate={{
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <TbCode className="ml-4 w-5 h-5 text-white flex-shrink-0" />
                <motion.span
                  animate={{
                    width: sidebarOpen ? "auto" : 0,
                    opacity: sidebarOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="font-medium text-white whitespace-nowrap overflow-hidden"
                >
                  vHack
                </motion.span>
                <motion.div
                  animate={{
                    width: sidebarOpen ? "auto" : 0,
                    opacity: sidebarOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2, delay: sidebarOpen ? 0.1 : 0 }}
                  className="overflow-hidden"
                >
                  <Badge
                    variant="secondary"
                    className="bg-orange-900/30 border-orange-600/30 text-orange-200 text-xs whitespace-nowrap"
                  >
                    <TbSparkles className="w-3 h-3 mr-1" />
                    Organizer
                  </Badge>
                </motion.div>
              </div>
            </motion.div>

            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <MdLogout className="text-white h-5 w-5 flex-shrink-0" />,
                onClick: handleLogout,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <div className="p-2 md:p-10 border border-white/10 bg-zinc-950 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          {error && (
            <Alert className="mb-6 bg-red-900/20 border-red-800/50">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
