import Section from '../../components/Section';
import { ChevronList, ChevronListButton } from '../../components/ChevronList';

const NewEntityPage: React.FC = () => {
  return (
    <Section>
      <ChevronList>
        <ChevronListButton href="/new/team">New team</ChevronListButton>
        <ChevronListButton href="/new/person">New person</ChevronListButton>
      </ChevronList>
    </Section>
  );
};

export default NewEntityPage;
