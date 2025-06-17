import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import Profile from "./judges/Profile";
import JudgeAnalytics from "./judges/Analytics";
import JudgeInvitation from "./judges/JudgeInvitation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  MdDashboard,
  MdNotifications,
  MdBalance,
  MdAssignment,
  MdBarChart,
  MdCalendarToday,
  MdSettings,
  MdPerson,
  MdLogout,
  MdStar,
  MdTrendingUp,
  MdTimer,
  MdCheckCircle,
  MdPending,
  MdGavel,
} from "react-icons/md";

const JudgeDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    }
  }, [activeSection, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/judge/dashboard`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      // Mock data for development
      setDashboardData({
        stats: {
          totalHackathons: 8,
          pendingInvitations: 2,
          projectsToJudge: 5,
          projectsJudged: 23,
          averageScore: 7.8,
          completionRate: 92
        },
        recentActivity: [
          {
            type: "judgment",
            message: "Judged project 'AI Assistant' in Tech Innovation Challenge",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            project: "AI Assistant"
          },
          {
            type: "assignment",
            message: "Assigned as judge for 'Future of Work Hackathon'",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            hackathon: "Future of Work Hackathon"
          }
        ],
        upcomingDeadlines: [
          {
            hackathon: "Climate Tech Challenge",
            type: "judging",
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            daysLeft: 3
          }
        ],
        pendingInvitations: [
          {
            title: "AI Innovation Summit",
            organizerId: { displayName: "TechCorp" },
            theme: "AI",
            timelines: {
              hackathonStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        ],
        projectsToJudge: [
          {
            title: "Smart City Dashboard",
            hackathon: { title: "Urban Tech Challenge" },
            team: { name: "CityBuilders" },
            builders: [{ user: { displayName: "Alex Johnson" } }]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Invitations",
      href: "#",
      icon: (
        <div className="relative">
          <MdNotifications className="text-zinc-400 h-5 w-5 flex-shrink-0" />
          {dashboardData?.stats?.pendingInvitations > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      ),
      onClick: () => setActiveSection("invitations"),
    },
    {
      label: "Judging Queue",
      href: "#",
      icon: <MdBalance className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("queue"),
    },
    {
      label: "My Reviews",
      href: "#",
      icon: <MdAssignment className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("reviews"),
    },
    {
      label: "Analytics",
      href: "#",
      icon: <MdBarChart className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("analytics"),
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("hackathons"),
    },
  ];

  const bottomLinks = [
    {
      label: "Profile",
      href: "#",
      icon: <MdPerson className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
    {
      label: "Settings",
      href: "#",
      icon: <MdSettings className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("settings"),
    },
    {
      label: "Logout",
      href: "#",
      icon: <MdLogout className="text-zinc-400 h-5 w-5 flex-shrink-0" />,
      onClick: logout,
    },
  ];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      );
    }

    const { stats, recentActivity, upcomingDeadlines, pendingInvitations, projectsToJudge } = dashboardData;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Judge'}!
            </h1>
            <p className="text-zinc-400">
              Ready to evaluate some amazing projects?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-600 text-white border-blue-600">
              <MdGavel className="w-4 h-4 mr-1" />
              Judge
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Hackathons</p>
                  <p className="text-2xl font-bold text-white">{stats.totalHackathons}</p>
                </div>
                <MdCalendarToday className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Projects Judged</p>
                  <p className="text-2xl font-bold text-white">{stats.projectsJudged}</p>
                </div>
                <MdCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Pending Reviews</p>
                  <p className="text-2xl font-bold text-white">{stats.projectsToJudge}</p>
                </div>
                <MdPending className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-white">{stats.averageScore}/10</p>
                </div>
                <MdStar className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                </div>
                <MdTrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Pending Invitations</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingInvitations}</p>
                </div>
                <MdNotifications className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTimer className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'judgment' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-zinc-400 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MdTimer className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-white font-medium">{deadline.hackathon}</p>
                    <p className="text-zinc-400 text-sm capitalize">{deadline.type} deadline</p>
                  </div>
                  <Badge className={`${
                    deadline.daysLeft <= 1 ? 'bg-red-600 border-red-600' : 
                    deadline.daysLeft <= 3 ? 'bg-yellow-600 border-yellow-600' : 'bg-green-600 border-green-600'
                  } text-white`}>
                    {deadline.daysLeft} day{deadline.daysLeft !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )) : (
                <p className="text-zinc-400 text-center py-4">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {pendingInvitations && pendingInvitations.length > 0 && (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdNotifications className="w-5 h-5" />
                  Pending Invitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingInvitations.map((invitation, index) => (
                  <div key={index} className="p-4 bg-zinc-900 rounded-lg border border-yellow-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{invitation.title}</h3>
                      <Badge className="bg-yellow-600 text-white border-yellow-600">{invitation.theme}</Badge>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">
                      Organized by {invitation.organizerId?.displayName}
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                        Accept
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-red-600">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects to Judge */}
          {projectsToJudge && projectsToJudge.length > 0 && (
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdBalance className="w-5 h-5" />
                  Projects to Judge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectsToJudge.map((project, index) => (
                  <div key={index} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{project.title}</h3>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                        Review
                      </Button>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {project.hackathon?.title} • Team: {project.team?.name}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderComingSoon = (title, description) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center">
        <MdTimer className="w-8 h-8 text-zinc-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-zinc-400">{description}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "invitations":
        return <JudgeInvitation />;
      case "queue":
        return renderComingSoon("Judging Queue", "Project review queue coming soon!");
      case "reviews":
        return renderComingSoon("My Reviews", "Review history and management coming soon!");
      case "analytics":
        return <JudgeAnalytics />;
      case "hackathons":
        return renderComingSoon("Hackathons", "Your judging hackathons overview coming soon!");
      case "profile":
        return <Profile/>;
      case "settings":
        return renderComingSoon("Settings", "Judging preferences and settings coming soon!");
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* User Info */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.displayName?.charAt(0) || 'J'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{user?.displayName || 'Judge'}</p>
              <p className="text-zinc-400 text-sm">Judge Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === link.label.toLowerCase().replace(' ', '')
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom Links */}
        <div className="px-4 py-6 border-t border-zinc-800">
          <div className="space-y-2">
            {bottomLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === link.label.toLowerCase()
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-8">
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
    </div>
  );
};

export default JudgeDashboard;