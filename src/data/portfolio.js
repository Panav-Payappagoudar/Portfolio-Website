export const portfolioData = {
    "personalInfo": {
        "name": "Panav Payappagoudar",
        "title": "Computer Science Undergraduate · VIT-AP University",
        "headline": "Building software across applied machine learning, distributed systems, and embedded robotics.",
        "subline": "I am a Computer Science undergraduate at VIT-AP University working on applied ML pipelines, simulation engines, and decentralized tooling. Outside engineering and campus research, I explore independent design projects and write technical breakdowns.",
        "location": "India",
        "institution": "VIT-AP University",
        "email": "panav.p@proton.me",
        "calendar": "https://cal.com/panav-payappagoudar/consulting",
        "medium": "https://panav-payappagoudar.medium.com/",
        "about": {
            "lead": "Computer Science and Engineering undergraduate at VIT-AP University (2024–2028).",
            "paragraphs": [
                "My interests center on systems programming, computer vision, geospatial data processing, and microcontroller robotics — particularly where mathematical modeling meets hands-on software engineering.",
                "Through campus research groups and hackathons, I have built projects ranging from collaborative multi-body physics simulations and satellite imagery change-detection pipelines to decentralized document storage and sensor-driven mobile robots.",
                "Beyond coursework and research, I run The Essentialist (a minimalist print-on-demand apparel project) and write technical notes on Medium and Hashnode documenting builds and system architectures.",
                "Currently, I am focused on deepening my systems programming skills in Rust and Python, refining computer vision workflows, and collaborating on challenging engineering internships and research."
            ]
        }
    },
    "socials": [
        { "name": "GitHub", "url": "https://github.com/Panav-Payappagoudar", "handle": "Panav-Payappagoudar" },
        { "name": "LinkedIn", "url": "https://linkedin.com/in/panav-payappagoudar", "handle": "panav-payappagoudar" },
        { "name": "Medium", "url": "https://panav-payappagoudar.medium.com/", "handle": "@panav-payappagoudar" },
        { "name": "Cal.com", "url": "https://cal.com/panav-payappagoudar/consulting", "handle": "panav-payappagoudar" }
    ],
    "projects": [
        {
            "id": "gravity-sandbox",
            "title": "Gravity Sandbox",
            "subtitle": "Real-time collaborative N-body astrophysics simulation",
            "year": "2025",
            "category": "Systems & Simulation",
            "status": "Hackathon Winner · SimVerse ’25",
            "featured": true,
            "description": "A collaborative astrophysics sandbox allowing multiple users to interact with multi-body gravitational mechanics in the browser. Built with a Host-Relay WebSocket architecture so one client computes physics state updates and broadcasts them to connected peers without running centralized physics servers.",
            "technologies": ["React", "Three.js", "Socket.io", "Node.js", "Physics Engine"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/SimVerse25",
            "liveUrl": "",
            "accolade": "SimVerse ’25 — 1st Place Winner",
            "specs": [
                "Host-Relay synchronization topology over WebSockets (Socket.io + Node.js)",
                "Client-side N-body gravitational simulation engine without server-side compute",
                "Interactive 3D browser visualization rendered using Three.js"
            ],
            "caseStudy": {
                "context": "Synchronizing multi-user gravitational simulations via centralized physics servers adds hosting overhead and network round-trip latency for every step.",
                "approach": "Implemented a Host-Relay architecture where one designated host client computes the N-body physics state and broadcasts updates to connected viewers sharing the Three.js scene.",
                "outcome": "Awarded 1st Place at SimVerse ’25 for delivering real-time collaborative physics interaction in the browser."
            }
        },
        {
            "id": "claim-agent",
            "title": "ClaimAgent",
            "subtitle": "Automated prior-authorization workflow prototype for clinical records",
            "year": "2026",
            "category": "Applied AI & Automation",
            "status": "Hackathon Prototype · Radiothon ’26",
            "featured": true,
            "description": "An autonomous prior-authorization prototype built for Radiothon ’26. Pairs Gemini 2.5 and retrieval-augmented generation (RAG) over clinical criteria with headless Playwright automation to extract patient context and populate payer portal forms.",
            "technologies": ["Gemini 2.5", "RAG", "Playwright", "Node.js", "REST API"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/ClaimAgent",
            "liveUrl": "",
            "accolade": "Radiothon ’26 — Top 5 Finalist",
            "specs": [
                "RAG pipeline matching clinical notes against policy rules via Gemini 2.5",
                "Headless Playwright browser automation for form completion and submission",
                "Tested end-to-end against a companion mock insurer backend repository"
            ],
            "caseStudy": {
                "context": "Healthcare prior authorization typically requires staff to manually cross-check clinical records (~90 minutes per request on manual flows) and copy entries into web forms.",
                "approach": "Built a multi-step hackathon prototype combining document retrieval with Gemini 2.5 and Playwright automation running against a simulated insurance backend.",
                "outcome": "Placed Top 5 Finalist at Radiothon ’26, compressing test case form preparation down to roughly 3 minutes."
            }
        },
        {
            "id": "geospatial-change",
            "title": "Geospatial Change Detection",
            "subtitle": "Multi-temporal satellite imagery & cloud-masking pipeline",
            "year": "2025",
            "category": "Computer Vision & GIS",
            "status": "Hackathon Prototype · ISRO Track",
            "featured": true,
            "description": "An automated remote sensing prototype engineered for the ISRO Hackathon to surface land-use and environmental changes across multi-temporal satellite captures. Preprocesses raster tiles with cloud masking and persists spatial change records into PostGIS.",
            "technologies": ["Python", "FastAPI", "PostGIS", "Rasterio", "Celery", "Vue.js"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/ISRO-Hackathon",
            "liveUrl": "",
            "accolade": "ISRO Hackathon Prototype",
            "specs": [
                "Raster preprocessing and cloud masking built on Python and Rasterio",
                "Asynchronous task queue using Celery and FastAPI for multi-date comparisons",
                "Spatial results persisted in PostGIS and displayed via a Vue.js interface"
            ],
            "caseStudy": {
                "context": "Manual inspection of multi-temporal satellite captures is slow and frequently disrupted by transient cloud cover causing false change alerts.",
                "approach": "Constructed a FastAPI and Celery pipeline using Rasterio to apply cloud-masking filters before comparing multi-date captures and saving spatial footprints to PostGIS.",
                "outcome": "Delivered a complete GIS monitoring prototype handling automated tile ingestion, filtering, and spatial alert generation."
            }
        },
        {
            "id": "securex",
            "title": "SecureX",
            "subtitle": "Decentralized document storage, smart contracts, and AI Q&A",
            "year": "2025",
            "category": "Systems & Security",
            "status": "Hackathon Prototype · Top 2%",
            "featured": true,
            "description": "A decentralized document management prototype created for Microsoft Triwizardathon. Integrates IPFS storage (via NFT.Storage), Ethereum smart contracts written in Solidity for access management, and LangChain-powered contextual document Q&A.",
            "technologies": ["React", "Node.js", "Solidity", "IPFS", "LangChain", "MongoDB"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Secure-X",
            "liveUrl": "https://final-secure-x-ix3r.vercel.app/",
            "accolade": "Microsoft Triwizardathon — Top 2% (23/1,290)",
            "specs": [
                "Decentralized content storage pinned to IPFS via NFT.Storage",
                "Access governance and audit state handled on Ethereum via Solidity contracts",
                "Contextual document querying built with LangChain alongside React and MongoDB"
            ],
            "caseStudy": {
                "context": "Conventional document vaults store files on single centralized providers with limited on-chain auditability for access permissions.",
                "approach": "Paired IPFS storage and Ethereum smart contracts in Solidity for decentralized file referencing and permission control, plus a LangChain Q&A workflow.",
                "outcome": "Ranked 23rd out of 1,290 competing teams (Top 2%) at Microsoft Triwizardathon with a live Vercel deployment."
            }
        },
        {
            "id": "human-following-robot",
            "title": "Autonomous Human-Following Robot",
            "subtitle": "Microcontroller mobile robotics prototype with sensor fusion",
            "year": "2025",
            "category": "Robotics & Hardware",
            "status": "Undergraduate Research Prototype",
            "featured": true,
            "description": "An embedded robotics research prototype built in the School of Electronics & Computer Science (VIT-AP University) under faculty supervision of Dr. Y. Narasimha Rao. Combines Arduino UNO R3 firmware, ultrasonic and infrared sensors, and differential-drive DC motors to track a moving human target.",
            "technologies": ["Arduino UNO", "Embedded C++", "IR & Ultrasonic Sensors", "Differential Drive"],
            "repoUrl": "",
            "liveUrl": "",
            "accolade": "Undergraduate Research · VIT-AP ECS",
            "specs": [
                "Sensor fusion logic pairing ultrasonic rangefinding with infrared proximity sensors",
                "Embedded C++ firmware running on Arduino UNO R3 with obstacle avoidance",
                "Differential-drive motor actuation driven by geared DC motors"
            ],
            "caseStudy": {
                "context": "Tracking a moving human target with low-cost sensors involves filtering noisy readings and reacting quickly to obstacles inside indoor spaces.",
                "approach": "Implemented embedded C++ sensor fusion on Arduino UNO R3 combining ultrasonic and IR arrays to steer differential-drive DC geared motors smoothly.",
                "outcome": "Demonstrated an autonomous hardware tracking prototype as part of undergraduate ECS departmental research."
            }
        },
        {
            "id": "omitfs",
            "title": "OmitFS",
            "subtitle": "Zero-dependency semantic filesystem experiment in Rust",
            "year": "2025",
            "category": "Systems Experiment",
            "status": "Experiment",
            "featured": false,
            "description": "An experimental filesystem written in Rust without external dependencies, exploring intent-based semantic navigation instead of nested hierarchical directories.",
            "technologies": ["Rust", "Systems", "Filesystems"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/OmitFS",
            "liveUrl": ""
        },
        {
            "id": "vectorgit",
            "title": "VectorGit",
            "subtitle": "Semantic code search and commit history tooling in Rust",
            "year": "2025",
            "category": "Developer Tooling",
            "status": "Prototype",
            "featured": false,
            "description": "An experimental Git tooling prototype in Rust exploring vector embeddings for semantic search across codebases and version control history.",
            "technologies": ["Rust", "AI", "Vector Search"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/VectorGit",
            "liveUrl": ""
        },
        {
            "id": "sketch-to-face",
            "title": "Sketch-to-Face Forensics",
            "subtitle": "Deep learning facial synthesis from hand-drawn sketches",
            "year": "2025",
            "category": "Computer Vision & ML",
            "status": "Club Research",
            "featured": false,
            "description": "A computer vision research project at the VIT-AP Machine Learning Club using TensorFlow, OpenCV, CNNs, and GANs to match and translate hand-drawn witness sketches into photorealistic faces.",
            "technologies": ["TensorFlow", "OpenCV", "CNNs", "GANs"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Sketch-to-face-forensics",
            "liveUrl": ""
        },
        {
            "id": "gridshield",
            "title": "GridShield",
            "subtitle": "Network security and threat detection prototype",
            "year": "2025",
            "category": "Security & Networking",
            "status": "Prototype",
            "featured": false,
            "description": "A network security framework prototype focused on threat detection and cryptographic traffic monitoring patterns in distributed computing environments.",
            "technologies": ["Security", "Networking", "Cryptography"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/GridShield",
            "liveUrl": ""
        },
        {
            "id": "clarity-ai",
            "title": "Clarity AI",
            "subtitle": "Hybrid ML pipeline for air quality CO forecasting",
            "year": "2025",
            "category": "Machine Learning",
            "status": "Academic / ML Project",
            "featured": false,
            "description": "An environmental ML application pairing Random Forest and Linear Regression models across 31 engineered features from the UCI Air Quality dataset to forecast CO levels, exposed via a Flask API and React/Chart.js frontend.",
            "technologies": ["Python", "Flask", "React", "scikit-learn", "Chart.js"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Clarity-AI",
            "liveUrl": ""
        },
        {
            "id": "healthguard-ai",
            "title": "HealthGuard AI",
            "subtitle": "Cross-platform mobile health triage & hospital locator",
            "year": "2025",
            "category": "Mobile Application",
            "status": "Hackathon Prototype",
            "featured": false,
            "description": "A Flutter mobile app built for the OpenAI Hackathon combining gpt-oss and Gemini for health consultations, offline-first local storage, and nearby hospital mapping via OpenStreetMap.",
            "technologies": ["Flutter", "Dart", "Gemini", "OpenStreetMap"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/HealthGuard_AI",
            "liveUrl": ""
        },
        {
            "id": "travel-booking",
            "title": "Jet2holidayz — Hotel Booking Platform",
            "subtitle": "Full-stack Django reservation system with task queues",
            "year": "2024",
            "category": "Full-Stack Web",
            "status": "Web Application",
            "featured": false,
            "description": "A hotel booking web application built with Django and Django REST Framework featuring real-time reservation workflows, role-based authentication, payment integration structure, and Celery background queues.",
            "technologies": ["Django", "DRF", "PostgreSQL", "Celery"],
            "repoUrl": "https://github.com/Panav-Payappagoudar/Travel-Booking",
            "liveUrl": ""
        }
    ],
    get featuredProjects() {
        return this.projects.filter(p => p.featured);
    },
    get secondaryProjects() {
        return this.projects.filter(p => !p.featured);
    },
    get flagshipProjects() {
        return this.featuredProjects;
    },
    get archivedProjects() {
        return this.projects;
    },
    "experience": [
        {
            "role": "Summer Scholar",
            "organization": "Amazon ML Summer School ’26",
            "period": "Jul 2026 – Aug 2026",
            "type": "Fellowship · Completed",
            "highlights": [
                "Selected from 135,000+ national applicants (~2.2% acceptance rate) for direct training from Amazon Applied Scientists.",
                "Studied deep learning architectures, probabilistic graphical models, and optimization methods in structured sessions."
            ]
        },
        {
            "role": "Open Source Contributor",
            "organization": "GirlScript Summer of Code (GSSoC ’25 & ’26)",
            "period": "2025 – 2026",
            "type": "Open Source · Selected & Active",
            "highlights": [
                "Selected contributor across consecutive 2025 and 2026 cohorts contributing to community open-source repositories.",
                "Worked on issue triage, bug fixes, feature pull requests, and technical documentation across collaborative codebases."
            ]
        },
        {
            "role": "Founder & Creative Director",
            "organization": "The Essentialist",
            "period": "Oct 2025 – Present",
            "type": "Independent Venture · Active",
            "highlights": [
                "Founded and manage a print-on-demand apparel storefront translating engineering themes into minimalist merchandise.",
                "Handled visual identity, typography layouts, product catalog design, and e-commerce storefront management."
            ]
        },
        {
            "role": "Technical Writer",
            "organization": "Medium & Hashnode",
            "period": "Oct 2025 – Present",
            "type": "Writing · Active",
            "highlights": [
                "Publish hands-on technical articles and project walkthroughs covering applied ML, Web3, cybersecurity, and systems engineering."
            ]
        },
        {
            "role": "ML Researcher — Deep Learning & CV Team",
            "organization": "The Machine Learning Club, VIT-AP",
            "period": "Aug 2025 – Present",
            "type": "Campus Research · Active",
            "highlights": [
                "Built deep learning image-translation workflows (Sketch-to-Face Forensics) with TensorFlow, OpenCV, CNNs, and GANs.",
                "Worked on LiDAR, Digital Elevation Models (DEM), and U-Net segmentation pipelines for solar utilization and terrain mapping."
            ]
        },
        {
            "role": "Undergraduate Robotics Researcher",
            "organization": "VIT-AP University — ECS Department",
            "period": "Jul 2025 – Present",
            "type": "Academic Research · Active",
            "highlights": [
                "Building an autonomous human-following mobile robot under the faculty supervision of Dr. Y. Narasimha Rao.",
                "Wrote embedded C++ firmware on Arduino UNO R3 integrating ultrasonic/IR sensor fusion, obstacle avoidance, and differential drive."
            ]
        },
        {
            "role": "AI & Cloud Intern",
            "organization": "IBM SkillsBuild",
            "period": "Sep 2025 – Oct 2025",
            "type": "Internship · Completed",
            "highlights": [
                "Completed a structured AI and cloud engineering internship program covering containerized workloads and foundational cloud deployment."
            ]
        },
        {
            "role": "Data Analyst Intern",
            "organization": "VOIS & Vodafone Idea Foundation",
            "period": "Sep 2025 – Oct 2025",
            "type": "Internship · Completed",
            "highlights": [
                "Built data processing workflows integrating language models for conversational transcript analysis and automated summarization."
            ]
        },
        {
            "role": "Technical Team Associate",
            "organization": "The Machine Learning Club, VIT-AP",
            "period": "Nov 2024 – Aug 2025",
            "type": "Student Research · Completed",
            "highlights": [
                "Contributed to data preprocessing, raster tiling, and baseline U-Net models for solar mapping and sustainability exploration."
            ]
        },
        {
            "role": "Freelance Technical Tutor & Peer Mentor",
            "organization": "Independent",
            "period": "Sep 2024 – Present",
            "type": "Mentorship · Active",
            "highlights": [
                "Tutored 25+ students in Java, Python, C++, and Data Structures & Algorithms, and supported peers with debugging and coding interview preparation."
            ]
        }
    ],
    "education": [
        {
            "institution": "VIT-AP University",
            "degree": "B.Tech in Computer Science and Engineering",
            "period": "2024 – 2028",
            "detail": "School of Electronics & Computer Science (ECS Department). Member of the Machine Learning Club and ECS Robotics Research Group."
        },
        {
            "institution": "Sri Chaitanya Techno School",
            "degree": "Intermediate (MPC & Computer Science)",
            "period": "2022 – 2024",
            "detail": "Mathematics, Physics, Chemistry, and Python foundations."
        }
    ],
    "achievements": [
        {
            "title": "Amazon ML Summer School ’26",
            "org": "Amazon",
            "date": "Jul 2026",
            "status": "Selected & Completed",
            "detail": "Selected from over 135,000 applicants (~2.2% acceptance rate) for machine learning coursework and sessions led by Amazon Applied Scientists."
        },
        {
            "title": "SimVerse ’25 Hackathon — 1st Place",
            "org": "SimVerse",
            "date": "2025",
            "status": "Winner",
            "detail": "Won 1st place for Gravity Sandbox, a collaborative real-time N-body physics engine built with WebSockets and Three.js."
        },
        {
            "title": "Microsoft Triwizardathon — Top 2% (23rd / 1,290)",
            "org": "Microsoft",
            "date": "2025",
            "status": "Finalist",
            "detail": "Ranked 23rd out of 1,290 engineering teams for SecureX, a decentralized document management and Q&A prototype using IPFS, Solidity, and LangChain."
        },
        {
            "title": "Radiothon ’26 — Top 5",
            "org": "Radiothon",
            "date": "2026",
            "status": "Finalist",
            "detail": "Placed Top 5 finalist with ClaimAgent, an automated clinical prior-authorization workflow prototype using Gemini 2.5 RAG and Playwright."
        },
        {
            "title": "IIT Bombay Techfest — Double Finalist",
            "org": "IIT Bombay",
            "date": "2025 – 2026",
            "status": "Finalist",
            "detail": "Reached the finals across both the Aarohan and AWS ImpactX competition tracks."
        },
        {
            "title": "Matrix Hackathon — Top 10",
            "org": "Matrix Hackathon",
            "date": "2025",
            "status": "Finalist",
            "detail": "Finished inside the Top 10 teams in the Matrix Hackathon."
        },
        {
            "title": "GirlScript Summer of Code (GSSoC ’25 & ’26)",
            "org": "GirlScript Foundation",
            "date": "2025 – 2026",
            "status": "Selected Contributor",
            "detail": "Selected across consecutive 2025 and 2026 open-source contribution cohorts."
        },
        {
            "title": "Overall Hackathon Record",
            "org": "Collegiate & National Events",
            "date": "2024 – 2026",
            "status": "Track Record",
            "detail": "1× Winner, 2× Runner-up, and 11× Finalist across university and national developer hackathons."
        },
        {
            "title": "Six Sigma White Belt Certification",
            "org": "Quality Management",
            "date": "2025",
            "status": "Certified",
            "detail": "Completed introductory White Belt certification covering process improvement and quality control fundamentals."
        }
    ],
    "capabilities": [
        {
            "discipline": "AI, ML & Computer Vision",
            "description": "Model training, vision pipelines, and applied LLM workflows.",
            "skills": ["PyTorch", "TensorFlow", "OpenCV", "scikit-learn", "LLMs / Gemini", "RAG Pipelines", "GANs / CNNs"]
        },
        {
            "discipline": "Geospatial & Scientific Computing",
            "description": "Raster processing, spatial databases, and numerical simulations.",
            "skills": ["Rasterio", "GDAL", "NumPy", "PostGIS", "Three.js / WebGL", "MATLAB"]
        },
        {
            "discipline": "Systems & Embedded Robotics",
            "description": "Userspace experiments, microcontroller firmware, and sensor integration.",
            "skills": ["Rust", "C / C++", "Embedded C++", "Arduino UNO", "Linux", "Sensor Fusion"]
        },
        {
            "discipline": "Backend & Full-Stack",
            "description": "Web services, task queues, and cross-platform interfaces.",
            "skills": ["Python", "FastAPI", "Django / DRF", "Node.js", "PostgreSQL", "Redis", "Celery", "React", "Flutter / Dart", "Docker"]
        },
        {
            "discipline": "Security & Web3",
            "description": "Decentralized storage patterns, smart contracts, and input hardening.",
            "skills": ["Solidity", "IPFS", "Cryptographic Verification", "Networking", "Secure API Design"]
        }
    ]
};
