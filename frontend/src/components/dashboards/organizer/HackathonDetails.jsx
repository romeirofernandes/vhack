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
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={onBack}
        >
          <MdArrowBack className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
            onClick={onEdit}
          >
            <MdEdit className="w-4 h-4 mr-2" />
            Edit Hackathon
          </Button>
          <Button
            variant="destructive"
            className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/30"
            onClick={onDelete}
          >
            <MdDelete className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="bg-zinc-950 border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                {hackathon.title}
              </CardTitle>
              <Badge
                className={`${
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
        <CardContent className="space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-white/80">{hackathon.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">Registration Period</p>
                  <p className="text-white/80">
                    {new Date(hackathon.timelines.registrationStart).toLocaleDateString()} - {new Date(hackathon.timelines.registrationEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Hackathon Period</p>
                  <p className="text-white/80">
                    {new Date(hackathon.timelines.hackathonStart).toLocaleDateString()} - {new Date(hackathon.timelines.hackathonEnd).toLocaleDateString()}
                  </p>
                </div>
                {hackathon.timelines.resultsDate && (
                  <div>
                    <p className="text-white/50 text-sm mb-1">Results Date</p>
                    <p className="text-white/80">
                      {new Date(hackathon.timelines.resultsDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Team Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/50 text-sm mb-1">Team Size</p>
                <p className="text-white/80">
                  {hackathon.teamSettings.minTeamSize} - {hackathon.teamSettings.maxTeamSize} members
                  {hackathon.teamSettings.allowSolo && " (Solo participants allowed)"}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Theme</p>
                <p className="text-white/80 capitalize">{hackathon.theme}</p>
              </div>
            </div>
          </div>

          {/* Prizes */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Prizes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/50 text-sm mb-1">First Prize</p>
                <p className="text-white/80">{hackathon.prizes.firstPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Second Prize</p>
                <p className="text-white/80">{hackathon.prizes.secondPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Third Prize</p>
                <p className="text-white/80">{hackathon.prizes.thirdPrize}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Participant Prize</p>
                <p className="text-white/80">{hackathon.prizes.participantPrize}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => navigate(`/organizer/hackathon/${hackathon._id}/allot-judges`)}
            >
              Manage Judges
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => navigate(`/organizer/hackathon/${hackathon._id}/participants`)}
            >
              View Participants
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HackathonDetails; 