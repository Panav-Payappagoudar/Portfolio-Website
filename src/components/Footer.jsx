import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Instagram, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import 'altcha';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    
    const formData = new FormData(e.target);
    const jsonBody = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormStatus('success');
        e.target.reset();
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
        setErrorMessage(data.message || "Something went wrong.");
        setTimeout(() => setFormStatus('idle'), 5000);
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage("Network error occurred. Please try again.");
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  return (
    <footer id="contact" className="py-20 px-6 bg-black border-t border-white/10">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">Get in Touch</h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Interested in working together or have a project in mind? 
            Send me a message below or reach out on my socials.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 mb-20 text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-2xl font-light mb-8 text-white/90">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/50 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-light"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/50 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-light"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/50 mb-2">Message</label>
                <textarea 
                  name="message" 
                  id="message" 
                  rows="4" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all resize-none font-light"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <altcha-widget challengeurl="/api/altcha" hidefooter hide-logo></altcha-widget>

              <button 
                type="submit" 
                disabled={formStatus === 'loading' || formStatus === 'success'}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-4 px-6 rounded-xl hover:bg-white/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {formStatus === 'idle' && <><Send className="w-4 h-4" /> Send Message</>}
                {formStatus === 'loading' && <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>}
                {formStatus === 'success' && <><CheckCircle className="w-4 h-4 text-green-600" /> Sent Successfully!</>}
                {formStatus === 'error' && <><XCircle className="w-4 h-4 text-red-600" /> Error Occurred</>}
              </button>
              
              {formStatus === 'error' && (
                <p className="text-red-400 text-sm mt-3 text-center">{errorMessage}</p>
              )}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center items-start md:items-center pt-10 md:pt-0"
          >
            <div className="w-full max-w-xs space-y-12">
              <div>
                <h3 className="text-xl font-light mb-6 text-white/90 md:text-center">Connect on Socials</h3>
                <div className="flex gap-4 md:justify-center">
                  <a 
                    href="https://github.com/Panav-Payappagoudar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border border-white/10 bg-white/5 rounded-full hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300"
                    aria-label="GitHub"
                  >
                    <Github className="w-6 h-6 text-white/80 hover:text-white" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/panav-payappagoudar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border border-white/10 bg-white/5 rounded-full hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-6 h-6 text-white/80 hover:text-white" />
                  </a>
                  <a 
                    href="https://instagram.com/panav.payappagoudar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 border border-white/10 bg-white/5 rounded-full hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-white/80 hover:text-white" />
                  </a>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <a 
                  href="mailto:panav@example.com" 
                  className="group flex flex-col items-start md:items-center gap-3 text-white/60 hover:text-white transition-colors"
                >
                  <div className="p-4 border border-white/10 bg-white/5 rounded-full group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-left md:text-center">
                    <p className="font-light text-sm text-white/40 mb-1">Or email directly</p>
                    <p className="font-medium tracking-wide">panav@example.com</p>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
          <p className="text-white/40 text-sm font-mono tracking-wider">
            © {currentYear} Panav Payappagoudar. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;