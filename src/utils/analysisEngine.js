import { analyzeEXIF, analyzeNoiseAndTexture } from './forensics';
import { classifyImage, computeAILikelihood } from './mlModel';

export const analyzeImage = async (file) => {
    console.log("Starting analysis for:", file.name);

    // 1. Create a dummy image element to read pixels
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise(resolve => img.onload = resolve);

    // 2. Parallel execution of checks
    // Heuristics
    const exifData = await analyzeEXIF(file);
    const textureData = analyzeNoiseAndTexture(img);

    // ML
    const predictions = await classifyImage(img);

    // 3. Compute Final Score
    const probability = computeAILikelihood(predictions, {
        exif: exifData,
        texture: textureData
    });

    // Clean up
    URL.revokeObjectURL(objectUrl);

    const isAI = probability >= 0.60; // Threshold

    return {
        isAI,
        probability: (probability * 100).toFixed(1),
        details: {
            exif: exifData,
            texture: textureData,
            predictions
        }
    };
};
