import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      
      {/* Left Column: Branding / Visual (Hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-slate-950 items-center justify-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-info/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMGg4djhIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 p-12 text-white max-w-xl">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">FieldIntel</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight">
              AI-Powered Field Operations Intelligence Platform.
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
              A comprehensive workforce management system designed for scale, speed, and real-time visibility.
            </p>
          </motion.div>
          
          <div className="mt-16 flex items-center gap-4">
             <div className="flex -space-x-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
             </div>
             <div className="text-sm">
                <p className="text-slate-300">Join thousands of teams</p>
                <div className="flex items-center text-yellow-500">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 md:hidden">
           <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">FieldIntel</span>
          </Link>
        </div>

        <div className="absolute top-6 right-6">
          <ThemeSwitcher />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
        </motion.div>
      </div>

    </div>
  );
}
