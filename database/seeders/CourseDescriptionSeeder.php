<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CourseDescription;

class CourseDescriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $descriptions = [
            // Information Technology Courses - BSIT (Accurate Descriptions)
            [
                'course_name' => 'BSIT',
                'description' => 'Bachelor of Science in Information Technology provides comprehensive training in computer programming, database management, and network administration. Students learn Java, Python, SQL, and web technologies to develop business applications.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program focuses on practical IT skills including system administration, software development, and IT project management. Students gain hands-on experience with Windows/Linux servers, programming languages, and database systems.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree covers web development, mobile app creation, and database design. Students learn HTML/CSS, JavaScript, PHP, MySQL, and mobile development frameworks for creating digital solutions.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT curriculum emphasizes business technology integration and IT service management. Students study enterprise systems, ITIL frameworks, and business process automation using modern IT tools and methodologies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology program prepares students for IT support, network administration, and software development roles. Covers computer hardware, networking protocols, programming fundamentals, and IT security basics.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT degree focuses on database administration, network security, and software testing. Students learn SQL Server, Oracle databases, network protocols, and quality assurance methodologies for enterprise environments.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course covers cloud computing, virtualization, and IT infrastructure management. Students work with AWS, Azure, VMware, and learn to deploy and manage cloud-based solutions.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program emphasizes cybersecurity fundamentals, ethical hacking, and digital forensics. Students learn network security, penetration testing, security tools, and incident response procedures.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree prepares students for business analyst and IT consultant roles. Covers requirements analysis, system design, project management, and business process modeling.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT curriculum includes enterprise resource planning systems, customer relationship management, and business intelligence tools. Students learn SAP, Salesforce, and data analytics platforms.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology program focuses on mobile application development and responsive web design. Students learn React Native, Flutter, Bootstrap, and modern web development frameworks.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT degree covers IT governance, risk management, and compliance standards. Students study COBIT, ITIL, ISO standards, and learn to implement IT policies and procedures.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course emphasizes data analytics, business intelligence, and reporting tools. Students learn Power BI, Tableau, Excel advanced features, and data visualization techniques.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program prepares students for DevOps and continuous integration roles. Covers Git, Jenkins, Docker, Kubernetes, and automated deployment practices for modern software development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree focuses on e-commerce platforms, digital marketing tools, and online business solutions. Students learn Shopify, WooCommerce, Google Analytics, and digital marketing technologies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'The BSIT program emphasizes practical application of technology solutions in real-world scenarios. Students develop skills in software engineering, cloud computing, and emerging technologies while building a strong foundation in computer science principles.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree prepares students for dynamic careers in the digital economy. The curriculum covers mobile app development, data analytics, artificial intelligence, and enterprise systems integration.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program focuses on creating innovative technology solutions for business challenges. Students learn database design, network security, web technologies, and project management methodologies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course develops expertise in system administration, software testing, and IT service management. Students gain hands-on experience with industry-standard tools and technologies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'The BSIT curriculum emphasizes digital transformation and technology innovation. Students explore machine learning, blockchain technology, and Internet of Things (IoT) applications.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology program prepares students for roles in software development, IT consulting, and technology leadership. Covers agile methodologies, DevOps practices, and quality assurance.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT degree focuses on building scalable and secure technology solutions. Students learn about cloud architecture, cybersecurity frameworks, and enterprise software development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course emphasizes user experience design and human-computer interaction. Students develop skills in UI/UX design, accessibility, and user-centered development approaches.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'The BSIT program covers emerging technologies like virtual reality, augmented reality, and 5G networks. Students learn to implement cutting-edge solutions for modern business needs.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree prepares students for cybersecurity careers with focus on ethical hacking, digital forensics, and security architecture. Includes hands-on labs and real-world scenarios.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program emphasizes data-driven decision making and business intelligence. Students learn data mining, statistical analysis, and visualization techniques for organizational insights.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course focuses on enterprise resource planning and business process automation. Students develop skills in SAP, Oracle, and other enterprise software platforms.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'The BSIT curriculum includes mobile computing, wireless networks, and distributed systems. Students learn to design and implement solutions for mobile-first business environments.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology program emphasizes software quality assurance and testing methodologies. Students learn automated testing, performance optimization, and continuous integration practices.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT degree covers network design, routing protocols, and telecommunications systems. Students gain expertise in Cisco technologies, network security, and infrastructure management.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology course focuses on e-commerce platforms, digital marketing technologies, and online business solutions. Students learn to build scalable web applications.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'The BSIT program emphasizes IT governance, risk management, and compliance frameworks. Students learn about COBIT, ITIL, and other industry standards for IT service management.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'Information Technology degree prepares students for cloud computing careers with focus on AWS, Azure, and Google Cloud platforms. Includes certification preparation and hands-on projects.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BSIT',
                'description' => 'BSIT program covers software architecture patterns, microservices, and containerization technologies. Students learn Docker, Kubernetes, and modern application deployment strategies.',
                'is_manual' => false
            ],
            // BS Computer Science (Accurate Descriptions)
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Bachelor of Science in Computer Science provides strong foundation in programming, algorithms, and data structures. Students learn Java, C++, Python, and study computer architecture, operating systems, and software engineering principles.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science program emphasizes mathematical foundations including calculus, discrete mathematics, and linear algebra. Students develop algorithmic thinking and problem-solving skills through programming and computer theory.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'BS Computer Science curriculum covers software engineering, database systems, and computer networks. Students learn software development methodologies, SQL programming, and network protocols for building scalable applications.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science degree focuses on artificial intelligence, machine learning, and data science. Students study algorithms, statistical analysis, and implement AI models using Python, TensorFlow, and data visualization tools.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science program prepares students for software development careers. Covers object-oriented programming, design patterns, web technologies, and mobile app development using industry-standard tools and frameworks.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'The BS Computer Science curriculum emphasizes mathematical foundations and algorithmic thinking. Students explore discrete mathematics, calculus, linear algebra, and their applications in computing.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science degree prepares students for software engineering careers with focus on object-oriented programming, design patterns, and software architecture principles.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'BS Computer Science program covers artificial intelligence and machine learning fundamentals. Students learn neural networks, natural language processing, and intelligent system design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science course emphasizes database systems and information management. Students develop skills in SQL, NoSQL databases, data modeling, and database administration.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'The Computer Science curriculum includes computer networks and distributed systems. Students learn network protocols, socket programming, and distributed computing principles.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science program focuses on operating systems and system programming. Students explore process management, memory allocation, file systems, and kernel development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'BS Computer Science degree emphasizes cybersecurity and cryptography. Students learn encryption algorithms, security protocols, and ethical hacking techniques.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science course covers web technologies and full-stack development. Students learn HTML, CSS, JavaScript, server-side programming, and web application frameworks.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'The Computer Science program emphasizes mobile application development. Students learn iOS and Android development, mobile UI/UX design, and cross-platform development frameworks.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science degree focuses on game development and computer graphics. Students explore 3D modeling, game engines, physics simulation, and interactive media design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'BS Computer Science program covers data science and big data analytics. Students learn statistical analysis, data visualization, and machine learning algorithms for data insights.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science course emphasizes software testing and quality assurance. Students develop skills in unit testing, integration testing, and automated testing frameworks.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'The Computer Science curriculum includes parallel and concurrent programming. Students learn multi-threading, parallel algorithms, and distributed computing architectures.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science program focuses on cloud computing and virtualization. Students explore cloud platforms, containerization, and scalable application deployment strategies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science degree emphasizes human-computer interaction and user experience design. Students learn usability testing, interface design, and accessibility principles.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'BS Computer Science program covers computational biology and bioinformatics. Students explore algorithms for DNA sequencing, protein structure prediction, and biological data analysis.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science course focuses on robotics and automation systems. Students learn control systems, sensor integration, and autonomous system programming.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'The Computer Science curriculum emphasizes software project management and agile methodologies. Students learn Scrum, Kanban, and collaborative development practices.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Computer Science',
                'description' => 'Computer Science program covers quantum computing and advanced algorithms. Students explore quantum algorithms, quantum cryptography, and future computing paradigms.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Information Systems',
                'description' => 'Bachelor of Science in Information Systems combines business knowledge with technology skills. Students learn to design, implement, and manage information systems that support business operations.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Information Systems',
                'description' => 'Information Systems program bridges the gap between business and technology. Students develop skills in database design, business analysis, and system integration for organizational efficiency.',
                'is_manual' => false
            ],

            // Business and Management Courses
            [
                'course_name' => 'BS Business Administration',
                'description' => 'Bachelor of Science in Business Administration develops leadership skills, strategic thinking, and entrepreneurial mindset. Students learn management principles, marketing strategies, and business operations.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Business Administration',
                'description' => 'Business Administration program prepares students for leadership roles in various industries. Covers organizational behavior, financial management, and strategic planning for business success.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Accountancy',
                'description' => 'Bachelor of Science in Accountancy prepares students for professional accounting careers. The program covers financial reporting, auditing, taxation, and business law.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Accountancy',
                'description' => 'Accountancy program develops expertise in financial analysis, cost management, and regulatory compliance. Students learn to prepare and analyze financial statements for decision-making.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Management',
                'description' => 'Bachelor of Science in Management focuses on organizational leadership, team dynamics, and strategic planning. Students develop skills in human resource management and organizational development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Management',
                'description' => 'Management program emphasizes leadership development and organizational effectiveness. Students learn change management, conflict resolution, and performance optimization strategies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Marketing',
                'description' => 'Bachelor of Science in Marketing develops creative communication skills and consumer behavior analysis. Students learn market research, brand management, and digital marketing strategies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Marketing',
                'description' => 'Marketing program focuses on customer relationship management and market positioning. Students develop skills in advertising, sales management, and marketing analytics.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Entrepreneurship',
                'description' => 'Bachelor of Science in Entrepreneurship fosters innovation, risk-taking, and business development. Students learn business model design, startup management, and venture financing.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Entrepreneurship',
                'description' => 'Entrepreneurship program emphasizes creative problem-solving and opportunity recognition. Students develop skills in business planning, market validation, and growth strategies.',
                'is_manual' => false
            ],

            // Engineering Courses
            [
                'course_name' => 'BS Engineering',
                'description' => 'Bachelor of Science in Engineering emphasizes mathematical analysis, scientific principles, and systematic problem-solving. Students develop technical skills and innovation capabilities.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Engineering',
                'description' => 'Engineering program focuses on design thinking and technical innovation. Students learn to apply scientific principles to solve complex real-world problems.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Civil Engineering',
                'description' => 'Bachelor of Science in Civil Engineering focuses on infrastructure development and environmental sustainability. Students learn structural design, transportation systems, and construction management.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Civil Engineering',
                'description' => 'Civil Engineering program emphasizes sustainable development and community infrastructure. Students develop skills in structural analysis, geotechnical engineering, and project management.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Mechanical Engineering',
                'description' => 'Bachelor of Science in Mechanical Engineering focuses on machine design and manufacturing processes. Students learn thermodynamics, fluid mechanics, and mechanical systems design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Mechanical Engineering',
                'description' => 'Mechanical Engineering program emphasizes innovation in product design and manufacturing. Students develop skills in CAD/CAM, robotics, and automation systems.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Electrical Engineering',
                'description' => 'Bachelor of Science in Electrical Engineering focuses on electrical systems and electronics. Students learn circuit design, power systems, and control systems engineering.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Electrical Engineering',
                'description' => 'Electrical Engineering program emphasizes renewable energy and smart grid technologies. Students develop skills in power electronics, telecommunications, and automation.',
                'is_manual' => false
            ],

            // Healthcare and Medical Courses
            [
                'course_name' => 'BS Nursing',
                'description' => 'Bachelor of Science in Nursing develops patient care skills, medical knowledge, and compassionate service. Students learn clinical procedures, health assessment, and nursing interventions.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Nursing',
                'description' => 'Nursing program emphasizes evidence-based practice and patient-centered care. Students develop critical thinking skills and clinical decision-making abilities.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Medical Technology',
                'description' => 'Bachelor of Science in Medical Technology focuses on laboratory diagnostics and medical research. Students learn clinical laboratory procedures, diagnostic testing, and research methodologies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Medical Technology',
                'description' => 'Medical Technology program emphasizes accuracy and precision in diagnostic testing. Students develop skills in laboratory management and quality assurance.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Pharmacy',
                'description' => 'Bachelor of Science in Pharmacy focuses on drug development and patient medication management. Students learn pharmaceutical chemistry, pharmacology, and clinical pharmacy practice.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Pharmacy',
                'description' => 'Pharmacy program emphasizes medication safety and therapeutic outcomes. Students develop skills in drug interactions, dosage calculations, and patient counseling.',
                'is_manual' => false
            ],

            // Psychology and Social Sciences
            [
                'course_name' => 'BS Psychology',
                'description' => 'Bachelor of Science in Psychology explores human behavior, mental processes, and emotional intelligence. Students learn research methods, counseling techniques, and psychological assessment.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Psychology',
                'description' => 'Psychology program emphasizes understanding human cognition and behavior. Students develop skills in psychological testing, therapy techniques, and research design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Social Work',
                'description' => 'Bachelor of Science in Social Work focuses on community development and social justice. Students learn case management, community organizing, and social policy analysis.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Social Work',
                'description' => 'Social Work program emphasizes advocacy and empowerment of vulnerable populations. Students develop skills in crisis intervention, family therapy, and program development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Sociology',
                'description' => 'Bachelor of Science in Sociology explores social structures and human interactions. Students learn social research methods, cultural analysis, and social change theories.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Sociology',
                'description' => 'Sociology program emphasizes understanding social inequalities and community dynamics. Students develop skills in data analysis, social policy, and community research.',
                'is_manual' => false
            ],

            // Education Courses
            [
                'course_name' => 'BS Education',
                'description' => 'Bachelor of Science in Education prepares students for teaching careers. The program covers instructional methods, curriculum design, classroom management, and student development.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Education',
                'description' => 'Education program emphasizes student-centered learning and educational innovation. Students develop skills in assessment design, differentiated instruction, and educational technology.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Elementary Education',
                'description' => 'Bachelor of Science in Elementary Education focuses on teaching young learners. Students learn child development, early literacy, and elementary curriculum design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Elementary Education',
                'description' => 'Elementary Education program emphasizes creating engaging learning environments for children. Students develop skills in classroom management and age-appropriate instruction.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Secondary Education',
                'description' => 'Bachelor of Science in Secondary Education prepares teachers for high school settings. Students learn adolescent development, subject-specific pedagogy, and assessment strategies.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Secondary Education',
                'description' => 'Secondary Education program emphasizes preparing students for college and career readiness. Students develop skills in curriculum planning and student engagement.',
                'is_manual' => false
            ],

            // Arts and Communication
            [
                'course_name' => 'BS Communication Arts',
                'description' => 'Bachelor of Science in Communication Arts develops storytelling, media production, and public speaking skills. Students learn journalism, broadcasting, and digital media production.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Communication Arts',
                'description' => 'Communication Arts program emphasizes effective communication across various media platforms. Students develop skills in content creation, audience analysis, and media ethics.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Journalism',
                'description' => 'Bachelor of Science in Journalism focuses on news reporting and media ethics. Students learn investigative reporting, multimedia storytelling, and media law.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Journalism',
                'description' => 'Journalism program emphasizes truth-seeking and public service through media. Students develop skills in fact-checking, digital journalism, and media production.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Multimedia Arts',
                'description' => 'Bachelor of Science in Multimedia Arts combines creativity with technology. Students learn graphic design, video production, web design, and digital animation.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Multimedia Arts',
                'description' => 'Multimedia Arts program emphasizes digital creativity and visual storytelling. Students develop skills in user experience design, interactive media, and creative software applications.',
                'is_manual' => false
            ],

            // Tourism and Hospitality
            [
                'course_name' => 'BS Tourism Management',
                'description' => 'Bachelor of Science in Tourism Management focuses on travel industry operations and destination management. Students learn tourism planning, hospitality services, and cultural tourism.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Tourism Management',
                'description' => 'Tourism Management program emphasizes sustainable tourism and customer service excellence. Students develop skills in tour operations, event management, and tourism marketing.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Hotel and Restaurant Management',
                'description' => 'Bachelor of Science in Hotel and Restaurant Management focuses on hospitality operations and service management. Students learn food service, accommodation management, and hospitality marketing.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Hotel and Restaurant Management',
                'description' => 'Hotel and Restaurant Management program emphasizes quality service and operational efficiency. Students develop skills in revenue management, guest relations, and hospitality technology.',
                'is_manual' => false
            ],

            // Agriculture and Environmental Sciences
            [
                'course_name' => 'BS Agriculture',
                'description' => 'Bachelor of Science in Agriculture focuses on sustainable farming and agricultural technology. Students learn crop production, animal husbandry, and agricultural economics.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Agriculture',
                'description' => 'Agriculture program emphasizes food security and environmental sustainability. Students develop skills in precision farming, agricultural biotechnology, and farm management.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Environmental Science',
                'description' => 'Bachelor of Science in Environmental Science focuses on environmental protection and sustainability. Students learn environmental monitoring, conservation biology, and environmental policy.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Environmental Science',
                'description' => 'Environmental Science program emphasizes climate change mitigation and ecosystem management. Students develop skills in environmental assessment, waste management, and renewable energy.',
                'is_manual' => false
            ],

            // Aviation and Transportation
            [
                'course_name' => 'BS Aviation Management',
                'description' => 'Bachelor of Science in Aviation Management focuses on airline operations and aviation safety. Students learn flight operations, airport management, and aviation regulations.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Aviation Management',
                'description' => 'Aviation Management program emphasizes safety management and operational efficiency. Students develop skills in air traffic control, aviation security, and fleet management.',
                'is_manual' => false
            ],

            // Maritime and Marine Sciences
            [
                'course_name' => 'BS Marine Transportation',
                'description' => 'Bachelor of Science in Marine Transportation focuses on maritime operations and navigation. Students learn ship operations, maritime law, and marine safety.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Marine Transportation',
                'description' => 'Marine Transportation program emphasizes maritime safety and international shipping. Students develop skills in navigation, cargo handling, and maritime regulations.',
                'is_manual' => false
            ],

            // Criminology and Law Enforcement
            [
                'course_name' => 'BS Criminology',
                'description' => 'Bachelor of Science in Criminology focuses on crime prevention and criminal justice. Students learn criminal law, forensic science, and law enforcement procedures.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Criminology',
                'description' => 'Criminology program emphasizes understanding criminal behavior and justice administration. Students develop skills in crime analysis, investigation techniques, and community policing.',
                'is_manual' => false
            ],

            // Architecture and Design
            [
                'course_name' => 'BS Architecture',
                'description' => 'Bachelor of Science in Architecture focuses on building design and urban planning. Students learn architectural design, building technology, and sustainable architecture.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Architecture',
                'description' => 'Architecture program emphasizes creative design and environmental responsibility. Students develop skills in architectural drawing, building codes, and construction management.',
                'is_manual' => false
            ],

            // Interior Design
            [
                'course_name' => 'BS Interior Design',
                'description' => 'Bachelor of Science in Interior Design focuses on creating functional and aesthetic spaces. Students learn space planning, color theory, and furniture design.',
                'is_manual' => false
            ],
            [
                'course_name' => 'BS Interior Design',
                'description' => 'Interior Design program emphasizes creating environments that enhance human well-being. Students develop skills in lighting design, material selection, and sustainable design.',
                'is_manual' => false
            ]
        ];

        foreach ($descriptions as $description) {
            CourseDescription::create($description);
        }
    }
}
