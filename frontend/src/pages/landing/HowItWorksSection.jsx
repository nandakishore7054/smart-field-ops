import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { title: 'Create Workforce', desc: 'Admin provisions worker accounts and assigns roles.' },
  { title: 'Assign Tasks', desc: 'Dispatchers create jobs and allocate them based on proximity.' },
  { title: 'Track Live Location', desc: 'Workers open the PWA; background sockets stream their GPS.' },
  { title: 'Geofence Verification', desc: 'System mathematically detects when workers enter/exit sites.' },
  { title: 'Task Completion', desc: 'Worker uploads proof of work and marks the task as complete.' },
  { title: 'Dashboard Analytics', desc: 'Haversine distances and shift timings aggregate on the dashboard.' },
  { title: 'AI Summary', desc: 'LLM synthesizes the entire operational day into a Markdown report.' }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 relative bg-background overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">How It Works</h2>
          <h3 className="text-4xl font-extrabold tracking-tight mb-4">The Complete Operational Loop.</h3>
          <p className="text-lg text-muted-foreground">From onboarding to AI synthesis, watch data flow seamlessly.</p>
        </div>

        <div className="relative border-l border-border ml-4 md:ml-0 md:border-none">
          {/* Desktop timeline connecting line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          
          <div className="space-y-12">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center md:justify-between group">
                  
                  {/* Mobile dot */}
                  <div className="md:hidden absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />

                  {/* Desktop Center dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border-2 border-primary items-center justify-center z-10 shadow-sm transition-transform duration-300 group-hover:scale-125">
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </div>

                  {/* Content Box */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`w-full md:w-[45%] pl-6 md:pl-0 ${isEven ? 'md:text-right md:pr-12' : 'md:ml-auto md:pl-12'}`}
                  >
                    <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm font-bold text-primary mb-2 md:hidden">Step {idx + 1}</div>
                      <h4 className="text-xl font-bold mb-2 tracking-tight">{step.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
