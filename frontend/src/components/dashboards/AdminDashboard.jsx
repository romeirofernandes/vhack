import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Activity,
  LogOut,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth"; 
import { auth } from "../../config/firebase"; 
import PendingHackathons from "./admin/PendingHackathons";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  // FIX THE LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        "http://localhost:8000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending_approval":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "draft":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage hackathons and oversee platform activity
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-white/10"
        >
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === "approvals"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
              }`}
            >
              Pending Approvals
              {dashboardData?.stats?.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {dashboardData.stats.pendingApprovals}
                </span>
              )}
            </button>
          </nav>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {dashboardData?.stats?.totalHackathons || 0}
                </div>
                <p className="text-gray-400 text-sm">Total Hackathons</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {dashboardData?.stats?.pendingApprovals || 0}
                </div>
                <p className="text-gray-400 text-sm">Pending Approvals</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {dashboardData?.stats?.publishedHackathons || 0}
                </div>
                <p className="text-gray-400 text-sm">Published</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {dashboardData?.stats?.draftHackathons || 0}
                </div>
                <p className="text-gray-400 text-sm">Drafts</p>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center mb-6">
                <Activity className="h-6 w-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">
                  Recent Activity
                </h3>
              </div>

              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((hackathon) => (
                    <div
                      key={hackathon._id}
                      className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-white">
                            {hackathon.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            by {hackathon.organizer.name} •{" "}
                            {formatDate(hackathon.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          hackathon.status
                        )}`}
                      >
                        {hackathon.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            {dashboardData?.stats?.pendingApprovals > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Review {dashboardData.stats.pendingApprovals} Pending Approval
                  {dashboardData.stats.pendingApprovals !== 1 ? "s" : ""}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "approvals" && <PendingHackathons />}
      </div>
    </div>
  );
};

export default AdminDashboard;
