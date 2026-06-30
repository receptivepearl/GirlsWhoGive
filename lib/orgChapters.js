import Organization from "@/models/Organization";

export async function getChaptersForParent(parentOrganizationId) {
    return Organization.find({
        parentOrganizationId,
        approvalStatus: 'approved',
    }).select('_id name location address').sort({ name: 1 });
}

export async function getChapterIdsForParent(parentOrganizationId) {
    const chapters = await getChaptersForParent(parentOrganizationId);
    return chapters.map((chapter) => chapter._id);
}

export async function getOrganizationIdsForUser(userId) {
    const organization = await Organization.findById(userId);
    if (!organization) return [];

    if (organization.isOrgAdministrator && organization.approvalStatus === 'approved' && organization.verified) {
        return getChapterIdsForParent(userId);
    }

    return [userId];
}
