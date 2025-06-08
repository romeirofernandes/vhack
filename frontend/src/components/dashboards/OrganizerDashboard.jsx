import React, { useState } from "react";
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

const OrganizerDashboard = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "My Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Create Event",
      href: "#",
      icon: <MdAdd className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Participants",
      href: "#",
      icon: <MdGroup className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Analytics",
      href: "#",
      icon: <MdBarChart className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      href: "#",
      icon: <MdPerson className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <MdSettings className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <MdLogout className="text-white/70 h-5 w-5 flex-shrink-0" />,
      onClick: handleLogout,
    },
  ];

  const myHackathons = [
    {
      id: 1,
      title: "AI for Healthcare Hackathon",
      date: "March 20-22, 2025",
      participants: 450,
      teams: 89,
      status: "Active",
      submissions: 67,
    },
    {
      id: 2,
      title: "Fintech Innovation Challenge",
      date: "April 15-17, 2025",
      participants: 320,
      teams: 64,
      status: "Registration Open",
      submissions: 0,
    },
    {
      id: 3,
      title: "Green Tech Solutions",
      date: "May 10-12, 2025",
      participants: 0,
      teams: 0,
      status: "Draft",
      submissions: 0,
    },
  ];

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
          <Button className="bg-white text-zinc-950 hover:bg-white/90">
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
              <div className="text-2xl font-bold text-white">8</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2,847</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">94%</div>
            </CardContent>
          </Card>
        </div>

        {/* My Hackathons */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">My Hackathons</CardTitle>
            <CardDescription className="text-white/70">
              Manage your hackathon events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">
                    {hackathon.title}
                  </h3>
                  <p className="text-sm text-white/70">{hackathon.date}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Participants: {hackathon.participants}</span>
                    <span>Teams: {hackathon.teams}</span>
                    <span>Submissions: {hackathon.submissions}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      hackathon.status === "Active"
                        ? "bg-green-900/50 text-green-200"
                        : hackathon.status === "Registration Open"
                        ? "bg-blue-900/50 text-blue-200"
                        : "bg-gray-900/50 text-gray-200"
                    }`}
                  >
                    {hackathon.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Analytics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  AI Healthcare Hackathon started
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  New team registered for Fintech Challenge
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  Judge John Doe added to panel
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdAdd className="w-4 h-4 mr-2" />
                Create New Hackathon
              </Button>
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdGroup className="w-4 h-4 mr-2" />
                Invite Judges
              </Button>
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdBarChart className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
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
