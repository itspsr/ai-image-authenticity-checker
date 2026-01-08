import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const UploadZone = ({ onFileSelect, disabled }) => {

    const handleDrop = (e) => {
        e.preventDefault();
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (disabled) return;
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className="glass-card"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: '2px dashed var(--glass-border)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto'
            }}
        >
            <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleChange}
                style={{ display: 'none' }}
                id="file-upload"
                disabled={disabled}
            />
            <label htmlFor="file-upload" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                }}>
                    <Upload size={40} color="var(--accent-color)" />
                </div>
                <h3 style={{ margin: '0 0 10px 0' }}>Upload an Image to Analyze</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                    Drag & drop or click to select. All processing happens locally in your browser.
                </p>
            </label>
        </div>
    );
};

export default UploadZone;
