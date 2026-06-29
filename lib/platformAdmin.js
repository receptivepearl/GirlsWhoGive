// Platform admin email is configured via environment variable (never hardcoded).
export function getPlatformAdminEmail() {
    return process.env.PLATFORM_ADMIN_EMAIL?.trim() || '';
}

export function isPlatformAdminEmail(email) {
    const adminEmail = getPlatformAdminEmail();
    if (!adminEmail || !email) return false;
    return email.toLowerCase() === adminEmail.toLowerCase();
}
