import { motion } from 'framer-motion';

const footerData = [
  {
    title: "FiverFlow",
    desc: "The all-in-one platform to manage your freelance business and scale across every platform.",
    sub: "A StriveLabs Company"
  },
  {
    title: "Navigation",
    links: ["Features", "Documentations", "Benefits", "Testimonials", "Pricing", "FAQ"]
  },
  {
    title: "Socials",
    links: ["Discord", "Instagram", "Facebook"]
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy"]
  }
];

export const DocsFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 border-t border-white/10 pt-12 pb-20 text-neutral-400 text-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1300px] mx-auto px-4 md:px-8">
        {footerData.map((col, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <h4 className="font-semibold text-white mb-4">{col.title}</h4>
            {col.desc && <p className="text-neutral-500 mb-2">{col.desc}</p>}
            {col.sub && <p className="text-neutral-600 text-xs">{col.sub}</p>}
            {col.links && (
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12 pt-8 border-t border-white/10 text-neutral-600 text-xs">
        © FiverFlow. All rights reserved.
      </div>
    </motion.footer>
  );
};

