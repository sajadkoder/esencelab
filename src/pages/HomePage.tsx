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

const stats = [
  { value: '50K+', label: 'Students' },
  { value: '2K+', label: 'Jobs' },
  { value: '500+', label: 'Companies' },
  { value: '10K+', label: 'Placements' }
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold">Esencelab</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-xs text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Now live in India
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Close the<br />
              <span className="text-gray-500">career gap.</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
              AI-powered campus recruitment platform for Indian students. 
              Upload your resume. Get matched. Get placed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition-all"
              >
                Start free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg text-gray-400 hover:text-white transition-colors"
              >
                Learn more
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[#222]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
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
            <p className="text-gray-400 max-w-lg mx-auto">
              Built specifically for Indian campus placements with AI-powered features
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
                className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-[#333] transition-colors"
              >
                <feature.icon className="w-8 h-8 mb-4 text-white" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-[#222]">
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
                <div className="text-5xl font-bold text-[#222] mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[#222]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get placed?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of Indian students who got their dream jobs through Esencelab
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition-all"
            >
              Create free account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#222]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-medium">Esencelab</span>
          </div>
          <p className="text-xs text-gray-500">
            Built for Indian students
          </p>
        </div>
      </footer>
    </div>
  );
}
