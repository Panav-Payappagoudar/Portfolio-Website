import { motion } from 'framer-motion';
import { Code, Database, Shield, Network, Brain, Cloud } from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend Development",
      icon: Code,
      skills: [
        { name: "React", level: 95 },
        { name: "Next.js", level: 90 },
        { name: "TypeScript", level: 88 },
        { name: "Tailwind CSS", level: 92 },
        { name: "Framer Motion", level: 85 },
        { name: "Vue.js", level: 75 }
      ]
    },
    {
      title: "Backend Development",
      icon: Database,
      skills: [
        { name: "Node.js", level: 90 },
        { name: "Python", level: 88 },
        { name: "Express", level: 85 },
        { name: "MongoDB", level: 82 },
        { name: "PostgreSQL", level: 80 },
        { name: "GraphQL", level: 75 }
      ]
    },
    {
      title: "Artificial Intelligence",
      icon: Brain,
      skills: [
        { name: "TensorFlow", level: 85 },
        { name: "PyTorch", level: 82 },
        { name: "Scikit-learn", level: 88 },
        { name: "OpenAI API", level: 90 },
        { name: "LangChain", level: 80 },
        { name: "Computer Vision", level: 75 }
      ]
    },
    {
      title: "Cloud & DevOps",
      icon: Cloud,
      skills: [
        { name: "Docker", level: 88 },
        { name: "Kubernetes", level: 82 },
        { name: "AWS", level: 85 },
        { name: "CI/CD", level: 90 },
        { name: "Terraform", level: 78 },
        { name: "Azure", level: 75 }
      ]
    },
    {
      title: "Cybersecurity",
      icon: Shield,
      skills: [
        { name: "Penetration Testing", level: 85 },
        { name: "Vulnerability Assessment", level: 88 },
        { name: "OWASP", level: 90 },
        { name: "SIEM", level: 82 },
        { name: "Encryption", level: 85 },
        { name: "Incident Response", level: 80 }
      ]
    },
    {
      title: "Web3 & Blockchain",
      icon: Network,
      skills: [
        { name: "Solidity", level: 80 },
        { name: "Ethereum", level: 82 },
        { name: "Smart Contracts", level: 85 },
        { name: "Web3.js", level: 78 },
        { name: "IPFS", level: 75 },
        { name: "DeFi", level: 70 }
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">Technical Arsenal</h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                className="bg-black border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white">{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="group/skill">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80 text-sm font-mono">{skill.name}</span>
                        <span className="text-white/60 text-xs">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: (index * 0.1) + (skillIndex * 0.05) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-2xl font-light mb-6">Founder's Note</h3>
          <div className="bg-black border border-white/10 rounded-xl p-8">
            <p className="text-white/80 leading-relaxed text-lg italic">
              "I build secure, scalable systems at the intersection of AI/ML, Cybersecurity, and Web3. 
              I believe in engineering that solves real-world problems through rapid prototyping and secure design. 
              My approach combines technical excellence with practical innovation, always keeping user security and 
              system reliability at the forefront."
            </p>
            <div className="mt-6 flex items-center justify-center">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;