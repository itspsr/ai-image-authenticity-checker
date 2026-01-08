import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ResultCard = ({ result, startOver }) => {
    const { isAI, probability } = result;

    const statusColor = isAI ? 'var(--warning-color)' : 'var(--success-color)';
    const StatusIcon = isAI ? AlertTriangle : CheckCircle;

    return (
        <div className="glass-card" style={{ marginBottom: '20px', borderLeft: `4px solid ${statusColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <StatusIcon color={statusColor} size={40} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                        {isAI ? 'Likely AI-Generated' : 'Likely Real Camera Image'}
                    </h2>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Confidence: <strong style={{ color: 'white' }}>{probability}%</strong>
                    </span>
                </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAI
                    ? "The image exhibits patterns consistent with generative AI, specifically in texture smoothness and noise uniformity. It lacks standard camera sensor noise signatures."
                    : "The image contains noise patterns, sharpness, and potential metadata consistent with a physical optical sensor."}
            </p>

            <button
                className="btn-primary"
                onClick={startOver}
                style={{ marginTop: '20px', width: '100%', background: 'rgba(255,255,255,0.1)' }}
            >
                Analyze Another Image
            </button>
        </div>
    );
};

export default ResultCard;
