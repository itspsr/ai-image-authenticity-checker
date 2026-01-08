import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const UploadZone = ({ onFileSelect }) => {

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
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
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
                id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
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
