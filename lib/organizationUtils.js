export function serializeOrganization(doc) {
    if (!doc) return null;
    if (typeof doc.toObject === 'function') {
        return doc.toObject();
    }
    return doc;
}

export function getOrganizationDisplayName(org) {
    if (!org) return '';
    const name = org.name;
    return typeof name === 'string' ? name.trim() : '';
}
