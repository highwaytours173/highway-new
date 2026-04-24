import { permanentRedirect } from 'next/navigation';

export default function TermsLegacyPage() {
  permanentRedirect('/terms-and-condition');
}
