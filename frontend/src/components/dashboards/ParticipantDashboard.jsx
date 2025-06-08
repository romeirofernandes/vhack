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
} from "react-icons/md";
import { TbCode, TbSparkles } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

const ParticipantDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [hackathons, setHackathons] = useState([]);
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
      label: "Profile",
      href: "#",
      icon: <MdSettings className="text-white h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === "hackathons") {
      fetchHackathons();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/participant`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

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
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/hackathons`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

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

  const joinHackathon = async (hackathonId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/dashboard/hackathons/${hackathonId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchHackathons();
        fetchDashboardData();
      } else {
        setError(data.error || "Failed to join hackathon");
      }
    } catch (error) {
      console.error("Join hackathon error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  const renderDashboardContent = () => {
    if (!dashboardData) return null;

    const {
      user: userData,
      stats,
      recentActivity,
      upcomingDeadlines,
      quickStats,
    } = dashboardData;

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
            value={stats.hackathonsJoined}
            icon={MdCode}
            color="blue"
            trend={`+${quickStats.ongoingHackathons} ongoing`}
          />
          <StatsCard
            title="Projects Submitted"
            value={stats.projectsSubmitted}
            icon={MdAssignment}
            color="green"
            trend={`${quickStats.draftProjects} drafts`}
          />
          <StatsCard
            title="Teams Joined"
            value={stats.teamsJoined}
            icon={MdGroup}
            color="purple"
            trend={`${quickStats.teamsCount} total`}
          />
          <StatsCard
            title="Achievements"
            value={stats.achievementsEarned}
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
              {recentActivity.length > 0 ? (
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
              {upcomingDeadlines.length > 0 ? (
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
      </div>
    );
  };

  const renderHackathonsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hackathons</h1>
          <p className="text-white/70">Discover and join exciting hackathons</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search hackathons..."
              className="w-64 h-10 pl-10 pr-4 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <MdFilterList className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <HackathonCard
            key={hackathon._id}
            hackathon={hackathon}
            onJoin={() => joinHackathon(hackathon._id)}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "hackathons":
        return renderHackathonsContent();
      case "teams":
        return (
          <ComingSoon
            title="Teams"
            description="Team management and collaboration tools coming soon!"
          />
        );
      case "projects":
        return (
          <ComingSoon
            title="Projects"
            description="Project submissions and portfolio coming soon!"
          />
        );
      case "achievements":
        return (
          <ComingSoon
            title="Achievements"
            description="Your badges and accomplishments coming soon!"
          />
        );
      case "profile":
        return (
          <ComingSoon
            title="Profile Settings"
            description="Advanced profile management coming soon!"
          />
        );
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
            {/* Logo */}
            <div className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20">
              <div className="flex items-center justify-center w-full">
                <TbCode className="w-5 h-5 text-white flex-shrink-0" />
                <motion.span
                  animate={{
                    display: sidebarOpen ? "inline-block" : "none",
                    opacity: sidebarOpen ? 1 : 0,
                  }}
                  className="font-medium text-white whitespace-pre ml-2"
                >
                  vHack
                </motion.span>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-white/10 border-white/20 text-white/90 text-xs ml-2"
                    >
                      <TbSparkles className="w-3 h-3 mr-1" />
                      Beta
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

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

// Hackathon Card Component
const HackathonCard = ({ hackathon, onJoin }) => (
  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-white text-lg mb-2 group-hover:text-white/90 transition-colors">
            {hackathon.title}
          </CardTitle>
          <p className="text-white/70 text-sm line-clamp-2">
            {hackathon.description}
          </p>
        </div>
        <Badge
          className={`ml-3 ${
            hackathon.status === "upcoming"
              ? "bg-blue-900/50 text-blue-200"
              : hackathon.status === "ongoing"
              ? "bg-green-900/50 text-green-200"
              : "bg-gray-900/50 text-gray-200"
          }`}
        >
          {hackathon.status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Dates */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/60">
          <span>Start:</span>
          <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-white/60">
          <span>End:</span>
          <span>{new Date(hackathon.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-white/60">
          <span>Participants:</span>
          <span>
            {hackathon.participantCount}
            {hackathon.maxParticipants ? `/${hackathon.maxParticipants}` : ""}
          </span>
        </div>
      </div>

      {/* Prizes */}
      {hackathon.prizes && hackathon.prizes.length > 0 && (
        <div className="text-sm">
          <p className="text-white/70 mb-1">Prizes:</p>
          <p className="text-green-400 font-medium">
            $
            {hackathon.prizes
              .reduce((total, prize) => total + prize.amount, 0)
              .toLocaleString()}
            + in total
          </p>
        </div>
      )}

      {/* Themes */}
      {hackathon.themes && hackathon.themes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hackathon.themes.slice(0, 3).map((theme, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-white/10 text-white/80 text-xs"
            >
              {theme}
            </Badge>
          ))}
          {hackathon.themes.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-white/10 text-white/80 text-xs"
            >
              +{hackathon.themes.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        {hackathon.isJoined ? (
          <Button
            disabled
            className="w-full bg-green-900/50 text-green-200 cursor-not-allowed"
          >
            ✓ Joined
          </Button>
        ) : hackathon.canJoin ? (
          <Button
            onClick={onJoin}
            className="w-full bg-white text-zinc-950 hover:bg-white/90"
          >
            Join Hackathon
          </Button>
        ) : (
          <Button
            disabled
            className="w-full bg-gray-900/50 text-gray-400 cursor-not-allowed"
          >
            Registration Closed
          </Button>
        )}
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
