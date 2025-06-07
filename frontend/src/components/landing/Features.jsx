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
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
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
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-white/[0.02] bg-white border border-white/10 hover:border-white/20 justify-between flex flex-col space-y-4",
        className
      )}
      whileHover={{ y: -2 }}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover/bento:bg-white/10 transition-colors">
            {icon}
          </div>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-white/5 border-white/10 text-white/90 text-xs"
            >
              {badge}
            </Badge>
          )}
        </div>
        <div className="font-sans font-bold text-white mb-2 mt-2">{title}</div>
        <div className="font-sans font-normal text-white/70 text-sm">
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
      icon: <TbTrophy className="w-5 h-5 text-white/70" />,
      badge: "Popular",
      className: "md:col-span-2",
    },
    {
      title: "Team Collaboration",
      description:
        "Find teammates and collaborate seamlessly with built-in project management tools.",
      header: <FeatureHeader2 />,
      icon: <TbUsers className="w-5 h-5 text-white/70" />,
      badge: "New",
      className: "md:col-span-1",
    },
    {
      title: "Real-time Updates",
      description:
        "Get instant notifications about hackathon updates, deadlines, and announcements.",
      header: <FeatureHeader3 />,
      icon: <TbBolt className="w-5 h-5 text-white/70" />,
      className: "md:col-span-1",
    },
    {
      title: "Secure Submissions",
      description:
        "Your intellectual property is protected with secure submission handling.",
      header: <FeatureHeader4 />,
      icon: <TbShield className="w-5 h-5 text-white/70" />,
      className: "md:col-span-1",
    },
    {
      title: "Multi-platform Support",
      description:
        "Build web, mobile, AI, blockchain, or any type of project with our flexible platform.",
      header: <FeatureHeader5 />,
      icon: <TbCode className="w-5 h-5 text-white/70" />,
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-6 bg-white/5 border-white/10 text-white/90"
          >
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Everything you need to
            <span className="text-white/60"> succeed</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            From ideation to implementation, our platform provides all the tools
            and support you need to build amazing projects.
          </p>
        </motion.div>

        <BentoGrid className="max-w-4xl mx-auto">
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
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"></div>
);

const FeatureHeader2 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20"></div>
);

const FeatureHeader3 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"></div>
);

const FeatureHeader4 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"></div>
);

const FeatureHeader5 = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"></div>
);

export default Features;
