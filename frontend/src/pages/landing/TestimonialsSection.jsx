import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Switching to Smart Field Ops reduced our dispatch times by 40%. The real-time tracking gives us unprecedented visibility into our daily operations.",
    author: "Sarah Jenkins",
    role: "Operations Director, Metro Utilities",
    avatar: "https://i.pravatar.cc/150?img=44"
  },
  {
    quote: "The offline PWA capability is a game-changer. Our workers in remote areas no longer lose their task data when the connection drops.",
    author: "David Chen",
    role: "Field Supervisor, BuildTech",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    quote: "Finally, a tool that looks and feels like modern software. The UI is incredibly intuitive, meaning zero training time for our new hires.",
    author: "Elena Rodriguez",
    role: "CEO, FastFix Services",
    avatar: "https://i.pravatar.cc/150?img=5"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-surface-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by operations teams</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between"
            >
              <div className="mb-6">
                <div className="flex text-yellow-500 mb-4">
                  {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
                <p className="text-foreground leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{t.author}</h4>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
