import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Sparkles, Target, BookOpen, Bot } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Resume Parser',
    desc: 'Extract skills, education & experience from your resume instantly'
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    desc: 'Get matched with jobs that fit your profile using AI'
  },
  {
    icon: Bot,
    title: 'Career Chatbot',
    desc: 'Ask anything about placements, interviews & career paths'
  },
  {
    icon: BookOpen,
    title: 'Learning Resources',
    desc: 'Access curated courses from GFG, Scaler & YouTube'
  }
];

type LandingTheme = 'dark' | 'light';

const LANDING_THEME_STORAGE_KEY = 'esencelab-landing-theme';

export function HomePage() {
  const [theme, setTheme] = useState<LandingTheme>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const storedTheme = window.localStorage.getItem(LANDING_THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  });
  const isLight = theme === 'light';

  useEffect(() => {
    window.localStorage.setItem(LANDING_THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className={isLight ? 'min-h-screen bg-[#f8fafc] text-[#0f172a]' : 'min-h-screen bg-black text-white'}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-black/80 border-[#222]'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${isLight ? 'bg-slate-900' : 'bg-white'}`}>
              <GraduationCap className={`w-4 h-4 ${isLight ? 'text-white' : 'text-black'}`} />
            </div>
            <span className="text-lg font-bold">Esencelab</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))}
              className={`px-3 py-2 rounded text-xs font-medium border transition-colors ${isLight ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100' : 'bg-[#111] text-gray-200 border-[#222] hover:border-[#444]'}`}
            >
              {isLight ? 'Dark mode' : 'Light mode'}
            </button>
            <Link 
              to="/login" 
              className={`text-sm transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
            >
              Sign in
            </Link>
            <Link 
              to="/login" 
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isLight ? 'bg-slate-900 text-white hover:bg-slate-700' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-6 ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#111] border-[#222] text-gray-400'}`}>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              now live in sngcet
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Close the<br />
              <span className={isLight ? 'text-slate-500' : 'text-gray-500'}>career gap.</span>
            </h1>
            
            <p className={`text-xl mb-10 max-w-xl mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              AI-powered campus recruitment platform for sngcet students. 
              Upload your resume. Get matched. Get placed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className={`group flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all ${isLight ? 'bg-slate-900 text-white hover:bg-slate-700' : 'bg-white text-black hover:bg-gray-200'}`}
              >
                Start free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'}`}
              >
                Learn more
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className={`max-w-lg mx-auto ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Built specifically for sngcet campus with AI-powered features
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl border transition-colors ${isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-[#0a0a0a] border-[#222] hover:border-[#333]'}`}
              >
                <feature.icon className={`w-8 h-8 mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`py-24 px-6 border-t ${isLight ? 'border-slate-200' : 'border-[#222]'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drop your PDF resume and our AI extracts your skills, education & experience' },
              { step: '02', title: 'Set Your Target', desc: 'Choose your dream role - SDE, Data Science, Frontend, Backend' },
              { step: '03', title: 'Get Matched', desc: 'Apply to curated jobs that match your profile with high accuracy' }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-5xl font-bold mb-4 ${isLight ? 'text-slate-200' : 'text-[#222]'}`}>{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-24 px-6 border-t ${isLight ? 'border-slate-200' : 'border-[#222]'}`}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get placed?</h2>
            <p className={`mb-8 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Join sngcet students building stronger placement outcomes with Esencelab
            </p>
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all ${isLight ? 'bg-slate-900 text-white hover:bg-slate-700' : 'bg-white text-black hover:bg-gray-200'}`}
            >
              Create free account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${isLight ? 'border-slate-200' : 'border-[#222]'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center ${isLight ? 'bg-slate-900' : 'bg-white'}`}>
              <GraduationCap className={`w-3 h-3 ${isLight ? 'text-white' : 'text-black'}`} />
            </div>
            <span className="text-sm font-medium">Esencelab</span>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
            Built for sngcet campus
          </p>
        </div>
      </footer>
    </div>
  );
}
