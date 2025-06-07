import React from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";
import Testimonials from "../components/landing/Testimonials";

const Landing = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white dark">
      <div className="relative">
        <div className="max-w-5xl mx-auto relative">
          <Navbar />
          <Hero />
          <Features />
          <Testimonials />
          <CTA />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Landing;
