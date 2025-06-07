import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      company: "Tech Startup",
      content:
        "vHack transformed how I approach hackathons. The platform's collaboration tools helped me find amazing teammates and we won our first competition!",
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "AI/ML Engineer",
      company: "Google",
      content:
        "The quality of hackathons on vHack is incredible. I've participated in 5 events and each one pushed me to learn new technologies.",
      avatar: "MR",
    },
    {
      name: "Priya Patel",
      role: "Product Designer",
      company: "Meta",
      content:
        "As a designer, finding dev-focused hackathons was always challenging. vHack's platform made it easy to connect with developers.",
      avatar: "PP",
    },
    {
      name: "David Kim",
      role: "Blockchain Developer",
      company: "Coinbase",
      content:
        "The Web3 hackathons on vHack are top-tier. The platform's secure submission system gave me confidence to share my solutions.",
      avatar: "DK",
    },
    {
      name: "Emma Thompson",
      role: "Frontend Developer",
      company: "Shopify",
      content:
        "I've won over $50K in prizes through vHack competitions. The platform attracts serious developers and the judging is fair.",
      avatar: "ET",
    },
    {
      name: "Alex Johnson",
      role: "DevOps Engineer",
      company: "AWS",
      content:
        "The real-time collaboration features are game-changing. Our team built and deployed a complete microservices architecture in 48 hours!",
      avatar: "AJ",
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);

  return (
    <section className="py-16 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge
            variant="secondary"
            className="mb-4 bg-white/5 border-white/10 text-white/90"
          >
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Loved by developers
            <span className="text-white/60"> worldwide</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join thousands of developers who have transformed their careers
            through hackathons.
          </p>
        </motion.div>

        <div className="relative">
          {/* Gradient masks for fade effect */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto h-[400px] overflow-hidden">
            {/* First Column - Moving Up */}
            <div className="overflow-hidden">
              <motion.div
                className="space-y-4"
                animate={{
                  y: [0, -1200],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {[
                  ...firstColumn,
                  ...firstColumn,
                  ...firstColumn,
                  ...firstColumn,
                  ...firstColumn,
                  ...firstColumn,
                ].map((testimonial, index) => (
                  <TestimonialCard
                    key={`first-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </motion.div>
            </div>

            {/* Second Column - Moving Down */}
            <div className="overflow-hidden">
              <motion.div
                className="space-y-4"
                animate={{
                  y: [-1200, 0],
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {[
                  ...secondColumn,
                  ...secondColumn,
                  ...secondColumn,
                  ...secondColumn,
                  ...secondColumn,
                  ...secondColumn,
                ].map((testimonial, index) => (
                  <TestimonialCard
                    key={`second-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 flex-shrink-0">
          <span className="text-white font-semibold text-xs">
            {testimonial.avatar}
          </span>
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <h4 className="text-white font-semibold text-sm">
              {testimonial.name}
            </h4>
            <p className="text-white/60 text-xs">
              {testimonial.role} • {testimonial.company}
            </p>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            "{testimonial.content}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
