import React from 'react';
import { Activity, Camera, FileDigit, Cpu } from 'lucide-react';

const SignalItem = ({ icon: Icon, label, value, statusColor }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid var(--glass-border)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon size={18} color="var(--text-secondary)" />
            <span>{label}</span>
        </div>
        <span style={{
            color: statusColor,
            fontWeight: '500'
        }}>
            {value}
        </span>
    </div>
);

const SignalsCard = ({ details }) => {
    const { exif, texture, predictions } = details;

    // FIX 4: METADATA STATUS WORDING ALIGNMENT
    const hasExif = exif.present;

    // FIX 3: SENSOR PATTERN WORDING & FIX 6: TEXTURE/VARIANCE DISPLAY
    const variance = texture.variance;
    let textureLabel = "Inconclusive texture signal";
    let textureColor = "var(--text-secondary)";

    if (variance < 5) {
        // "Artificial" removed unless high confidence elsewhere - using neutral "Elevated uniformity"
        textureLabel = "Elevated uniformity";
        textureColor = "#f59e0b"; // Neutral Warning
    } else if (variance >= 5 && variance < 15) {
        textureLabel = "Within natural range";
        textureColor = "var(--success-color)";
    } else {
        textureLabel = "Inconclusive texture signal";
        textureColor = "var(--text-secondary)";
    }

    return (
        <div className="glass-card">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--accent-color)" />
                Analysis Signals
            </h3>

            <SignalItem
                icon={FileDigit}
                label="EXIF Metadata"
                value={hasExif ? "Camera Metadata Detected" : "Unavailable or Stripped"}
                statusColor={hasExif ? "var(--success-color)" : "var(--text-secondary)"}
            />

            <SignalItem
                icon={Camera}
                label="Sensor Pattern"
                value={textureLabel}
                statusColor={textureColor}
            />

            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, display: 'flex', gap: '8px' }}>
                    <Cpu size={14} style={{ marginTop: '3px', minWidth: '14px' }} />
                    {/* FIX 7: SOFTEN AI INFERENCE COPY */}
                    <span>
                        Pattern similarity observed with known generative image characteristics. This is a probabilistic assessment, not a definitive classification.
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SignalsCard;
