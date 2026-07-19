import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../app/auth-context';
import { Compass } from 'lucide-react';
import { Button } from '../common/components/ui/Button';
import ThemeSwitcher from '../common/components/layout/ThemeSwitcher';

import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import WhyFieldIntelSection from './landing/WhyFieldIntelSection';
import HowItWorksSection from './landing/HowItWorksSection';
import TechStackSection from './landing/TechStackSection';
import StatsSection from './landing/StatsSection';
import Footer from './landing/Footer';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading workspace...</p>
        </div>
      </main>
    );
  }

  let dashboardLink = '/admin/dashboard';
  if (user?.role === 'worker') dashboardLink = '/worker/dashboard';
  if (user?.role === 'dispatcher') dashboardLink = '/admin/dispatch-board';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden selection:bg-primary/30">
      
      {/* Top Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-lg hidden sm:inline-block">OpsGrid</span>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#why" className="hover:text-foreground transition-colors">Why OpsGrid</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it Works</a>
          </div>

          <ThemeSwitcher />

          {isAuthenticated ? (
            <Button as={Link} to={dashboardLink} size="sm" className="hidden sm:inline-flex">
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Button as={Link} to="/register" size="sm" className="hidden sm:inline-flex">
                Get Started
              </Button>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col w-full">
        <HeroSection isAuthenticated={isAuthenticated} dashboardLink={dashboardLink} />
        <div id="features"><FeaturesSection /></div>
        <div id="why"><WhyFieldIntelSection /></div>
        <div id="how"><HowItWorksSection /></div>
        <TechStackSection />
        <StatsSection />
        
        {/* Call to Action Section */}
        <section className="py-24 relative overflow-hidden bg-background">
           <div className="absolute inset-0 bg-primary/5" />
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
           
           <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Ready to Transform Your Field Operations?</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                 Join modern teams using OpsGrid to manage tasks, dispatch workers, and track operations with real-time AI intelligence.
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button as={Link} to="/register" size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-glow">
                    Launch OpsGrid
                  </Button>
                  <Button as={Link} to="/login" variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-surface">
                    Sign into Workspace
                  </Button>
                </div>
              )}
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}