import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TbCode, TbSparkles, TbArrowRight } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";

const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartBuilding = () => {
    if (user) {
      navigate(user.role ? "/dashboard" : "/select-role");
    } else {
      navigate("/signup");
    }
  };

  return (
    <section className="relative py-32 px-8">
      <div className="max-w-5xl mx-auto text-center relative">
        <motion.div
          className="relative p-12 rounded-3xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <Badge
              variant="secondary"
              className="px-6 py-3 bg-zinc-700/25 border border-zinc-600/40 text-zinc-200 hover:bg-zinc-700/35 transition-colors backdrop-blur-sm rounded-full"
            >
              <TbSparkles className="w-4 h-4 mr-2" />
              Ready to get started?
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            className="text-5xl md:text-6xl font-bold leading-tight mb-12 text-white tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          >
            Join the Revolution.
          </motion.h2>

          {/* CTA Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="px-10 py-5 bg-white text-zinc-950 hover:bg-white/90 font-semibold group rounded-xl shadow-xl shadow-white/30 text-lg"
                onClick={handleStartBuilding}
              >
                <TbCode className="w-6 h-6 mr-3" />
                {user ? "Go to Dashboard" : "Start Building"}
                <TbArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
