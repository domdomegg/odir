import Helmet from 'react-helmet';
import { convert } from '@odir/shared';
import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Cover, { CTADown } from '../components/Cover';
import IntroStats from '../components/IntroStats';
import Footer from '../components/Footer';
import { SocialIconV2 } from '../components/SocialIcon';

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>
        Raise: A charitable movement encouraging students to adopt a positive
        approach towards deliberate, effective giving
      </title>
      <meta
        property="og:title"
        content="Raise: A charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving"
      />
    </Helmet>
    <Cover>
      <TopNavigation />
      <Section className="px-8 my-8">
        <IntroStats
          title="Raise: A Celebration of Giving"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our chapter websites to learn more about what we do."
          statistics={{
            years: 6,
            students: 2697,
            raised: 466495,
            protected: convert.moneyToPeopleProtected('gbp', 466495_00),
          }}
        />
      </Section>
      <CTADown text="Our philosophy" href="#our-philosophy" />
    </Cover>

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="inline-block text-left">
        <SocialIconV2 type="email" id="raisenational@gmail.com" />
      </div>
    </Section>

    <Footer />
  </Page>
);

export default IndexPage;
