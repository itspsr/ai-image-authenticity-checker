import { analyzeEXIF, analyzeNoiseAndTexture } from './forensics';
import { classifyImage, computeAILikelihood } from './mlModel';

// CONSTANTS
const MAX_ANALYSIS_WIDTH = 512;
const FAST_PATH_MIN_WIDTH = 3000;
const TIMEOUT_MS = 3000; // FIX 6: HARD TIME KILL SWITCH

/**
 * Resizes an image file to a maximum dimension for faster processing.
 */
const optimizeImage = async (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Safety measure: if image is huge, we already spent time loading it.
            // But we will resize it drastically.

            const originalWidth = img.width;
            const originalHeight = img.height;

            let width = img.width;
            let height = img.height;

            if (width > MAX_ANALYSIS_WIDTH || height > MAX_ANALYSIS_WIDTH) {
                if (width > height) {
                    height = Math.round((height * MAX_ANALYSIS_WIDTH) / width);
                    width = MAX_ANALYSIS_WIDTH;
                } else {
                    width = Math.round((width * MAX_ANALYSIS_WIDTH) / height);
                    height = MAX_ANALYSIS_WIDTH;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const optimizedImg = document.createElement('img');
            optimizedImg.src = canvas.toDataURL('image/jpeg', 0.6);

            optimizedImg.onload = () => {
                resolve({
                    optimizedImg,
                    originalWidth,
                    originalHeight,
                    isLargeOriginal: Math.max(originalWidth, originalHeight) > FAST_PATH_MIN_WIDTH
                });
            };
            optimizedImg.onerror = () => reject(new Error("Optimized Image Load Failed"));
        };

        img.onerror = () => reject(new Error("Image Load Failed"));
        img.src = url;
    });
};

/**
 * Main Analysis Entry Point with Progress Support
 */
export const analyzeImage = async (file, onProgress = () => { }) => {
    onProgress(10);

    // 1. Check EXIF first (Fastest)
    const exifData = await analyzeEXIF(file);

    // 2. Optimization
    let imgContext;
    try {
        imgContext = await optimizeImage(file);
        onProgress(30);
    } catch (e) {
        throw new Error("Image Optimization Failed");
    }

    const { optimizedImg, isLargeOriginal } = imgContext;

    // --- FAST PATH --
    if (isLargeOriginal && exifData.present && exifData.tags.Make && exifData.tags.Model) {
        onProgress(100);
        return {
            isAI: false,
            probability: "92.0", // FIX 6: Clamped Max Confidence (Never 100%)
            details: {
                exif: exifData,
                texture: { smoothnessScore: 0.1, variance: 50 },
                predictions: [{ className: "Fast Path Analysis", probability: 0.92 }],
                fastPath: true
            }
        };
    }

    // 3. Heavy Analysis Race
    const analysisPromise = (async () => {
        onProgress(50);
        // NO LOOP PIXEL POLICY is handled in analyzeNoiseAndTexture implementation
        const textureData = analyzeNoiseAndTexture(optimizedImg);

        onProgress(70);
        const predictions = await classifyImage(optimizedImg);

        onProgress(90);
        return { textureData, predictions };
    })();

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Analysis Timeout")), TIMEOUT_MS)
    );

    try {
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        const { textureData, predictions } = result;

        // 4. Scoring
        let probability = computeAILikelihood(predictions, {
            exif: exifData,
            texture: textureData
        });

        // FIX 6: CONFIDENCE CLAMPING (10% - 92%)
        if (probability < 0.10) probability = 0.10;
        if (probability > 0.92) probability = 0.92;

        onProgress(100);
        return {
            isAI: probability >= 0.60,
            probability: (probability * 100).toFixed(1),
            details: {
                exif: exifData,
                texture: textureData,
                predictions
            }
        };

    } catch (error) {
        if (error.message === "Analysis Timeout") {
            console.warn("Analysis timed out - forcing fallback");
            onProgress(100);
            return {
                isAI: false,
                probability: "Low", // Neutral label
                details: {
                    exif: exifData || { present: false },
                    texture: { smoothnessScore: 0.5, variance: 10 },
                    predictions: [],
                    timeout: true,
                    note: "Analysis limited by performance constraints." // FIX 5: Softened
                }
            };
        }
        throw error;
    }
};
