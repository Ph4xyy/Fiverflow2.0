import { GlowBackground } from '../components/ui/GlowBackground';
import { DocsSidebar } from '../components/docs/DocsSidebar';
import { DocsContent } from '../components/docs/DocsContent';
import { DocsTOC } from '../components/docs/DocsTOC';
import { DocsFooter } from '../components/docs/DocsFooter';
import { SearchCommand } from '../components/docs/SearchCommand';
import { motion } from 'framer-motion';

export default function DocsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen text-white relative overflow-hidden">
      <GlowBackground />
      <div className="relative z-10">
        <div className="lg:hidden px-4 py-4">
          <div className="max-w-[1300px] mx-auto">
            <SearchCommand />
          </div>
        </div>
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="flex gap-8 lg:gap-12">
            <DocsSidebar />
            <div className="flex-1 min-w-0">
              <DocsContent />
            </div>
            <DocsTOC />
          </div>
          <DocsFooter />
        </main>
      </div>
    </motion.div>
  );
}
