import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TbMenu2, TbX, TbCode, TbSparkles } from "react-icons/tb";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Hackathons", href: "#hackathons" },
    { name: "About", href: "#about" },
    { name: "Community", href: "#community" },
    { name: "Pricing", href: "#pricing" },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate(user.role ? "/dashboard" : "/select-role");
    } else {
      navigate("/signup");
    }
  };

  const handleSignIn = () => {
    if (user) {
      navigate(user.role ? "/dashboard" : "/select-role");
    } else {
      navigate("/login");
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800/60 rounded-xl flex items-center justify-center border border-zinc-700/30 backdrop-blur-sm">
                <TbCode className="w-6 h-6 text-zinc-200" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                vHack
              </span>
              <Badge
                variant="secondary"
                className="bg-zinc-700/20 border-zinc-600/40 text-zinc-200 text-xs font-medium px-3 py-1"
              >
                <TbSparkles className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-white/80 hover:text-zinc-200 transition-colors text-sm font-medium tracking-wide"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="bg-white text-zinc-950 hover:bg-white/90 px-6 py-2 rounded-lg font-medium shadow-lg shadow-white/25"
                onClick={handleGetStarted}
              >
                {user ? "Dashboard" : "Get Started"}
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? (
              <TbX className="w-6 h-6" />
            ) : (
              <TbMenu2 className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-800/50 mt-4 pt-6 pb-6"
            >
              <div className="flex flex-col space-y-6">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-white/80 hover:text-zinc-200 transition-colors text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
                <div className="flex flex-col pt-6 border-t border-zinc-800/50">
                  <Button
                    size="sm"
                    className="justify-start bg-white text-zinc-950 hover:bg-white/90 rounded-lg shadow-lg shadow-white/25"
                    onClick={() => {
                      handleGetStarted();
                      setIsOpen(false);
                    }}
                  >
                    {user ? "Dashboard" : "Get Started"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
