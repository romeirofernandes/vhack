import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdCalendarToday,
  MdGroup,
  MdTimer,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import HackathonDetails from "./HackathonDetails";
import { TbArrowLeft, TbShare } from "react-icons/tb";
import SharePoster from "./SharePoster";

const MyHackathons = ({ navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedHackathonForShare, setSelectedHackathonForShare] =
    useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrganizerHackathons();
  }, [user]);

  const handleShare = (hackathon) => {
    setSelectedHackathonForShare(hackathon);
    setShowShareModal(true);
  };

  const fetchOrganizerHackathons = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/my/hackathons`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.data.success) {
        setHackathons(response.data.data.hackathons);
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error("Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  // Get calendar data
  const { days, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return {
      days,
      monthYear: firstDay.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [currentDate]);

  // Get hackathons by date
  const hackathonsByDate = useMemo(() => {
    const map = new Map();
    hackathons.forEach((hackathon) => {
      const startDate = new Date(hackathon.timelines?.hackathonStart);
      const endDate = new Date(hackathon.timelines?.hackathonEnd);

      const current = new Date(startDate);
      while (current <= endDate) {
        const dateKey = current.toDateString();
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey).push(hackathon);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [hackathons]);

  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const hasHackathons = (date) => {
    return hackathonsByDate.has(date.toDateString());
  };

  const getHackathonsForDate = (date) => {
    return hackathonsByDate.get(date.toDateString()) || [];
  };

  const selectedDateHackathons = selectedDate
    ? getHackathonsForDate(selectedDate)
    : [];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleBack = () => {
    setSelectedHackathon(null);
  };

  const handleEdit = (hackathon) => {
    navigate(`/organizer/hackathon/${hackathon._id}/edit`);
  };

  const handleDelete = async (hackathon) => {
    if (window.confirm("Are you sure you want to delete this hackathon?")) {
      try {
        const idToken = await user.getIdToken();
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/hackathons/${hackathon._id}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        toast.success("Hackathon deleted successfully");
        fetchOrganizerHackathons();
        setSelectedHackathon(null);
      } catch (error) {
        console.error("Error deleting hackathon:", error);
        toast.error("Failed to delete hackathon");
      }
    }
  };

  if (selectedHackathon) {
    return (
      <div className="space-y-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800"
        >
          <TbArrowLeft className="w-4 h-4 mr-2" />
          Back to My Hackathons
        </Button>
        <HackathonDetails
          hackathon={selectedHackathon}
          onBack={handleBack}
          onEdit={() => handleEdit(selectedHackathon)}
          onDelete={() => handleDelete(selectedHackathon)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Hackathons</h1>
          <p className="text-zinc-400">Manage your hackathon events</p>
        </div>
        <Button
          className="bg-white text-zinc-950 hover:bg-zinc-200"
          onClick={() => navigate("/organizer/create-hackathon")}
        >
          <MdAdd className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {hackathons.length}
                </p>
                <p className="text-zinc-400 text-sm">Total Events</p>
              </div>
              <MdCalendarToday className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {hackathons.filter((h) => h.status === "ongoing").length}
                </p>
                <p className="text-zinc-400 text-sm">Active Now</p>
              </div>
              <MdTimer className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {hackathons.reduce(
                    (total, h) => total + (h.participants?.length || 0),
                    0
                  )}
                </p>
                <p className="text-zinc-400 text-sm">Total Participants</p>
              </div>
              <MdGroup className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Custom Calendar */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevMonth}
                className="text-white hover:bg-zinc-800 hover:text-white p-2"
              >
                <MdChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-white">{monthYear}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="text-white hover:bg-zinc-800 hover:text-white p-2"
              >
                <MdChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-zinc-400 text-sm font-medium py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                <AnimatePresence mode="wait">
                  {days.map((date, index) => {
                    const dayHackathons = getHackathonsForDate(date);
                    const isSelected =
                      selectedDate &&
                      date.toDateString() === selectedDate.toDateString();

                    return (
                      <motion.button
                        key={`${date.toDateString()}-${currentDate.getMonth()}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            isSelected
                              ? "bg-blue-600 text-white ring-2 ring-blue-400"
                              : isToday(date)
                              ? "bg-blue-500/30 text-white ring-1 ring-blue-400/50"
                              : isCurrentMonth(date)
                              ? "text-white hover:bg-zinc-800"
                              : "text-zinc-500 hover:bg-zinc-800/50"
                          }
                          ${hasHackathons(date) ? "ring-1 ring-green-400" : ""}
                        `}
                      >
                        <span className="block">{date.getDate()}</span>
                        {hasHackathons(date) && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="flex gap-0.5">
                              {dayHackathons.slice(0, 3).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 h-1 bg-green-400 rounded-full"
                                />
                              ))}
                              {dayHackathons.length > 3 && (
                                <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                              )}
                            </div>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/30 rounded border border-blue-400/50"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-green-400"></div>
                <span>Has Events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {selectedDate
                ? `Events on ${selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "Select a date to view events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateHackathons.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateHackathons.map((hackathon) => (
                    <motion.div
                      key={hackathon._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">
                            {hackathon.title}
                          </h4>
                          <p className="text-zinc-400 text-sm mt-1">
                            {hackathon.description.substring(0, 80)}...
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${
                            hackathon.status === "ongoing"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : hackathon.status === "draft"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
                          }`}
                        >
                          {hackathon.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-zinc-950 hover:bg-zinc-200"
                          onClick={() => setSelectedHackathon(hackathon)}
                        >
                          View Details
                        </Button>
                        {["published", "upcoming"].includes(
                          hackathon.status
                        ) && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleShare(hackathon)}
                          >
                            <TbShare className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MdCalendarToday className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-400">No events on this date</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MdCalendarToday className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-400">Click on a date to view events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Hackathons List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Hackathons</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading hackathons...</p>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MdAdd className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-400 mb-4">No hackathons created yet</p>
              <Button
                className="bg-white text-zinc-950 hover:bg-zinc-200"
                onClick={() => navigate("/organizer/create-hackathon")}
              >
                Create Your First Hackathon
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hackathons.map((hackathon) => (
                <motion.div
                  key={hackathon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-semibold text-white text-lg">
                        {hackathon.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`self-start sm:self-center ${
                          hackathon.status === "ongoing"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : hackathon.status === "draft"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
                        }`}
                      >
                        {hackathon.status.charAt(0).toUpperCase() +
                          hackathon.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 text-sm">
                      {hackathon.description.length > 120
                        ? `${hackathon.description.substring(0, 120)}...`
                        : hackathon.description}
                    </p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700">
                        <p className="text-zinc-500 font-medium mb-1">
                          Timeline
                        </p>
                        <p className="text-zinc-300">
                          {new Date(
                            hackathon.timelines.hackathonStart
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(
                            hackathon.timelines.hackathonEnd
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700">
                        <p className="text-zinc-500 font-medium mb-1">
                          Team Size
                        </p>
                        <p className="text-zinc-300">
                          {hackathon.teamSettings.minTeamSize} -{" "}
                          {hackathon.teamSettings.maxTeamSize}
                          {hackathon.teamSettings.allowSolo && " (Solo)"}
                        </p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700">
                        <p className="text-zinc-500 font-medium mb-1">Theme</p>
                        <p className="text-zinc-300 capitalize">
                          {hackathon.theme}
                        </p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700">
                        <p className="text-zinc-500 font-medium mb-1">
                          Participants
                        </p>
                        <p className="text-zinc-300">
                          {hackathon.participants?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {["published", "upcoming"].includes(hackathon.status) && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          onClick={() => handleShare(hackathon)}
                        >
                          <TbShare className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-zinc-950 hover:bg-zinc-200"
                        onClick={() => setSelectedHackathon(hackathon)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() =>
                          navigate(
                            `/organizer/hackathon/${hackathon._id}/allot-judges`
                          )
                        }
                      >
                        Judges
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SharePoster
        hackathon={selectedHackathonForShare}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedHackathonForShare(null);
        }}
      />
    </div>
  );
};

export default MyHackathons;
