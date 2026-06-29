import { redirect } from 'next/navigation';

export default function DonorOrganizationNeedsRedirect() {
  redirect('/ongoing-drives');
}
