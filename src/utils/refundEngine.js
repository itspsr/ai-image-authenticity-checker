
/**
 * REFUND DECISION SUPPORT SYSTEM (Layer on top of Image Authenticity)
 * 
 * LOGIC:
 * Refund Risk Score (0-100) = Image Risk + Confidence Risk
 * 
 * IMAGE RISK:
 * - Verified Camera Image: +5
 * - Camera-like (Unverified): +20
 * - Screenshot: +45
 * - AI-Generated: +60
 * - Unknown Source: +30
 * 
 * CONFIDENCE RISK:
 * - >= 80%: +0
 * - 50-79%: +10
 * - < 50%: +20
 * 
 * DECISION TIERS:
 * - 0-30: Auto-approve (Green)
 * - 31-60: Manual Review (Yellow)
 * - 61-100: Require Verification / Deny (Red)
 */

export const calculateRefundRisk = (analysisResult) => {
    if (!analysisResult) return null;

    const { assessmentTitle, rawScore, details, isAI } = analysisResult;

    // 1. DETERMINE IMAGE RISK BASE
    let imageRisk = 0;
    let category = "Unknown";

    if (assessmentTitle === "Likely Authentic Camera Image") {
        imageRisk = 5;
        category = "Verified Camera Image";
    } else if (assessmentTitle === "Likely Camera Image (Edited)") {
        imageRisk = 20;
        category = "Camera-like (Unverified)";
    } else {
        // "Likely Non-Camera Image" - Need to split based on signals
        if (details.structure?.isScreenshot) {
            imageRisk = 45;
            category = "Screenshot";
        } else if (isAI && details.texture?.smoothnessScore > 0.6) {
            // High smoothness + Low confidence = Strong AI Indicator
            imageRisk = 60;
            category = "AI-Generated";
        } else {
            // Low confidence but not smooth (e.g. noisy, blurry, or stripped metadata)
            imageRisk = 30;
            category = "Unknown Source";
        }
    }

    // 2. DETERMINE CONFIDENCE RISK
    let confidenceRisk = 0;
    if (rawScore >= 80) {
        confidenceRisk = 0;
    } else if (rawScore >= 50) {
        confidenceRisk = 10;
    } else {
        confidenceRisk = 20;
    }

    // 3. CALCULATE TOTAL RISK SCORE
    let refundRiskScore = imageRisk + confidenceRisk;
    // Clamp between 0-100
    refundRiskScore = Math.max(0, Math.min(100, refundRiskScore));

    // 4. DETERMINE DECISION & MESSAGE
    let decision = "";
    let userMessage = "";
    let statusColor = "";
    let riskTier = "";

    if (refundRiskScore <= 30) {
        riskTier = "LOW";
        decision = "Auto-approve refund";
        userMessage = "Your refund has been processed successfully.";
        statusColor = "#22c55e"; // Green
    } else if (refundRiskScore <= 60) {
        riskTier = "MEDIUM";
        decision = "Manual review required";
        userMessage = "Your request is under review. We may reach out if more details are needed.";
        statusColor = "#eab308"; // Yellow
    } else {
        riskTier = "HIGH";
        decision = "Require additional verification";
        userMessage = "We need additional verification to process this request.";
        statusColor = "#ef4444"; // Red
    }

    // 5. INFER CAPTURE SOURCE FOR DASHBOARD (Visual Label)
    let captureSource = "Unknown";
    if (details.structure?.isScreenshot) {
        captureSource = "Screenshot";
    } else if (isAI && details.texture?.smoothnessScore > 0.6) {
        captureSource = "AI-Generated";
    } else if (details.exif?.present) {
        if (details.exif.tags?.Make?.toLowerCase().includes("canon") ||
            details.exif.tags?.Make?.toLowerCase().includes("nikon") ||
            details.exif.tags?.Make?.toLowerCase().includes("sony")) {
            captureSource = "DSLR / Mirrorless";
        } else {
            captureSource = "Mobile Camera";
        }
    } else if (assessmentTitle === "Likely Authentic Camera Image") {
        captureSource = "Mobile Camera"; // Default for authentic
    }

    return {
        refundRiskScore,
        imageRisk,
        confidenceRisk,
        riskTier,
        decision,
        userMessage,
        statusColor,
        category, // Internal category used for calculation
        captureSource // Display label
    };
};
