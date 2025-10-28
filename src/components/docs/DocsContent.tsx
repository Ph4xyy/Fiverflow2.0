import React from 'react';
import { motion } from 'framer-motion';
import { welcomePageContent, TOC_SECTIONS } from '../../lib/docsPageContent';
import { ArrowLeft, ArrowRight, MessageCircle, Mail } from 'lucide-react';

export const DocsContent = () => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-6 md:p-10 overflow-hidden prose prose-invert max-w-full"
    >
      {/* H1 */}
      <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-white mb-4 !mt-0">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
          Welcome
        </span>
      </h1>

      {/* Intro paragraph */}
      <p className="text-neutral-300 leading-relaxed text-base md:text-lg mb-8 !text-current">
        FiverFlow is your all-in-one dashboard designed to help freelancers organize their clients, manage tasks, and track growth with ease. This documentation walks you through every feature — from setting up your first client to advanced tools like smart task prioritization and billing.
      </p>

      {/* Content sections */}
      {welcomePageContent.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-white mt-10 mb-3 !text-current">
            {section.heading}
          </h2>

          <div className="space-y-4 !text-neutral-300">
            {section.body.map((paragraph, pIndex) => (
              <p key={pIndex} className="leading-relaxed !text-current">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Callout box */}
          {section.callout && (
            <div className={`mt-6 ${section.callout.style}`}>
              <p className="!text-current !mb-0">{section.callout.text}</p>
            </div>
          )}
        </motion.div>
      ))}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 pt-8 border-t border-white/10"
      >
        <div className="flex flex-wrap gap-4">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
            Previous Tutorial
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow">
            Next Tutorial
            <ArrowRight size={18} />
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-neutral-300 hover:text-white transition-colors">
            <MessageCircle size={18} />
            Join our Community
          </button>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-neutral-300 hover:text-white transition-colors">
            <Mail size={18} />
            Get in touch
          </button>
        </div>
      </motion.div>
    </motion.article>
  );
};

