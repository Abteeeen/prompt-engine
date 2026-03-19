import React from 'react';

interface ArenaResult {
    modelId: string;
    modelName: string;
    response?: string;
    error?: string;
    status: 'success' | 'error';
}

interface JuryVerdict {
    winner: string;
    reasoning: string;
}

interface ArenaModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: ArenaResult[];
    jury: JuryVerdict;
    prompt: string;
}

export function ArenaModal({ isOpen, onClose, results, jury, prompt }: ArenaModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>⚔️</span> AI Model Arena
                        </h2>
                        <p className="text-xs text-white/50 mt-1 truncate max-w-md">Input: "{prompt}"</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0a0a0c]">
                    {/* Jury Verdict */}
                    <div className="panel-gradient border border-purple-500/30 rounded-xl p-5 shadow-lg shadow-purple-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Official Jury Verdict</span>
                            <span className="text-white font-semibold">Winner: {jury.winner}</span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed italic">
                            "{jury.reasoning}"
                        </p>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((res) => (
                            <div 
                                key={res.modelId} 
                                className={`rounded-xl border p-4 transition-all ${
                                    jury.winner.includes(res.modelName) 
                                    ? 'bg-purple-900/20 border-purple-500/50 ring-1 ring-purple-500/30' 
                                    : 'bg-white/5 border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${res.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        {res.modelName}
                                    </h4>
                                    {jury.winner.includes(res.modelName) && (
                                        <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold">🏆 WINNER</span>
                                    )}
                                </div>
                                
                                <div className="bg-black/40 rounded-lg p-3 max-h-60 overflow-y-auto border border-white/5">
                                    {res.status === 'success' ? (
                                        <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed">
                                            {res.response}
                                        </pre>
                                    ) : (
                                        <p className="text-xs text-red-400 font-mono">Error: {res.error}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Powered by Everything Claude Code Fleet Orchestration</p>
                </div>
            </div>
        </div>
    );
}
