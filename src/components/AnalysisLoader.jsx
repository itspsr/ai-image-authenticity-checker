import React from 'react';
import { Scan } from 'lucide-react';

const AnalysisLoader = () => {
    return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="scan-animation" style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                margin: '0 auto 20px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Scan size={64} color="var(--accent-color)" />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--accent-color)',
                    boxShadow: '0 0 10px var(--accent-color)',
                    animation: 'scan 1.5s infinite linear'
                }} />
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>Analyzing Image Patterns...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Checking noise, metadata, and visual consistency.</p>

            <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default AnalysisLoader;
