import { motion } from 'framer-motion';
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react';

const Education = () => {
  const educationData = [
    {
      degree: "Bachelor of Technology",
      field: "Computer Science and Engineering",
      specialization: "Artificial Intelligence and Machine Learning",
      institution: "VIT-AP University",
      location: "Amaravati, Andhra Pradesh, India",
      period: "2021 - 2025",
      gpa: "9.2/10",
      achievements: [
        "Dean's List - 2022, 2023",
        "President, AI Club",
        "Research Assistant - Machine Learning Lab",
        "Top 5% in Computer Science Department",
        "Recipient of Academic Excellence Scholarship"
      ],
      coursework: [
        "Machine Learning", "Deep Learning", "Computer Vision", 
        "Natural Language Processing", "Data Structures & Algorithms",
        "Database Management Systems", "Operating Systems", 
        "Computer Networks", "Cybersecurity Fundamentals"
      ],
      projects: [
        "AI-Powered Healthcare Diagnosis System",
        "Blockchain-based Supply Chain Management",
        "Real-time Network Intrusion Detection System"
      ]
    },
    {
      degree: "Higher Secondary Education",
      field: "Science (PCM)",
      specialization: "Computer Science",
      institution: "Delhi Public School",
      location: "New Delhi, India",
      period: "2019 - 2021",
      gpa: "95.2%",
      achievements: [
        "National Level Mathematics Olympiad Winner",
        "School Topper in Computer Science",
        "Captain, Robotics Club",
        "JEE Mains Qualifier (Top 1%)"
      ],
      coursework: [
        "Physics", "Chemistry", "Mathematics", 
        "Computer Science", "English", "Physical Education"
      ],
      projects: [
        "Automated Attendance System using Face Recognition",
        "Smart Home Automation using IoT",
        "Basic Chatbot Implementation"
      ]
    }
  ];

  return (
    <section id="education" className="py-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6">Academic Background</h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
        </motion.div>

        <div className="space-y-12">
          {educationData.map((edu, index) => (
            <motion.div 
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <div className="bg-black border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <GraduationCap className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-medium text-white mb-2">{edu.degree}</h3>
                      <h4 className="text-xl text-blue-500 font-medium mb-1">{edu.field}</h4>
                      {edu.specialization && (
                        <p className="text-white/70 mb-3">{edu.specialization}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {edu.institution}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {edu.period}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Award size={14} />
                          <span className="text-blue-500 font-medium">{edu.gpa}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-8">
                  <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-500" />
                    Academic Achievements
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {edu.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/70 text-sm">
                        <span className="text-blue-500">•</span>
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coursework */}
                <div className="mb-8">
                  <h5 className="text-white font-medium mb-4">Key Coursework</h5>
                  <div className="flex flex-wrap gap-2">
                    {edu.coursework.map((course, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full text-xs hover:bg-white/10 transition-colors"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h5 className="text-white font-medium mb-4">Notable Projects</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {edu.projects.map((project, i) => (
                      <div 
                        key={i} 
                        className="p-3 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-white/10 transition-colors"
                      >
                        {project}
                      </div>
                    ))}
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

export default Education;