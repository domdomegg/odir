import env from '../env/env';
import Link from './Link';
import Logo from './Logo';
import { SectionNoPadding } from './Section';

const Footer: React.FC = () => (
  <footer className="mt-12 py-6 text-left bg-primary-100">
    <SectionNoPadding>
      <div className="flex gap-4">
        <Link href={`//${env.CUSTOM_ODIR_DOMAIN}`}><Logo className="h-10 mt-1" /></Link>
        <div>
          <p className="mb-0.5">Directory Navigator is a project by <Link href="https://adamjones.me" target="_blank" className="inline-block hover:underline">Adam Jones</Link> and others.</p>

          <div className="flex gap-2">
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdL0wKeFtzQpcpcyPp25x3vKn8x9WoLS-qbQ97hxjHOsll9EA/viewform?usp=pp_url&entry.260031422=Hey,+I+had+some+feedback+about+Directory+Navigator:%0A%0A" target="_blank" className="inline-block hover:underline">Feedback</Link>
            ·
            <Link href="mailto:domdomegg+directory_navigator@gmail.com?subject=Directory%20Navigator%20Support" className="inline-block hover:underline">Support</Link>
            {/* TODO: add about page */}
            {/* ·
            <Link href={`//${env.CUSTOM_ODIR_DOMAIN}/about/`} className="inline-block hover:underline">About</Link> */}
          </div>
        </div>
      </div>
    </SectionNoPadding>
  </footer>
);

export default Footer;
