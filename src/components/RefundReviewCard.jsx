
import React, { useState } from 'react';

const RefundReviewCard = ({ refundData }) => {
    const [showDebug, setShowDebug] = useState(false);

    if (!refundData) return null;

    const {
        userMessage,
        statusColor,
        riskTier,
        refundRiskScore,
        decision,
        category,
        imageRisk,
        confidenceRisk,
        captureSource
    } = refundData;

    return (
        <div style={{
            marginTop: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${statusColor}`,
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 20px -5px ${statusColor}40`
        }}>
            {/* USER FACING SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#000'
                }}>
                    {riskTier === "LOW" ? "✓" : riskTier === "MEDIUM" ? "!" : "✕"}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Refund Review Status</h3>
                    <p style={{ margin: '5px 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                        {userMessage}
                    </p>
                </div>
            </div>

            {/* INTERNAL DASHBOARD (Click to toggle) */}
            <div style={{ marginTop: '15px' }}>
                <button
                    onClick={() => setShowDebug(!showDebug)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                    }}
                >
                    {showDebug ? "Hide Internal Risk Data" : "View Internal Risk Data (Admin)"}
                </button>

                {showDebug && (
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                    }}>
                        <div><strong>Risk Score:</strong> {refundRiskScore}/100</div>
                        <div><strong>Risk Tier:</strong> <span style={{ color: statusColor }}>{riskTier}</span></div>

                        <div><strong>Image Risk:</strong> +{imageRisk}</div>
                        <div><strong>Confidence Risk:</strong> +{confidenceRisk}</div>

                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '5px', paddingTop: '5px' }}>
                            <strong>Assigned Category:</strong> {category}<br />
                            <strong>Capture Source:</strong> {captureSource}<br />
                            <strong>Rec. Action:</strong> {decision}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundReviewCard;
