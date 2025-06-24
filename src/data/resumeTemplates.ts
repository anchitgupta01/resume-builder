import { ResumeTemplate } from '../types/resume';

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'software-engineer-senior',
    name: 'Senior Software Engineer',
    description: 'Perfect for experienced developers with leadership experience and full-stack expertise',
    category: 'technology',
    level: 'senior',
    preview: 'Experienced full-stack developer with team leadership and architecture design experience',
    tags: ['React', 'Node.js', 'Leadership', 'Architecture', 'Full-Stack'],
    data: {
      personalInfo: {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/alexjohnson',
        github: 'https://github.com/alexjohnson',
        website: 'https://alexjohnson.dev',
        summary: 'Senior Software Engineer with 7+ years of experience building scalable web applications and leading cross-functional teams. Expertise in React, Node.js, and cloud architecture. Proven track record of delivering high-impact products that serve millions of users while mentoring junior developers and driving technical excellence.'
      },
      experience: [
        {
          id: '1',
          company: 'TechCorp Inc.',
          position: 'Senior Software Engineer',
          startDate: '2021-03',
          endDate: '',
          current: true,
          description: [
            'Lead development of microservices architecture serving 2M+ daily active users',
            'Mentor team of 5 junior developers and conduct technical interviews',
            'Collaborate with product managers and designers to define technical requirements'
          ],
          achievements: [
            'Reduced API response time by 60% through database optimization and caching strategies',
            'Led migration to React 18 and Next.js, improving page load speeds by 40%',
            'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes'
          ]
        },
        {
          id: '2',
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2019-01',
          endDate: '2021-02',
          current: false,
          description: [
            'Developed and maintained React-based web applications with Node.js backends',
            'Designed and implemented RESTful APIs and database schemas',
            'Collaborated in agile development environment with weekly sprints'
          ],
          achievements: [
            'Built customer dashboard that increased user engagement by 85%',
            'Optimized database queries reducing server costs by $15K annually',
            'Developed real-time chat feature using WebSocket technology'
          ]
        },
        {
          id: '3',
          company: 'Digital Agency Pro',
          position: 'Frontend Developer',
          startDate: '2017-06',
          endDate: '2018-12',
          current: false,
          description: [
            'Created responsive websites and web applications for diverse clients',
            'Worked closely with design team to implement pixel-perfect UI/UX',
            'Maintained and updated existing client websites and applications'
          ],
          achievements: [
            'Delivered 25+ client projects with 98% on-time completion rate',
            'Improved website performance scores by average of 35% across all projects',
            'Implemented accessibility standards achieving WCAG 2.1 AA compliance'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of California, Berkeley',
          degree: "Bachelor's Degree",
          field: 'Computer Science',
          graduationDate: '2017-05',
          gpa: '3.7',
          honors: ['Dean\'s List (3 semesters)', 'Computer Science Honor Society']
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'technical', proficiency: 'expert' },
        { id: '2', name: 'TypeScript', category: 'technical', proficiency: 'expert' },
        { id: '3', name: 'React', category: 'technical', proficiency: 'expert' },
        { id: '4', name: 'Node.js', category: 'technical', proficiency: 'expert' },
        { id: '5', name: 'Python', category: 'technical', proficiency: 'advanced' },
        { id: '6', name: 'AWS', category: 'technical', proficiency: 'advanced' },
        { id: '7', name: 'Docker', category: 'technical', proficiency: 'advanced' },
        { id: '8', name: 'PostgreSQL', category: 'technical', proficiency: 'advanced' },
        { id: '9', name: 'MongoDB', category: 'technical', proficiency: 'intermediate' },
        { id: '10', name: 'Leadership', category: 'soft', proficiency: 'advanced' },
        { id: '11', name: 'Team Collaboration', category: 'soft', proficiency: 'expert' },
        { id: '12', name: 'Problem Solving', category: 'soft', proficiency: 'expert' },
        { id: '13', name: 'AWS Certified Developer', category: 'certification', proficiency: 'advanced' }
      ],
      projects: [
        {
          id: '1',
          name: 'E-Commerce Platform',
          description: 'Full-stack e-commerce solution with React frontend, Node.js backend, and Stripe integration. Features include user authentication, product catalog, shopping cart, and admin dashboard.',
          technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Stripe API', 'AWS'],
          link: 'https://ecommerce-demo.alexjohnson.dev',
          github: 'https://github.com/alexjohnson/ecommerce-platform'
        },
        {
          id: '2',
          name: 'Real-Time Analytics Dashboard',
          description: 'Interactive dashboard for visualizing real-time business metrics with WebSocket connections, chart.js integration, and responsive design.',
          technologies: ['React', 'D3.js', 'WebSocket', 'Node.js', 'Redis'],
          link: 'https://analytics-dashboard.alexjohnson.dev',
          github: 'https://github.com/alexjohnson/analytics-dashboard'
        }
      ]
    }
  },
  {
    id: 'frontend-developer-mid',
    name: 'Frontend Developer',
    description: 'Ideal for mid-level frontend developers with modern framework experience',
    category: 'technology',
    level: 'mid',
    preview: 'Frontend specialist with React, Vue.js expertise and strong UI/UX collaboration skills',
    tags: ['React', 'Vue.js', 'CSS', 'JavaScript', 'UI/UX'],
    data: {
      personalInfo: {
        fullName: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1 (555) 987-6543',
        location: 'Austin, TX',
        linkedin: 'https://linkedin.com/in/sarahchen',
        github: 'https://github.com/sarahchen',
        website: 'https://sarahchen.design',
        summary: 'Creative Frontend Developer with 4+ years of experience crafting beautiful, responsive web applications. Specialized in React and Vue.js with strong eye for design and user experience. Passionate about writing clean, maintainable code and collaborating with design teams to bring ideas to life.'
      },
      experience: [
        {
          id: '1',
          company: 'Design Studio Co.',
          position: 'Frontend Developer',
          startDate: '2022-01',
          endDate: '',
          current: true,
          description: [
            'Develop responsive web applications using React and Vue.js frameworks',
            'Collaborate with UX/UI designers to implement pixel-perfect designs',
            'Optimize applications for maximum speed and scalability'
          ],
          achievements: [
            'Improved website loading speed by 45% through code splitting and lazy loading',
            'Built component library used across 8 different client projects',
            'Increased mobile user engagement by 30% with responsive design improvements'
          ]
        },
        {
          id: '2',
          company: 'WebTech Solutions',
          position: 'Junior Frontend Developer',
          startDate: '2020-06',
          endDate: '2021-12',
          current: false,
          description: [
            'Built interactive user interfaces using HTML5, CSS3, and JavaScript',
            'Integrated frontend applications with RESTful APIs',
            'Participated in code reviews and agile development processes'
          ],
          achievements: [
            'Developed 15+ responsive websites with 100% client satisfaction rate',
            'Reduced CSS bundle size by 25% through optimization and refactoring',
            'Implemented accessibility features improving WCAG compliance scores'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Texas at Austin',
          degree: "Bachelor's Degree",
          field: 'Computer Science',
          graduationDate: '2020-05',
          gpa: '3.6',
          honors: ['Graduated Magna Cum Laude']
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'technical', proficiency: 'advanced' },
        { id: '2', name: 'React', category: 'technical', proficiency: 'advanced' },
        { id: '3', name: 'Vue.js', category: 'technical', proficiency: 'advanced' },
        { id: '4', name: 'HTML5', category: 'technical', proficiency: 'expert' },
        { id: '5', name: 'CSS3', category: 'technical', proficiency: 'expert' },
        { id: '6', name: 'Sass/SCSS', category: 'technical', proficiency: 'advanced' },
        { id: '7', name: 'Tailwind CSS', category: 'technical', proficiency: 'advanced' },
        { id: '8', name: 'Webpack', category: 'technical', proficiency: 'intermediate' },
        { id: '9', name: 'Git', category: 'technical', proficiency: 'advanced' },
        { id: '10', name: 'Figma', category: 'technical', proficiency: 'intermediate' },
        { id: '11', name: 'Creative Problem Solving', category: 'soft', proficiency: 'advanced' },
        { id: '12', name: 'Attention to Detail', category: 'soft', proficiency: 'expert' }
      ],
      projects: [
        {
          id: '1',
          name: 'Portfolio Website Builder',
          description: 'Drag-and-drop website builder for creative professionals with real-time preview, template system, and export functionality.',
          technologies: ['React', 'TypeScript', 'Styled Components', 'Firebase'],
          link: 'https://portfolio-builder.sarahchen.design',
          github: 'https://github.com/sarahchen/portfolio-builder'
        },
        {
          id: '2',
          name: 'Weather App',
          description: 'Beautiful weather application with location-based forecasts, interactive maps, and customizable themes.',
          technologies: ['Vue.js', 'CSS3', 'OpenWeather API', 'Chart.js'],
          link: 'https://weather-app.sarahchen.design',
          github: 'https://github.com/sarahchen/weather-app'
        }
      ]
    }
  },
  {
    id: 'data-scientist-senior',
    name: 'Senior Data Scientist',
    description: 'For experienced data scientists with machine learning and analytics expertise',
    category: 'technology',
    level: 'senior',
    preview: 'Data science expert with ML, Python, and business intelligence experience',
    tags: ['Python', 'Machine Learning', 'SQL', 'Analytics', 'AI'],
    data: {
      personalInfo: {
        fullName: 'Dr. Michael Rodriguez',
        email: 'michael.rodriguez@email.com',
        phone: '+1 (555) 456-7890',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/michaelrodriguez',
        github: 'https://github.com/mrodriguez',
        website: 'https://michaelrodriguez.ai',
        summary: 'Senior Data Scientist with 6+ years of experience developing machine learning models and analytics solutions that drive business growth. PhD in Statistics with expertise in Python, R, and cloud platforms. Proven track record of delivering data-driven insights that increased revenue by $50M+ across multiple organizations.'
      },
      experience: [
        {
          id: '1',
          company: 'DataTech Corp',
          position: 'Senior Data Scientist',
          startDate: '2021-08',
          endDate: '',
          current: true,
          description: [
            'Lead data science initiatives for customer analytics and predictive modeling',
            'Develop and deploy machine learning models in production environments',
            'Collaborate with engineering teams to build scalable data pipelines'
          ],
          achievements: [
            'Built recommendation system that increased customer engagement by 40%',
            'Developed churn prediction model reducing customer attrition by 25%',
            'Led A/B testing framework implementation improving decision-making speed by 60%'
          ]
        },
        {
          id: '2',
          company: 'Analytics Solutions Inc',
          position: 'Data Scientist',
          startDate: '2019-03',
          endDate: '2021-07',
          current: false,
          description: [
            'Analyzed large datasets to identify business opportunities and trends',
            'Created statistical models for forecasting and optimization',
            'Presented findings to executive leadership and stakeholders'
          ],
          achievements: [
            'Developed pricing optimization model increasing profit margins by 15%',
            'Built fraud detection system reducing false positives by 80%',
            'Created automated reporting dashboard saving 20 hours/week of manual work'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Stanford University',
          degree: 'PhD',
          field: 'Statistics',
          graduationDate: '2019-06',
          gpa: '3.9',
          honors: ['Outstanding Dissertation Award', 'NSF Graduate Research Fellowship']
        },
        {
          id: '2',
          institution: 'MIT',
          degree: "Master's Degree",
          field: 'Applied Mathematics',
          graduationDate: '2015-05',
          gpa: '3.8',
          honors: ['Summa Cum Laude']
        }
      ],
      skills: [
        { id: '1', name: 'Python', category: 'technical', proficiency: 'expert' },
        { id: '2', name: 'R', category: 'technical', proficiency: 'expert' },
        { id: '3', name: 'SQL', category: 'technical', proficiency: 'expert' },
        { id: '4', name: 'Machine Learning', category: 'technical', proficiency: 'expert' },
        { id: '5', name: 'TensorFlow', category: 'technical', proficiency: 'advanced' },
        { id: '6', name: 'PyTorch', category: 'technical', proficiency: 'advanced' },
        { id: '7', name: 'AWS', category: 'technical', proficiency: 'advanced' },
        { id: '8', name: 'Tableau', category: 'technical', proficiency: 'advanced' },
        { id: '9', name: 'Apache Spark', category: 'technical', proficiency: 'intermediate' },
        { id: '10', name: 'Statistical Analysis', category: 'technical', proficiency: 'expert' },
        { id: '11', name: 'Leadership', category: 'soft', proficiency: 'advanced' },
        { id: '12', name: 'Communication', category: 'soft', proficiency: 'expert' }
      ],
      projects: [
        {
          id: '1',
          name: 'Customer Segmentation Platform',
          description: 'ML-powered customer segmentation tool using clustering algorithms and behavioral analysis to identify high-value customer groups.',
          technologies: ['Python', 'Scikit-learn', 'Pandas', 'PostgreSQL', 'Docker'],
          github: 'https://github.com/mrodriguez/customer-segmentation'
        },
        {
          id: '2',
          name: 'Predictive Analytics Dashboard',
          description: 'Real-time dashboard for business forecasting with interactive visualizations and automated model retraining.',
          technologies: ['Python', 'Streamlit', 'Plotly', 'AWS', 'MLflow'],
          link: 'https://analytics.michaelrodriguez.ai',
          github: 'https://github.com/mrodriguez/predictive-dashboard'
        }
      ]
    }
  },
  {
    id: 'product-manager-senior',
    name: 'Senior Product Manager',
    description: 'Perfect for experienced product managers with strategic vision and execution skills',
    category: 'business',
    level: 'senior',
    preview: 'Strategic product leader with data-driven approach and cross-functional team experience',
    tags: ['Product Strategy', 'Analytics', 'Leadership', 'Agile', 'Growth'],
    data: {
      personalInfo: {
        fullName: 'Jennifer Kim',
        email: 'jennifer.kim@email.com',
        phone: '+1 (555) 234-5678',
        location: 'Seattle, WA',
        linkedin: 'https://linkedin.com/in/jenniferkim',
        website: 'https://jenniferkim.pm',
        summary: 'Senior Product Manager with 8+ years of experience driving product strategy and execution for B2B and B2C platforms. Led cross-functional teams to launch 15+ features serving 10M+ users. Expert in data-driven decision making, user research, and agile methodologies with proven track record of increasing user engagement by 200% and revenue by $25M.'
      },
      experience: [
        {
          id: '1',
          company: 'TechGiant Inc.',
          position: 'Senior Product Manager',
          startDate: '2020-09',
          endDate: '',
          current: true,
          description: [
            'Lead product strategy and roadmap for core platform serving 5M+ monthly active users',
            'Manage cross-functional team of 12 engineers, designers, and data analysts',
            'Drive product discovery through user research, A/B testing, and data analysis'
          ],
          achievements: [
            'Launched mobile app that achieved 1M downloads in first 6 months',
            'Increased user retention by 45% through personalization features',
            'Led product pivot that resulted in $15M additional annual revenue',
            'Reduced customer acquisition cost by 30% through improved onboarding flow'
          ]
        },
        {
          id: '2',
          company: 'GrowthCo',
          position: 'Product Manager',
          startDate: '2018-01',
          endDate: '2020-08',
          current: false,
          description: [
            'Managed B2B SaaS product suite with focus on customer success and growth',
            'Collaborated with sales and marketing teams to drive product-led growth',
            'Conducted user interviews and market research to identify opportunities'
          ],
          achievements: [
            'Delivered 8 major feature releases with 95% on-time delivery rate',
            'Increased customer lifetime value by 60% through feature optimization',
            'Reduced churn rate from 15% to 8% through improved user experience',
            'Led integration project that expanded market reach by 40%'
          ]
        },
        {
          id: '3',
          company: 'StartupXYZ',
          position: 'Associate Product Manager',
          startDate: '2016-06',
          endDate: '2017-12',
          current: false,
          description: [
            'Supported product development for early-stage fintech startup',
            'Analyzed user behavior and market trends to inform product decisions',
            'Coordinated with engineering team to prioritize feature development'
          ],
          achievements: [
            'Helped grow user base from 10K to 100K users in 18 months',
            'Launched MVP that secured $2M Series A funding',
            'Implemented analytics framework improving data-driven decisions by 80%'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Washington',
          degree: 'MBA',
          field: 'Business Administration',
          graduationDate: '2016-06',
          gpa: '3.8',
          honors: ['Beta Gamma Sigma Honor Society']
        },
        {
          id: '2',
          institution: 'UC Berkeley',
          degree: "Bachelor's Degree",
          field: 'Economics',
          graduationDate: '2014-05',
          gpa: '3.7',
          honors: ['Phi Beta Kappa']
        }
      ],
      skills: [
        { id: '1', name: 'Product Strategy', category: 'technical', proficiency: 'expert' },
        { id: '2', name: 'Data Analysis', category: 'technical', proficiency: 'advanced' },
        { id: '3', name: 'A/B Testing', category: 'technical', proficiency: 'advanced' },
        { id: '4', name: 'SQL', category: 'technical', proficiency: 'intermediate' },
        { id: '5', name: 'Figma', category: 'technical', proficiency: 'intermediate' },
        { id: '6', name: 'Jira', category: 'technical', proficiency: 'advanced' },
        { id: '7', name: 'Google Analytics', category: 'technical', proficiency: 'advanced' },
        { id: '8', name: 'Mixpanel', category: 'technical', proficiency: 'advanced' },
        { id: '9', name: 'Leadership', category: 'soft', proficiency: 'expert' },
        { id: '10', name: 'Strategic Thinking', category: 'soft', proficiency: 'expert' },
        { id: '11', name: 'Communication', category: 'soft', proficiency: 'expert' },
        { id: '12', name: 'Problem Solving', category: 'soft', proficiency: 'expert' },
        { id: '13', name: 'Certified Scrum Product Owner', category: 'certification', proficiency: 'advanced' }
      ],
      projects: [
        {
          id: '1',
          name: 'Product Analytics Framework',
          description: 'Comprehensive analytics framework for tracking user behavior, feature adoption, and business metrics across multiple product lines.',
          technologies: ['SQL', 'Python', 'Tableau', 'Google Analytics', 'Mixpanel']
        },
        {
          id: '2',
          name: 'Customer Journey Optimization',
          description: 'End-to-end customer journey analysis and optimization project that improved conversion rates and reduced friction points.',
          technologies: ['User Research', 'A/B Testing', 'Hotjar', 'Amplitude']
        }
      ]
    }
  },
  {
    id: 'marketing-manager-mid',
    name: 'Digital Marketing Manager',
    description: 'Ideal for marketing professionals with digital campaign and analytics experience',
    category: 'business',
    level: 'mid',
    preview: 'Digital marketing specialist with campaign management and growth marketing expertise',
    tags: ['Digital Marketing', 'SEO', 'Analytics', 'Content', 'Growth'],
    data: {
      personalInfo: {
        fullName: 'David Thompson',
        email: 'david.thompson@email.com',
        phone: '+1 (555) 345-6789',
        location: 'Chicago, IL',
        linkedin: 'https://linkedin.com/in/davidthompson',
        website: 'https://davidthompson.marketing',
        summary: 'Results-driven Digital Marketing Manager with 5+ years of experience developing and executing integrated marketing campaigns. Specialized in SEO, content marketing, and paid advertising with proven track record of increasing organic traffic by 300% and generating $2M+ in attributed revenue. Expert in data analysis and marketing automation.'
      },
      experience: [
        {
          id: '1',
          company: 'MarketingPro Agency',
          position: 'Digital Marketing Manager',
          startDate: '2021-02',
          endDate: '',
          current: true,
          description: [
            'Develop and execute comprehensive digital marketing strategies for B2B clients',
            'Manage multi-channel campaigns across SEO, PPC, social media, and email marketing',
            'Analyze campaign performance and optimize for ROI and conversion rates'
          ],
          achievements: [
            'Increased client organic traffic by average of 250% within 12 months',
            'Generated $2.5M in attributed revenue through integrated campaigns',
            'Improved email marketing open rates by 40% through segmentation and personalization',
            'Reduced cost per acquisition by 35% through campaign optimization'
          ]
        },
        {
          id: '2',
          company: 'GrowthTech Startup',
          position: 'Marketing Specialist',
          startDate: '2019-08',
          endDate: '2021-01',
          current: false,
          description: [
            'Executed content marketing strategy and managed social media presence',
            'Conducted keyword research and implemented SEO best practices',
            'Created and managed Google Ads and Facebook advertising campaigns'
          ],
          achievements: [
            'Grew social media following from 5K to 50K across all platforms',
            'Increased website conversion rate by 60% through landing page optimization',
            'Launched content marketing program that generated 500+ qualified leads monthly',
            'Achieved 4.2x ROAS on paid advertising campaigns'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Northwestern University',
          degree: "Bachelor's Degree",
          field: 'Marketing',
          graduationDate: '2019-06',
          gpa: '3.6',
          honors: ['Marketing Honor Society']
        }
      ],
      skills: [
        { id: '1', name: 'SEO', category: 'technical', proficiency: 'expert' },
        { id: '2', name: 'Google Analytics', category: 'technical', proficiency: 'advanced' },
        { id: '3', name: 'Google Ads', category: 'technical', proficiency: 'advanced' },
        { id: '4', name: 'Facebook Ads', category: 'technical', proficiency: 'advanced' },
        { id: '5', name: 'Content Marketing', category: 'technical', proficiency: 'advanced' },
        { id: '6', name: 'Email Marketing', category: 'technical', proficiency: 'advanced' },
        { id: '7', name: 'HubSpot', category: 'technical', proficiency: 'intermediate' },
        { id: '8', name: 'Salesforce', category: 'technical', proficiency: 'intermediate' },
        { id: '9', name: 'Adobe Creative Suite', category: 'technical', proficiency: 'intermediate' },
        { id: '10', name: 'Creative Thinking', category: 'soft', proficiency: 'advanced' },
        { id: '11', name: 'Analytical Skills', category: 'soft', proficiency: 'advanced' },
        { id: '12', name: 'Project Management', category: 'soft', proficiency: 'advanced' },
        { id: '13', name: 'Google Ads Certified', category: 'certification', proficiency: 'advanced' },
        { id: '14', name: 'HubSpot Certified', category: 'certification', proficiency: 'intermediate' }
      ],
      projects: [
        {
          id: '1',
          name: 'E-commerce SEO Campaign',
          description: 'Comprehensive SEO strategy for e-commerce client resulting in 400% increase in organic traffic and 250% increase in online sales.',
          technologies: ['SEMrush', 'Google Analytics', 'Google Search Console', 'Screaming Frog']
        },
        {
          id: '2',
          name: 'Multi-Channel Attribution Model',
          description: 'Developed custom attribution model to track customer journey across multiple touchpoints and optimize marketing spend allocation.',
          technologies: ['Google Analytics', 'Google Tag Manager', 'Data Studio', 'SQL']
        }
      ]
    }
  },
  {
    id: 'entry-level-developer',
    name: 'Entry Level Developer',
    description: 'Perfect for new graduates and career changers entering tech',
    category: 'technology',
    level: 'entry',
    preview: 'Recent graduate with strong foundation in programming and eagerness to learn',
    tags: ['JavaScript', 'React', 'Entry Level', 'Graduate', 'Learning'],
    data: {
      personalInfo: {
        fullName: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1 (555) 678-9012',
        location: 'Denver, CO',
        linkedin: 'https://linkedin.com/in/emilydavis',
        github: 'https://github.com/emilydavis',
        website: 'https://emilydavis.dev',
        summary: 'Motivated Computer Science graduate with strong foundation in JavaScript, React, and Python. Passionate about creating user-friendly web applications and solving complex problems through code. Completed 3 internships and built 5+ personal projects. Eager to contribute to a dynamic development team while continuing to learn and grow.'
      },
      experience: [
        {
          id: '1',
          company: 'TechStart Inc.',
          position: 'Software Development Intern',
          startDate: '2023-06',
          endDate: '2023-08',
          current: false,
          description: [
            'Developed React components for customer-facing web application',
            'Collaborated with senior developers on bug fixes and feature implementations',
            'Participated in daily standups and sprint planning meetings'
          ],
          achievements: [
            'Built responsive user interface components used by 10,000+ users',
            'Reduced page load time by 20% through code optimization',
            'Received "Outstanding Intern" award for exceptional performance'
          ]
        },
        {
          id: '2',
          company: 'University Web Services',
          position: 'Student Web Developer',
          startDate: '2022-09',
          endDate: '2023-05',
          current: false,
          description: [
            'Maintained and updated university department websites',
            'Created custom WordPress themes and plugins',
            'Provided technical support to faculty and staff'
          ],
          achievements: [
            'Redesigned 5 department websites improving user engagement by 35%',
            'Developed automated backup system reducing manual work by 15 hours/week',
            'Trained 3 new student developers on web development best practices'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: 'University of Colorado Boulder',
          degree: "Bachelor's Degree",
          field: 'Computer Science',
          graduationDate: '2023-12',
          gpa: '3.5',
          honors: ['Dean\'s List (2 semesters)', 'Computer Science Club President']
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript', category: 'technical', proficiency: 'intermediate' },
        { id: '2', name: 'React', category: 'technical', proficiency: 'intermediate' },
        { id: '3', name: 'Python', category: 'technical', proficiency: 'intermediate' },
        { id: '4', name: 'HTML5', category: 'technical', proficiency: 'advanced' },
        { id: '5', name: 'CSS3', category: 'technical', proficiency: 'advanced' },
        { id: '6', name: 'Git', category: 'technical', proficiency: 'intermediate' },
        { id: '7', name: 'SQL', category: 'technical', proficiency: 'beginner' },
        { id: '8', name: 'Node.js', category: 'technical', proficiency: 'beginner' },
        { id: '9', name: 'Problem Solving', category: 'soft', proficiency: 'advanced' },
        { id: '10', name: 'Team Collaboration', category: 'soft', proficiency: 'advanced' },
        { id: '11', name: 'Quick Learning', category: 'soft', proficiency: 'expert' },
        { id: '12', name: 'Communication', category: 'soft', proficiency: 'advanced' }
      ],
      projects: [
        {
          id: '1',
          name: 'Task Management App',
          description: 'Full-stack web application for personal task management with user authentication, drag-and-drop functionality, and real-time updates.',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
          link: 'https://taskmanager.emilydavis.dev',
          github: 'https://github.com/emilydavis/task-manager'
        },
        {
          id: '2',
          name: 'Recipe Finder',
          description: 'React application that helps users find recipes based on available ingredients using external API integration.',
          technologies: ['React', 'CSS3', 'Recipe API', 'Local Storage'],
          link: 'https://recipes.emilydavis.dev',
          github: 'https://github.com/emilydavis/recipe-finder'
        },
        {
          id: '3',
          name: 'Personal Portfolio',
          description: 'Responsive portfolio website showcasing projects and skills with modern design and smooth animations.',
          technologies: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'],
          link: 'https://emilydavis.dev',
          github: 'https://github.com/emilydavis/portfolio'
        }
      ]
    }
  }
];

export const getTemplatesByCategory = (category: string) => {
  return resumeTemplates.filter(template => template.category === category);
};

export const getTemplatesByLevel = (level: string) => {
  return resumeTemplates.filter(template => template.level === level);
};

export const getTemplateById = (id: string) => {
  return resumeTemplates.find(template => template.id === id);
};