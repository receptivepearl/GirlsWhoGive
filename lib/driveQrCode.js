export const QR_CODE_API_BASE = 'https://api.qrserver.com/v1/create-qr-code/';

export function buildDriveDonationUrl(organizationId, driveId, baseUrl) {
  const base = (baseUrl || '').replace(/\/$/, '');
  const path = `/donate/drive?orgId=${organizationId}&driveId=${driveId}`;
  if (!base) return path;
  return `${base}${path}`;
}

export function getDriveDonationLink(drive, baseUrl) {
  const id = drive?._id?.toString?.() || drive?._id || drive?.id;
  if (!drive?.organizationId || !id) return '';

  const resolvedBase =
    baseUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    '';

  if (resolvedBase) {
    return buildDriveDonationUrl(drive.organizationId, id, resolvedBase);
  }

  if (drive?.donationLink?.startsWith('http')) {
    return drive.donationLink;
  }

  return buildDriveDonationUrl(drive.organizationId, id, '');
}

export function buildDriveQrCodeImageUrl(donationUrl, options = {}) {
  const {
    size = '200x200',
    format = 'png',
    color = '000000',
    bgcolor = 'ffffff',
    margin = 1,
    ecc = 'L',
  } = options;

  const params = new URLSearchParams({
    data: donationUrl,
    size,
    format,
    color,
    bgcolor,
    margin: String(margin),
    ecc,
    'charset-source': 'UTF-8',
    'charset-target': 'UTF-8',
  });

  return `${QR_CODE_API_BASE}?${params.toString()}`;
}

export function getDriveQrCodeImageUrl(drive, options = {}) {
  const donationUrl = getDriveDonationLink(drive, options.baseUrl);
  if (!donationUrl) return '';
  return buildDriveQrCodeImageUrl(donationUrl, options);
}
