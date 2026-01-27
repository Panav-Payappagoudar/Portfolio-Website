import { motion } from 'framer-motion';

const Founder = () => {
  return (
    <section id="venture" className="py-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">The Essentialist</h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div>
            <p className="text-white/60 mb-6 leading-relaxed">
              My Venture. An independent design venture focused on creating original, minimalist apparel and goods. 
              Operating on a capital-efficient, print-on-demand model to eliminate waste and financial risk.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium mb-1">Design-First</h4>
                  <p className="text-white/50 text-sm">Developing original visual concepts and typography for modern builders.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium mb-1">E-Commerce</h4>
                  <p className="text-white/50 text-sm">Managing end-to-end logistics, product listings, and D2C strategy.</p>
                </div>
              </div>
            </div>
            <a 
              href="https://the-essentialist-2.creator-spring.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors font-mono text-sm"
            >
              Visit Store →
            </a>
          </div>
          
          <div className="bg-black border border-white/10 rounded-lg p-6">
            <pre className="text-xs text-white/70 overflow-x-auto">
              <code>{`export const TheEssentialist = defineConfig({
  // Core values
  mission: "Bridge design & dev culture",
  founded: 2025,
  services: [
    "Bad Swag Solver",
    "Visual Identity"
  ],
  stack: {
    design: "Minimalist",
    inventory: null,
    fulfillment: "On-Demand"
  },
  status: "Open for Collaboration",
  contact: async () => {
    return "panav@essentialist.com"
  }
})`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Founder;