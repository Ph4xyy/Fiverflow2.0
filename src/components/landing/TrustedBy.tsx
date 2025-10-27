import { motion } from 'framer-motion';

export const TrustedBy = () => {
  const platforms = [
    "Fiverr",
    "Upwork",
    "Shopify",
    "TikTok Shop",
    "Instagram DM",
    "Custom Clients"
  ];

  return (
    <section className="py-12">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-sm text-neutral-400 mb-8"
        >
          Trusted by freelancers on
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.4, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-sm text-neutral-500 font-medium"
            >
              {platform}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

