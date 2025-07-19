import Head from 'next/head';
import Section, { SectionTitle } from '../components/Section';
import Table from '../components/Table';
import { RequestFormLink } from '../components/RequestFormLink';
import Link from '../components/Link';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>
          Directory Navigator: Privacy
        </title>
      </Head>
      <Section>
        <SectionTitle>Privacy Policy</SectionTitle>

        <p className="font-black font-header mt-8">Who we are</p>
        <p>Directory Navigator is a personal project. In line with the UK GDPR Article 2(c), with regard to the EU's Recital 18, the processing of personal data is exempt from the UK GDPR on the basis of it being done by a natural person in the course of a personal activity.</p>

        <p className="mt-4">Despite this, in the interests of good practice this notice sets out similar details to if this project was covered under the UK GDPR. We also currently voluntarily comply with requests from data subjects in line with the UK GDPR.</p>

        <p className="font-black font-header mt-8">How to contact us</p>
        <p>You can contact us via <RequestFormLink message={'I have a privacy enquiry:\n\n'} className="underline">our request form</RequestFormLink>.</p>

        <p className="font-black font-header mt-8 mb-2">Why we process your personal data</p>
        <Table
          definition={{
            purpose: { label: 'Purpose', className: 'whitespace-pre-line align-top' },
            legalBasis: { label: 'Legal basis', className: 'whitespace-pre-line align-top' },
          }}
          items={[{
            purpose: `Maintaining core platform data: for example people, teams, users, groups, domains and relations.

          Displaying core platform data to others on the platform, e.g. allowing other people to view your profile.

          Responding to and managing feedback, complaints and other communications to or involving us.

          Delivering services you request or accommodating for special requirements.

          Calculating aggregated statistics for publication, such as total users active on the platform.

          Improving and measuring the quality of services we deliver and the effectiveness of our operations, including through web analytics.`,
            legalBasis: 'Our legitimate interest in offering the services and enabling the project to run effectively and efficiently.',
          }, {
            purpose: `Ensuring people and teams in the organisations recorded within Directory Navigator can collaborate effectively.

            Supporting scientific and historical research, primarily by the organizations in the directory.`,
            legalBasis: 'The performance of a task carried out in the public interest.',
          }, {
            purpose: 'Complying with laws and regulations, for example performing security monitoring of activity on the platform.',
            legalBasis: 'Our legal obligations',
          }]}
        />

        <p className="font-black font-header mt-8 mb-2">How long we store your personal data</p>
        <Table
          definition={{
            category: { label: 'Category', className: 'whitespace-pre-line align-top' },
            heldUntil: { label: 'How long is it held?', className: 'whitespace-pre-line align-top' },
          }}
          items={[{
            category: 'Data core to the platform: for example people, teams, users, groups, domains and relations.',
            heldUntil: 'Indefinitely, as it is held for scientific and historical research and in line with the right of freedom of expression.',
          }, {
            category: 'Data held for statistical purposes: for example analytics.',
            heldUntil: 'Indefinitely, as it is held for statistical purposes. Most data of this form is anonymised or pseudonymised.',
          }, {
            category: 'Data we need to keep to comply with a legal obligation, such as security log data.',
            heldUntil: 'The end of the calendar year in which the legal obligation no longer requires us to hold the data. For most subcategories that is at most about 6 years. Note that some of this data may also be held for statistical purposes.',
          }]}
        />

        <p className="font-black font-header mt-8 mb-2">Data subject requests</p>
        <p>We accept requests from data subjects regarding:</p>
        <ul className="list-disc ml-12 my-2">
          <li>Access to personal data - you can ask us for a copy of data we hold about you</li>
          <li>Rectification of personal data - you can ask us to correct data we hold about you</li>
          <li>Erasure of personal data - you can ask us to delete data we hold about you</li>
          <li>Restriction of processing of personal data - you can ask us to stop processing data we hold about you</li>
        </ul>
        <p>These rights are not absolute and may be limited in some cases. To exercise your data protection rights, or for more information, contact us.</p>
        <p className="mt-4">We believe this project is exempt from the UK GDPR. However, if you are unhappy with how we have handled your data or with the response received from us, you may still be able to able to <Link href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" className="underline">lodge a complaint with the ICO</Link>.</p>
      </Section>
    </>
  );
};

export default PrivacyPolicyPage;
