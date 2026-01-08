import EXIF from 'exif-js';

// Analyze EXIF data presence
export const analyzeEXIF = (file) => {
    return new Promise((resolve) => {
        EXIF.getData(file, function () {
            const allTags = EXIF.getAllTags(this); // 'this' refers to the image
            const hasMake = !!allTags.Make;
            const hasModel = !!allTags.Model;
            const hasSoftware = !!allTags.Software;

            // AI images often strip metadata or have specific signatures (which we can't easily detect without a DB)
            // Real camera images usually have Make/Model.
            // Screenshot/Edited images might lack them.

            let likelihoodReal = 0.5; // Neutral start

            if (hasMake && hasModel) {
                likelihoodReal += 0.3; // Strong indicator of a camera
            } else {
                likelihoodReal -= 0.1; // Slight indicator of synthetic/edited
            }

            resolve({
                score: likelihoodReal,
                tags: allTags,
                present: Object.keys(allTags).length > 0
            });
        });
    });
};

// Simple noise variance analysis (High frequency noise detection)
// AI images (especially older GANs/early diffusers) can be "too smooth" or have uniform noise.
// Real sensors have thermal noise.
export const analyzeNoiseAndTexture = (imgElement) => {
    // Create a canvas to read pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256; // Downscale for performance
    canvas.height = 256;
    ctx.drawImage(imgElement, 0, 0, 256, 256);

    const imageData = ctx.getImageData(0, 0, 256, 256);
    const data = imageData.data;

    let totalVariance = 0;

    // Simple laplacian-like variance check on Green channel (most contributed to luminance)
    for (let i = 0; i < data.length; i += 4) {
        if (i > 4 && i < data.length - 4) {
            const current = data[i + 1]; // Green
            const prev = data[i - 3];
            const next = data[i + 5];

            // Local contrast
            totalVariance += Math.abs(current - prev) + Math.abs(current - next);
        }
    }

    // Normalize roughly
    const avgVariance = totalVariance / (256 * 256);

    // Heuristic:
    // Very low variance (< 5) -> Too smooth (AI or blurry)
    // Moderate variance (10-30) -> Natural photo
    // High variance (> 50) -> Noisy or detail rich

    let smoothnessScore = 0;
    if (avgVariance < 10) smoothnessScore = 0.8; // High chance of being artificial smoothness
    else if (avgVariance > 15) smoothnessScore = 0.2; // Natural noise

    return {
        variance: avgVariance,
        smoothnessScore // Higher means "Likely AI"
    };
}
