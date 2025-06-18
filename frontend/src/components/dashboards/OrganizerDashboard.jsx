import React, { useState, useEffect, use } from "react";
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
} from "react-icons/md";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
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
import { getIdToken } from "firebase/auth";
import Analytics from "./organizer/Analytics";


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

const DashboardAnalytics = () => (
  <Analytics />
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardData();
    }
    if (activeSection === "hackathons") {
      fetchHackathons();
    }
    // eslint-disable-next-line
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
    console.log("Dashboard response:", res.data);
    if (res.data.success) {
      setDashboardData(res.data.data);
    } else {
      toast.error(res.data.message || "Error loading dashboard");
    }
  } catch (err) {
    toast.error("Error loading dashboard");
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
        { headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true }
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
      onClick: () => navigate("/organizer/create-hackathon"),
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
    if (activeSection === "dashboard") {
      if (loading || !dashboardData) {
        return <div className="text-white text-center py-20">Loading...</div>;
      }
      const { stats, recentActivity, upcomingEvents, todoList, insights, leaderboard } = dashboardData;

      return (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdCalendarToday className="w-5 h-5" /> Total Hackathons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.totalHackathons}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdTimer className="w-5 h-5" /> Active Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.activeEvents}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdGroup className="w-5 h-5" /> Total Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.totalParticipants}</span>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdTrendingUp className="w-5 h-5" /> Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.successRate}%</span>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MdTrendingUp className="w-5 h-5" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <div>
                        <p className="text-white text-sm">{a.message}</p>
                        <p className="text-xs text-white/50">{new Date(a.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  )) : <div className="text-white/50">No recent activity</div>}
                </CardContent>
              </Card>
              {/* To-Do List */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MdCheckCircle className="w-5 h-5" /> To-Do List
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {todoList.length > 0 ? todoList.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <MdFlashOn className="text-yellow-400" />
                      <span className="text-white text-sm">{t.task}</span>
                    </div>
                  )) : <div className="text-white/50">All caught up!</div>}
                </CardContent>
              </Card>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MdTimer className="w-5 h-5" /> Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-white font-medium">{e.title}</span>
                      <span className="text-xs text-white/50">
                        {new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )) : <div className="text-white/50">No upcoming events</div>}
                </CardContent>
              </Card>
              {/* Quick Actions */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MdFlashOn className="w-5 h-5" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 text-white" onClick={() => navigate("/organizer/create-hackathon")}>
                    + Create Hackathon
                  </Button>
                  <Button className="w-full bg-green-600 text-white" onClick={() => setActiveSection("participants")}>
                    View Participants
                  </Button>
                  <Button className="w-full bg-purple-600 text-white" onClick={() => setActiveSection("analytics")}>
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom: Insights/Charts & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Insights/Charts */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📊 Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <Bar
                    data={{
                      labels: insights.map(i => i.title),
                      datasets: [
                        {
                          label: "Participants",
                          data: insights.map(i => i.participants),
                          backgroundColor: "rgba(59,130,246,0.7)",
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Leaderboard */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MdLeaderboard className="w-5 h-5" /> Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.length > 0 ? leaderboard.map((p, i) => (
                  <div key={p._id || i} className="flex items-center gap-3">
                    <span className="text-xl font-bold text-yellow-400">{i + 1}</span>
                    <img src={p.photoURL || "https://avatar.vercel.sh/user"} className="w-8 h-8 rounded-full" />
                    <span className="text-white">{p.displayName || p.email}</span>
                    <span className="ml-auto text-white/70">{p.submissions} submissions</span>
                  </div>
                )) : <div className="text-white/50">No leaderboard data</div>}
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    if (activeSection === "hackathons") {
      return <MyHackathons hackathons={hackathons} loading={loading} navigate={navigate} />;
    }
    if (activeSection === "create-event") {
      return <CreateEvent />;
    }
    if (activeSection === "participants") {
      return <Participants />;
    }
    if (activeSection === "analytics") {
      return <DashboardAnalytics />;
    }
    if (activeSection === "profile") {
      return <Profile />;
    }
    if (activeSection === "settings") {
      return <Settings />;
    }
    return null;
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