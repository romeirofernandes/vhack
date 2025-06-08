import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-4 hidden md:flex md:flex-col bg-zinc-950 border-r border-white/10 shrink-0 sticky top-0",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "70px") : "280px",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile Header */}
      <div
        className={cn(
          "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-zinc-950 border-b border-white/10 w-full sticky top-0 z-40"
        )}
        {...props}
      >
        <div className="flex justify-between items-center w-full">
          {/* Logo for mobile */}
          <div className="font-normal flex space-x-2 items-center text-sm text-white">
            <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
            <span className="font-medium text-white">VHack</span>
          </div>

          <Menu
            className="text-white h-6 w-6 cursor-pointer hover:text-white/80 transition-colors"
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-zinc-950 p-6 z-[100] flex flex-col justify-between md:hidden",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-white cursor-pointer hover:text-white/80 transition-colors"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({ link, className, onClick, ...props }) => {
  const { open, animate } = useSidebar();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
    // For mobile, close the sidebar after clicking a link
    if (window.innerWidth < 768) {
      const { setOpen } = useSidebar();
      setOpen(false);
    }
  };

  return (
    <a
      href={link.href || "#"}
      onClick={handleClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer relative",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 relative z-10">{link.icon}</div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className="text-white/80 text-sm group-hover/sidebar:text-white group-hover/sidebar:translate-x-1 transition-all duration-200 whitespace-pre inline-block !p-0 !m-0 relative z-10"
      >
        {link.label}
      </motion.span>

      {/* Tooltip for collapsed state */}
      {animate && !open && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
          {link.label}
        </div>
      )}
    </a>
  );
};
