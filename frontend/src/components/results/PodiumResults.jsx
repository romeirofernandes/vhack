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
  TbX,
} from "react-icons/tb";

const PodiumResults = ({ hackathon, results, isVisible, onClose }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (isVisible && results.length > 0) {
      // Reset animation
      setAnimationStage(0);
      setShowConfetti(false);

      // Animate podium pieces sequentially with dramatic timing
      const timer1 = setTimeout(() => setAnimationStage(1), 800); // 3rd place
      const timer2 = setTimeout(() => setAnimationStage(2), 1400); // 2nd place
      const timer3 = setTimeout(() => setAnimationStage(3), 2000); // 1st place
      const timer4 = setTimeout(() => {
        setAnimationStage(4);
        setShowConfetti(true);
        // Play celebration sound effect (optional)
        if (!audioPlayed) {
          setAudioPlayed(true);
        }
      }, 2600); // Confetti and winner announcement

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
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3 }}
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <TbX className="w-5 h-5" />
        </motion.button>

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 4 === 0
                    ? "bg-yellow-400"
                    : i % 4 === 1
                    ? "bg-blue-400"
                    : i % 4 === 2
                    ? "bg-green-400"
                    : "bg-purple-400"
                }`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 720,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-zinc-950 rounded-3xl border border-zinc-800 p-8 max-w-5xl w-full relative overflow-hidden"
        >
          {/* Magical Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 via-purple-600/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600/5 to-transparent" />

          {/* Header with dramatic entrance */}
          <div className="text-center mb-8 relative z-10">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                <TbTrophy className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                🎉 WINNERS REVEALED! 🎉
              </h1>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                <TbTrophy className="w-12 h-12 text-yellow-400" />
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-zinc-300 text-xl font-medium"
            >
              {hackathon.title} • {hackathon.theme}
            </motion.p>
          </div>

          {/* Epic Podium Display */}
          <div className="relative mb-8">
            <div className="flex items-end justify-center gap-6 h-96">
              {/* 2nd Place */}
              {second && (
                <motion.div
                  initial={{ y: 300, opacity: 0, rotateY: -45 }}
                  animate={
                    animationStage >= 2 ? { y: 0, opacity: 1, rotateY: 0 } : {}
                  }
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  className="flex flex-col items-center"
                >
                  {/* Floating Team Badge */}
                  <motion.div
                    initial={{ scale: 0, rotateZ: -180 }}
                    animate={
                      animationStage >= 2 ? { scale: 1, rotateZ: 0 } : {}
                    }
                    transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    className="mb-6 text-center"
                  >
                    <div className="bg-gradient-to-r from-gray-400 to-gray-300 text-black px-6 py-3 rounded-full font-bold text-lg mb-3 shadow-lg">
                      {second.team?.name || "Team Silver"}
                    </div>
                    <div className="text-gray-300 text-sm font-semibold">
                      {second.finalScore
                        ? `${second.finalScore.toFixed(1)} points`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Silver Podium */}
                  <motion.div
                    className="bg-gradient-to-t from-gray-700 to-gray-400 h-36 w-28 rounded-t-xl border-4 border-gray-300 flex flex-col items-center justify-end pb-4 relative shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute -top-10 bg-gradient-to-br from-gray-500 to-gray-400 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-xl"
                      animate={animationStage >= 2 ? { rotateY: [0, 360] } : {}}
                      transition={{ duration: 1, delay: 0.6 }}
                    >
                      <TbMedal className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.div
                      className="text-white font-bold text-3xl"
                      initial={{ scale: 0 }}
                      animate={animationStage >= 2 ? { scale: 1 } : {}}
                      transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
                    >
                      2
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* 1st Place - THE CHAMPION */}
              {first && (
                <motion.div
                  initial={{ y: 300, opacity: 0, scale: 0.8 }}
                  animate={
                    animationStage >= 3 ? { y: 0, opacity: 1, scale: 1 } : {}
                  }
                  transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center relative"
                >
                  {/* Floating Crown */}
                  <motion.div
                    initial={{ y: -50, rotate: -30, opacity: 0, scale: 0 }}
                    animate={
                      animationStage >= 4
                        ? { y: -60, rotate: 0, opacity: 1, scale: 1 }
                        : {}
                    }
                    transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
                    className="absolute -top-20 text-8xl z-10"
                  >
                    👑
                  </motion.div>

                  {/* Champion Badge */}
                  <motion.div
                    initial={{ scale: 0, rotateZ: 180 }}
                    animate={
                      animationStage >= 3 ? { scale: 1, rotateZ: 0 } : {}
                    }
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="mb-6 text-center"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 text-black px-8 py-4 rounded-full font-bold text-xl mb-3 shadow-2xl border-2 border-yellow-300">
                      🏆 {first.team?.name || "CHAMPIONS"} 🏆
                    </div>
                    <div className="text-yellow-300 text-lg font-bold">
                      {first.finalScore
                        ? `${first.finalScore.toFixed(1)} points`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Golden Podium */}
                  <motion.div
                    className="bg-gradient-to-t from-yellow-700 to-yellow-400 h-44 w-32 rounded-t-xl border-4 border-yellow-300 flex flex-col items-center justify-end pb-4 relative shadow-2xl"
                    animate={
                      animationStage >= 4
                        ? {
                            boxShadow: [
                              "0 0 0 0 rgba(251, 191, 36, 0.4)",
                              "0 0 0 20px rgba(251, 191, 36, 0)",
                              "0 0 0 0 rgba(251, 191, 36, 0)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute -top-12 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-full w-24 h-24 flex items-center justify-center border-4 border-white shadow-2xl"
                      animate={animationStage >= 3 ? { rotateY: [0, 360] } : {}}
                      transition={{ duration: 1.5, delay: 0.6 }}
                    >
                      <TbTrophy className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.div
                      className="text-white font-bold text-4xl"
                      initial={{ scale: 0 }}
                      animate={animationStage >= 3 ? { scale: 1 } : {}}
                      transition={{ delay: 1, type: "spring", bounce: 0.8 }}
                    >
                      1
                    </motion.div>
                  </motion.div>

                  {/* Victory Sparkles */}
                  {animationStage >= 4 && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            rotate: 360,
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2 + i * 0.2,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          className={`absolute text-yellow-400`}
                          style={{
                            top: `${
                              -80 + Math.sin((i * 45 * Math.PI) / 180) * 40
                            }px`,
                            left: `${
                              Math.cos((i * 45 * Math.PI) / 180) * 40
                            }px`,
                          }}
                        >
                          <TbSparkles className="w-6 h-6" />
                        </motion.div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

              {/* 3rd Place */}
              {third && (
                <motion.div
                  initial={{ y: 300, opacity: 0, rotateY: 45 }}
                  animate={
                    animationStage >= 1 ? { y: 0, opacity: 1, rotateY: 0 } : {}
                  }
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  className="flex flex-col items-center"
                >
                  {/* Team Badge */}
                  <motion.div
                    initial={{ scale: 0, rotateZ: 180 }}
                    animate={
                      animationStage >= 1 ? { scale: 1, rotateZ: 0 } : {}
                    }
                    transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    className="mb-6 text-center"
                  >
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg mb-3 shadow-lg">
                      {third.team?.name || "Team Bronze"}
                    </div>
                    <div className="text-orange-300 text-sm font-semibold">
                      {third.finalScore
                        ? `${third.finalScore.toFixed(1)} points`
                        : "Score: N/A"}
                    </div>
                  </motion.div>

                  {/* Bronze Podium */}
                  <motion.div
                    className="bg-gradient-to-t from-orange-800 to-orange-500 h-28 w-28 rounded-t-xl border-4 border-orange-400 flex flex-col items-center justify-end pb-4 relative shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute -top-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-xl"
                      animate={animationStage >= 1 ? { rotateY: [0, 360] } : {}}
                      transition={{ duration: 1, delay: 0.6 }}
                    >
                      <TbAward className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.div
                      className="text-white font-bold text-3xl"
                      initial={{ scale: 0 }}
                      animate={animationStage >= 1 ? { scale: 1 } : {}}
                      transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
                    >
                      3
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Prize Information with entrance animation */}
          {animationStage >= 4 && hackathon.prizes && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {hackathon.prizes.firstPrize && (
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/30 border-2 border-yellow-600/50 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <div className="text-4xl mb-3">🥇</div>
                  <div className="text-yellow-300 font-bold text-lg mb-2">
                    First Prize
                  </div>
                  <div className="text-yellow-100">
                    {hackathon.prizes.firstPrize}
                  </div>
                </motion.div>
              )}
              {hackathon.prizes.secondPrize && (
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="bg-gradient-to-br from-gray-800/40 to-gray-700/30 border-2 border-gray-500/50 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <div className="text-4xl mb-3">🥈</div>
                  <div className="text-gray-300 font-bold text-lg mb-2">
                    Second Prize
                  </div>
                  <div className="text-gray-100">
                    {hackathon.prizes.secondPrize}
                  </div>
                </motion.div>
              )}
              {hackathon.prizes.thirdPrize && (
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="bg-gradient-to-br from-orange-900/40 to-orange-800/30 border-2 border-orange-600/50 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <div className="text-4xl mb-3">🥉</div>
                  <div className="text-orange-300 font-bold text-lg mb-2">
                    Third Prize
                  </div>
                  <div className="text-orange-100">
                    {hackathon.prizes.thirdPrize}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Action Button */}
          {animationStage >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              className="text-center"
            >
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🎊 Continue to Dashboard 🎊
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PodiumResults;
