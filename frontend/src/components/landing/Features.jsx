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
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg shadow-[#03001C]/30 p-4 bg-[#301E67]/30 border border-[#301E67]/60 hover:border-[#5B8FB9]/60 justify-between flex flex-col backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition-transform duration-300 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-[#5B8FB9]/25 rounded-lg flex items-center justify-center border border-[#5B8FB9]/40 group-hover/bento:bg-[#5B8FB9]/35 transition-colors">
            {icon}
          </div>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-[#5B8FB9]/20 border-[#5B8FB9]/40 text-[#B6EADA] text-xs font-medium px-2 py-1"
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
      icon: <TbTrophy className="w-6 h-6 text-[#B6EADA]" />,
      badge: "Popular",
      className: "md:col-span-2",
    },
    {
      title: "Team Collaboration",
      description:
        "Find teammates and collaborate seamlessly with built-in project management tools.",
      header: <FeatureHeader2 />,
      icon: <TbUsers className="w-6 h-6 text-[#B6EADA]" />,
      badge: "New",
      className: "md:col-span-1",
    },
    {
      title: "Real-time Updates",
      description:
        "Get instant notifications about hackathon updates, deadlines, and announcements.",
      header: <FeatureHeader3 />,
      icon: <TbBolt className="w-6 h-6 text-[#B6EADA]" />,
      className: "md:col-span-1",
    },
    {
      title: "Secure Submissions",
      description:
        "Your intellectual property is protected with secure submission handling.",
      header: <FeatureHeader4 />,
      icon: <TbShield className="w-6 h-6 text-[#B6EADA]" />,
      className: "md:col-span-1",
    },
    {
      title: "Multi-platform Support",
      description:
        "Build web, mobile, AI, blockchain, or any type of project with our flexible platform.",
      header: <FeatureHeader5 />,
      icon: <TbCode className="w-6 h-6 text-[#B6EADA]" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge
            variant="secondary"
            className="mb-8 bg-[#301E67]/60 border-[#5B8FB9]/40 text-[#B6EADA] px-6 py-2 rounded-full"
          >
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-white tracking-tight">
            Everything you need to
            <span className="text-[#B6EADA]/80"> succeed</span>
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

// Feature Header Components
const FeatureHeader1 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-[#5B8FB9]/15 border border-[#5B8FB9]/25"></div>
);

const FeatureHeader2 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-[#B6EADA]/10 border border-[#B6EADA]/20"></div>
);

const FeatureHeader3 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-[#301E67]/50 border border-[#301E67]/70"></div>
);

const FeatureHeader4 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-[#5B8FB9]/20 border border-[#5B8FB9]/35"></div>
);

const FeatureHeader5 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] max-h-[8rem] rounded-lg bg-[#B6EADA]/8 border border-[#B6EADA]/15"></div>
);

export default Features;
