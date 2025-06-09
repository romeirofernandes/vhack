import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AchievementCard = ({ achievement }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "bg-gray-900/50 text-gray-200 border-gray-700";
      case "rare":
        return "bg-blue-900/50 text-blue-200 border-blue-700";
      case "epic":
        return "bg-purple-900/50 text-purple-200 border-purple-700";
      case "legendary":
        return "bg-yellow-900/50 text-yellow-200 border-yellow-700";
      default:
        return "bg-gray-900/50 text-gray-200 border-gray-700";
    }
  };

  const getProgressColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "bg-gray-400";
      case "rare":
        return "bg-blue-400";
      case "epic":
        return "bg-purple-400";
      case "legendary":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  const progressPercentage = achievement.total > 0 
    ? Math.round((achievement.progress / achievement.total) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          achievement.unlocked
            ? "bg-white/10 border-white/20 shadow-lg"
            : "bg-white/5 border-white/10 opacity-60"
        }`}
      >
        <CardContent className="p-6">
          {/* Achievement Icon */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`text-4xl mb-2 ${
                achievement.unlocked ? "grayscale-0" : "grayscale"
              }`}
            >
              {achievement.icon}
            </div>
            <Badge className={getRarityColor(achievement.rarity)}>
              {achievement.rarity}
            </Badge>
          </div>

          {/* Achievement Info */}
          <div className="space-y-2 mb-4">
            <h3
              className={`font-bold text-lg ${
                achievement.unlocked ? "text-white" : "text-white/50"
              }`}
            >
              {achievement.name}
            </h3>
            <p
              className={`text-sm ${
                achievement.unlocked ? "text-white/70" : "text-white/40"
              }`}
            >
              {achievement.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/60">Progress</span>
              <span className="text-xs text-white/60">
                {achievement.progress}/{achievement.total}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getProgressColor(achievement.rarity)}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Points */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Points:</span>
              <span className="text-sm font-semibold text-white">
                {achievement.points}
              </span>
            </div>
            {achievement.unlocked && achievement.unlockedAt && (
              <span className="text-xs text-white/50">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Unlocked Badge */}
          {achievement.unlocked && (
            <div className="absolute top-2 right-2">
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ✓ Unlocked
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;