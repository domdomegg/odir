import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../../helpers/wrapper';
import { auditLogTable } from '../../../../../helpers/tables';
import { assertHasGroup, query } from '../../../../../helpers/db';
import { $AuditLogs } from '../../../../../schemas';

export const main = middyfy(null, $AuditLogs, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  return query(auditLogTable, { object: event.pathParameters.objectId });
});
