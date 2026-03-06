import { Metadata } from 'next';
import CommResults from '@/app/components/comSection/CommResults';

export const metadata: Metadata = {
  title: 'Communication Results | SkillDev',
  description: 'Your detailed AI communication skill evaluation results including sub-scores, level, and course recommendations.',
};

export default function ComResultsPage() {
  return <CommResults />;
}
