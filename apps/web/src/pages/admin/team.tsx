import { RouteComponentProps } from '@gatsbyjs/reach-router';
import {
  useReq, useRawReq
} from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import { Team } from '../../helpers/generated-api-client';

const TeamPage: React.FC<RouteComponentProps & { teamId: string }> = ({ teamId }) => {
  const [team, refetchTeam] = useReq('get /admin/teams/{teamId}', { teamId });
  const req = useRawReq();

  return (
    <Section>
      <SectionTitle>{team.data?.name || 'Team'}</SectionTitle>
      <PropertyEditor<Team>
        definition={{
          name: { label: 'Name', inputType: 'text' },
          vision: { label: 'Vision', inputType: 'text' },
          mission: { label: 'Mission', inputType: 'text' },
        }}
        item={team}
        onSave={async (data) => {
          await req('patch /admin/teams/{teamId}', { teamId }, data);
          refetchTeam();
        }}
      />
    </Section>
  );
};

export default TeamPage;
