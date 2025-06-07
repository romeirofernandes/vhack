import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TbCode, TbSparkles, TbArrowRight, TbUsers } from "react-icons/tb";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 px-6">
      {/* Background grid pattern with radial mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_120%)]" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/0 via-zinc-950/50 to-zinc-950" />

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <TbSparkles className="w-4 h-4 mr-2" />
              Platform Beta Now Live
            </Badge>
          </motion.div>

          {/* Main heading with container */}
          <motion.div
            className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold leading-tight">
              <span className="text-white">Build.</span>
              <br />
              <span className="text-white">Compete.</span>
              <br />
              <span className="text-white/60">Innovate.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            The ultimate hackathon platform where developers come together to
            create groundbreaking solutions and compete for amazing prizes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="px-8 py-4 bg-white text-zinc-950 hover:bg-white/90 font-medium group"
              >
                <TbCode className="w-5 h-5 mr-2" />
                Start Building
                <TbArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
              >
                <TbUsers className="w-5 h-5 mr-2" />
                Browse Hackathons
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats container */}
          <motion.div
            className="relative p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="grid grid-cols-3 gap-12">
              {[
                { number: "500+", label: "Developers" },
                { number: "50+", label: "Hackathons" },
                { number: "$100K+", label: "Prizes" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.8 }}
                >
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/60 uppercase tracking-wider">
                    {stat.label}
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
