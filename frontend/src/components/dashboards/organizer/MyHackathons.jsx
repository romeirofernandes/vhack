import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdAdd, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const MyHackathons = ({ hackathons, loading, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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
      monthYear: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [currentDate]);

  // Get hackathons by date
  const hackathonsByDate = useMemo(() => {
    const map = new Map();
    hackathons.forEach(hackathon => {
      const startDate = new Date(hackathon.timelines?.hackathonStart);
      const endDate = new Date(hackathon.timelines?.hackathonEnd);
      
      // Add hackathon to all dates in its range
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

  const selectedDateHackathons = selectedDate ? getHackathonsForDate(selectedDate) : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">My Hackathons</CardTitle>
            <p className="text-white/70 text-sm">
              Calendar view of your hackathons
            </p>
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
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Custom Calendar */}
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevMonth}
                className="text-white hover:bg-white/10 p-2"
              >
                <MdChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-white">{monthYear}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="text-white hover:bg-white/10 p-2"
              >
                <MdChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-white/60 text-sm font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                <AnimatePresence mode="wait">
                  {days.map((date, index) => {
                    const dayHackathons = getHackathonsForDate(date);
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <motion.button
                        key={`${date.toDateString()}-${currentDate.getMonth()}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelected
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : isToday(date)
                            ? 'bg-white/20 text-white ring-1 ring-white/30'
                            : isCurrentMonth(date)
                            ? 'text-white hover:bg-white/10'
                            : 'text-white/30 hover:bg-white/5'
                          }
                          ${hasHackathons(date) ? 'ring-1 ring-emerald-400' : ''}
                        `}
                      >
                        <span className="block">{date.getDate()}</span>
                        {hasHackathons(date) && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="flex gap-0.5">
                              {dayHackathons.slice(0, 3).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 h-1 bg-emerald-400 rounded-full"
                                />
                              ))}
                              {dayHackathons.length > 3 && (
                                <div className="w-1 h-1 bg-white/60 rounded-full" />
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
            <div className="flex items-center gap-4 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/20 rounded border border-white/30"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-emerald-400"></div>
                <span>Has hackathons</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-white font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {selectedDateHackathons.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateHackathons.map(hackathon => (
                      <div
                        key={hackathon._id}
                        className="p-4 bg-white/10 rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{hackathon.title}</h4>
                          <Badge
                            className={`${
                              hackathon.status === "ongoing"
                                ? "bg-green-900/50 text-green-200"
                                : hackathon.status === "draft"
                                ? "bg-blue-900/50 text-blue-200"
                                : "bg-gray-900/50 text-gray-200"
                            }`}
                          >
                            {hackathon.status}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mb-3">
                          {hackathon.description.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() => navigate(`/organizer/hackathon/${hackathon._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <p>No hackathons on this date</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-white">{hackathons.length}</div>
                <div className="text-white/70 text-sm">Total Events</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-white">
                  {hackathons.filter(h => h.status === 'ongoing').length}
                </div>
                <div className="text-white/70 text-sm">Active Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* All Hackathons List */}
        <div className="mt-8 space-y-4">
          <h3 className="text-white font-semibold text-lg">All Hackathons</h3>
          
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
                <motion.div
                  key={hackathon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      className="border-white/20 text-white hover:bg-white/10"
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyHackathons;