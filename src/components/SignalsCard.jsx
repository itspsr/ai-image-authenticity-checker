import React from 'react';
import { Activity, Camera, FileDigit, Cpu } from 'lucide-react';

const SignalItem = ({ icon: Icon, label, value, good }) => (
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
            color: good ? 'var(--success-color)' : 'var(--warning-color)',
            fontWeight: '500'
        }}>
            {value}
        </span>
    </div>
);

const SignalsCard = ({ details }) => {
    const { exif, texture } = details;

    // Logic to determine display values
    const hasExif = exif.present;
    const isSmooth = texture.smoothnessScore > 0.5;
    const variance = texture.variance.toFixed(1);

    return (
        <div className="glass-card">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--accent-color)" />
                Analysis Signals
            </h3>

            <SignalItem
                icon={FileDigit}
                label="EXIF Metadata"
                value={hasExif ? "Present" : "Missing / Stripped"}
                good={hasExif}
            />

            <SignalItem
                icon={Camera}
                label="Sensor Noise"
                value={isSmooth ? "Low (Artificial)" : "Natural Variance"}
                good={!isSmooth}
            />

            <SignalItem
                icon={Activity}
                label="Texture Score"
                value={`Variance: ${variance}`}
                good={variance > 10}
            />

            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, display: 'flex', gap: '8px' }}>
                    <Cpu size={14} style={{ marginTop: '3px' }} />
                    <span>
                        AI inference performed locally using MobileNet features to check for semantic coherence vs abstract generativeness.
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SignalsCard;
