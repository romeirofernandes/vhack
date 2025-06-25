import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MdArrowBack, MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const HackathonDetails = ({ hackathon, onBack, onEdit, onDelete }) => {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 text-sm sm:text-base self-start"
          onClick={onBack}
        >
          <MdArrowBack className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 text-sm sm:text-base"
            onClick={onEdit}
          >
            <MdEdit className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Edit Hackathon</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/30 text-sm sm:text-base"
            onClick={onDelete}
          >
            <MdDelete className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Delete</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="bg-zinc-950 border-white/10">
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
                {hackathon.title}
              </CardTitle>
              <Badge
                className={`self-start ${
                  hackathon.status === "ongoing"
                    ? "bg-green-600/80 text-green-100"
                    : hackathon.status === "draft"
                    ? "bg-blue-600/80 text-blue-100"
                    : "bg-white/20 text-white"
                }`}
              >
                {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Description</h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">{hackathon.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-white/50 text-xs sm:text-sm mb-1">Registration Period</p>
                  <p className="text-white/80 text-sm sm:text-base">
                    {new Date(hackathon.timelines.registrationStart).toLocaleDateString()} - {new Date(hackathon.timelines.registrationEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs sm:text-sm mb-1">Hackathon Period</p>
                  <p className="text-white/80 text-sm sm:text-base">
                    {new Date(hackathon.timelines.hackathonStart).toLocaleDateString()} - {new Date(hackathon.timelines.hackathonEnd).toLocaleDateString()}
                  </p>
                </div>
                {hackathon.timelines.resultsDate && (
                  <div>
                    <p className="text-white/50 text-xs sm:text-sm mb-1">Results Date</p>
                    <p className="text-white/80 text-sm sm:text-base">
                      {new Date(hackathon.timelines.resultsDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Settings */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Team Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">Team Size</p>
                <p className="text-white/80 text-sm sm:text-base">
                  {hackathon.teamSettings.minTeamSize} - {hackathon.teamSettings.maxTeamSize} members
                  {hackathon.teamSettings.allowSolo && " (Solo participants allowed)"}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">Theme</p>
                <p className="text-white/80 capitalize text-sm sm:text-base">{hackathon.theme}</p>
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Prizes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">First Prize</p>
                <p className="text-white/80 text-sm sm:text-base">{hackathon.prizes.firstPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">Second Prize</p>
                <p className="text-white/80 text-sm sm:text-base">{hackathon.prizes.secondPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">Third Prize</p>
                <p className="text-white/80 text-sm sm:text-base">{hackathon.prizes.thirdPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs sm:text-sm mb-1">Participant Prize</p>
                <p className="text-white/80 text-sm sm:text-base">{hackathon.prizes.participantPrize}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base"
              onClick={() => navigate(`/organizer/hackathon/${hackathon._id}/allot-judges`)}
            >
              <span className="hidden sm:inline">Manage Judges</span>
              <span className="sm:hidden">Judges</span>
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700 text-sm sm:text-base"
              onClick={() => navigate(`/organizer/hackathon/${hackathon._id}/participants`)}
            >
              <span className="hidden sm:inline">View Participants</span>
              <span className="sm:hidden">Participants</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HackathonDetails; 