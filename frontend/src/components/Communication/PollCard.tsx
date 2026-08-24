import React, { useState } from 'react';
import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface PollProps {
    id: string;
    question: string;
    date: string;
    expiresIn?: string;
    options: PollOption[];
    totalVotes: number;
    hasVoted?: boolean;
    onVote?: () => void;
}

export const PollCard: React.FC<PollProps> = ({
    id, question, date, expiresIn, options, totalVotes, hasVoted = false, onVote
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVote = async () => {
        if (!selectedOption || hasVoted) return;
        setIsSubmitting(true);
        try {
            await api.post(`/communication/polls/${id}/vote`, { option_id: selectedOption });
            if (onVote) onVote();
        } catch (err) {
            console.error("Failed to vote", err);
            alert("Erro ao submeter voto.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6 mb-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
                        <ChartBarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">{question}</h3>
                        <p className="text-sm text-muted-foreground">
                            {date} {expiresIn && `• Termina em: ${expiresIn}`}
                        </p>
                    </div>
                </div>
                {hasVoted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-success/15 text-success">
                        <CheckCircleIcon className="w-4 h-4 mr-1" /> Votado
                    </span>
                )}
            </div>

            <div className="mt-6 space-y-3">
                {options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return (
                        <div
                            key={option.id}
                            onClick={() => !hasVoted && setSelectedOption(option.id)}
                            className={`relative overflow-hidden rounded-md border p-4 cursor-pointer transition-all ${hasVoted
                                ? 'border-border bg-muted/30'
                                : selectedOption === option.id
                                    ? 'border-ring bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                        >
                            {/* Progress Bar Background for voted state */}
                            {hasVoted && (
                                <div
                                    className="absolute top-0 left-0 h-full bg-primary/10 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative flex items-center justify-between z-10">
                                <div className="flex items-center space-x-3">
                                    {!hasVoted && (
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOption === option.id ? 'border-primary' : 'border-input'
                                            }`}>
                                            {selectedOption === option.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                    )}
                                    <span className={`font-medium text-sm ${hasVoted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {option.text}
                                    </span>
                                </div>
                                {hasVoted && (
                                    <span className="text-sm font-semibold text-foreground">{percentage}%</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!hasVoted && (
                <div className="mt-6 flex justify-end">
                    <button
                        disabled={!selectedOption || isSubmitting}
                        onClick={handleVote}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedOption && !isSubmitting
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? 'A submeter...' : 'Submeter Voto'}
                    </button>
                </div>
            )}

            {hasVoted && (
                <div className="mt-4 text-right text-xs text-muted-foreground">
                    Total de {totalVotes} votos registados
                </div>
            )}
        </div>
    );
};
