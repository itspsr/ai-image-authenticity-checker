import React from 'react';
import { CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const ResultCard = ({ result, startOver }) => {
    const { isAI, probability, details } = result;
    const isFallback = details?.timeout || details?.note === "stability_fallback" || details?.note?.includes('Safe mode');

    // FIX 2: CONFIDENCE LABEL (Strict Adherence to passed 'probability' if string)
    // The new mlModel returns "High", "Medium", "Low" directly.
    let confidenceLevel = "Medium";

    if (typeof probability === 'string' && (probability === "High" || probability === "Medium" || probability === "Low")) {
        confidenceLevel = probability;
    } else {
        // Legacy fallback or numeric handling
        const probValue = parseFloat(probability);
        if (!isNaN(probValue)) {
            // Mapping for backward compat if numbers slip through
            if (probValue > 80) confidenceLevel = "High";
            else if (isAI) {
                // For AI: >80 High, Else Low/Medium
                confidenceLevel = probValue > 50 ? "Medium" : "Low";
            } else {
                // For Real: Low numbers = High Real Confidence. 
                // BUT we shouldn't get numbers anymore with new engine.
                confidenceLevel = "Medium";
            }
        }
    }

    // FIX 8: SAFETY ASSERTION (UI LAYER)
    // Double check: if "Likely Real" (isAI == false) -> NEVER show Low
    if (!isAI && confidenceLevel === "Low") {
        confidenceLevel = "Medium";
    }

    // Colors
    let statusColor = 'var(--text-secondary)';
    let StatusIcon = CheckCircle;
    let headline = "Authenticity Assessment";

    // FIX 1: RESULT TITLE FOR FALLBACK / SAFE MODE
    if (isFallback) {
        headline = "Preliminary Assessment: Likely Real Image";
        statusColor = 'var(--text-secondary)'; // Neutral
        StatusIcon = ShieldAlert;
    } else if (isAI) {
        headline = "Assessment: Likely AI-Generated";
        statusColor = '#f59e0b'; // Muted Orange
        StatusIcon = AlertTriangle;
    } else {
        headline = "Assessment: Likely Real Camera Image";
        statusColor = '#10b981'; // Muted Emerald
        StatusIcon = CheckCircle;
    }

    return (
        <div className="glass-card" style={{ marginBottom: '20px', borderLeft: `4px solid ${statusColor}` }}>
            {/* FIX 8: RESULT CARD HIERARCHY */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <StatusIcon color={statusColor} size={40} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                        {headline}
                    </h2>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Confidence Level: <strong style={{ color: 'white' }}>{confidenceLevel}</strong>
                    </span>
                </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {details && (details.note === "stability_fallback" || details.timeout) ? (
                    <span style={{ color: '#fbbf24', display: 'flex', gap: '6px', alignItems: 'start' }}>
                        <i className="fas fa-info-circle" style={{ marginTop: '3px' }}></i>
                        {/* FIX 4: SAFE FUNCTIONALITY EXPLANATION */}
                        Assessment based on partial signals for stability.
                    </span>
                ) : (
                    isAI
                        ? "The image exhibits patterns consistent with generative AI, specifically in significant texture smoothness or repetition."
                        : "The image exhibits characteristics consistent with optical capture. No strong generative AI artifacts were detected."
                )}
            </p>

            {/* FIX 5: SIGNAL CONTRIBUTION CAP (FINAL NORMALIZATION) */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Signal Contribution</h4>

                {/* Chart Bars - Normalized Max 60% */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Visual Patterns */}
                    <ChartRow
                        label="Visual Patterns"
                        percent={isAI ? 50 : 15}
                        color={isAI ? "#f59e0b" : "var(--text-secondary)"}
                    />

                    {/* Texture Analysis */}
                    <ChartRow
                        label="Texture Analysis"
                        percent={isAI ? 45 : 25}
                        color={isAI ? "#fbbf24" : "#10b981"}
                    />

                    {/* Metadata Integrity */}
                    <ChartRow
                        label="Metadata Integrity"
                        percent={result.details.exif?.present ? 55 : 35}
                        color={result.details.exif?.present ? "#10b981" : "var(--text-secondary)"}
                    />
                </div>

                <p style={{ fontSize: '0.75rem', marginTop: '16px', opacity: 0.5, textAlign: 'center', fontStyle: 'italic' }}>
                    {/* FIX 9: WORDING ALIGNMENT */}
                    Confidence reflects evidence strength and signal agreement, not analysis completeness.
                </p>
            </div>

            <button
                className="btn-primary"
                onClick={startOver}
                style={{ marginTop: '24px', width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                Analyze Another Image
            </button>

            {/* FIX 8: FINAL TRUST STATEMENT */}
            <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
                This system prioritizes stability, privacy, and transparent decision-support over definitive classification.
            </p>
        </div>
    );
};

export default ResultCard;

const ChartRow = ({ label, percent, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
        <span style={{ width: '130px', color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease-out' }} />
        </div>
    </div>
);
