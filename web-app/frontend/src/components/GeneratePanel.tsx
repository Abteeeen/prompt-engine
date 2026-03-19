import React, { useState } from 'react';
import { api } from '../services/api';
import type { Template, QualityScore } from '../types';
import { ArenaModal } from './ArenaModal';

interface GeneratePanelProps {
    templates: Template[];
    onGenerate: (result: { prompt: string; qualityScore: QualityScore; source: string }) => void;
    onLoading: (loading: boolean) => void;
}

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'coding', label: 'Coding', icon: '💻' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'research', label: 'Research', icon: '🔬' },
];

export function GeneratePanel({ templates, onGenerate, onLoading }: GeneratePanelProps) {
    const [input, setInput] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isArenaLoading, setIsArenaLoading] = useState(false);
    const [arenaResults, setArenaResults] = useState<{ results: any[]; jury: any } | null>(null);
    const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);
    const [securityStatus, setSecurityStatus] = useState<{ isSafe: boolean; riskLevel: string } | null>(null);

    const handleGenerate = async () => {
        if (!input.trim() || input.trim().length < 5) return;

        setIsLoading(true);
        onLoading(true);

        try {
            const data = await api.ai.generate(input);
            onGenerate(data);
            if (data.security) setSecurityStatus(data.security);
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsLoading(false);
            onLoading(false);
        }
    };

    const handleOptimize = async () => {
        if (!input.trim() || input.trim().length < 5) return;
        setIsOptimizing(true);
        try {
            const data = await api.ai.optimize(input);
            setInput(data.optimized);
        } catch (err) {
            console.error('Optimization failed:', err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleArena = async () => {
        if (!input.trim() || input.trim().length < 5) return;
        setIsArenaLoading(true);
        onLoading(true);
        try {
            const data = await api.ai.arena(input);
            setArenaResults(data);
            setIsArenaModalOpen(true);
        } catch (err) {
            console.error('Arena failed:', err);
        } finally {
            setIsArenaLoading(false);
            onLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const filteredTemplates = activeCategory === 'all'
        ? templates.slice(0, 6)
        : templates.filter(t => t.category?.toLowerCase() === activeCategory).slice(0, 6);

    return (
        <div className="panel-gradient rounded-2xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Create Prompt</h2>
                <p className="text-sm text-white/50">Describe what you need and let AI craft the perfect prompt</p>
            </div>

            {/* Input Area */}
            <div className="glass rounded-xl p-4 mb-6">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your task... (e.g., 'Write a cold email to a startup CTO')"
                    className="w-full bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none text-sm leading-relaxed"
                    rows={4}
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-white/30">
                        {input.length > 0 ? `${input.length} chars` : 'Ctrl+Enter to generate'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing || input.trim().length < 5}
                            title="Optimize Prompt (Autonomous Optimizer)"
                            className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--accent-purple)] bg-[var(--accent-purple)]/10 hover:bg-[var(--accent-purple)]/20 disabled:opacity-30 flex items-center gap-1.5 transition-all border border-[var(--accent-purple)]/20"
                        >
                            {isOptimizing ? '✨ Optimizing...' : '✨ Optimize'}
                        </button>
                        <button
                            onClick={handleArena}
                            disabled={isArenaLoading || input.trim().length < 5}
                            title="Model Arena (Fleet Orchestration)"
                            className="px-3 py-2 rounded-lg text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 disabled:opacity-30"
                        >
                            {isArenaLoading ? '⚔️...' : '⚔️ Arena'}
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || input.trim().length < 5}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent-purple)] hover:bg-[var(--button-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <>
                                    <span>Generate</span>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {securityStatus && (
                    <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block ${securityStatus.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        🛡️ Security Shield: {securityStatus.riskLevel.toUpperCase()} RISK
                    </div>
                )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium text-white/70 mb-3">Quick Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="template-card-mini"
                            onClick={() => setInput(template.description || template.name)}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-white truncate">{template.name}</span>
                            </div>
                            <p className="text-xs text-white/40 line-clamp-2">{template.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Arena Modal */}
            {arenaResults && (
                <ArenaModal
                    isOpen={isArenaModalOpen}
                    onClose={() => setIsArenaModalOpen(false)}
                    results={arenaResults.results}
                    jury={arenaResults.jury}
                    prompt={input}
                />
            )}
        </div>
    );
}
