import React from 'react';
import { Info } from 'lucide-react';

const Disclaimer = () => {
    return (
        <div style={{
            marginTop: '40px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            opacity: 0.7
        }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Info size={14} />
                This analysis is probabilistic and intended for demonstration purposes only.
            </p>
            <p>
                It does not provide legal, forensic, or definitive proof. The results are based on browser-side heuristics and simplified ML models.
            </p>
            <p style={{ marginTop: '20px' }}>
                &copy; {new Date().getFullYear()} AI Image Authenticity Checker. All processing is Client-Side.
            </p>
        </div>
    );
};

export default Disclaimer;
