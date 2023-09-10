import { ulid } from 'ulid';
import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { userTable } from '../../../helpers/tables';
import { $Ulid, $UserCreation } from '../../../schemas';
import { sendEmail } from '../../../helpers/email';
import invite from '../../../helpers/email/invite';
import env from '../../../env/env';

export const main = middyfy($UserCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  const user = await insert(userTable, {
    id: ulid(),
    ...event.body,
  });

  if (event.body.sendAccountCreationEmail === true) {
    // TODO: it might be cool to send this person a login link, e.g. that's valid for some amount of time.
    // if it's expired when they click it they should be just sent back to the login page (e.g. some query param like ?ignore_expired=true)
    await sendEmail(
      'Your account has been created!',
      invite(`http${env.STAGE === 'local' ? '' : 's'}://${env.CUSTOM_ODIR_DOMAIN}`),
      event.body.email,
    );
  }

  return user.id;
});
