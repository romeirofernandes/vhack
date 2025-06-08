import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdSettings,
  MdPerson,
  MdGroup,
  MdEmojiEvents,
  MdCalendarToday,
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

const ParticipantDashboard = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    navigate("/login");
  };

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "My Teams",
      href: "#",
      icon: <MdGroup className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Achievements",
      href: "#",
      icon: <MdEmojiEvents className="text-white/70 h-5 w-5 flex-shrink-0" />,
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

  const upcomingHackathons = [
    {
      id: 1,
      title: "AI for Good Hackathon",
      date: "March 15-17, 2025",
      prize: "$50,000",
      participants: 1200,
      status: "Open",
    },
    {
      id: 2,
      title: "Web3 Innovation Challenge",
      date: "April 2-4, 2025",
      prize: "$25,000",
      participants: 800,
      status: "Open",
    },
    {
      id: 3,
      title: "Climate Tech Hackathon",
      date: "April 20-22, 2025",
      prize: "$30,000",
      participants: 600,
      status: "Registration Soon",
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
                label: user?.displayName || "User",
                href: "#",
                icon: (
                  <img
                    src={
                      user?.photoURL || "https://avatar.vercel.sh/participant"
                    }
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.displayName?.split(" ")[0]}!
          </h1>
          <p className="text-white/70">Ready to build something amazing?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Hackathons Joined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">5</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Awards Won
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Teams Formed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">#127</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Hackathons */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Hackathons</CardTitle>
            <CardDescription className="text-white/70">
              Discover and join exciting hackathons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingHackathons.map((hackathon) => (
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
                    <span>Prize: {hackathon.prize}</span>
                    <span>Participants: {hackathon.participants}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      hackathon.status === "Open"
                        ? "bg-green-900/50 text-green-200"
                        : "bg-yellow-900/50 text-yellow-200"
                    }`}
                  >
                    {hackathon.status}
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-white text-zinc-950 hover:bg-white/90"
                  >
                    {hackathon.status === "Open" ? "Register" : "Notify Me"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  Won 2nd place in AI Hackathon 2024
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  Joined team "Code Warriors"
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="text-sm text-white/80">
                  Submitted project "EcoTracker"
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">My Teams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Code Warriors</p>
                  <p className="text-sm text-white/70">4 members</p>
                </div>
                <Badge className="bg-green-900/50 text-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Innovation Squad</p>
                  <p className="text-sm text-white/70">3 members</p>
                </div>
                <Badge className="bg-yellow-900/50 text-yellow-200">
                  Recruiting
                </Badge>
              </div>
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

export default ParticipantDashboard;
