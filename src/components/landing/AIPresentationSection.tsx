import { motion } from 'framer-motion';
import { Bot, Zap, MessageSquare, Brain, TrendingUp, BarChart } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "Natural Conversation",
    description: "Chat with your AI assistant like a team member. Get instant answers to your questions.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Zap,
    title: "Smart Recommendations",
    description: "Get intelligent suggestions to optimize your workflow and boost productivity.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: Brain,
    title: "Context Awareness",
    description: "Understands your projects, clients, and deadlines to provide relevant insights.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: BarChart,
    title: "Data Analysis",
    description: "Analyze your performance metrics and get actionable insights instantly.",
    color: "from-orange-500 to-red-500"
  }
];

export const AIPresentationSection = () => {
  return (
    <section id="ai-assistant" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center"
            >
              <Bot className="text-white" size={24} />
            </motion.div>
            <span className="text-indigo-400 uppercase tracking-wider text-xs font-medium">AI Assistant</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Meet Jett! Your own AI assistant
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Get instant answers, smart suggestions, and intelligent insights powered by advanced AI.
            Your personal assistant is always ready to help.
          </p>
        </motion.div>

        {/* Chat Interface Preview */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Chat preview image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden">
              <img
                src="/jett-assistant-preview.png"
                alt="Jett AI Assistant Chat Interface"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Right: Features list */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/assistant'}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-medium shadow-[0_20px_80px_rgba(99,102,241,0.6)] hover:shadow-[0_30px_120px_rgba(99,102,241,0.9)] transition-shadow"
          >
            <Bot size={20} />
            Try AI Assistant
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

