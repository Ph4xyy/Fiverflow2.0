import { motion } from 'framer-motion';

export const TrustedBy = () => {
  const platforms = [
    'Fiverr',
    'Upwork',
    'Shopify',
    'TikTok Shop',
    'Instagram DM',
    'Custom Clients',
  ];

  const gradientBadges = [
    'from-emerald-400 via-emerald-500 to-green-400 shadow-glow-green',
    'from-sky-400 via-cyan-500 to-teal-400 shadow-glow-md',
    'from-amber-400 via-orange-500 to-yellow-400 shadow-glow-orange',
    'from-fuchsia-400 via-purple-500 to-pink-400 shadow-glow-purple',
    'from-indigo-400 via-blue-500 to-cyan-400 shadow-glow-md',
    'from-rose-400 via-pink-500 to-orange-400 shadow-glow-md',
  ];

  const duplicated = [...platforms, ...platforms, ...platforms];

  return (
    <section className="py-12">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <p className="text-sm text-neutral-400 inline-flex items-center gap-2">
            <span>Trusted by freelancers on</span>
            <span className="relative inline-block h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-fuchsia-500 animate-pulse" />
          </p>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-10 bg-gradient-to-r from-brand.surface via-transparent to-brand.surface opacity-90 [mask-image:linear-gradient(to_right,black_0%,black_15%,transparent_30%,transparent_70%,black_85%,black_100%)]" />

          <div className="overflow-hidden">
            <div className="flex whitespace-nowrap will-change-transform animate-marquee-left">
              {duplicated.map((platform, idx) => (
                <motion.span
                  key={`row1-${idx}-${platform}`}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className={`mr-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${gradientBadges[idx % gradientBadges.length]} px-4 py-2 text-xs font-semibold text-white/90 shadow-glow-sm backdrop-blur-sm`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {platform}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-hidden">
            <div className="flex whitespace-nowrap will-change-transform animate-marquee-right">
              {duplicated.map((platform, idx) => (
                <motion.span
                  key={`row2-${idx}-${platform}`}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className={`mr-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${gradientBadges[(idx + 2) % gradientBadges.length]} px-4 py-2 text-xs font-semibold text-white/90 shadow-glow-sm backdrop-blur-sm`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {platform}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

