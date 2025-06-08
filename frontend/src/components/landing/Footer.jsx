import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const AnimatedContainer = ({ className, delay = 0.1, children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Footer = () => {
  const teamMembers = [
    { name: "romeiro", github: "https://github.com/romeirofernandes" },
    { name: "aliqyaan", github: "https://github.com/Hike-12" },
    { name: "aditya", github: "https://github.com/Adityadab10" },
  ];

  return (
    <footer className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-3xl border-t border-[#301E67]/60 bg-[#301E67]/30 backdrop-blur-sm px-8 py-16 lg:py-20">
      <div className="bg-[#5B8FB9]/40 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="flex w-full justify-between items-start">
        <AnimatedContainer className="space-y-6">
          <h3 className="text-3xl font-bold text-white tracking-tight">vHack</h3>
          <p className="text-white/70 max-w-md leading-relaxed text-lg">
            The ultimate platform for competitive hackathons.
          </p>
        </AnimatedContainer>

        <AnimatedContainer delay={0.2} className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={member.name} className="flex items-center space-x-2 mr-2">
              <a
                href={member.github}
                className="text-white/60 hover:text-[#B6EADA] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-white/70 hover:text-[#B6EADA] text-base font-medium">{member.name}</span>
              </a>
            </div>
          ))}
        </AnimatedContainer>
      </div>

      <AnimatedContainer
        delay={0.4}
        className="w-full mt-12 pt-8 border-t border-[#301E67]/60"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-base mb-4 md:mb-0">
            © 2025 vHack. All rights reserved.
          </p>
          <p className="text-white/60 text-base">Crafted by Team CPU</p>
        </div>
      </AnimatedContainer>
    </footer>
  );
};

export default Footer;
