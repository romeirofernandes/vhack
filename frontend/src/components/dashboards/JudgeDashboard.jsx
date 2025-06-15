import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdSettings,
  MdPerson,
  MdBalance,
  MdCalendarToday,
  MdAssignment,
  MdLogout,
  MdNotifications,
} from "react-icons/md";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import JudgeInvitations from "./judges/JudgeInvitation";
import Profile from "./judges/Profile";

const JudgeDashboard = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    stats: {
      projectsReviewed: 0,
      pendingReviews: 0,
      hackathonsJudged: 0,
      averageScore: 0
    },
    pendingReviews: [],
    recentReviews: [],
    judgingCategories: [],
    invitations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasInvitations, setHasInvitations] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    checkInvitations();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      
      // You can replace these with actual API calls when backend is ready
      const mockStats = {
        projectsReviewed: 23,
        pendingReviews: 7,
        hackathonsJudged: 5,
        averageScore: 8.2
      };

      const mockPendingReviews = [
        {
          id: 1,
          title: "EcoTracker App",
          team: "Green Coders",
          hackathon: "Climate Tech Hackathon",
          submittedAt: "2 hours ago",
          category: "Mobile App",
        },
        {
          id: 2,
          title: "AI Resume Builder",
          team: "Career Boost",
          hackathon: "AI for Good",
          submittedAt: "4 hours ago",
          category: "Web App",
        },
        {
          id: 3,
          title: "DeFi Portfolio Tracker",
          team: "Crypto Wizards",
          hackathon: "Web3 Innovation",
          submittedAt: "6 hours ago",
          category: "Blockchain",
        },
      ];

      const mockRecentReviews = [
        {
          projectTitle: "SmartFarm IoT",
          score: 9.2,
          status: "Completed"
        },
        {
          projectTitle: "CryptoLearn Platform",
          score: 7.8,
          status: "Completed"
        }
      ];

      setDashboardData(prev => ({
        ...prev,
        stats: mockStats,
        pendingReviews: mockPendingReviews,
        recentReviews: mockRecentReviews
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const checkInvitations = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/judge/invitations`,
        {
          headers: { Authorization: `Bearer ${idToken}` }
        }
      );
      
      if (response.data.success) {
        const invitations = response.data.invitations || [];
        setDashboardData(prev => ({ ...prev, invitations }));
        setHasInvitations(invitations.length > 0);
      }
    } catch (error) {
      console.error("Error checking invitations:", error);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      const idToken = await user.getIdToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/judge/invitations/${invitationId}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.data.success) {
        toast.success(`Invitation ${response}ed successfully`);
        // Remove the invitation from the list
        setDashboardData(prev => ({
          ...prev,
          invitations: prev.invitations.filter(inv => inv.id !== invitationId)
        }));
        // Refresh stats if accepted
        if (response === 'accept') {
          fetchDashboardData();
        }
        // Update notification badge
        checkInvitations();
      } else {
        toast.error('Failed to respond to invitation');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
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
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Invitations",
      href: "#",
      icon: (
        <div className="relative">
          <MdNotifications className="text-white/70 h-5 w-5 flex-shrink-0" />
          {hasInvitations && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      ),
      onClick: () => setActiveSection("invitations"),
    },
    {
      label: "Judging Queue",
      href: "#",
      icon: <MdBalance className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("queue"),
    },
    {
      label: "My Reviews",
      href: "#",
      icon: <MdAssignment className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("reviews"),
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("hackathons"),
    },
    {
      label: "Profile",
      href: "#",
      icon: <MdPerson className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
    {
      label: "Settings",
      href: "#",
      icon: <MdSettings className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("settings"),
    },
    {
      label: "Logout",
      href: "#",
      icon: <MdLogout className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: handleLogout,
    },
  ];

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Judge Dashboard</h1>
        <p className="text-white/70">Review and evaluate amazing projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              Projects Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.projectsReviewed}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.pendingReviews}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              Hackathons Judged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.hackathonsJudged}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              Average Score Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dashboardData.stats.averageScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Pending Reviews</CardTitle>
          <CardDescription className="text-white/70">
            Projects waiting for your evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData.pendingReviews.length > 0 ? (
            dashboardData.pendingReviews.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{project.title}</h3>
                  <p className="text-sm text-white/70">by {project.team}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{project.hackathon}</span>
                    <span>Submitted {project.submittedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-900/50 text-blue-200">
                    {project.category}
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-white text-zinc-950 hover:bg-white/90"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/50">
              No pending reviews at the moment
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentReviews.length > 0 ? (
              dashboardData.recentReviews.map((review, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{review.projectTitle}</p>
                    <p className="text-sm text-white/70">Scored: {review.score}/10</p>
                  </div>
                  <Badge className="bg-green-900/50 text-green-200">
                    {review.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50">
                No recent reviews
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Judging Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Innovation</span>
              <span className="text-white/70">Weight: 30%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Technical Implementation</span>
              <span className="text-white/70">Weight: 25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">User Experience</span>
              <span className="text-white/70">Weight: 20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Business Impact</span>
              <span className="text-white/70">Weight: 25%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInvitationsContent = () => (
    <JudgeInvitations/>
  );

  const renderComingSoon = (title, description) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <MdSettings className="w-12 h-12 text-white/30" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-white/70 max-w-md mb-6">{description}</p>
      <Button
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
        onClick={() => setActiveSection("dashboard")}
      >
        Back to Dashboard
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "invitations":
        return renderInvitationsContent();
      case "queue":
        return renderComingSoon("Judging Queue", "Project review queue coming soon!");
      case "reviews":
        return renderComingSoon("My Reviews", "Review history and management coming soon!");
      case "hackathons":
        return renderComingSoon("Hackathons", "Your judging hackathons overview coming soon!");
      case "profile":
        return <Profile/>
      case "settings":
        return renderComingSoon("Settings", "Judging preferences and settings coming soon!");
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
    <div className="bg-zinc-950 min-h-screen flex">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.displayName || "Judge",
                href: "#",
                icon: (
                  <img
                    src={user?.photoURL || "https://avatar.vercel.sh/judge"}
                    className="h-7 w-7 flex-shrink-0 rounded-full border border-white/10"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {error && (
          <Alert className="bg-red-900/20 border-red-800/50">
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
  );
};

const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20">
      <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        VHack
      </motion.span>
    </div>
  );
};

export default JudgeDashboard;