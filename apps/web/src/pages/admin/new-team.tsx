import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { navigate } from 'gatsby';
import { useRawReq } from '../../helpers/networking';
import Section from '../../components/Section';
import { Form } from '../../components/Form';
import { TeamCreation } from '../../helpers/generated-api-client';
import { ENTITY_PREFIX } from '../../helpers/entityPrefix';

const NewTeamPage: React.FC<RouteComponentProps> = () => {
  const req = useRawReq();

  return (
    <Section>
      <Form<TeamCreation>
        title="New team"
        definition={{
          name: { inputType: 'text', label: 'Name' },
          mission: { inputType: 'textarea', label: 'Mission' },
          vision: { inputType: 'textarea', label: 'Vision' },
          priorities: { inputType: 'textarea', label: 'Priorities' },
          notes: { inputType: 'textarea', label: 'Notes' },
          website: { inputType: 'text', label: 'Website' },
        }}
        initialValues={{
          name: '',
          mission: '',
          vision: '',
          priorities: '',
          notes: '',
          website: '',
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          const teamId = (await req('post /admin/teams', data)).data;
          navigate(`${ENTITY_PREFIX}${teamId}`);
        }}
      />
    </Section>
  );
};

export default NewTeamPage;
