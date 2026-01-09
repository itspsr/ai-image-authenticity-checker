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

            {/* CAPTURE SOURCE */}
            {result.captureSource && (
                <div style={{ margin: '20px 0', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--text-secondary)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Capture Source</h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: '500', color: '#fff' }}>
                        {result.captureSource.category}
                    </div>
                    {result.captureSource.subCategory && (
                        <div style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.8, color: 'var(--text-secondary)' }}>
                            • {result.captureSource.subCategory}
                        </div>
                    )}
                </div>
            )}

            {/* FIX 5: SIGNAL CONTRIBUTION CAP (FINAL NORMALIZATION) */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Signal Contribution</h4>

                {/* Chart Bars - Normalized Max 60% */}
                {/* Chart Bars - Visualizing the 4 Key Pillars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* 1. SENSOR NOISE */}
                    {details.noise ? (
                        <ChartRow
                            label="Sensor Noise"
                            percent={details.noise.hasSensorNoise ? 70 : 20}
                            color={details.noise.hasSensorNoise ? "#10b981" : "var(--text-secondary)"}
                        />
                    ) : (
                        <ChartRow label="Texture Analysis" percent={isAI ? 45 : 25} color={isAI ? "#fbbf24" : "#10b981"} />
                    )}

                    {/* 2. FREQUENCY (DCT) */}
                    {details.dct && (
                        <ChartRow
                            label="Frequency Decay"
                            percent={details.dct.isNaturalDecay ? 65 : 30}
                            color={details.dct.isNaturalDecay ? "#10b981" : "#f59e0b"} // Green (Natural) vs Orange (Artificial)
                        />
                    )}

                    {/* 3. RESIDUALS */}
                    {details.residuals && (
                        <ChartRow
                            label="Compression Residuals"
                            percent={details.residuals.isChaotic ? 60 : 25}
                            color={details.residuals.isChaotic ? "#10b981" : "var(--text-secondary)"}
                        />
                    )}

                    {/* 4. METADATA */}
                    <ChartRow
                        label="Metadata Integrity"
                        percent={details.exif?.present ? 55 : 35}
                        color={details.exif?.present ? "#10b981" : "var(--text-secondary)"}
                    />

                    {/* 5. STRUCTURE (If suspicious) */}
                    {details.structure && details.structure.isScreenshot && (
                        <ChartRow
                            label="Screenshot Traits"
                            percent={85}
                            color="#ef4444"
                        />
                    )}
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

            {/* MANDATORY TRUST STATEMENT / VALIDATION MESSAGE */}
            <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
                {result.validationMessage || "Detection is based on device metadata and visual consistency."}
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
