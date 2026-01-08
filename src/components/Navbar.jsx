import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '40px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck color="var(--accent-color)" size={32} />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>AI Authenticity</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Demo-Grade Detector</span>
                </div>
            </div>
            <div>
                <a href="https://github.com/itspsr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    By Pratik Kumar
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
