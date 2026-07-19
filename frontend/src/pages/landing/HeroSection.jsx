import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../common/components/ui/Button';
import { Map, Navigation, ShieldCheck, Zap, Bot, Users } from 'lucide-react';

export default function HeroSection({ isAuthenticated, dashboardLink = '/admin/dashboard' }) {
  // Floating animation variants for the CSS illustration
  const floatAnim = {
    initial: { y: 0 },
    animate: { 
      y: [-10, 10, -10],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const floatAnimDelayed = {
    initial: { y: 0 },
    animate: { 
      y: [10, -10, 10],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-6">
      {/* Soft Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen opacity-50 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-info/10 blur-[100px] rounded-full mix-blend-screen opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Enterprise SaaS Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            🌍 OpsGrid
          </motion.h1>

          <motion.h2
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
             className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-info mb-6"
          >
             AI-Powered Field Operations Intelligence Platform
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl"
          >
            OpsGrid enables organizations to monitor, coordinate, and optimize field workforce operations using real-time GPS tracking, geofencing, task management, live analytics, and AI-powered operational insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {!isAuthenticated ? (
              <>
                <Button as={Link} to="/register" size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-glow">
                  Get Started
                </Button>
                <Button as="a" href="#features" variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8 bg-surface">
                  Explore Features
                </Button>
              </>
            ) : (
              <Button as={Link} to={dashboardLink} size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-glow">
                Go to Dashboard
              </Button>
            )}
          </motion.div>
        </div>

        {/* Right Content: Professional CSS & Lucide Illustration */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
           className="relative w-full aspect-square max-w-lg mx-auto lg:mx-0 hidden md:block"
        >
           {/* Central Core */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center relative">
                 {/* Map Grid Pattern */}
                 <div className="absolute inset-0 rounded-full opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" style={{ clipPath: 'circle(50% at 50% 50%)' }} />
                 <div className="w-32 h-32 rounded-full bg-surface border border-border shadow-2xl flex items-center justify-center z-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-info/10" />
                    <Map className="w-12 h-12 text-primary relative z-10" />
                 </div>
              </div>
           </div>

           {/* Floating Nodes */}
           <motion.div variants={floatAnim} initial="initial" animate="animate" className="absolute top-[10%] left-[20%] w-16 h-16 rounded-2xl bg-surface border border-border shadow-lg flex items-center justify-center text-info">
              <Navigation className="w-7 h-7" />
           </motion.div>

           <motion.div variants={floatAnimDelayed} initial="initial" animate="animate" className="absolute top-[20%] right-[10%] w-14 h-14 rounded-xl bg-surface border border-border shadow-lg flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
           </motion.div>

           <motion.div variants={floatAnim} initial="initial" animate="animate" className="absolute bottom-[25%] left-[5%] w-14 h-14 rounded-xl bg-surface border border-border shadow-lg flex items-center justify-center text-yellow-500">
              <Zap className="w-6 h-6" />
           </motion.div>

           <motion.div variants={floatAnimDelayed} initial="initial" animate="animate" className="absolute bottom-[15%] right-[20%] w-16 h-16 rounded-2xl bg-surface border border-border shadow-lg flex items-center justify-center text-purple-500">
              <Bot className="w-7 h-7" />
           </motion.div>

           <motion.div variants={floatAnim} initial="initial" animate="animate" className="absolute top-[50%] right-[-5%] w-12 h-12 rounded-xl bg-surface border border-border shadow-lg flex items-center justify-center text-green-500">
              <Users className="w-5 h-5" />
           </motion.div>

           {/* Connection Lines (SVGs) */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: -1 }}>
              <line x1="30%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20%" y1="70%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="95%" y1="55%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
           </svg>
        </motion.div>

      </div>
    </section>
  );
}
