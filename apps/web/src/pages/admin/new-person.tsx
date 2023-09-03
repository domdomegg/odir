import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { navigate } from 'gatsby';
import { useRawReq } from '../../helpers/networking';
import Section from '../../components/Section';
import { Form } from '../../components/Form';
import { PersonCreation } from '../../helpers/generated-api-client';
import { GRADES } from '../../helpers/grades';

const NewPersonPage: React.FC<RouteComponentProps> = () => {
  const req = useRawReq();

  return (
    <Section>
      <Form<PersonCreation>
        title="New person"
        definition={{
          name: { inputType: 'text', label: 'Name' },
          jobTitle: { label: 'Job title', inputType: 'text' },
          grade: { label: 'Grade', inputType: 'select', selectOptions: GRADES },
          email: { label: 'Email', inputType: 'text' },
          linkedin: { label: 'LinkedIn', inputType: 'text' },
          about: { label: 'Who am I?', inputType: 'textarea' },
          howHelpMe: { label: 'How can others help me?', inputType: 'textarea' },
          howSupportOthers: { label: 'How can I help others?', inputType: 'textarea' },
          motivation: { label: 'Motivation', inputType: 'textarea' },
          policyBackground: { label: 'Policy background', inputType: 'textarea' },
        }}
        initialValues={{
          name: '',
          jobTitle: '',
          grade: '',
          email: '',
          linkedin: '',
          about: '',
          howHelpMe: '',
          howSupportOthers: '',
          motivation: '',
          policyBackground: '',
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          const personId = (await req('post /admin/persons', data)).data;
          navigate(`/admin/${personId}`);
        }}
      />
    </Section>
  );
};

export default NewPersonPage;
