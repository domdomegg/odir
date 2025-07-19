import { useRouter } from 'next/router';
import { PlusSmIcon } from '@heroicons/react/outline';
import { fixedGroups } from '@odir/shared';
import { useState } from 'react';
import {
  asResponseValues, useReq, useRawReq,
} from '../helpers/networking';
import Section, { SectionTitle } from './Section';
import Table from './Table';
import Button from './Button';
import Modal from './Modal';
import { Form } from './Form';
import { RequireGroup } from '../helpers/security';
import { DomainCreation } from '../helpers/generated-api-client';

const DomainsPanel: React.FC = () => {
  const router = useRouter();
  const [domains, refetchDomains] = useReq('get /admin/domains');
  const [groups] = useReq('get /admin/groups');
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {};
  const [newDomainModalOpen, setNewDomainModalOpen] = useState(false);
  const req = useRawReq();

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Domains</SectionTitle>
        <RequireGroup group={fixedGroups.Admin}>
          <Button onClick={() => setNewDomainModalOpen(true)}>
            <PlusSmIcon className="h-6 mb-1" /> New <span className="hidden lg:inline">domain</span>
          </Button>
        </RequireGroup>
      </div>
      <Modal open={newDomainModalOpen} onClose={() => setNewDomainModalOpen(false)}>
        <Form<DomainCreation>
          title="New domain"
          definition={{
            name: { label: 'Name', inputType: 'text' },
            domain: { label: 'Domain', inputType: 'text' },
            groups: {
              label: 'Groups', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)', inputType: 'multiselect', selectOptions: groupMap,
            },
            loginMethods: {
              label: 'Login methods', formatter: (methods?: string[]) => methods?.join(', ') || '(none)', inputType: 'multiselect', selectOptions: ['google', 'microsoft', 'email', 'gov-sso']
            },
          }}
          initialValues={{
            name: '',
            domain: '',
            groups: [fixedGroups.Allowlisted],
            loginMethods: ['email'],
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const domainId = (await req('post /admin/domains', data)).data;
            await refetchDomains();
            router.push(`/admin/domains/${domainId}/`);
          }}
        />
      </Modal>
      <Table
        className="mb-8"
        definition={{
          name: { label: 'Name', className: 'whitespace-nowrap' },
          domain: { label: 'Domain', className: 'whitespace-nowrap' },
          groups: { label: 'Groups', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)' },
          loginMethods: { label: 'Logins', formatter: (methods?: string[]) => methods?.join(', ') || '(none)' },
        }}
        // eslint-disable-next-line no-nested-ternary
        items={asResponseValues(domains.data?.sort((a, b) => (a.domain === b.domain ? 0 : (a.domain > b.domain ? 1 : -1))), domains)}
        href={(domain) => `/admin/domains/${domain.id}/`}
      />
    </Section>
  );
};

export default DomainsPanel;
