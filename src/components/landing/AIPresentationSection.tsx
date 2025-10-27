import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, MessageSquare, Brain, TrendingUp, BarChart } from 'lucide-react';

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
            Your AI-Powered Assistant
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Get instant answers, smart suggestions, and intelligent insights powered by advanced AI.
            Your personal assistant is always ready to help.
          </p>
        </motion.div>

        {/* Chat Interface Preview */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Chat preview */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] p-6">
              {/* Chat messages */}
              <div className="space-y-4">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">What's my revenue this month?</p>
                  </div>
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-neutral-200 text-sm mb-2">
                      Your revenue this month is $12,450, up 32% from last month! Your top earning source is client consultations.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <TrendingUp size={14} />
                      <span>Great progress!</span>
                    </div>
                  </div>
                </motion.div>

                {/* User follow-up */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">Show me my analytics</p>
                  </div>
                </motion.div>
              </div>

              {/* Input area */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex gap-3"
              >
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  disabled
                />
                <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center hover:shadow-lg transition-shadow">
                  <Sparkles className="text-white" size={18} />
                </button>
              </motion.div>
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

