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
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Profile from "./organizer/Profile";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import MyHackathons from "./organizer/MyHackathons";

const CreateEvent = () => (
  <div className="text-white text-xl text-center py-20">
    <MdAdd className="mx-auto mb-4 w-10 h-10" />
    <p>Create Event functionality coming soon!</p>
  </div>
);

const Participants = () => (
  <div className="text-white text-xl text-center py-20">
    <MdGroup className="mx-auto mb-4 w-10 h-10" />
    <p>Participants management coming soon!</p>
  </div>
);

const Analytics = () => (
  <div className="text-white text-xl text-center py-20">
    <MdBarChart className="mx-auto mb-4 w-10 h-10" />
    <p>Analytics dashboard coming soon!</p>
  </div>
);

const Settings = () => (
  <div className="text-white text-xl text-center py-20">
    <MdSettings className="mx-auto mb-4 w-10 h-10" />
    <p>Settings coming soon!</p>
  </div>
);

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
    if (activeSection === "dashboard" || activeSection === "hackathons") {
      fetchHackathons();
    }
    // eslint-disable-next-line
  }, [activeSection]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setHackathons(response.data.data.hackathons);
        setStats(response.data.data.stats);
      } else {
        toast.error(response.data.message || 'Error fetching hackathons');
      }
    } catch (error) {
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

  // Main content rendering based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
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
            <MyHackathons hackathons={hackathons} loading={loading} navigate={navigate} />
          </>
        );
      case "hackathons":
        return <MyHackathons hackathons={hackathons} loading={loading} navigate={navigate} />;
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
        return null;
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