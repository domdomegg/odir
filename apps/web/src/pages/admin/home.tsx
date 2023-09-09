import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useReq } from '../../helpers/networking';
import Section, { SectionNoPadding, SectionTitle } from '../../components/Section';
import Logo from '../../components/Logo';
import { EntitySearchBox, SelectRef } from '../../components/SearchBox';
import { TeamCardGrid } from '../../components/TeamCard';
import Spinner from '../../components/Spinner';

const HomePage: React.FC<RouteComponentProps> = () => {
  const [teams] = useReq('get /admin/teams/top');
  const ref: SelectRef = useRef(null);

  useHotkeys(
    ['ctrl+k', 'meta+k', 'ctrl+f', 'meta+f', 'ctrl+e', 'meta+e', 'ctrl+g', 'meta+g'],
    () => ref.current?.focus(),
    { preventDefault: true }
  );

  return (
    <>
      <Section className="md:max-w-2xl mt-8 md:mt-12 text-center">
        <Logo className="h-24 mb-8" />
        <SectionTitle className="mb-4 sm:mb-10">Directory Navigator</SectionTitle>
        <div className="text-left">
          <EntitySearchBox autoFocus className="p-3 text-xl" selectRef={ref} />
        </div>
      </Section>
      <SectionNoPadding className="mt-4">
        <SectionTitle className="mt-28 sm:text-3xl">Or browse by organisation...</SectionTitle>
        {teams.data ? <TeamCardGrid teams={teams.data} /> : <div className="text-center mt-8"><Spinner /></div>}

      </SectionNoPadding>
    </>
  );
};

export default HomePage;
