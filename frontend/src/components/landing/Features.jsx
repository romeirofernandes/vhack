import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TbTrophy,
  TbUsers,
  TbBolt,
  TbShield,
  TbCode,
  TbWorld,
  TbClock,
  TbAward,
  TbTarget,
  TbCheck,
  TbDeviceMobile,
  TbBrandReact,
} from "react-icons/tb";

const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  badge,
}) => {
  return (
    <motion.div
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg shadow-zinc-950/30 p-4 bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700/60 justify-between flex flex-col backdrop-blur-sm overflow-hidden",
        className
      )}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition-transform duration-300 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-zinc-700/25 rounded-lg flex items-center justify-center border border-zinc-600/40 group-hover/bento:bg-zinc-700/35 transition-colors">
            {icon}
          </div>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-zinc-800/60 border-zinc-700/40 text-zinc-200 text-xs font-medium px-2 py-1"
            >
              {badge}
            </Badge>
          )}
        </div>
        <div className="font-bold text-white mb-2 text-sm md:text-base line-clamp-2">
          {title}
        </div>
        <div className="font-normal text-white/70 text-xs leading-relaxed line-clamp-3">
          {description}
        </div>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      title: "Competitive Hackathons",
      description:
        "Join exciting competitions with amazing prizes and recognition from top tech companies worldwide.",
      header: <FeatureHeader1 />,
      icon: <TbTrophy className="w-6 h-6 text-zinc-200" />,
      className: "md:col-span-2",
    },
    {
      title: "Team Collaboration",
      description:
        "Find teammates and collaborate seamlessly with built-in project management tools.",
      header: <FeatureHeader2 />,
      icon: <TbUsers className="w-6 h-6 text-zinc-200" />,
      className: "md:col-span-1",
    },
    {
      title: "Real-time Updates",
      description:
        "Get instant notifications about hackathon updates, deadlines, and announcements.",
      header: <FeatureHeader3 />,
      icon: <TbBolt className="w-6 h-6 text-zinc-200" />,
      className: "md:col-span-1",
    },
    {
      title: "Secure Submissions",
      description:
        "Your intellectual property is protected with secure submission handling.",
      header: <FeatureHeader4 />,
      icon: <TbShield className="w-6 h-6 text-zinc-200" />,
      className: "md:col-span-1",
    },
    {
      title: "Multi-platform Support",
      description:
        "Build web, mobile, AI, blockchain, or any type of project with our flexible platform.",
      header: <FeatureHeader5 />,
      icon: <TbCode className="w-6 h-6 text-zinc-200" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <section id="features" className="py-8 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge
            variant="secondary"
            className="mb-8 bg-zinc-800/60 border-zinc-700/40 text-zinc-200 px-6 py-2 rounded-full"
          >
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-white tracking-tight">
            Everything you need to
            <span className="text-zinc-300"> succeed</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            From ideation to implementation, our platform provides all the tools
            and support you need to build amazing projects.
          </p>
        </motion.div>

        <BentoGrid className="max-w-5xl mx-auto">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              badge={item.badge}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

const FeatureHeader1 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 overflow-hidden relative group/header">
    <div className="absolute inset-0 flex items-end justify-center pb-4">
      <div className="flex items-end space-x-2">
        {/* 2nd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-8 h-12 bg-zinc-600/40 rounded-t-sm border border-zinc-500/30 flex items-end justify-center pb-1">
            <span className="text-xs text-zinc-300 font-bold">2</span>
          </div>
          <TbAward className="w-4 h-4 text-zinc-400 mt-1" />
        </motion.div>

        {/* 1st place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -3, scale: 1.05 }}
        >
          <div className="w-8 h-16 bg-gradient-to-t from-yellow-500/30 to-yellow-400/20 rounded-t-sm border border-yellow-500/40 flex items-end justify-center pb-1">
            <span className="text-xs text-yellow-300 font-bold">1</span>
          </div>
          <TbTrophy className="w-5 h-5 text-yellow-400 mt-1" />
        </motion.div>

        {/* 3rd place */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -2 }}
        >
          <div className="w-8 h-10 bg-zinc-600/40 rounded-t-sm border border-zinc-500/30 flex items-end justify-center pb-1">
            <span className="text-xs text-zinc-300 font-bold">3</span>
          </div>
          <TbAward className="w-4 h-4 text-zinc-400 mt-1" />
        </motion.div>
      </div>
    </div>
  </div>
);

// Team connection animation
const FeatureHeader2 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 overflow-hidden relative group/header">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-32 h-20 flex items-center justify-center">
        <svg className="absolute w-full h-full" viewBox="0 0 128 80">
          <defs>
            <motion.marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2.0 }}
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgb(59 130 246 / 0.5)" />
            </motion.marker>
            <motion.marker
              id="arrowhead2"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2.5 }}
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgb(59 130 246 / 0.5)" />
            </motion.marker>
          </defs>
          <motion.path
            d="M 24 15 Q 64 -5 104 15"
            stroke="rgb(59 130 246 / 0.5)"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            strokeDasharray="4,2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            whileHover={{
              strokeWidth: 4,
              stroke: "rgb(59 130 246 / 0.9)",
              strokeDasharray: "8,4",
            }}
          />
          <motion.path
            d="M 104 65 Q 64 85 24 65"
            stroke="rgb(59 130 246 / 0.5)"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead2)"
            strokeDasharray="4,2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            whileHover={{
              strokeWidth: 4,
              stroke: "rgb(59 130 246 / 0.9)",
              strokeDasharray: "8,4",
            }}
          />
        </svg>

        {/* Team members positioned at cycle points */}
        <motion.div
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-blue-500/30 rounded-full border border-blue-400/40 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <TbUsers className="w-5 h-5 text-blue-300" />
        </motion.div>

        <motion.div
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-blue-500/30 rounded-full border border-blue-400/40 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TbUsers className="w-5 h-5 text-blue-300" />
        </motion.div>
      </div>
    </div>
  </div>
);

// Notification pulse animation
const FeatureHeader3 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 overflow-hidden relative group/header">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Center notification */}
        <motion.div
          className="relative w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center border border-purple-400/40"
          whileHover={{ scale: 1.1 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TbBolt className="w-5 h-5 text-purple-300" />

          {/* Notification dots */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Ripple effect around center */}
          <motion.div
            className="absolute w-12 h-12 rounded-full border border-purple-400/40"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-12 h-12 rounded-full border border-purple-400/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  </div>
);

// Security shield with checkmark animation
const FeatureHeader4 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 overflow-hidden relative group/header">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Shield */}
        <motion.div
          className="w-12 h-14 bg-green-500/20 rounded-lg border border-green-400/40 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TbShield className="w-6 h-6 text-green-300" />
        </motion.div>

        {/* Animated checkmark */}
        <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <TbCheck className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  </div>
);

// Multi-platform devices
const FeatureHeader5 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-gradient-to-br from-zinc-500/10 to-neutral-500/5 border border-zinc-500/20 overflow-hidden relative group/header">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex items-center justify-center space-x-8">
        {/* Mobile Device */}
        <motion.div
          className="flex flex-col items-center space-y-2"
          whileHover={{ y: -2, scale: 1.05 }}
          initial={{ y: 15, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative w-6 h-10 bg-zinc-600/30 rounded-md border border-zinc-500/40 flex flex-col items-center justify-between py-1">
            <div className="w-2 h-0.5 bg-zinc-400/60 rounded-full" />
            <div className="flex-1 w-4 bg-zinc-700/40 rounded-sm mx-auto" />
            <div className="w-1 h-1 bg-zinc-400/60 rounded-full" />
          </div>
          <TbDeviceMobile className="w-3 h-3 text-zinc-300" />
        </motion.div>

        {/* Desktop/Web */}
        <motion.div
          className="flex flex-col items-center space-y-2"
          whileHover={{ y: -3, scale: 1.1 }}
          initial={{ y: 15, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative w-12 h-8 bg-zinc-600/30 rounded-sm border border-zinc-500/40 flex flex-col">
            <div className="flex-1 bg-zinc-700/40 rounded-t-sm m-0.5 mb-0 flex items-center justify-center">
              <TbBrandReact className="w-3 h-3 text-zinc-300" />
            </div>
            <div className="h-1 bg-zinc-600/50 rounded-b-sm" />
          </div>
          <div className="w-8 h-1 bg-zinc-500/40 rounded-full" />
        </motion.div>

        {/* Cloud/API */}
        <motion.div
          className="flex flex-col items-center space-y-2"
          whileHover={{ y: -2, scale: 1.05 }}
          initial={{ y: 15, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <div className="w-8 h-5 bg-zinc-600/30 rounded-lg border border-zinc-500/40 flex items-center justify-center">
              <TbWorld className="w-3 h-3 text-zinc-300" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data flow lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <motion.marker
            id="flow-arrow"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.8 }}
          >
            <polygon points="0 0, 6 2, 0 4" fill="rgb(113 113 122 / 0.6)" />
          </motion.marker>
        </defs>
        <motion.path
          d="M 90 40 Q 108 30 126 40"
          stroke="rgb(113 113 122 / 0.4)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3,2"
          markerEnd="url(#flow-arrow)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        />
        <motion.path
         d="M 165 40 Q 183 30 208 48"
          stroke="rgb(113 113 122 / 0.4)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3,2"
          markerEnd="url(#flow-arrow)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
      </svg>
    </div>
  </div>
);

export default Features;
