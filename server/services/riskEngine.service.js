const calculateRisk = (current, previous, config = {}) => {
    let score = 0;
    const reasons = [];

    // Default Config if not provided
    const {
        feverThreshold = 100.4,
        painThreshold = 7,
        medicationPenalty = 10,
        enabledRules = ['PAIN_LEVEL', 'PAIN_TREND', 'FEVER', 'MEDICATION', 'SYMPTOMS_SEVERE', 'SYMPTOMS_MULTIPLE']
    } = config;

    // Helper to check if rule is enabled
    const isEnabled = (rule) => enabledRules.includes(rule);

    // 1. Pain Level
    if (isEnabled('PAIN_LEVEL') && current.painLevel >= painThreshold) {
        score += 15; // Base weight for high pain
        reasons.push(`High Pain Level (>= ${painThreshold})`);
    }

    // 2. Pain Trend (Weight: +10 if increased)
    if (isEnabled('PAIN_TREND') && previous && current.painLevel > previous.painLevel) {
        score += 10;
        reasons.push('Pain increased vs yesterday');
    }

    // 3. Fever
    if (isEnabled('FEVER') && current.temperature >= feverThreshold) {
        score += 25;
        reasons.push(`Fever detected (>= ${feverThreshold})`);
    }

    // 4. Medication Adherence
    if (isEnabled('MEDICATION') && !current.medicationsTaken) {
        score += medicationPenalty;
        reasons.push('Missed Medication');
    }

    // 5. Severe Symptoms (Weight: +30)
    const severeSymptoms = ['Chest pain', 'Bleeding', 'Breathlessness'];
    const hasSevere = current.symptoms && current.symptoms.some(s =>
        severeSymptoms.some(severe => s.toLowerCase().includes(severe.toLowerCase()))
    );

    if (isEnabled('SYMPTOMS_SEVERE') && hasSevere) {
        score += 30;
        reasons.push('Severe Symptoms detected');
    }

    // 6. Multiple Symptoms (Weight: +10 if >= 3)
    if (isEnabled('SYMPTOMS_MULTIPLE') && current.symptoms && current.symptoms.length >= 3) {
        score += 10;
        reasons.push('Multiple Symptoms reported');
    }

    // Cap at 100
    if (score > 100) score = 100;

    // Determine Level
    let level = 'NORMAL';
    if (score >= 61) level = 'CRITICAL';
    else if (score >= 31) level = 'WARNING';

    return { score, level, reasons };
};

module.exports = { calculateRisk };
