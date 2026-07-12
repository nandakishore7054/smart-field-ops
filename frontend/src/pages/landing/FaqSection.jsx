import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../common/components/ui/utils';

const faqs = [
  {
    question: "Do workers need internet access to use the app?",
    answer: "No. Smart Field Ops is built as a Progressive Web App (PWA). Workers can view their tasks and submit proofs while offline. The app will automatically sync with the server once a connection is restored."
  },
  {
    question: "How does the location tracking work?",
    answer: "Location tracking is powered by the device's native GPS and transmitted via secure WebSocket connections. Dispatchers can only see live locations while workers are active and on the clock."
  },
  {
    question: "Can I integrate this with my existing payroll system?",
    answer: "Our enterprise API (coming in a future update) allows full export of attendance and task completion data, making it easy to sync with external payroll and HR systems."
  },
  {
    question: "Is there a limit to how many photos a worker can upload?",
    answer: "We support unlimited compressed image uploads for proof of work, securely stored and delivered globally via our CDN."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">Everything you need to know about the product and billing.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={cn(
                "border border-border rounded-xl bg-surface overflow-hidden transition-colors",
                openIndex === i ? "border-primary/50" : "hover:border-border/80"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    openIndex === i ? "rotate-180" : ""
                  )} 
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-0 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
