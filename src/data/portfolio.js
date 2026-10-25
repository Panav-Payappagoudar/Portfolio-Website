export const portfolioData = {
    "personalInfo": {
        "name": "Panav Payappagoudar",
        "title": "Software Developer & Systems Engineer",
        "headline": "Software engineer, researcher, and builder working on distributed systems, numerical simulations, and applied machine learning.",
        "subline": "Undergraduate researcher in the School of Electronics & Computer Science at VIT-AP University and Amazon ML Summer Scholar ’26. Exploring deterministic simulation engines, satellite computer vision pipelines, and resilient software architectures.",
        "location": "India",
        "institution": "VIT-AP University",
        "email": "panav.p@proton.me",
        "calendar": "https://cal.com/panav-payappagoudar/consulting",
        "medium": "https://panav-payappagoudar.medium.com/",
        "about": {
            "lead": "I am an engineer and researcher drawn to software that requires mathematical rigor, mechanical sympathy, and disciplined product craft.",
            "paragraphs": [
                "My work focuses on systems where deterministic reliability matters: low-level numerical algorithms for multi-body orbital simulations, automated computer vision pipelines analyzing multi-spectral satellite passes, sensor fusion firmware for autonomous robotics, and zero-trust cryptographic architectures.",
                "Currently conducting undergraduate research in the School of Electronics and Computer Science at VIT-AP University under faculty mentorship, and active in the Machine Learning Club (Deep Learning & Computer Vision team). Outside academic research, I founded The Essentialist, an independent apparel venture exploring minimalist typography, and write technical walkthroughs on Medium."
            ]
        }
    },
    "socials": [
        { "name": "GitHub", "url": "https://github.com/Panav-Payappagoudar", "handle": "Panav-Payappagoudar" },
        { "name": "LinkedIn", "url": "https://linkedin.com/in/panav-payappagoudar", "handle": "panav-payappagoudar" },
        { "name": "Medium", "url": "https://panav-payappagoudar.medium.com/", "handle": "@panav-payappagoudar" },
        { "name": "Cal.com", "url": "https://cal.com/panav-payappagoudar/consulting", "handle": "panav-payappagoudar" }
    ],
    // Unified Project Collection: All 12 projects in one single cohesive presentation
    "projects": [
        {
            "id": "gravity-sandbox",
            "title": "Gravity Sandbox",
            "subtitle": "Real-time collaborative N-body astrophysics simulation engine",
            "year": "2025",
            "category": "Systems & Simulation",
            "description": "A collaborative astrophysics sandbox enabling distributed users to interactively simulate multi-body gravitational mechanics in real time with zero server compute. Implemented Velocity Verlet numerical integration with adaptive timestep subdivision and an ultra-low latency host-relay state delta broadcast protocol over WebSockets.",
            "technologies": ["WebGL", "Three.js", "Socket.io", "Node.js", "Physics Engine", "JavaScript"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/SimVerse25",
            "liveUrl": "",
            "accolade": "SimVerse ’25 Winner",
            "caseStudy": {
                "context": "Simulating high-body gravitational dynamics in real time requires $O(N^2)$ force evaluations per timestep. Running centralized physics servers for concurrent multi-user sessions introduces latency lag, server bandwidth costs, and synchronization jitter.",
                "approach": "Engineered a peer-coordinated Host-Relay topology over WebSockets. One designated host client computes the numerical integration step while broadcasting compressed delta state vectors to passive observer clients with client-side drift compensation. Built the rendering layer in WebGL with dynamic orbital trail buffers.",
                "outcome": "Achieved steady 60 FPS client rendering with up to 150 concurrent celestial bodies and sub-50ms synchronization across peer clients without server compute overhead."
            }
        },
        {
            "id": "claim-agent",
            "title": "ClaimAgent",
            "subtitle": "Autonomous clinical prior-authorization intelligence platform",
            "year": "2026",
            "category": "Applied AI & Automation",
            "description": "An agentic clinical automation platform that compresses healthcare prior-authorization processing from 90 minutes to under 3 minutes. Fuses Gemini 2.5 multimodal document extraction with deterministic medical rule engines and headless browser automation to navigate complex insurer submission portals without hallucinations.",
            "technologies": ["Gemini 2.5", "Playwright", "RAG", "Node.js", "Express", "REST API"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/ClaimAgent",
            "liveUrl": "",
            "accolade": "Radiothon ’26 Finalist (Top 5)",
            "caseStudy": {
                "context": "Healthcare prior authorization requires clinicians to manually inspect hundreds of unstructured medical records, verify treatments against insurer clinical criteria, and re-enter data into antiquated payer web forms.",
                "approach": "Designed a three-tier pipeline: (1) Multimodal ingestion and RAG summarization matching patient clinical notes against insurer policy guidelines; (2) Deterministic guardrail layer enforcing Zero-Hallucination verification; (3) Headless Playwright RPA automating questionnaire completion and citation attachment.",
                "outcome": "Reduced processing cycle time by 96.7% (90 minutes to ~3 minutes) with 100% adherence to deterministic clinical decision checks."
            }
        },
        {
            "id": "geospatial-change",
            "title": "Geospatial Change Detection",
            "subtitle": "Automated satellite remote sensing & spectral difference analysis",
            "year": "2025",
            "category": "Computer Vision & GIS",
            "description": "An automated remote sensing pipeline for monitoring land-use changes, deforestation, and infrastructure expansion across multi-temporal Sentinel-2 L2A satellite passes. Employs QA60 cloud and shadow bitmasking to eliminate false positives, computes multi-spectral indices (NDVI, NDBI) via Rasterio and GDAL, and vectorizes polygon differences into PostGIS.",
            "technologies": ["Python", "FastAPI", "PostGIS", "Rasterio", "GDAL", "NumPy", "Vue.js"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/ISRO-Hackathon",
            "liveUrl": "",
            "accolade": "ISRO Hackathon National Pipeline",
            "caseStudy": {
                "context": "Large-scale satellite monitoring suffers from high rates of false-positive change alerts caused by transient cloud shadows, seasonal vegetation shifts, and atmospheric variation.",
                "approach": "Built automated bitmasking filters parsing QA60 metadata bands to eliminate ephemeral cloud shadows. Implemented radiometric normalization across multi-date passes and calculated localized spectral difference matrices, converting polygon boundaries into spatial vectors served by an asynchronous FastAPI backend.",
                "outcome": "Eliminated 92% of transient cloud artifacts across multi-date satellite passes while maintaining sub-pixel radiometric consistency."
            }
        },
        {
            "id": "securex",
            "title": "SecureX",
            "subtitle": "Zero-trust document infrastructure with decentralized access control",
            "year": "2025",
            "category": "Systems & Security",
            "description": "A zero-trust document security system pairing client-side Web Crypto AES-GCM-256 encryption, IPFS decentralized content addressing, and Ethereum smart contracts for immutable access governance and tamper-proof audit trails.",
            "technologies": ["Solidity", "Ethereum", "IPFS", "Web Crypto API", "React", "Ethers.js"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Secure-X",
            "liveUrl": "https://final-secure-x-ix3r.vercel.app/",
            "accolade": "Microsoft Triwizardathon Top 2%",
            "caseStudy": {
                "context": "Centralized document repositories leave sensitive files vulnerable to insider access, unauthorized administrative tampering, and credential compromise.",
                "approach": "Documents are encrypted entirely inside the client's browser before transmission using 256-bit AES-GCM keys. Ciphertext is pinned to IPFS generating an immutable CID, while cryptographic hash verification and role permissions are executed on-chain via Solidity smart contracts.",
                "outcome": "Ranked in the top 2% (23 out of 1,290 competing engineering teams) at Microsoft Triwizardathon with zero plaintext server transmission."
            }
        },
        {
            "id": "omitfs",
            "title": "OmitFS",
            "subtitle": "Zero-dependency semantic filesystem prototype in Rust",
            "year": "2025",
            "category": "Systems Engineering",
            "description": "An experimental userspace filesystem written in Rust exploring intent-based and semantic file addressability rather than rigid hierarchical directory trees. Implements custom POSIX inode mappings and metadata indexing to examine alternative storage paradigms.",
            "technologies": ["Rust", "Systems Programming", "POSIX", "Filesystem Internals"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/OmitFS",
            "liveUrl": ""
        },
        {
            "id": "vectorgit",
            "title": "VectorGit",
            "subtitle": "Semantic code search and commit history embedding layer",
            "year": "2025",
            "category": "Developer Tooling",
            "description": "A Git metadata extension written in Rust that embeds commit diffs, tree hashes, and pull request changes into a vector space. Enables semantic natural-language search across large code repository histories without relying on exact commit message string matches.",
            "technologies": ["Rust", "Vector Embeddings", "Git Internals", "Search Engines"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/VectorGit",
            "liveUrl": ""
        },
        {
            "id": "human-following-robot",
            "title": "Autonomous Human-Following Robot",
            "subtitle": "Target-tracking mobile robotics platform with sensor fusion",
            "year": "2025",
            "category": "Robotics & Hardware",
            "description": "Mobile robotics tracking platform developed under faculty mentorship at VIT-AP University (ECS Department). Combines Arduino microcontroller firmware, ultrasonic and infrared sensor fusion arrays, differential drive kinematics, and real-time obstacle avoidance loops.",
            "technologies": ["Arduino", "Embedded C++", "Sensor Fusion", "Robotics Kinematics"],
            "repoUrl": "https://github.com/Panav-Payappagoudar",
            "liveUrl": ""
        },
        {
            "id": "sketch-to-face",
            "title": "Sketch-to-Face Forensics",
            "subtitle": "Deep learning facial reconstruction and forensic matching",
            "year": "2025",
            "category": "Computer Vision & ML",
            "description": "Forensic reconstruction pipeline developed at VIT-AP Machine Learning Club. Employs TensorFlow, convolutional neural networks, and generative adversarial networks (GANs) for image-to-image translation, synthesizing photorealistic faces from sparse forensic witness sketches.",
            "technologies": ["TensorFlow", "OpenCV", "GANs", "CNNs", "Python"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Sketch-to-face-forensics/tree/main",
            "liveUrl": ""
        },
        {
            "id": "gridshield",
            "title": "GridShield",
            "subtitle": "Distributed network security and real-time threat detection",
            "year": "2025",
            "category": "Security & Networks",
            "description": "Real-time threat detection and network security telemetry framework built for high-throughput node clusters. Evaluates packet headers, traffic flow irregularities, and connection patterns to flag anomalous behavior across distributed microservices.",
            "technologies": ["Python", "Networking", "Cryptography", "Distributed Systems"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/GridShield",
            "liveUrl": ""
        },
        {
            "id": "clarity-ai",
            "title": "Clarity AI",
            "subtitle": "Particulate matter & air quality prediction pipeline",
            "year": "2025",
            "category": "Machine Learning",
            "description": "Environmental analytics system forecasting atmospheric particulate matter (PM2.5 / PM10). Evaluates 31 engineered meteorological and atmospheric parameters using Random Forest and linear regression models, served through a lightweight Flask API.",
            "technologies": ["Python", "Scikit-Learn", "Flask", "React", "NumPy"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Clarity-AI",
            "liveUrl": ""
        },
        {
            "id": "healthguard-ai",
            "title": "HealthGuard AI",
            "subtitle": "Mobile healthcare consultation app with offline caching",
            "year": "2025",
            "category": "Mobile Systems",
            "description": "Cross-platform healthcare consultation mobile application built in Flutter. Implements an offline-first local medical symptom cache, AI-assisted preliminary triage, and OpenStreetMap integration for emergency hospital routing.",
            "technologies": ["Flutter", "Dart", "OpenStreetMap", "Mobile Architecture"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/HealthGuard_AI",
            "liveUrl": ""
        },
        {
            "id": "travel-booking",
            "title": "Distributed Booking System",
            "subtitle": "Asynchronous reservation engine with queue brokers",
            "year": "2024",
            "category": "Backend Systems",
            "description": "High-concurrency reservation architecture built in Django. Features asynchronous booking workers managed by Celery and Redis, role-based authorization, ACID transaction compliance, and automated email ticketing relays.",
            "technologies": ["Django", "PostgreSQL", "Redis", "Celery", "Python"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Travel-Booking",
            "liveUrl": ""
        }
    ],
    // Backward compatibility aliases
    get flagshipProjects() {
        return this.projects.filter(p => p.caseStudy);
    },
    get archivedProjects() {
        return this.projects;
    },
    "experience": [
        {
            "role": "Machine Learning Researcher – Computer Vision",
            "organization": "Machine Learning Club, VIT-AP",
            "period": "Aug 2025 – Present",
            "type": "Academic Research",
            "description": "Researching deep learning pipelines for image translation, forensic facial reconstruction using GANs and CNNs, and multi-spectral terrain segmentation algorithms using Sentinel-2 and LiDAR datasets."
        },
        {
            "role": "Undergraduate Robotics Researcher",
            "organization": "VIT-AP University – School of Electronics & Computer Science",
            "period": "Jul 2025 – Present",
            "type": "Academic Research",
            "description": "Developing autonomous tracking robots under faculty mentorship (Dr. Y. Narasimha Rao). Implementing embedded sensor fusion routines (ultrasonic and IR arrays), obstacle avoidance loops, and differential drive motor kinematics in embedded C++."
        },
        {
            "role": "Open Source Contributor",
            "organization": "GirlScript Summer of Code (GSSoC ’25 & ’26)",
            "period": "May 2026 – Present",
            "type": "Open Source",
            "description": "Selected contributor across consecutive cohorts for collaborative developer infrastructure, documentation, and performance regression fixes."
        },
        {
            "role": "Founder & Creative Director",
            "organization": "The Essentialist",
            "period": "Oct 2025 – Present",
            "type": "Independent Venture",
            "description": "Directing an independent print-on-demand venture translating engineering and developer aesthetics into minimalist merchandise. Architected the e-commerce storefront, supply chain workflows, and brand identity."
        },
        {
            "role": "Technical Writer",
            "organization": "Medium & Hashnode",
            "period": "Oct 2025 – Present",
            "type": "Writing",
            "description": "Publishing technical walkthroughs and engineering teardowns dissecting applied machine learning, systems architecture, and cryptographic protocols."
        },
        {
            "role": "AI & Cloud Engineering Intern",
            "organization": "IBM SkillsBuild",
            "period": "Sep 2025 – Oct 2025",
            "type": "Apprenticeship",
            "description": "Completed enterprise cloud architecture track focusing on containerized microservices and AI workload orchestration."
        },
        {
            "role": "Conversational Data Intern",
            "organization": "Vodafone Idea Foundation",
            "period": "Sep 2025 – Oct 2025",
            "type": "Apprenticeship",
            "description": "Engineered data transformation workflows integrating language models for conversational transcript analysis and automated summarization."
        }
    ],
    "education": [
        {
            "institution": "VIT-AP University",
            "degree": "B.Tech in Computer Science and Engineering",
            "period": "2024 – 2028",
            "detail": "Undergraduate Researcher in School of Electronics & Computer Science (ECS Department). Active researcher in Machine Learning Club (Deep Learning & Computer Vision associate)."
        }
    ],
    "achievements": [
        {
            "title": "Amazon ML Summer Scholar ’26",
            "org": "Amazon",
            "date": "2026",
            "detail": "Selected from 135,000+ national applicants (~2.2% acceptance rate) for direct mentorship from Amazon Machine Learning Scientists."
        },
        {
            "title": "SimVerse ’25 Hackathon — 1st Place Winner",
            "org": "SimVerse",
            "date": "2025",
            "detail": "Engineered Gravity Sandbox: real-time collaborative N-body astrophysics simulation using Velocity Verlet numerical integration and WebGL."
        },
        {
            "title": "Microsoft Triwizardathon — Top 2%",
            "org": "Microsoft",
            "date": "2025",
            "detail": "Ranked 23rd out of 1,290 competing engineering teams with SecureX: zero-trust document security infrastructure."
        },
        {
            "title": "Radiothon ’26 — Top 5 Finalist",
            "org": "Radiothon",
            "date": "2026",
            "detail": "Built ClaimAgent: autonomous clinical prior-authorization intelligence with Gemini 2.5 and Playwright RPA."
        },
        {
            "title": "IIT Bombay Techfest — Double Finalist",
            "org": "IIT Bombay",
            "date": "2025 – 2026",
            "detail": "Finalist across both Aarohan and AWS ImpactX engineering tracks for cloud infrastructure design."
        }
    ],
    "capabilities": [
        {
            "discipline": "Systems & Distributed Software",
            "description": "Low-level prototypes, deterministic numerical algorithms, and concurrent services.",
            "skills": ["Rust", "Python", "C / C++", "Node.js", "POSIX / Linux", "REST & WebSockets", "Host-Relay Protocols"]
        },
        {
            "discipline": "Machine Learning & Vision",
            "description": "Computer vision pipelines, remote sensing raster math, and generative models.",
            "skills": ["PyTorch", "TensorFlow", "OpenCV", "GDAL / Rasterio", "Gemini API & LLMs", "RAG", "Scikit-Learn"]
        },
        {
            "discipline": "Robotics & Hardware",
            "description": "Microcontroller firmware, sensor fusion arrays, and mobile tracking kinematics.",
            "skills": ["Arduino UNO", "Embedded C++", "Sensor Fusion (IR / Ultrasonic)", "Differential Drive Control"]
        },
        {
            "discipline": "Infrastructure & Security",
            "description": "Databases, container orchestration, and cryptographic access protocols.",
            "skills": ["PostgreSQL & PostGIS", "Docker", "Redis", "Solidity", "Web Crypto AES-GCM", "IPFS"]
        }
    ]
};
