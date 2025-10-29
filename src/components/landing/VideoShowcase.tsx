import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export const VideoShowcase = () => {
  const tags = [
    "Client Management",
    "Calendar Sync",
    "Invoices",
    "Task Priority"
  ];

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
              See FiverFlow in Action
            </h2>
            <p className="text-lg text-neutral-300">
              Watch how freelancers manage clients, projects, billing, and deadlines — all in one place.
            </p>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Explore Documentation →
            </a>
          </div>

          {/* Right: Video Player */}
          <div className="relative">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.8)] aspect-video relative flex items-center justify-center overflow-hidden">
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center cursor-pointer group"
              >
                <Play className="text-white ml-1" size={32} fill="white" />
              </motion.button>

              {/* Placeholder for video */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />
            </div>

            {/* Floating Tags */}
            {tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
                className={`absolute ${index % 2 === 0 ? 'top-[10%]' : 'bottom-[15%]'} ${index % 3 === 0 ? 'left-[-10%]' : index % 3 === 1 ? 'right-[-5%]' : 'left-[5%]'} bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-neutral-300`}
              >
                {tag}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

