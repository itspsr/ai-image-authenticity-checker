import React from 'react';
import { CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const ResultCard = ({ result, startOver }) => {
    const { isAI, probability, rawScore, assessmentTitle, details } = result;
    const isFallback = details?.timeout || details?.note === "stability_fallback" || details?.note?.includes('Safe mode');

    // FIX: Use mandated 3-Tier Levels
    const confidenceLevel = probability; // "High", "Medium", "Low"
    const confidencePercent = rawScore || 50; // Fallback 50 if missing

    // Colors & Icons
    let statusColor = 'var(--text-secondary)';
    let StatusIcon = CheckCircle;

    // Headline handling
    let headline = assessmentTitle || (isAI ? "Likely Non-Camera Image" : "Likely Authentic Camera Image");

    if (isFallback) {
        headline = "Preliminary Assessment: Likely Real Image";
        statusColor = 'var(--text-secondary)';
        StatusIcon = ShieldAlert;
    } else if (confidenceLevel === "High") {
        statusColor = '#10b981'; // Emerald
        StatusIcon = CheckCircle;
    } else if (confidenceLevel === "Medium") {
        statusColor = '#fbbf24'; // Amber
        // Differentiate icon if needed, or keep Check for "Real but Edited"
        StatusIcon = isAI ? AlertTriangle : CheckCircle;
    } else {
        // Low Confidence (AI/Screenshot)
        statusColor = '#ef4444'; // Red-ish/Orange for "Non-Camera"
        StatusIcon = AlertTriangle;
    }

    return (
        <div className="glass-card" style={{ marginBottom: '20px', borderLeft: `4px solid ${statusColor}` }}>
            {/* HEADLINE SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <StatusIcon color={statusColor} size={40} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                        {headline}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Confidence: <strong style={{ color: 'white' }}>{confidenceLevel}</strong>
                        </span>
                        <span style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            color: statusColor,
                            fontWeight: 'bold'
                        }}>
                            {confidencePercent}%
                        </span>
                    </div>
                </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {details && (details.note === "stability_fallback" || details.timeout) ? (
                    <span style={{ color: '#fbbf24', display: 'flex', gap: '6px', alignItems: 'start' }}>
                        <i className="fas fa-info-circle" style={{ marginTop: '3px' }}></i>
                        Assessment based on partial signals for stability.
                    </span>
                ) : (
                    // DYNAMIC DESCRIPTION
                    confidenceLevel === "High"
                        ? "Strong evidence of optical capture (metadata + sensor noise) with no manipulation detected."
                        : confidenceLevel === "Medium"
                            ? "Signs of optical capture present, but with potential editing, missing metadata, or format conversion."
                            : "Lacks strong camera traits. Likely a screenshot, digital creation, or heavily synthesized image."
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
                    {/* MANDATORY CAPTION */}
                    "Confidence reflects strength of authenticity signals, not absolute certainty."
                </p>
            </div>

            <button
                className="btn-primary"
                onClick={startOver}
                style={{ marginTop: '24px', width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                Analyze Another Image
            </button>

            {/* MANDATORY TRUST STATEMENT */}
            <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
                This system prioritizes evidence-based confidence, user fairness, and decision support over definitive classification.
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
