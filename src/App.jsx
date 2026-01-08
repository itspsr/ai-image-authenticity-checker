import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import AnalysisLoader from './components/AnalysisLoader';
import ResultCard from './components/ResultCard';
import SignalsCard from './components/SignalsCard';
import Disclaimer from './components/Disclaimer';
import { analyzeImage } from './utils/analysisEngine';

function App() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setAnalyzing(true);
    setResult(null);

    // Artificial minimum delay for UX (2.5s)
    const delayPromise = new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Run analysis
      const analysisResult = await analyzeImage(selectedFile);

      // Wait for at least the delay
      await delayPromise;

      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image. Please try another file.");
      setFile(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleStartOver = () => {
    setFile(null);
    setResult(null);
  };

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
              </>
            )}
          </div>

          {/* Core Flow */}
          {!file && (
            <div className="fade-in">
              <UploadZone onFileSelect={handleFileSelect} />
            </div>
          )}

          {analyzing && (
            <div className="fade-in">
              <AnalysisLoader />
            </div>
          )}

          {result && !analyzing && (
            <div className="fade-in">
              <ResultCard result={result} startOver={handleStartOver} />
              <SignalsCard details={result.details} />
            </div>
          )}

          <Disclaimer />

          {/* Informational Sections */}
          <div style={{ marginTop: '80px', color: 'var(--text-secondary)' }}>

            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ color: 'white' }}>How it Works</h3>
              <p>
                The image is analyzed directly in your browser using a lightweight TensorFlow.js model and forensic heuristics.
                We check for missing metadata, unnatural smoothness, and noise patterns typical of generative AI.
                Common signs of AI include stripped EXIF data and uniform noise distributions.
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
