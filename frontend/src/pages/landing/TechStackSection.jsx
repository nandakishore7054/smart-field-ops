import React from 'react';
import { motion } from 'framer-motion';

const technologies = [
  { name: 'React', type: 'Frontend PWA' },
  { name: 'Node.js', type: 'Event-driven Engine' },
  { name: 'Express.js', type: 'RESTful API' },
  { name: 'MongoDB', type: 'Geospatial Database' },
  { name: 'Socket.IO', type: 'Telemetry Stream' },
  { name: 'Leaflet', type: 'Interactive Mapping' },
  { name: 'TailwindCSS', type: 'Utility Design System' },
  { name: 'Groq', type: 'Primary LLM Inference' },
  { name: 'Google Gemini', type: 'Fallback LLM Inference' },
  { name: 'JWT', type: 'Stateless Auth' }
];

export default function TechStackSection() {
  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <div className="mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Enterprise Grade</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Built on a modern technology stack.</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          {technologies.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="px-6 py-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-default flex flex-col items-center min-w-[160px]"
            >
              <span className="font-bold text-lg text-foreground mb-1">{tech.name}</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{tech.type}</span>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
