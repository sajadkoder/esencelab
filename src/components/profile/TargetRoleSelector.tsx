import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, Check } from 'lucide-react';
import { TARGET_ROLES } from '@/lib/constants';
import type { TargetRole } from '@/types';
import { GlassCard, GlassBadge } from '@/components/ui/Glass';

interface TargetRoleSelectorProps {
  selectedRole: TargetRole | null;
  onSelect: (role: TargetRole) => void;
}

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
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <p className="text-sm text-slate-400">Target Role</p>
            <p className="text-white font-medium">
              {selectedRole ? selectedRole.name : 'Select your target role'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-20 w-full mt-2 glass-card max-h-80 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-white/10">
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedRoles).map(([category, roles]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider bg-white/5">
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
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{role.name}</p>
                        <p className="text-xs text-slate-400">
                          {role.requiredSkills.slice(0, 4).join(', ')}
                          {role.requiredSkills.length > 4 && '...'}
                        </p>
                      </div>
                      {selectedRole?.id === role.id && (
                        <Check className="w-4 h-4 text-indigo-400" />
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
        <div className="mt-3">
          <p className="text-xs text-slate-400 mb-2">Required Skills:</p>
          <div className="flex flex-wrap gap-2">
            {selectedRole.requiredSkills.map((skill) => (
              <GlassBadge key={skill} variant="default">
                {skill}
              </GlassBadge>
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

  const priorityReasons: Record<string, string> = {
    'Python': 'Essential for most tech roles and data work',
    'JavaScript': 'Required for web development',
    'React': 'Highly demanded in frontend development',
    'SQL': 'Critical for database management',
    'Machine Learning': 'Growing field with high demand',
    'AWS': 'Cloud skills are increasingly important',
    'Git': 'Version control is essential for collaboration',
    'Data Structures': 'Core computer science knowledge',
  };

  if (gaps.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All Skills Covered!</h3>
          <p className="text-slate-400">You have all the required skills for this role.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-white mb-4">Skill Gap Analysis</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 mb-2">Priority Skills to Learn:</p>
          <div className="space-y-2">
            {gaps.map((skill, index) => (
              <div key={skill} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{skill}</p>
                  <p className="text-xs text-slate-400">
                    {priorityReasons[skill] || 'Important skill for this role'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {matched.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Skills You Have:</p>
            <div className="flex flex-wrap gap-2">
              {matched.map((skill) => (
                <GlassBadge key={skill} variant="success">
                  <Check className="w-3 h-3 mr-1" />
                  {skill}
                </GlassBadge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
