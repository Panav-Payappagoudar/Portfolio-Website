import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: "AI-Powered Analytics Dashboard",
    description: "Real-time data visualization with machine learning insights",
    tags: ["React", "D3.js", "Python"],
    image: "https://placehold.co/600x400/000000/ffffff?text=Project+1",
    github: "#",
    live: "#",
    span: "col-span-2"
  },
  {
    id: 2,
    title: "Blockchain Identity Verification",
    description: "Decentralized identity management system",
    tags: ["Solidity", "Web3", "React"],
    image: "https://placehold.co/300x300/000000/ffffff?text=Project+2",
    github: "#",
    live: "#"
  },
  {
    id: 3,
    title: "Cybersecurity Threat Detection",
    description: "AI-driven network security monitoring",
    tags: ["Python", "TensorFlow", "Kubernetes"],
    image: "https://placehold.co/300x300/000000/ffffff?text=Project+3",
    github: "#",
    live: "#"
  },
  {
    id: 4,
    title: "E-Commerce Platform",
    description: "Full-stack shopping experience with real-time updates",
    tags: ["Next.js", "Node.js", "MongoDB"],
    image: "https://placehold.co/600x300/000000/ffffff?text=Project+4",
    github: "#",
    live: "#",
    span: "col-span-2"
  }
];

const BentoGrid = () => {
  return (
    <section id="projects" className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">
            Selected <span className="text-blue-500">Works</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">
            A collection of projects that showcase my technical expertise and creative problem-solving.
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className={`bg-black border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${project.span || ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: project.id * 0.1 }}
            >
              <div className="mb-4">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 border border-white/5"
                />
                <h3 className="text-xl font-light mb-2 text-blue-500">
                  {project.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {project.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-4">
                <motion.a
                  href={project.github}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-mono text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Github size={16} />
                  Code
                </motion.a>
                <motion.a
                  href={project.live}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-mono text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <ExternalLink size={16} />
                  Live
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;