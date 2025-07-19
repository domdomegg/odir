import { useRouter } from 'next/router';
import { useRawReq } from '../../helpers/networking';
import Section from '../../components/Section';
import { Form } from '../../components/Form';
import { PersonCreation } from '../../helpers/generated-api-client';
import { ENTITY_PREFIX } from '../../helpers/entityPrefix';

const NewPersonPage: React.FC = () => {
  const router = useRouter();
  const req = useRawReq();

  return (
    <Section>
      <Form<PersonCreation>
        title="New person"
        definition={{
          name: { inputType: 'text', label: 'Name' },
          jobTitle: { label: 'Job title', inputType: 'text' },
          email: { label: 'Email', inputType: 'text' },
          phone: { label: 'Phone', inputType: 'text' },
          linkedin: { label: 'LinkedIn', inputType: 'text' },
          website: { label: 'Website', inputType: 'text' },
          about: { label: 'About (markdown)', inputType: 'textarea' },
        }}
        initialValues={{
          name: '',
          jobTitle: '',
          email: '',
          phone: '',
          linkedin: '',
          website: '',
          about: '',
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          const personId = (await req('post /admin/persons', data)).data;
          router.push(`${ENTITY_PREFIX}${personId}`);
        }}
      />
    </Section>
  );
};

export default NewPersonPage;
