import React from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldCheck, Zap, BrainCircuit, Lightbulb } from 'lucide-react';

const reasons = [
  {
    icon: Eye,
    title: 'Real-Time Visibility',
    description: 'Eliminate blind spots. See exactly where your team is located globally without waiting for manual check-ins.'
  },
  {
    icon: ShieldCheck,
    title: 'Workforce Accountability',
    description: 'Cryptographically verify attendance with geofences and timestamped coordinate logs. Trust, but verify.'
  },
  {
    icon: Zap,
    title: 'Operational Efficiency',
    description: 'Dispatch the closest worker instantly using Haversine distance calculations to reduce travel time and fuel costs.'
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Insights',
    description: 'Let Generative AI do the heavy lifting at the end of the shift by summarizing raw telemetry into executive reports.'
  },
  {
    icon: Lightbulb,
    title: 'Intelligent Decision Making',
    description: 'Stop guessing. Use hard distance metrics and completion times to optimize your daily operational strategy.'
  }
];

export default function WhyFieldIntelSection() {
  return (
    <section className="py-24 bg-surface relative border-y border-border">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Why FieldIntel</h2>
              <h3 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
                Move from reactive management to proactive intelligence.
              </h3>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Traditional workforce management relies on trust and paper trails. FieldIntel replaces guesswork with deterministic geographic data and AI analysis.
              </p>
            </motion.div>

            <div className="space-y-8">
              {reasons.slice(0, 3).map((reason, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <reason.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{reason.title}</h4>
                    <p className="text-muted-foreground">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Visual / Remaining Reasons */}
          <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-info/5 rounded-3xl transform rotate-3" />
             <div className="relative bg-background border border-border shadow-xl rounded-3xl p-8 lg:p-12">
               <div className="space-y-10">
                  {reasons.slice(3).map((reason, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.2 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm">
                        <reason.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{reason.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
                      </div>
                    </motion.div>
                  ))}
               </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
