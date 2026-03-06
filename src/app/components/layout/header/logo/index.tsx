import Image from 'next/image';
import Link from 'next/link';
import { getImgPath } from '@/utils/pathUtils';

const Logo: React.FC = () => {

  return (
    <Link href="/">
      <h2>SkillMENTOR</h2>
    </Link>
  );
};

export default Logo;