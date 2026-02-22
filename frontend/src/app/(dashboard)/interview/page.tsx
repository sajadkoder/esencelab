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
        <div className="layout-container section-spacing space-y-10 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">Mock Interview Assistant</h1>
                <p className="text-base text-secondary">Practice with our AI interviewer to perfect your delivery.</p>
            </div>

            {!sessionActive ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card hoverable={false} className="p-8">
                            <h2 className="text-xl font-semibold text-primary mb-4">Start a Practice Session</h2>
                            <p className="text-secondary mb-8">
                                The AI interviewer will ask you behavioral and technical questions tailored to your target role.
                                You will receive real-time feedback on your speech pace, filler words, and answer clarity.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">Target Role</label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Product Manager">Product Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="primary" onClick={handleStartSession} className="w-full sm:w-auto">
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    Begin Interview
                                </Button>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Settings
                                </Button>
                            </div>
                        </Card>

                        <h3 className="text-lg font-semibold text-primary mt-8 mb-4">Past Sessions</h3>
                        <Card hoverable={false} className="divide-y divide-border p-0">
                            <div className="p-6 flex items-center justify-between hover:bg-background/50 transition-colors">
                                <div>
                                    <h4 className="font-medium text-primary">Frontend Developer Practice</h4>
                                    <p className="text-sm text-secondary">Oct 12, 2023 • 15 mins</p>
                                </div>
                                <Badge variant="success">Great (85%)</Badge>
                            </div>
                            <div className="p-6 flex items-center justify-between hover:bg-background/50 transition-colors">
                                <div>
                                    <h4 className="font-medium text-primary">React Technical Interview</h4>
                                    <p className="text-sm text-secondary">Oct 05, 2023 • 25 mins</p>
                                </div>
                                <Badge variant="warning">Needs Work (62%)</Badge>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card hoverable={false} className="bg-emerald-50 border-emerald-100 p-6">
                            <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2" /> Tips for Success
                            </h3>
                            <ul className="space-y-3 text-sm text-emerald-700">
                                <li className="flex items-start"><span className="mr-2">•</span> Use the STAR method (Situation, Task, Action, Result) for behavioral questions.</li>
                                <li className="flex items-start"><span className="mr-2">•</span> Speak clearly and at a moderate pace to allow the AI to transcribe accurately.</li>
                                <li className="flex items-start"><span className="mr-2">•</span> Ensure your background is quiet and well-lit.</li>
                            </ul>
                        </Card>

                        <Card hoverable={false} className="p-6">
                            <h3 className="font-medium text-primary mb-4">System Check</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-secondary">
                                        <Video className="w-4 h-4 mr-2" /> Camera
                                    </div>
                                    <Badge variant="success">Ready</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-secondary">
                                        <Mic className="w-4 h-4 mr-2" /> Microphone
                                    </div>
                                    <Badge variant="success">Ready</Badge>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto"
                >
                    <Card hoverable={false} className="overflow-hidden p-0 border border-border">
                        <div className="bg-black aspect-video relative flex items-center justify-center">
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                                Recording
                            </div>

                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-700">
                                    <Video className="w-10 h-10 text-gray-500" />
                                </div>
                                <p className="text-gray-400">Camera preview will appear here</p>
                            </div>

                            <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-end">
                                <div className="bg-black/60 backdrop-blur-md max-w-lg rounded-2xl p-4 border border-white/10">
                                    <p className="text-white text-sm">
                                        <span className="font-semibold text-accent mb-1 block">AI Interviewer</span>
                                        "Could you tell me about a time you had to optimize the performance of a React application? What specific metrics did you focus on?"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={handleEndSession}>
                                    End Session
                                </Button>
                                <div className="text-sm font-mono text-secondary">02:45</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                                    <Video className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>

                    <div className="mt-6 flex justify-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-sm text-secondary ml-2">Listening to your answer...</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
