import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, Check } from 'lucide-react';
import type { TargetRole } from '@/types';

interface TargetRoleSelectorProps {
  selectedRole: TargetRole | null;
  onSelect: (role: TargetRole) => void;
}

const TARGET_ROLES: TargetRole[] = [
  { id: 'software-engineer', name: 'Software Engineer', requiredSkills: ['DSA', 'OOP', 'Git', 'SQL', 'System Design'], category: 'Engineering' },
  { id: 'associate-software-engineer', name: 'Associate Software Engineer', requiredSkills: ['DSA', 'Java', 'Git', 'REST APIs', 'SQL'], category: 'Engineering' },
  { id: 'software-development-engineer-i', name: 'Software Development Engineer I', requiredSkills: ['DSA', 'JavaScript', 'Databases', 'Testing', 'Problem Solving'], category: 'Engineering' },
  { id: 'full-stack-developer', name: 'Full Stack Developer', requiredSkills: ['React', 'Node.js', 'SQL', 'APIs', 'Git'], category: 'Engineering' },
  { id: 'frontend-developer', name: 'Frontend Developer', requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'State Management'], category: 'Web' },
  { id: 'frontend-engineer', name: 'Frontend Engineer', requiredSkills: ['React', 'Next.js', 'Performance Optimization', 'Accessibility', 'Testing'], category: 'Web' },
  { id: 'backend-developer', name: 'Backend Developer', requiredSkills: ['Node.js', 'Python', 'SQL', 'Redis', 'Microservices'], category: 'Engineering' },
  { id: 'backend-engineer', name: 'Backend Engineer', requiredSkills: ['Java', 'Spring Boot', 'Distributed Systems', 'Databases', 'Caching'], category: 'Engineering' },
  { id: 'api-developer', name: 'API Developer', requiredSkills: ['REST', 'GraphQL', 'Node.js', 'Authentication', 'PostgreSQL'], category: 'Engineering' },
  { id: 'platform-engineer', name: 'Platform Engineer', requiredSkills: ['Kubernetes', 'CI/CD', 'Terraform', 'Observability', 'Linux'], category: 'Infrastructure' },
  { id: 'mobile-app-developer', name: 'Mobile App Developer', requiredSkills: ['Flutter', 'React Native', 'REST APIs', 'Mobile UI', 'State Management'], category: 'Mobile' },
  { id: 'android-developer', name: 'Android Developer', requiredSkills: ['Kotlin', 'Android SDK', 'Jetpack', 'REST APIs', 'Room DB'], category: 'Mobile' },
  { id: 'ios-developer', name: 'iOS Developer', requiredSkills: ['Swift', 'UIKit', 'SwiftUI', 'REST APIs', 'Core Data'], category: 'Mobile' },
  { id: 'game-developer', name: 'Game Developer', requiredSkills: ['C#', 'Unity', 'Game Physics', 'Rendering', 'OOP'], category: 'Engineering' },
  { id: 'embedded-software-engineer', name: 'Embedded Software Engineer', requiredSkills: ['C', 'C++', 'RTOS', 'Microcontrollers', 'Debugging'], category: 'Engineering' },

  { id: 'data-analyst', name: 'Data Analyst', requiredSkills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'], category: 'Data' },
  { id: 'business-analyst', name: 'Business Analyst', requiredSkills: ['SQL', 'Excel', 'Dashboarding', 'Requirement Analysis', 'Communication'], category: 'Data' },
  { id: 'bi-analyst', name: 'Business Intelligence Analyst', requiredSkills: ['Power BI', 'SQL', 'Data Modeling', 'ETL', 'DAX'], category: 'Data' },
  { id: 'data-engineer', name: 'Data Engineer', requiredSkills: ['Python', 'SQL', 'ETL', 'Airflow', 'Spark'], category: 'Data' },
  { id: 'analytics-engineer', name: 'Analytics Engineer', requiredSkills: ['dbt', 'SQL', 'Data Warehousing', 'Python', 'BI Tools'], category: 'Data' },
  { id: 'database-administrator', name: 'Database Administrator', requiredSkills: ['PostgreSQL', 'MySQL', 'Query Optimization', 'Backups', 'Replication'], category: 'Data' },
  { id: 'data-scientist', name: 'Data Scientist', requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'Feature Engineering'], category: 'AI/ML' },
  { id: 'machine-learning-engineer', name: 'Machine Learning Engineer', requiredSkills: ['Python', 'Scikit-learn', 'MLOps', 'Model Deployment', 'TensorFlow'], category: 'AI/ML' },
  { id: 'ai-engineer', name: 'AI Engineer', requiredSkills: ['LLMs', 'Prompt Engineering', 'RAG', 'Python', 'Vector Databases'], category: 'AI/ML' },
  { id: 'nlp-engineer', name: 'NLP Engineer', requiredSkills: ['Python', 'Transformers', 'spaCy', 'Text Processing', 'Evaluation Metrics'], category: 'AI/ML' },
  { id: 'computer-vision-engineer', name: 'Computer Vision Engineer', requiredSkills: ['OpenCV', 'PyTorch', 'CNNs', 'Image Processing', 'Python'], category: 'AI/ML' },
  { id: 'mlops-engineer', name: 'MLOps Engineer', requiredSkills: ['Docker', 'Kubernetes', 'MLflow', 'CI/CD', 'Cloud'], category: 'AI/ML' },

  { id: 'cloud-engineer', name: 'Cloud Engineer', requiredSkills: ['AWS', 'Terraform', 'Docker', 'IAM', 'Networking'], category: 'Cloud & DevOps' },
  { id: 'devops-engineer', name: 'DevOps Engineer', requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Monitoring'], category: 'Cloud & DevOps' },
  { id: 'site-reliability-engineer', name: 'Site Reliability Engineer (SRE)', requiredSkills: ['Kubernetes', 'Prometheus', 'Incident Response', 'Automation', 'Linux'], category: 'Cloud & DevOps' },
  { id: 'release-engineer', name: 'Release Engineer', requiredSkills: ['CI/CD', 'Git', 'Automation', 'Versioning', 'Testing'], category: 'Cloud & DevOps' },
  { id: 'systems-engineer', name: 'Systems Engineer', requiredSkills: ['Linux', 'Networking', 'Shell Scripting', 'Infrastructure', 'Monitoring'], category: 'Infrastructure' },
  { id: 'network-engineer', name: 'Network Engineer', requiredSkills: ['TCP/IP', 'Routing', 'Switching', 'Firewalls', 'Network Security'], category: 'Infrastructure' },

  { id: 'cybersecurity-analyst', name: 'Cybersecurity Analyst', requiredSkills: ['Network Security', 'SIEM', 'Incident Response', 'OWASP', 'Threat Analysis'], category: 'Security' },
  { id: 'security-engineer', name: 'Security Engineer', requiredSkills: ['AppSec', 'Threat Modeling', 'IAM', 'Cloud Security', 'Pen Testing'], category: 'Security' },
  { id: 'penetration-tester', name: 'Penetration Tester', requiredSkills: ['Kali Linux', 'Burp Suite', 'OWASP', 'Scripting', 'Vulnerability Assessment'], category: 'Security' },
  { id: 'soc-analyst', name: 'SOC Analyst', requiredSkills: ['SIEM', 'Log Analysis', 'Incident Handling', 'EDR', 'Threat Intelligence'], category: 'Security' },
  { id: 'application-security-engineer', name: 'Application Security Engineer', requiredSkills: ['Secure Coding', 'SAST/DAST', 'OWASP', 'Code Review', 'Threat Modeling'], category: 'Security' },

  { id: 'qa-engineer', name: 'QA Engineer', requiredSkills: ['Test Cases', 'Manual Testing', 'Bug Tracking', 'Regression Testing', 'Agile'], category: 'Quality' },
  { id: 'software-test-engineer', name: 'Software Test Engineer', requiredSkills: ['Selenium', 'API Testing', 'Postman', 'Test Automation', 'CI/CD'], category: 'Quality' },
  { id: 'sdet', name: 'SDET', requiredSkills: ['Java', 'Selenium', 'Cypress', 'API Automation', 'Framework Design'], category: 'Quality' },
  { id: 'performance-test-engineer', name: 'Performance Test Engineer', requiredSkills: ['JMeter', 'Load Testing', 'Profiling', 'Monitoring', 'Bottleneck Analysis'], category: 'Quality' },

  { id: 'ui-ux-designer', name: 'UI/UX Designer', requiredSkills: ['Figma', 'Wireframing', 'Design Systems', 'User Research', 'Prototyping'], category: 'Product & Design' },
  { id: 'product-designer', name: 'Product Designer', requiredSkills: ['Figma', 'UX Writing', 'Interaction Design', 'User Research', 'Design Thinking'], category: 'Product & Design' },
  { id: 'product-manager', name: 'Product Manager', requiredSkills: ['Product Strategy', 'Roadmapping', 'Analytics', 'A/B Testing', 'Stakeholder Management'], category: 'Product & Design' },
  { id: 'technical-product-manager', name: 'Technical Product Manager', requiredSkills: ['System Design', 'APIs', 'Roadmapping', 'Agile', 'Data Analysis'], category: 'Product & Design' },
  { id: 'program-manager-tech', name: 'Technical Program Manager', requiredSkills: ['Project Planning', 'Risk Management', 'Cross-functional Leadership', 'Agile', 'Metrics'], category: 'Product & Design' },

  { id: 'blockchain-developer', name: 'Blockchain Developer', requiredSkills: ['Solidity', 'EVM', 'Smart Contracts', 'Web3.js', 'Security'], category: 'Blockchain' },
  { id: 'smart-contract-engineer', name: 'Smart Contract Engineer', requiredSkills: ['Solidity', 'Hardhat', 'Testing', 'Auditing', 'Gas Optimization'], category: 'Blockchain' },
  { id: 'web3-frontend-developer', name: 'Web3 Frontend Developer', requiredSkills: ['React', 'ethers.js', 'Wallet Integration', 'TypeScript', 'Web3 UX'], category: 'Blockchain' },

  { id: 'ar-vr-developer', name: 'AR/VR Developer', requiredSkills: ['Unity', 'C#', '3D Math', 'XR SDKs', 'Performance Optimization'], category: 'Emerging Tech' },
  { id: 'iot-engineer', name: 'IoT Engineer', requiredSkills: ['Embedded C', 'MQTT', 'Sensors', 'Edge Computing', 'Cloud IoT'], category: 'Emerging Tech' },
  { id: 'robotics-engineer', name: 'Robotics Engineer', requiredSkills: ['ROS', 'C++', 'Control Systems', 'Computer Vision', 'Python'], category: 'Emerging Tech' },

  { id: 'it-support-engineer', name: 'IT Support Engineer', requiredSkills: ['Windows/Linux', 'Networking', 'Troubleshooting', 'Ticketing Systems', 'Scripting'], category: 'Support' },
  { id: 'technical-support-engineer', name: 'Technical Support Engineer', requiredSkills: ['Debugging', 'SQL Basics', 'APIs', 'Communication', 'Incident Management'], category: 'Support' },
  { id: 'solutions-engineer', name: 'Solutions Engineer', requiredSkills: ['APIs', 'Cloud Basics', 'Customer Discovery', 'Pre-sales', 'Integrations'], category: 'Support' },
];

export function TargetRoleSelector({ selectedRole, onSelect }: TargetRoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredRoles = TARGET_ROLES.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedRoles = filteredRoles.reduce((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, TargetRole[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-[#111] border border-[#222] hover:border-white transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Target className="w-4 h-4 text-white" />
          <div className="text-left">
            <p className="text-[10px] sm:text-xs text-gray-500">Target Role</p>
            <p className="text-xs sm:text-sm text-white font-medium">
              {selectedRole ? selectedRole.name : 'Select role'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-20 w-full mt-2 bg-[#0a0a0a] border border-[#222] rounded-lg max-h-64 sm:max-h-80 overflow-hidden flex flex-col"
          >
            <div className="p-2 sm:p-3 border-b border-[#222]">
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#111] border border-[#222] text-white placeholder:text-gray-500 text-xs sm:text-sm focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedRoles).map(([category, roles]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider bg-[#111]">
                    {category}
                  </div>
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        onSelect(role);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 sm:py-2.5 hover:bg-[#111] transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-xs sm:text-sm text-white">{role.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {role.requiredSkills.slice(0, 3).join(', ')}
                        </p>
                      </div>
                      {selectedRole?.id === role.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedRole && (
        <div className="mt-2 sm:mt-3">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">Skills needed:</p>
          <div className="flex flex-wrap gap-1">
            {selectedRole.requiredSkills.slice(0, 6).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-[#111] text-gray-300 text-[10px] sm:text-xs rounded border border-[#222]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SkillGapAnalysisProps {
  userSkills: string[];
  targetSkills: string[];
}

export function SkillGapAnalysis({ userSkills, targetSkills }: SkillGapAnalysisProps) {
  const matched = targetSkills.filter(skill => 
    userSkills.some(userSkill => 
      userSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const gaps = targetSkills.filter(skill => 
    !userSkills.some(userSkill => 
      userSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  if (gaps.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 sm:p-6 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">All Skills Covered!</h3>
        <p className="text-xs sm:text-sm text-gray-500">You have all required skills for this role.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 sm:p-4">
      <h3 className="font-medium text-white text-sm mb-3 sm:mb-4">Skill Gap Analysis</h3>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-2">Skills to learn:</p>
          <div className="space-y-1.5 sm:space-y-2">
            {gaps.slice(0, 5).map((skill, index) => (
              <div key={skill} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-[#111]">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] sm:text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-white">{skill}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {matched.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Skills you have:</p>
            <div className="flex flex-wrap gap-1">
              {matched.map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-white text-black text-[10px] sm:text-xs rounded font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
