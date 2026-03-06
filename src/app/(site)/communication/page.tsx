import { Metadata } from 'next';
import VoiceChatbot from '@/app/components/comSection/VoiceChatbot';

export const metadata: Metadata = {
  title: 'Communication Evaluation | SkillDev',
  description: 'AI-powered voice chatbot that evaluates your communication skills across clarity, vocabulary, fluency, structure, and confidence.',
};

export default function CommunicationPage() {
  return <VoiceChatbot />;
}
