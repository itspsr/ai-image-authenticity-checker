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
    // FIX 5: ZERO-LOOP PIXEL POLICY - Use small canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128; // Smaller canvas for faster read
    canvas.height = 128; // 128x128 = 16k pixels
    ctx.drawImage(imgElement, 0, 0, 128, 128);

    const imageData = ctx.getImageData(0, 0, 128, 128);
    const data = imageData.data;

    let totalVariance = 0;
    let samples = 0;

    // FIX 5: SAMPLING POLICY - Step by 10 (sample 10%) or more.
    // User requested "Sampling max 1% pixels".
    // 128*128 = 16,384 pixels. 1% = ~164 pixels. 
    // We should skip large chunks.
    const STEP = 4 * 100; // Skip 100 pixels at a time (~1% coverage)

    for (let i = 0; i < data.length; i += STEP) {
        if (i > 4 && i < data.length - 4) {
            const current = data[i + 1]; // Green
            const prev = data[i - 3];
            const next = data[i + 5];

            // Local contrast
            totalVariance += Math.abs(current - prev) + Math.abs(current - next);
            samples++;
        }
    }

    // Normalize
    const avgVariance = samples > 0 ? totalVariance / samples : 0;

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

// FIX: Structure Analysis for Screenshots & Editing
export const analyzeStructure = (file, imageWidth, imageHeight) => {
    return new Promise((resolve) => {
        const aspect = imageWidth / imageHeight;

        // Common Screenshot Resolutions (Mobile & Desktop)
        // 19.5:9 (iPhone/New Androids) ~ 2.16
        // 16:9 ~ 1.77
        // 9:16 ~ 0.56
        // 9:19.5 ~ 0.46
        const isCommonScreenRatio =
            (Math.abs(aspect - 2.16) < 0.05) ||
            (Math.abs(aspect - 0.46) < 0.05) ||
            (Math.abs(aspect - 1.77) < 0.01) ||
            (Math.abs(aspect - 0.56) < 0.01);

        // PNGs are often screenshots. JPGs are usually cameras.
        const isPNG = file.type === 'image/png';

        const isScreenshotLikely = isPNG && isCommonScreenRatio;

        // Check for Editing Software in Metadata (if EXIF was read separately, but we can check basic tags here if passed, 
        // but ideally this is done in the EXIF block. We will resolve simple structure flags here).

        resolve({
            isScreenshot: isScreenshotLikely,
            isPNG,
            aspectRatio: aspect
        });
    });
};
