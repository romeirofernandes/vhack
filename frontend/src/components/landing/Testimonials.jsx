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
    <section className="py-20 px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-8 bg-[#301E67]/60 border-[#5B8FB9]/40 text-[#B6EADA] px-6 py-2 rounded-full"
          >
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Loved by developers
            <span className="text-[#B6EADA]/80"> worldwide</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who have transformed their careers
            through hackathons.
          </p>
        </motion.div>

        <div className="relative">
          {/* Gradient masks for fade effect */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#03001C] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#03001C] to-transparent z-10 pointer-events-none" />

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
    <div className="p-6 rounded-2xl border border-[#301E67]/60 bg-[#301E67]/30 backdrop-blur-sm">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-[#5B8FB9]/25 rounded-xl flex items-center justify-center border border-[#5B8FB9]/40 flex-shrink-0">
          <span className="text-[#B6EADA] font-bold text-sm">
            {testimonial.avatar}
          </span>
        </div>
        <div className="flex-1">
          <div className="mb-3">
            <h4 className="text-white font-semibold text-base">
              {testimonial.name}
            </h4>
            <p className="text-[#B6EADA]/70 text-sm">
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
