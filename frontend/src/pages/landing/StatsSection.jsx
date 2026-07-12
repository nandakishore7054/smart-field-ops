import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '2.5M+', label: 'Tasks Completed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '15k+', label: 'Active Workers' },
  { value: '45%', label: 'Efficiency Increase' },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="space-y-2"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm md:text-base font-medium text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
