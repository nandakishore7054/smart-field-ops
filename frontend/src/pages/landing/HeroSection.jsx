import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../common/components/ui/Button';
import { ChevronRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function HeroSection({ isAuthenticated }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-info/20 blur-[100px] rounded-full mix-blend-screen opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border shadow-sm mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-foreground">Smart Field Ops v2.0 is live</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
        >
          Field operations, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-info">reimagined.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A unified workforce management platform. Dispatch tasks, track real-time locations, verify proofs of work, and accelerate your entire operational workflow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {!isAuthenticated ? (
            <>
              <Button as={Link} to="/register" size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-glow">
                Start for free
              </Button>
              <Button as={Link} to="/login" variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Sign in to workspace
              </Button>
            </>
          ) : (
            <Button as={Link} to="/admin/dashboard" size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-glow">
              Go to Dashboard
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="w-full max-w-5xl mx-auto mt-20 relative"
        >
          <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-surface/50 backdrop-blur-sm p-2">
            <div className="rounded-lg overflow-hidden bg-background border border-border aspect-video relative flex items-center justify-center">
               {/* Mock UI for premium feel */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
               
               <div className="grid grid-cols-3 gap-6 w-full max-w-3xl p-6 relative z-10 opacity-80">
                  <div className="col-span-2 space-y-4">
                     <div className="h-40 rounded-xl bg-surface border border-border shadow-sm p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                           <div className="w-24 h-4 bg-muted rounded" />
                           <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="w-full h-16 bg-gradient-to-t from-primary/20 to-transparent rounded-b flex items-end">
                           <svg className="w-full h-8 text-primary" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none"><path d="M0 100 L 20 60 L 40 80 L 60 30 L 80 50 L 100 10" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke"/></svg>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 rounded-xl bg-surface border border-border shadow-sm p-4 flex flex-col justify-between">
                           <div className="w-16 h-3 bg-muted rounded" />
                           <div className="w-20 h-6 bg-primary/20 rounded" />
                        </div>
                        <div className="h-24 rounded-xl bg-surface border border-border shadow-sm p-4 flex flex-col justify-between">
                           <div className="w-20 h-3 bg-muted rounded" />
                           <div className="w-16 h-6 bg-info/20 rounded" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-16 rounded-xl bg-surface border border-border shadow-sm p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10" />
                          <div className="space-y-2 flex-1">
                             <div className="w-full h-2 bg-muted rounded" />
                             <div className="w-2/3 h-2 bg-muted rounded" />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
        
        {/* Trusted By */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="mt-24 w-full"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by modern field teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
             {/* Fake logos */}
             <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck className="w-6 h-6"/> Verta</div>
             <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-6 h-6"/> BoltOps</div>
             <div className="font-serif font-bold text-2xl italic">Lumina</div>
             <div className="font-bold text-xl tracking-tighter">NEXUS</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
