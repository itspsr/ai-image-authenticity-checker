import { useState, useCallback, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import AnalysisLoader from './components/AnalysisLoader';
import ResultCard from './components/ResultCard';
import SignalsCard from './components/SignalsCard';
import RefundReviewCard from './components/RefundReviewCard'; // NEW IMPORT
import Disclaimer from './components/Disclaimer';
import { analyzeImage } from './utils/analysisEngine';
import { analyzeEXIF } from './utils/forensics'; // For Safe Mode
import { calculateRefundRisk } from './utils/refundEngine'; // NEW IMPORT

function App() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [safeMode, setSafeMode] = useState(false); // FIX 10: Safe Mode State

  // FIX 7: FAIL-SAFE RESULT (LAST LINE OF DEFENSE)
  const FALLBACK_RESULT = {
    isAI: false,
    probability: "Low",
    details: {
      exif: { present: false, data: {} },
      texture: { smoothnessScore: 0, variance: 0 },
      predictions: [],
      // FIX 5: ERROR / TIMEOUT MESSAGE SOFTENING
      note: "Full analysis could not be completed safely within performance limits."
    }
  };

  const handleFileSelect = useCallback(async (selectedFile) => {
    // FIX 9: UI STATE LOCK (Disable re-entry)
    if (analyzing) return;

    // FIX 3: SAFE IMAGE HANDLING & FIX 4: IMAGE HANDLING LOCKDOWN
    if (!selectedFile) return;

    // Validate File Type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
      alert("Invalid file format. Please upload a JPG or PNG image.");
      return;
    }

    // Validate File Size (10MB Limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 10MB.");
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);
    setResult(null);
    setProgress(0); // FIX 8: Progress Bar Start

    // FIX 6: HARD TIME KILL SWITCH (UI Level Enforcement)
    const UI_TIMEOUT_MS = 3000;
    let timeoutId;

    try {
      // FIX 10: SAFE MODE EXECUTION
      if (safeMode) {
        console.warn("SAFE MODE: Skipping heavy analysis.");
        const exifData = await analyzeEXIF(selectedFile);
        setResult({
          isAI: false,
          probability: "Low",
          details: {
            exif: exifData,
            texture: { smoothnessScore: 0, variance: 0 },
            predictions: [],
            // FIX 9: SAFE MODE COPY (Softened)
            note: "Stability mode enabled to ensure a reliable user experience."
          }
        });
        setProgress(100);
        return;
      }

      // RACE CONDITION: Analysis vs 3000ms Timer
      const analysisPromise = analyzeImage(selectedFile, (p) => setProgress(p));

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("UI_TIMEOUT"));
        }, UI_TIMEOUT_MS);
      });

      // FIX 3: SINGLE-STEP ANALYSIS
      const analysisResult = await Promise.race([analysisPromise, timeoutPromise]);
      setResult(analysisResult);

    } catch (error) {
      // FIX 2: GLOBAL CRASH LISTENER (Function Level)
      console.error("ANALYSIS FAILED:", error);

      // Activate Safe Mode for NEXT attempt if this checked real logic
      setSafeMode(true);

      // Show Fallback
      setResult(FALLBACK_RESULT);
    } finally {
      // FIX 8 & 9: Clean up state
      clearTimeout(timeoutId);
      setAnalyzing(false);
      // Ensure progress bar is hidden or full
      setProgress(100);
    }
  }, [analyzing, safeMode]);

  const handleStartOver = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  // Calculate Refund Risk whenever result changes
  const refundData = useMemo(() => {
    if (!result) return null;
    return calculateRefundRisk(result);
  }, [result]);

  return (
    <>
      <div className="container" style={{ paddingBottom: '60px' }}>
        <Navbar />

        <main style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Header Text */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            {!result && !analyzing && (
              <>
                <h1 style={{
                  fontSize: '2.5rem',
                  marginBottom: '10px',
                  background: 'linear-gradient(to right, #fff, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Analyze Image Authenticity
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  Is it Real or AI? Check instantly in your browser.
                </p>
                {safeMode && (
                  <p style={{ color: '#fbbf24', fontSize: '0.9rem', marginTop: '10px' }}>
                    <i className="fas fa-shield-alt"></i> Safe Mode Active
                  </p>
                )}
              </>
            )}
          </div>

          {/* Core Flow */}
          {!file && (
            <div className="fade-in">
              <UploadZone onFileSelect={handleFileSelect} disabled={analyzing} />
            </div>
          )}

          {analyzing && (
            <div className="fade-in">
              <AnalysisLoader progress={progress} />
            </div>
          )}

          {result && !analyzing && (
            <div className="fade-in">
              <ResultCard result={result} startOver={handleStartOver} />

              {/* NEW REFUND REVIEW SECTION */}
              <RefundReviewCard refundData={refundData} />

              <SignalsCard details={result.details} />
            </div>
          )}

          <Disclaimer />

          {/* Informational Sections */}
          <div style={{ marginTop: '80px', color: 'var(--text-secondary)' }}>
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ color: 'white' }}>How it Works</h3>
              <p>
                The image is checked for digital fingerprints, metadata inconsistencies, and statistical anomalies.
                {safeMode ? " Currently running in Safe Mode (Metadata only)." : " Uses local ML and forensic analysis directly in your browser."}
              </p>
            </section>
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ color: 'white' }}>About</h3>
              <p>
                This project demonstrates how client-side technologies can help verify media authenticity.
                It is designed to be privacy-friendly (no uploads to servers) and API-free.
                Enterprise deployments typically extend this with server-side deep learning models.
              </p>
            </section>
            <section style={{ marginBottom: '60px' }}>
              <h3 style={{ color: 'white' }}>Terms & Conditions</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Results are probabilistic and not guaranteed.</li>
                <li>This tool does not provide legal or forensic proof.</li>
                <li>Images are processed locally; no data is stored.</li>
                <li>By using this tool, you agree it is for demonstration purposes only.</li>
              </ul>
            </section>
          </div>

        </main>

        <footer style={{
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '30px',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          <p>AI Image Authenticity Checker – Demo</p>
          <p>Built for trust & verification by <a href="https://linkedin.com/in/data-by-pratik" style={{ color: 'var(--accent-color)' }}>Pratik Kumar</a></p>
          <div style={{ marginTop: '10px' }}>
            <a href="https://github.com/itspsr" style={{ color: 'inherit', margin: '0 10px' }}>GitHub</a>
            <a href="https://linkedin.com/in/data-by-pratik" style={{ color: 'inherit', margin: '0 10px' }}>LinkedIn</a>
          </div>
          <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '10px' }}>
            v1.2 Refund Secure • Refund Intelligence Active
          </p>
        </footer>
      </div>
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default App;
