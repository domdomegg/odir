import { fixedGroups } from '@odir/shared';
import { sendEmail } from '../helpers/email';
import emailLogin from '../helpers/email/emailLogin';

export default {
  id: '01H7DWQ77TZG31E8E1ADWVA15W',
  name: 'Send test login email',
  groups: [fixedGroups.Admin],
  run: async (): Promise<void> => {
    await sendEmail(
      'Test email login',
      emailLogin('https://example.com'),
      'someone@example.com', // to email
      'Directory Navigator', // from Name
    );
  },
};
