import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  MdDashboard,
  MdSettings,
  MdPerson,
  MdGroup,
  MdCalendarToday,
  MdSecurity,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ADMIN_PASSWORD = "vhack2025admin"; 

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if admin is already authenticated in this session
    const adminAuth = sessionStorage.getItem("vhack_admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("vhack_admin_auth", "true");
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("vhack_admin_auth");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
            <CardDescription className="text-white/70">
              Enter the admin password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-900/20 border-red-800/50">
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-zinc-950 hover:bg-white/90"
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: <MdDashboard className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "User Management",
      href: "#",
      icon: <MdGroup className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Hackathons",
      href: "#",
      icon: <MdCalendarToday className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Analytics",
      href: "#",
      icon: <MdBarChart className="text-white/70 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Security",
      href: "#",
      icon: <MdSecurity className="text-white/70 h-5 w-5 flex-shrink-0" />,
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

  const platformStats = {
    totalUsers: 12847,
    totalHackathons: 156,
    activeEvents: 8,
    totalSubmissions: 3421,
    revenueThisMonth: 48500,
    growthRate: 23.5,
  };

  const recentActivity = [
    {
      type: "user",
      message: "New user registered: john.doe@email.com",
      time: "5 min ago",
    },
    {
      type: "hackathon",
      message: "AI Hackathon 2025 published by TechCorp",
      time: "12 min ago",
    },
    {
      type: "submission",
      message: "Project 'EcoTracker' submitted to Climate Tech Challenge",
      time: "18 min ago",
    },
    {
      type: "payment",
      message: "Premium subscription activated by InnovateLab",
      time: "25 min ago",
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
                label: "Admin User",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-red-600 flex items-center justify-center">
                    <MdSecurity className="h-4 w-4 text-white" />
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/70">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {platformStats.totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Hackathons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {platformStats.totalHackathons}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {platformStats.activeEvents}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {platformStats.totalSubmissions.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${platformStats.revenueThisMonth.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">
                Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                +{platformStats.growthRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-white/70">
                Live platform activity feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "user"
                        ? "bg-blue-400"
                        : activity.type === "hackathon"
                        ? "bg-green-400"
                        : activity.type === "submission"
                        ? "bg-purple-400"
                        : "bg-yellow-400"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{activity.message}</p>
                    <p className="text-xs text-white/50">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-white/70">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdGroup className="w-4 h-4 mr-2" />
                Moderate Users
              </Button>
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdCalendarToday className="w-4 h-4 mr-2" />
                Review Hackathons
              </Button>
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdBarChart className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button className="w-full justify-start bg-white/5 border border-white/20 text-white hover:bg-white/10">
                <MdSecurity className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Overview */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Overview</CardTitle>
            <CardDescription className="text-white/70">
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">8,542</div>
                <Badge className="bg-blue-900/50 text-blue-200 mt-2">
                  Participants
                </Badge>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">1,205</div>
                <Badge className="bg-green-900/50 text-green-200 mt-2">
                  Organizers
                </Badge>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white">3,100</div>
                <Badge className="bg-purple-900/50 text-purple-200 mt-2">
                  Judges
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
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
        VHack Admin
      </motion.span>
    </div>
  );
};

export default AdminDashboard;
