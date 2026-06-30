export function parseLocalDateStart(dateString) {
    if (!dateString || typeof dateString !== 'string') return NaN;
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return NaN;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

export function parseLocalDateEnd(dateString) {
    if (!dateString || typeof dateString !== 'string') return NaN;
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return NaN;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}

export function getDriveStatus(drive, now = Date.now()) {
    if (now < drive.startDate) return 'upcoming';
    if (now > drive.endDate) return 'completed';
    return 'ongoing';
}

export function formatDriveDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
