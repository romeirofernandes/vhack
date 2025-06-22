import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TbTrophy,
  TbMedal,
  TbAward,
  TbUsers,
  TbStar,
  TbConfetti,
  TbSparkles,
} from "react-icons/tb";

const PodiumResults = ({ hackathon, results, isVisible, onClose }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && results.length > 0) {
      // Animate podium pieces sequentially
      const timer1 = setTimeout(() => setAnimationStage(1), 500); // 3rd place
      const timer2 = setTimeout(() => setAnimationStage(2), 1000); // 2nd place
      const timer3 = setTimeout(() => setAnimationStage(3), 1500); // 1st place
      const timer4 = setTimeout(() => {
        setAnimationStage(4);
        setShowConfetti(true);
      }, 2000); // Confetti and winner announcement

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isVisible, results]);

  if (!isVisible || !results.length) return null;

  const winners = results.slice(0, 3);
  const [first, second, third] = winners;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-zinc-950 rounded-3xl border border-zinc-800 p-8 max-w-4xl w-full relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/10 via-transparent to-transparent" />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <TbTrophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                🎉 Winners Announced! 🎉
              </h1>
              <TbTrophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-400 text-lg"
            >
              {hackathon.title} - {hackathon.theme}
            </motion.p>
          </div>

          {/* Podium */}
          <div className="relative mb-8">
            <div className="flex items-end justify-center gap-4 h-80">
              {/* 2nd Place */}
              {second && (
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={animationStage >= 2 ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center"
                >
                  {/* Team Name */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={animationStage >= 2 ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-4 text-center"
                  >
                    <div className="bg-gradient-to-r from-gray-400 to-gray-300 text-black px-4 py-2 rounded-full font-bold text-sm mb-2">
                      {second.team?.name || "Team"}
                    </div>
                    <div className="text-zinc-300 text-xs">
                      {second.finalScore
                        ? `${second.finalScore.toFixed(1)} pts`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Podium */}
                  <div className="bg-gradient-to-t from-gray-600 to-gray-400 h-32 w-24 rounded-t-lg border-2 border-gray-300 flex flex-col items-center justify-end pb-4 relative">
                    <div className="absolute -top-8 bg-gray-500 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white">
                      <TbMedal className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-white font-bold text-2xl">2</div>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {first && (
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={animationStage >= 3 ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center relative"
                >
                  {/* Crown */}
                  <motion.div
                    initial={{ y: -20, rotate: -20, opacity: 0 }}
                    animate={
                      animationStage >= 4
                        ? { y: -40, rotate: 0, opacity: 1 }
                        : {}
                    }
                    transition={{ duration: 0.6 }}
                    className="absolute -top-16 text-6xl"
                  >
                    👑
                  </motion.div>

                  {/* Team Name */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={animationStage >= 3 ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-4 text-center"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full font-bold text-lg mb-2">
                      {first.team?.name || "Team"}
                    </div>
                    <div className="text-yellow-300 text-sm font-semibold">
                      {first.finalScore
                        ? `${first.finalScore.toFixed(1)} pts`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Podium */}
                  <div className="bg-gradient-to-t from-yellow-600 to-yellow-400 h-40 w-28 rounded-t-lg border-2 border-yellow-300 flex flex-col items-center justify-end pb-4 relative">
                    <div className="absolute -top-8 bg-yellow-500 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white">
                      <TbTrophy className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white font-bold text-3xl">1</div>
                  </div>

                  {/* Winner Sparkles */}
                  {animationStage >= 4 && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute -top-20 -right-8 text-yellow-400"
                      >
                        <TbSparkles className="w-6 h-6" />
                      </motion.div>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute -top-16 -left-8 text-yellow-400"
                      >
                        <TbSparkles className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                </motion.div>
              )}

              {/* 3rd Place */}
              {third && (
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={animationStage >= 1 ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center"
                >
                  {/* Team Name */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={animationStage >= 1 ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-4 text-center"
                  >
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-2">
                      {third.team?.name || "Team"}
                    </div>
                    <div className="text-zinc-300 text-xs">
                      {third.finalScore
                        ? `${third.finalScore.toFixed(1)} pts`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Podium */}
                  <div className="bg-gradient-to-t from-orange-700 to-orange-500 h-24 w-24 rounded-t-lg border-2 border-orange-400 flex flex-col items-center justify-end pb-4 relative">
                    <div className="absolute -top-8 bg-orange-600 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white">
                      <TbAward className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-white font-bold text-2xl">3</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Prize Information */}
          {animationStage >= 4 && hackathon.prizes && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              {hackathon.prizes.firstPrize && (
                <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-600/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🥇</div>
                    <div className="text-yellow-300 font-semibold">
                      First Prize
                    </div>
                    <div className="text-yellow-100 text-sm">
                      {hackathon.prizes.firstPrize}
                    </div>
                  </CardContent>
                </Card>
              )}
              {hackathon.prizes.secondPrize && (
                <Card className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-gray-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🥈</div>
                    <div className="text-gray-300 font-semibold">
                      Second Prize
                    </div>
                    <div className="text-gray-100 text-sm">
                      {hackathon.prizes.secondPrize}
                    </div>
                  </CardContent>
                </Card>
              )}
              {hackathon.prizes.thirdPrize && (
                <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-600/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🥉</div>
                    <div className="text-orange-300 font-semibold">
                      Third Prize
                    </div>
                    <div className="text-orange-100 text-sm">
                      {hackathon.prizes.thirdPrize}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Close Button */}
          {animationStage >= 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold"
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PodiumResults;
