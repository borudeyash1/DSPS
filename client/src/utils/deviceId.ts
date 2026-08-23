// Generate unique device ID from browser fingerprint
export const generateDeviceId = (): string => {
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform,
    ].join('|');

    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return 'device_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
};

// Get or create device ID (persisted in localStorage)
export const getDeviceId = (): string => {
    const stored = localStorage.getItem('admin_device_id');
    if (stored) {
        return stored;
    }

    const newDeviceId = generateDeviceId();
    localStorage.setItem('admin_device_id', newDeviceId);
    return newDeviceId;
};

// Get device info
export const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        runtime: 'browser' as const,
    };
};
