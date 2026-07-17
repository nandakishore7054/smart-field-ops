import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '7', label: 'Domain Modules' },
  { value: '11', label: 'Database Collections' },
  { value: '2', label: 'AI Inference Providers' },
  { value: '2', label: 'Secure User Roles' },
  { value: '15+', label: 'REST APIs' },
  { value: '< 50ms', label: 'Socket Latency' },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight">By the numbers.</h2>
          <p className="text-muted-foreground mt-4">Built for scale, speed, and absolute reliability.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-2 p-6 rounded-2xl bg-surface border border-border shadow-sm"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm md:text-base font-semibold text-foreground uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
