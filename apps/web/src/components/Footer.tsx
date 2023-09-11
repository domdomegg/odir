import env from '../env/env';
import Link from './Link';
import Logo from './Logo';
import { RequestFormLink } from './RequestFormLink';
import { SectionNoPadding } from './Section';

const Footer: React.FC = () => (
  <footer className="mt-12 py-6 text-left bg-primary-100">
    <SectionNoPadding>
      <div className="flex gap-4">
        <Link href={`//${env.CUSTOM_ODIR_DOMAIN}`}><Logo className="h-10 mt-1" /></Link>
        <div>
          <p className="mb-0.5">Directory Navigator is a project by <Link href="https://adamjones.me" target="_blank" className="inline-block hover:underline">Adam Jones</Link> and others.</p>

          <div className="flex gap-2">
            <RequestFormLink message={'I have some feedback about Directory Navigator:\n\n'} className="inline-block hover:underline">Feedback</RequestFormLink>
            ·
            <RequestFormLink message={'I had a support query regarding Directory Navigator:\n\n'} className="inline-block hover:underline">Support</RequestFormLink>
            ·
            <Link href="/policies/privacy" className="inline-block hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </SectionNoPadding>
  </footer>
);

export default Footer;
