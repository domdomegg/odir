import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { navigate } from 'gatsby';
import { PlusSmIcon } from '@heroicons/react/outline';
import {
  fixedGroups,
} from '@odir/shared';
import { useState } from 'react';
import {
  asResponseValues, useReq, useRawReq,
} from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Form } from '../../components/Form';
import PropertyEditor from '../../components/PropertyEditor';
import { RequireGroup } from '../../helpers/security';
import { TeamCreation } from '../../helpers/generated-api-client';
import { ENTITY_PREFIX } from '../../helpers/entityPrefix';

const TeamsPage: React.FC<RouteComponentProps> = () => {
  const [teams, refetchTeams] = useReq('get /admin/teams');
  const [newTeamModalOpen, setNewTeamModalOpen] = useState(false);
  const req = useRawReq();

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Teams</SectionTitle>
        <RequireGroup group={fixedGroups.Admin}>
          <Button onClick={() => setNewTeamModalOpen(true)}>
            <PlusSmIcon className="h-6 mb-1" />
            {' '}
            New
            {' '}
            <span className="hidden lg:inline">team</span>
          </Button>
        </RequireGroup>
      </div>
      <Modal open={newTeamModalOpen} onClose={() => setNewTeamModalOpen(false)}>
        <Form<TeamCreation>
          title="New team"
          definition={{
            name: { inputType: 'text' },
            about: { inputType: 'text' },
            website: { inputType: 'text' },
          }}
          initialValues={{
            name: 'New team',
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const teamId = (await req('post /admin/teams', data)).data;
            await refetchTeams();
            navigate(`${ENTITY_PREFIX}${teamId}`);
          }}
        />
      </Modal>
      <Table
        className="mb-8"
        definition={{
          name: { label: 'Name', className: 'whitespace-nowrap' },
        }}
        items={asResponseValues(teams.data?.sort((a, b) => b.lastEditedAt - a.lastEditedAt), teams)}
        href={(team) => `${ENTITY_PREFIX}${team.preferredSlug}/`}
      />
      <PropertyEditor
        definition={{
          totalTeams: { label: 'Total number of teams' },
        }}
        item={asResponseValues({
          totalTeams: teams.data?.length
        }, teams)}
      />
    </Section>
  );
};

export default TeamsPage;
