import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../../helpers/wrapper';
import { auditLogTable } from '../../../../../helpers/tables';
import { assertHasGroup, scan } from '../../../../../helpers/db';
import { $AuditLogs } from '../../../../../schemas';

export const main = middyfy(null, $AuditLogs, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  return (await scan(auditLogTable)).filter((l) => l.subject === event.pathParameters.subjectId).sort((a, b) => b.at - a.at);
});
