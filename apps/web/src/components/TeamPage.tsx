import Section, { SectionTitle } from './Section';
import PropertyEditor from './PropertyEditor';
import { EntityResponse, Team } from '../helpers/generated-api-client';
import { useRawReq } from '../helpers/networking';

const TeamPage: React.FC<{ data: EntityResponse & { type: 'team' }, refetch: () => void }> = ({ data: { team }, refetch }) => {
  const req = useRawReq();

  return (
    <Section>
      <SectionTitle>{team.name}</SectionTitle>
      <PropertyEditor<Team>
        definition={{
          name: { label: 'Name', inputType: 'text' },
          vision: { label: 'Vision', inputType: 'text' },
          mission: { label: 'Mission', inputType: 'text' },
        }}
        item={team}
        onSave={async (data) => {
          await req('patch /admin/teams/{teamId}', { teamId: team.id }, data);
          refetch();
        }}
      />
    </Section>
  );
};

export default TeamPage;
