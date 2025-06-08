import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TbCode, TbSparkles, TbArrowRight, TbUsers } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartBuilding = () => {
    if (user) {
      navigate(user.role ? "/dashboard" : "/select-role");
    } else {
      navigate("/signup");
    }
  };

  const handleBrowseHackathons = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      // Scroll to hackathons section or navigate to signup
      const hackathonsSection = document.getElementById("hackathons");
      if (hackathonsSection) {
        hackathonsSection.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/signup");
      }
    }
  };

  return (
    <section className="relative pt-40 pb-32 px-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#301E67_1px,transparent_1px),linear-gradient(to_bottom,#301E67_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_30%,transparent_100%)] opacity-40" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03001C]/0 via-[#03001C]/40 to-[#03001C]" />

      <div className="max-w-5xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-12"
          >
            <Badge
              variant="secondary"
              className="px-6 py-3 bg-[#301E67]/60 border border-[#5B8FB9]/40 text-[#B6EADA] hover:bg-[#301E67]/80 transition-colors backdrop-blur-sm rounded-full text-sm"
            >
              <TbSparkles className="w-4 h-4 mr-2" />
              Platform Beta Now Live
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tight">
              <span className="text-white">Build.</span>
              <br />
              <span className="text-white">Compete.</span>
              <br />
              <span className="text-[#B6EADA]/80">Innovate.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            The ultimate hackathon platform where developers come together to
            create groundbreaking solutions and compete for amazing prizes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="px-10 py-5 bg-[#5B8FB9] text-white hover:bg-[#5B8FB9]/90 font-semibold group rounded-xl shadow-xl shadow-[#5B8FB9]/30 text-lg"
                onClick={handleStartBuilding}
              >
                <TbCode className="w-6 h-6 mr-3" />
                {user ? "Go to Dashboard" : "Start Building"}
                <TbArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-5 border-[#301E67] bg-[#301E67]/40 text-white hover:bg-[#301E67]/60 hover:border-[#5B8FB9]/60 backdrop-blur-sm rounded-xl text-lg"
                onClick={handleBrowseHackathons}
              >
                <TbUsers className="w-6 h-6 mr-3" />
                Browse Hackathons
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats container */}
          <motion.div
            className="relative p-8 rounded-2xl border border-[#301E67]/50 bg-[#301E67]/30 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-16">
              {/*
                { number: "500+", label: "Developers" },
                { number: "50+", label: "Hackathons" },
                { number: "$100K+", label: "Prizes" },
              */}
              {["500+", "50+", "$100K+"].map((number, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                    {number}
                  </div>
                  <div className="text-sm text-[#B6EADA]/80 uppercase tracking-wider font-medium">
                    {["Developers", "Hackathons", "Prizes"][index]}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
