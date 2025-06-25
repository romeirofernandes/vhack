import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdLogout,
  MdPendingActions,
  MdCheckCircle,
  MdDrafts,
  MdEvent,
  MdTrendingUp,
  MdTimer,
  MdPerson,
  MdNotifications,
  MdGroup,
  MdAssignment,
} from "react-icons/md";
import { TbCode, TbSparkles, TbShield, TbRefresh } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PendingHackathons from "./admin/PendingHackathons";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const CACHE_KEY = "admin_dashboard_data";
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(CACHE_KEY);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    }
  }, [activeSection, user]);

  // Listen for hackathon status changes to refresh dashboard
  useEffect(() => {
    const handleStatusChange = () => {
      fetchDashboardData(true);
    };

    window.addEventListener("hackathonStatusChanged", handleStatusChange);
    return () => {
      window.removeEventListener("hackathonStatusChanged", handleStatusChange);
    };
  }, []);

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          console.log("Using cached admin dashboard data");
          return data;
        }
      }
    } catch (error) {
      console.error("Error reading cache:", error);
    }
    return null;
  };

  const setCachedData = (data) => {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);

      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setDashboardData(cachedData);
          setLastUpdated(new Date());
          setLoading(false);
          setError("");
          return;
        }
      }

      if (!user) {
        setError("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }

      const result = await response.json();

      if (result.success) {
        const dashboardData = {
          stats: result.stats,
          recentActivity: result.recentActivity,
          platformInsights: result.platformInsights,
          growthMetrics: result.growthMetrics,
        };

        setDashboardData(dashboardData);
        setCachedData(dashboardData);
        setLastUpdated(new Date());
        setError("");

        console.log("Dashboard data loaded from API:", dashboardData);
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error) {
      setError("Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.success("Refreshing dashboard data...");
    fetchDashboardData(true);
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Pending Approvals",
      href: "#",
      icon: (
        <div className="relative">
          <MdPendingActions className="text-white h-5 w-5 flex-shrink-0" />
          {dashboardData?.stats?.pendingApprovals > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      ),
      onClick: () => setActiveSection("approvals"),
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      case "pending_approval":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "draft":
        return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
      case "completed":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      case "rejected":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      default:
        return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
    }
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
              <MdEvent className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-white font-medium mb-2">No Data Available</p>
            <p className="text-zinc-400 mb-4">Unable to load dashboard data</p>
            <Button
              onClick={() => fetchDashboardData(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <TbRefresh className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    const { stats, recentActivity, platformInsights } = dashboardData;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400">
              Monitor platform activity and manage hackathon approvals
            </p>
            {lastUpdated && (
              <p className="text-zinc-500 text-sm mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              variant="default"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <TbRefresh className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Badge className="bg-red-600 text-white border-red-600">
              <TbShield className="w-4 h-4 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Hackathons</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalHackathons}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {stats.completedHackathons} completed
                  </p>
                </div>
                <MdEvent className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.pendingApprovals}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">Require review</p>
                </div>
                <div className="relative">
                  <MdPendingActions className="w-8 h-8 text-yellow-400" />
                  {stats.pendingApprovals > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalParticipants +
                      stats.totalOrganizers +
                      stats.totalJudges}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {stats.totalParticipants} participants
                  </p>
                </div>
                <MdPerson className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Active Events</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.activeEvents}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Currently running
                  </p>
                </div>
                <MdCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats Row */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Teams Formed</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalTeams || 0}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Across all events
                  </p>
                </div>
                <MdGroup className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Projects</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalProjects || 0}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Total submissions
                  </p>
                </div>
                <MdAssignment className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Organizers</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalOrganizers}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {stats.totalJudges} judges
                  </p>
                </div>
                <MdPerson className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {platformInsights?.successRate || 0}%
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">Completion rate</p>
                </div>
                <MdTrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Alert */}
        {stats.pendingApprovals > 0 && (
          <Alert className="bg-yellow-900/20 border-yellow-600/30">
            <MdNotifications className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              You have {stats.pendingApprovals} hackathon
              {stats.pendingApprovals !== 1 ? "s" : ""} pending approval.{" "}
              <button
                onClick={() => setActiveSection("approvals")}
                className="underline hover:no-underline font-medium"
              >
                Review now
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="bg-zinc-950 border-zinc-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTimer className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity._id}
                    className="flex items-start space-x-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === "published"
                          ? "bg-green-400"
                          : activity.status === "pending_approval"
                          ? "bg-yellow-400"
                          : activity.status === "completed"
                          ? "bg-blue-400"
                          : "bg-zinc-400"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">
                          {activity.title}
                        </p>
                        <Badge
                          className={`text-xs ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-zinc-400 text-xs">
                        by {activity.organizer.name} •{" "}
                        {formatDate(activity.createdAt)}
                      </p>
                      {activity.theme && (
                        <p className="text-blue-400 text-xs mt-1">
                          Theme: {activity.theme}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-zinc-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Platform Insights */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTrendingUp className="w-5 h-5" />
                Platform Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Monthly Growth</span>
                  <span
                    className={`font-semibold ${
                      platformInsights?.monthlyGrowth >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {platformInsights?.monthlyGrowth >= 0 ? "+" : ""}
                    {platformInsights?.monthlyGrowth}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Success Rate</span>
                  <span className="text-blue-400 font-semibold">
                    {platformInsights?.successRate}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">
                    Avg Participants
                  </span>
                  <span className="text-purple-400 font-semibold">
                    {platformInsights?.averageParticipants}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Submission Rate</span>
                  <span className="text-cyan-400 font-semibold">
                    {platformInsights?.submissionRate}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <h4 className="text-zinc-400 text-sm mb-2">Popular Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {platformInsights?.popularThemes?.map((theme, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-zinc-600 text-zinc-300"
                    >
                      {theme}
                    </Badge>
                  )) || (
                    <span className="text-zinc-500 text-xs">No themes yet</span>
                  )}
                </div>
              </div>
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
      case "approvals":
        return <PendingHackathons />;
      default:
        return renderDashboardContent();
    }
  };

  if (loading && activeSection === "dashboard" && !dashboardData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-zinc-950 w-full flex-1 mx-auto border border-white/10">
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
                    className="bg-red-600/20 border-red-400/40 text-red-300 text-xs whitespace-nowrap"
                  >
                    <TbSparkles className="w-3 h-3 mr-1" />
                    Admin
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

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
