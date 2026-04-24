import { permanentRedirect } from 'next/navigation';

export default function PrivacyLegacyPage() {
  permanentRedirect('/policy-security');
}
