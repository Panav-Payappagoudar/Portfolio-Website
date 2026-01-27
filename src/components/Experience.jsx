import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: "Software Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      period: "2023 - Present",
      type: "Full-time",
      description: "Developing scalable web applications using React, Node.js, and cloud technologies. Led development of AI-powered analytics dashboard.",
      achievements: [
        "Reduced application load time by 40% through performance optimization",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Mentored 3 junior developers in modern development practices",
        "Led migration from monolithic to microservices architecture"
      ],
      technologies: ["React", "Node.js", "AWS", "Docker", "MongoDB"]
    },
    {
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      period: "2021 - 2023",
      type: "Full-time",
      description: "Built end-to-end solutions for fintech applications. Specialized in secure authentication and real-time data processing.",
      achievements: [
        "Developed microservices architecture serving 100K+ users",
        "Implemented OAuth 2.0 authentication for enterprise clients",
        "Created automated testing suite increasing code coverage to 95%",
        "Optimized database queries improving response time by 70%"
      ],
      technologies: ["Next.js", "Python", "PostgreSQL", "Redis", "Kubernetes"]
    },
    {
      title: "Frontend Developer Intern",
      company: "Digital Innovations Inc",
      location: "New York, NY",
      period: "2020 - 2021",
      type: "Internship",
      description: "Worked on responsive web applications and collaborated with design teams to implement pixel-perfect UI components.",
      achievements: [
        "Built 15+ responsive components used across multiple projects",
        "Improved accessibility compliance to WCAG 2.1 standards",
        "Reduced CSS bundle size by 30% through code splitting",
        "Implemented design system used by 50+ developers"
      ],
      technologies: ["React", "TypeScript", "Sass", "Jest", "Storybook"]
    }
  ];

  return (
    <section id="experience" className="py-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">Career Path</h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
        </motion.div>

        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div 
              key={index}
              className="relative group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-blue-500/20 to-transparent"></div>
              
              {/* Timeline dot */}
              <div className="absolute left-0 top-6 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 border-2 border-black group-hover:scale-125 transition-transform"></div>
              
              <div className="ml-12">
                <div className="bg-black border border-white/10 rounded-xl p-8 hover:border-white/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-medium text-white mb-2">{exp.title}</h3>
                      <h4 className="text-xl text-blue-500 font-medium mb-3">{exp.company}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {exp.location}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {exp.period}
                        </div>
                        <span>•</span>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">
                          {exp.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-white/70 mb-6 leading-relaxed">{exp.description}</p>
                  
                  {/* Achievements */}
                  <div className="mb-6">
                    <h5 className="text-white font-medium mb-3">Key Achievements:</h5>
                    <ul className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-3 text-white/60 text-sm">
                          <span className="text-blue-500 mt-1 flex-shrink-0">›</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Technologies */}
                  <div>
                    <h5 className="text-white font-medium mb-3">Technologies:</h5>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full text-xs font-mono hover:bg-white/10 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;