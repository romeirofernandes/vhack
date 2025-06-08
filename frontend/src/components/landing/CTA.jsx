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
    <section className="relative py-24 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          className="relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
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
            className="mb-6"
          >
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <TbSparkles className="w-4 h-4 mr-2" />
              Ready to get started?
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            className="text-4xl md:text-5xl font-bold leading-tight mb-8 text-white"
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
                className="px-8 py-4 bg-white text-zinc-950 hover:bg-white/90 font-medium group"
                onClick={handleStartBuilding}
              >
                <TbCode className="w-5 h-5 mr-2" />
                {user ? "Go to Dashboard" : "Start Building"}
                <TbArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
