import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdSettings,
  MdPerson,
  MdBalance,
  MdCalendarToday,
  MdAssignment,
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
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useNavigate } from "react-router-dom";

const JudgeDashboard = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      href: "#",
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Judging Queue",
      href: "#",
      icon: <MdBalance className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "My Reviews",
      href: "#",
      icon: <MdAssignment className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
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
      onClick: ()=>handleLogout(),
    },
  ];

  const pendingReviews = [
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
              <div className="text-2xl font-bold text-white">23</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Hackathons Judged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">5</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Average Score Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">8.2</div>
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
            {pendingReviews.map((project) => (
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
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">SmartFarm IoT</p>
                  <p className="text-sm text-white/70">Scored: 9.2/10</p>
                </div>
                <Badge className="bg-green-900/50 text-green-200">
                  Completed
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">CryptoLearn Platform</p>
                  <p className="text-sm text-white/70">Scored: 7.8/10</p>
                </div>
                <Badge className="bg-green-900/50 text-green-200">
                  Completed
                </Badge>
              </div>
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
