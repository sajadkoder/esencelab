import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, Check } from 'lucide-react';
import type { TargetRole } from '@/types';

interface TargetRoleSelectorProps {
  selectedRole: TargetRole | null;
  onSelect: (role: TargetRole) => void;
}

const TARGET_ROLES: TargetRole[] = [
  { id: '1', name: 'Software Engineer', requiredSkills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'DSA'], category: 'Engineering' },
  { id: '2', name: 'Data Scientist', requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'], category: 'Data' },
  { id: '3', name: 'Frontend Developer', requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'], category: 'Engineering' },
  { id: '4', name: 'Backend Developer', requiredSkills: ['Python', 'SQL', 'Docker', 'AWS', 'Node.js'], category: 'Engineering' },
  { id: '5', name: 'Full Stack Developer', requiredSkills: ['React', 'Node.js', 'SQL', 'JavaScript', 'Git'], category: 'Engineering' },
  { id: '6', name: 'ML Engineer', requiredSkills: ['Python', 'ML', 'PyTorch', 'TensorFlow', 'Statistics'], category: 'AI/ML' },
  { id: '7', name: 'DevOps Engineer', requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Linux'], category: 'Operations' },
  { id: '8', name: 'Data Analyst', requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'], category: 'Data' },
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
