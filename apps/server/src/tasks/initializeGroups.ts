import { fixedGroups } from '@odir/shared';
import { insert } from '../helpers/db';
import { groupTable } from '../helpers/tables';

// Purpose: For creating fixed groups with consistent IDs across environments
export default {
  id: '01GPY6CSHMD09C16H417C8SVBB',
  name: 'Initialize fixed groups',
  groups: [fixedGroups.Admin],
  run: async (): Promise<void> => {
    await insert(groupTable, { id: fixedGroups.Admin, name: 'Admin' });
    await insert(groupTable, { id: fixedGroups.Allowlisted, name: 'Allowlisted' });
  },
};
