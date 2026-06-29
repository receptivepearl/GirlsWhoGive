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
