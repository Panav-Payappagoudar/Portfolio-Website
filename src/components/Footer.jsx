import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="py-16 px-6 bg-black border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">Get in Touch</h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Interested in working together or have a project in mind? 
            Feel free to reach out for collaborations, opportunities, or just a friendly chat.
          </p>
        </motion.div>

        <motion.div 
          className="flex justify-center gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <a 
            href="https://github.com/Panav-Payappagoudar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5 text-white/70 hover:text-white" />
          </a>
          <a 
            href="https://linkedin.com/in/panav-payappagoudar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-white/70 hover:text-white" />
          </a>
          <a 
            href="mailto:panav@example.com" 
            className="p-3 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            aria-label="Email"
          >
            <Mail className="w-5 h-5 text-white/70 hover:text-white" />
          </a>
          <a 
            href="https://instagram.com/panav.payappagoudar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5 text-white/70 hover:text-white" />
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
          <p className="text-white/50 text-sm font-mono">
            © {currentYear} Panav Payappagoudar. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;