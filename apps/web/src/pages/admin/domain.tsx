import { asResponseValues, useReq, useRawReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import { Domain } from '../../helpers/generated-api-client';

const DomainPage: React.FC<{ domainId: string }> = ({ domainId }) => {
  const [domains, refetchDomains] = useReq('get /admin/domains');
  const [groups] = useReq('get /admin/groups');
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {};
  const req = useRawReq();

  const user = asResponseValues(domains.data?.find((d) => d.id === domainId), domains);

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">{user.data?.name ?? 'Domain'}</SectionTitle>
      </div>
      <PropertyEditor<Domain>
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
        item={user}
        onSave={async (data) => {
          await req('patch /admin/domains/{domainId}', { domainId }, data);
          refetchDomains();
        }}
      />
    </Section>
  );
};

export default DomainPage;
