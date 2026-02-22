'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { PlayCircle, Video, Mic, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MockInterviewPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [sessionActive, setSessionActive] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Frontend Developer');

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (user?.role !== 'student') {
        router.push('/dashboard');
        return null;
    }

    const handleStartSession = () => {
        setSessionActive(true);
    };

    const handleEndSession = () => {
        if (confirm('Are you sure you want to end this practice session?')) {
            setSessionActive(false);
        }
    };

    return (
        <div className="layout-container section-spacing space-y-12 max-w-6xl mx-auto">
            {!sessionActive && (
                <div className="space-y-4 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary mb-2">The AI Mock Interviewer</h1>
                    <p className="text-lg font-sans font-light text-secondary">Step into our simulation. Perfect your delivery with real-time feedback on pacing, filler words, and clarity.</p>
                </div>
            )}

            {!sessionActive ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="md:col-span-2 space-y-8">
                        <div className="glass-panel p-10 md:p-12 rounded-[2.5rem]">
                            <h2 className="text-3xl font-serif text-primary mb-6">Initialize Session</h2>
                            <p className="text-lg font-sans font-light text-secondary mb-10">
                                The AI interviewer will dynamically generate behavioral and technical questions based on your target profile.
                            </p>

                            <div className="space-y-6 mb-10 relative">
                                <label className="absolute left-6 transition-all duration-200 pointer-events-none text-[10px] uppercase tracking-widest px-1 bg-transparent text-secondary z-10 -top-2 font-bold">Target Role Configuration</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full rounded-2xl border-[0.5px] border-border bg-white/50 px-6 py-5 font-sans font-medium text-lg text-primary transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-inner relative z-0 appearance-none"
                                >
                                    <option value="Frontend Developer">Frontend Developer</option>
                                    <option value="Backend Developer">Backend Developer</option>
                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                    <option value="Data Scientist">Data Scientist</option>
                                    <option value="Product Manager">Product Manager</option>
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5">
                                <Button onClick={handleStartSession} className="w-full sm:w-auto h-14 rounded-full px-12 font-serif text-xl bg-primary text-white hover:bg-black/90 transition-all shadow-xl shadow-primary/20">
                                    <PlayCircle className="w-6 h-6 mr-3" />
                                    Commence Simulation
                                </Button>
                            </div>
                        </div>

                        <div className="px-4">
                            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-secondary mb-4">Simulation History</h3>
                            <div className="space-y-4">
                                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div>
                                        <h4 className="font-serif font-bold text-lg text-primary">Senior Frontend Developer</h4>
                                        <p className="text-xs font-sans font-semibold text-secondary uppercase tracking-widest mt-1">Oct 12 • 15 mins</p>
                                    </div>
                                    <Badge variant="success" className="font-sans font-bold text-[10px] uppercase px-3 py-1.5 shadow-sm">
                                        85% Clarity
                                    </Badge>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div>
                                        <h4 className="font-serif font-bold text-lg text-primary">React Technical Core</h4>
                                        <p className="text-xs font-sans font-semibold text-secondary uppercase tracking-widest mt-1">Oct 05 • 25 mins</p>
                                    </div>
                                    <Badge variant="warning" className="font-sans font-bold text-[10px] uppercase px-3 py-1.5 shadow-sm">
                                        62% Clarity
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="glass-panel p-8 bg-emerald-500/5 border-emerald-500/20 rounded-3xl">
                            <h3 className="font-serif font-bold text-xl text-emerald-900 mb-6 flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Optimal Parameters
                            </h3>
                            <ul className="space-y-4 text-sm font-sans font-medium text-emerald-800/80 leading-relaxed">
                                <li className="flex items-start gap-3"><span className="text-emerald-500">•</span> Execute the STAR method for behavioral responses.</li>
                                <li className="flex items-start gap-3"><span className="text-emerald-500">•</span> Maintain moderate audio pacing for optimal transcription fidelity.</li>
                                <li className="flex items-start gap-3"><span className="text-emerald-500">•</span> Ensure adequate facial illumination.</li>
                            </ul>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl">
                            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-secondary mb-6">Hardware Status</h3>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm font-sans font-bold text-primary">
                                        <Video className="w-5 h-5 mr-3 text-secondary" /> Video Input
                                    </div>
                                    <Badge variant="success" className="bg-emerald-100/50 text-emerald-700 font-bold uppercase text-[9px] px-2 py-1 border-[0.5px] border-emerald-200">Online</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm font-sans font-bold text-primary">
                                        <Mic className="w-5 h-5 mr-3 text-secondary" /> Audio Array
                                    </div>
                                    <Badge variant="success" className="bg-emerald-100/50 text-emerald-700 font-bold uppercase text-[9px] px-2 py-1 border-[0.5px] border-emerald-200">Online</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Teleprompter Area */}
                        <div className="flex-1 glass-panel rounded-[2rem] p-10 md:p-16 flex flex-col justify-center min-h-[400px]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            >
                                <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-accent mb-6">Current Prompt</h3>
                                <p className="font-serif text-3xl md:text-5xl text-primary leading-tight font-bold">
                                    "Could you tell me about a time you had to optimize the performance of a React application?"
                                </p>
                            </motion.div>
                        </div>

                        {/* Video / Metrics Panel */}
                        <div className="w-full md:w-[350px] flex flex-col gap-6">
                            {/* Video Feed Placeholder */}
                            <div className="glass-panel p-2 rounded-[2rem] bg-primary overflow-hidden relative aspect-[3/4]">
                                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest flex items-center border-[0.5px] border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                                    Recording
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary">
                                    <div className="w-20 h-20 rounded-full border-[0.5px] border-secondary/30 flex items-center justify-center mb-4">
                                        <Video className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="text-xs font-sans uppercase tracking-widest font-semibold opacity-50">Camera Matrix Active</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="glass-panel p-6 rounded-[2rem] flex items-center justify-between">
                                <div className="text-sm font-sans font-bold text-primary tracking-widest">02:45</div>
                                <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-black/20 hover:scale-105 transition-transform group" onClick={handleEndSession}>
                                    <div className="w-6 h-6 rounded-sm bg-red-500 group-hover:bg-red-400 transition-colors" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                    <div className="h-1 w-6 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                    <div className="h-1 w-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </div>
    );
}
