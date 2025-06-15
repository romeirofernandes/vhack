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
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Profile from "./organizer/Profile";
import axios from "axios";
import { toast } from "react-hot-toast";
import OrganizerProfile from "@/pages/CreateOrganizerProfile";

const OrganizerDashboard = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeEvents: 0,
    totalParticipants: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      console.log('Current user:', user); // Debug log for user info

      // First try to fetch all hackathons
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons`,
        { withCredentials: true }
      );

      console.log('All hackathons response:', response.data); // Debug log

      if (response.data.success) {
        setHackathons(response.data.data.hackathons);
        setStats(response.data.data.stats);
      } else {
        toast.error(response.data.message || 'Error fetching hackathons');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message); // Debug log
      toast.error(error.response?.data?.message || 'Error fetching hackathons');
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

  const links = [
    {
      label: "Dashboard",
      href: "/organizer/dashboard",
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "My Hackathons",
      href: "/organizer/hackathons",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("hackathons"),
    },
    {
      label: "Create Event",
      href: "/organizer/create-hackathon",
      icon: <MdAdd className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("create-event"),
    },
    {
      label: "Participants",
      href: "/organizer/participants",
      icon: <MdGroup className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("participants"),
    },
    {
      label: "Analytics",
      href: "/organizer/analytics",
      icon: <MdBarChart className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("analytics"),
    },
    {
      label: "Profile",
      href: "/organizer/profile",
      icon: <MdPerson className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: () => setActiveSection("profile"),
    },
    {
      label: "Settings",
      href: "/organizer/settings",
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

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <Profile />;
      case "dashboard":
      default:
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">
                  Organizer Dashboard
                </h1>
                <p className="text-white/70">
                  Manage and create amazing hackathon experiences
                </p>
              </div>
              <Button 
                className="bg-white text-zinc-950 hover:bg-white/90"
                onClick={() => navigate('/organizer/create-hackathon')}
              >
                <MdAdd className="w-4 h-4 mr-2" />
                Create Hackathon
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    Total Hackathons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalHackathons}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    Active Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.activeEvents}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    Total Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* My Hackathons */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">My Hackathons</CardTitle>
                    <CardDescription className="text-white/70">
                      Manage your hackathon events
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-white text-zinc-950 hover:bg-white/90"
                    onClick={() => navigate('/organizer/create-hackathon')}
                  >
                    <MdAdd className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center text-white/70 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70 mx-auto mb-4"></div>
                    Loading hackathons...
                  </div>
                ) : hackathons.length === 0 ? (
                  <div className="text-center text-white/70 py-8">
                    <p className="mb-4">No hackathons created yet</p>
                    <Button 
                      className="bg-white text-zinc-950 hover:bg-white/90"
                      onClick={() => navigate('/organizer/create-hackathon')}
                    >
                      Create Your First Hackathon
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {hackathons.map((hackathon) => (
                      <div
                        key={hackathon._id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {hackathon.title}
                              </h3>
                              <p className="text-sm text-white/70 mt-1">
                                {hackathon.description.length > 150 
                                  ? `${hackathon.description.substring(0, 150)}...` 
                                  : hackathon.description}
                              </p>
                            </div>
                            <Badge
                              className={`${
                                hackathon.status === "ongoing"
                                  ? "bg-green-900/50 text-green-200"
                                  : hackathon.status === "draft"
                                  ? "bg-blue-900/50 text-blue-200"
                                  : "bg-gray-900/50 text-gray-200"
                              }`}
                            >
                              {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                              <p className="text-white/50">Timeline</p>
                              <p className="text-white/80">
                                {new Date(hackathon.timelines.hackathonStart).toLocaleDateString()} - {new Date(hackathon.timelines.hackathonEnd).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-white/50">Registration</p>
                              <p className="text-white/80">
                                {new Date(hackathon.timelines.registrationStart).toLocaleDateString()} - {new Date(hackathon.timelines.registrationEnd).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-white/50">Team Size</p>
                              <p className="text-white/80">
                                {hackathon.teamSettings.minTeamSize} - {hackathon.teamSettings.maxTeamSize} members
                                {hackathon.teamSettings.allowSolo && " (Solo allowed)"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-white/50">Theme</p>
                              <p className="text-white/80 capitalize">{hackathon.theme}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 md:mt-0 md:ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-black hover:bg-white/10"
                            onClick={() => navigate(`/organizer/hackathon/${hackathon._id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => navigate(`/organizer/hackathon/${hackathon._id}/allot-judges`)}
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                          >
                            Add Judges
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.displayName || "Organizer",
                href: "#",
                icon: (
                  <img
                    src={user?.photoURL || "https://avatar.vercel.sh/organizer"}
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
        {renderContent()}
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

export default OrganizerDashboard;
