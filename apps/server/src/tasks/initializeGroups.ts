import { fixedGroups } from '@odir/shared';
import { insert } from '../helpers/db';
import { groupTable } from '../helpers/tables';

// Purpose: For creating Admin group with consistent IDs across environments
export default {
  id: '01GPY6CSHMD09C16H417C8SVBB',
  name: 'Initialize Admin group',
  groups: [fixedGroups.Admin],
  run: async (): Promise<void> => {
    await insert(groupTable, { id: fixedGroups.Admin, name: 'Admin' });
  },
};
