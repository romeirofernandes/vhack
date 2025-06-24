import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdCode,
  MdGroup,
  MdAssignment,
  MdEmojiEvents,
  MdSettings,
  MdLogout,
  MdNotifications,
  MdTrendingUp,
  MdTimer,
  MdSearch,
  MdFilterList,
  MdBarChart,
} from "react-icons/md";
import { TbCode, TbSparkles } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

// Import the new components
import Profile from "./participants/Profile";
import Projects from "./participants/Projects";
import Achievements from "./participants/Achievements";
import Hackathons from "./participants/HackathonDetailsPage";
import ParticipantHackathons from "./participants/ParticipantHackathons";
import MyHackathonsAndTeams from "./participants/MyHackathonsAndTeams";
import ParticipantAnalytics from "./participants/Analytics";
import ResultsChecker from "./participants/ResultsChecker";

const ParticipantDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [userHackathons, setUserHackathons] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCode className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("hackathons"),
    },
    {
      label: "My Hackathons & Teams",
      href: "#",
      icon: <MdGroup className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("my-hackathons"),
    },
    {
      label: "Projects",
      href: "#",
      icon: <MdAssignment className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("projects"),
    },
    {
      label: "Achievements",
      href: "#",
      icon: <MdEmojiEvents className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("achievements"),
    },
    {
      label: "Analytics",
      href: "#",
      icon: <MdBarChart className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("analytics"),
    },
    {
      label: "Profile",
      href: "#",
      icon: <MdSettings className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchMyTeams();
    fetchAchievements();
  }, []);

  useEffect(() => {
    if (activeSection === "hackathons") {
      fetchHackathons();
    }
  }, [activeSection]);

  useEffect(() => {
    const fetchUserHackathons = async () => {
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/participant/hackathons`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("User hackathons fetch failed:", response.status);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUserHackathons(data.data.hackathons);
      }
    };

    fetchUserHackathons();
  }, [user]);

  const fetchMyTeams = async () => {
    try {
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teams/my`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyTeams(data.data || []);
      }
    } catch (error) {
      console.error("Teams fetch error:", error);
    }
  };

  const fetchAchievements = async () => {
    try {
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/achievements`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.data.achievements || []);
        }
      }
    } catch (error) {
      console.error("Achievements fetch error:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      console.log(
        "Fetching dashboard with token:",
        idToken ? "Token exists" : "No token"
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/participant/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Dashboard response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Dashboard fetch error:", errorData);

        if (response.status === 401) {
          // Token is invalid, try to refresh
          console.log("Token invalid, attempting refresh...");
          try {
            const freshToken = await user.getIdToken(true);
            const retryResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/participant/dashboard`,
              {
                headers: {
                  Authorization: `Bearer ${freshToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.success) {
                setDashboardData(retryData.data);
                return;
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        setError(errorData.error || "Failed to fetch dashboard data");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathons = async () => {
    try {
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/hackathons`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Hackathons fetch failed:", response.status);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setHackathons(data.data.hackathons);
      }
    } catch (error) {
      console.error("Hackathons fetch error:", error);
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

  // Calculate real stats from actual data
  const calculateRealStats = () => {
    const hackathonsJoined = myTeams.length; // Each team represents a hackathon joined
    const achievementsEarned = achievements.filter((a) => a.unlocked).length;

    // Get unique hackathons from teams
    const uniqueHackathons = new Set(
      myTeams.map((team) => team.hackathon?._id).filter(Boolean)
    );
    const uniqueHackathonsCount = uniqueHackathons.size;

    // Count ongoing hackathons
    const ongoingHackathons = myTeams.filter(
      (team) =>
        team.hackathon?.status === "ongoing" ||
        team.hackathon?.status === "published"
    ).length;

    // Count teams
    const teamsJoined = myTeams.length;

    return {
      hackathonsJoined: uniqueHackathonsCount || hackathonsJoined,
      achievementsEarned,
      teamsJoined,
      ongoingHackathons,
      projectsSubmitted: dashboardData?.stats?.projectsSubmitted || 0,
      draftProjects: dashboardData?.quickStats?.draftProjects || 0,
    };
  };

  const renderDashboardContent = () => {
    if (!dashboardData) return null;

    const { user: userData, recentActivity, upcomingDeadlines } = dashboardData;

    const realStats = calculateRealStats();

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {userData.displayName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-white/70">
              Ready to build something amazing today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={userData.profileCompleted ? "default" : "destructive"}
              className="text-sm"
            >
              Profile {userData.profileCompleted ? "Complete" : "Incomplete"}
            </Badge>
            {!userData.profileCompleted && (
              <Button
                size="sm"
                onClick={() => navigate("/profile/participant")}
                className="bg-white text-zinc-950 hover:bg-white/90"
              >
                Complete Profile
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Hackathons Joined"
            value={realStats.hackathonsJoined}
            icon={MdCode}
            color="blue"
            trend={`+${realStats.ongoingHackathons} ongoing`}
          />
          <StatsCard
            title="Projects Submitted"
            value={realStats.projectsSubmitted}
            icon={MdAssignment}
            color="green"
            trend={`${realStats.draftProjects} drafts`}
          />
          <StatsCard
            title="Teams Joined"
            value={realStats.teamsJoined}
            icon={MdGroup}
            color="purple"
            trend={`${realStats.teamsJoined} total`}
          />
          <StatsCard
            title="Achievements"
            value={realStats.achievementsEarned}
            icon={MdEmojiEvents}
            color="yellow"
            trend="🏆"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white/5 border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                    onClick={() => activity.link && navigate(activity.link)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "team"
                          ? "bg-blue-400"
                          : activity.type === "project"
                          ? "bg-green-400"
                          : "bg-purple-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-white/50 text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/50">No recent activity</p>
                  <Button
                    className="mt-4 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => setActiveSection("hackathons")}
                  >
                    Join Your First Hackathon
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTimer className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {deadline.hackathon}
                      </p>
                      <p className="text-white/50 text-xs capitalize">
                        {deadline.type} deadline
                      </p>
                    </div>
                    <Badge
                      variant={
                        deadline.daysLeft <= 1
                          ? "destructive"
                          : deadline.daysLeft <= 3
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {deadline.daysLeft}d
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MdNotifications className="w-8 h-8 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for getting started */}
        {realStats.hackathonsJoined === 0 && (
          <Card className="bg-blue-900/20 border-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    🚀 Ready to start your hackathon journey?
                  </h3>
                  <p className="text-blue-200 text-sm">
                    Join your first hackathon and start building amazing
                    projects!
                  </p>
                </div>
                <Button
                  onClick={() => setActiveSection("hackathons")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Hackathons
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "hackathons":
        return <ParticipantHackathons />;
      case "my-hackathons":
        return <MyHackathonsAndTeams />;
      case "projects":
        return <Projects />;
      case "achievements":
        return <Achievements />;
      case "analytics":
        return <ParticipantAnalytics />;
      case "profile":
        return <Profile />;
      default:
        return renderDashboardContent();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading your dashboard...</div>
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
              className="font-normal flex items-center text-sm text-white py-1 relative z-20 "
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
                    className="bg-blue-500/20 border-blue-400/40 text-blue-300 text-xs whitespace-nowrap"
                  >
                    <TbSparkles className="w-3 h-3 mr-1" />
                    Participant
                  </Badge>
                </motion.div>
              </div>
            </motion.div>

            {/* Navigation Links */}
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

      {/* Main Content */}
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

      {/* Results Checker - automatically shows results when available */}
      <ResultsChecker hackathons={userHackathons} />
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        <Icon
          className={`w-5 h-5 ${
            color === "blue"
              ? "text-blue-400"
              : color === "green"
              ? "text-green-400"
              : color === "purple"
              ? "text-purple-400"
              : "text-yellow-400"
          }`}
        />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && <div className="text-xs text-white/50">{trend}</div>}
      </div>
    </CardContent>
  </Card>
);

// Coming Soon Component
const ComingSoon = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
      <TbSparkles className="w-12 h-12 text-white/30" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <p className="text-white/70 max-w-md mb-6">{description}</p>
    <Button
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10"
      onClick={() =>
        window.open("https://github.com/yourusername/vhack", "_blank")
      }
    >
      Follow Development
    </Button>
  </div>
);

export default ParticipantDashboard;
