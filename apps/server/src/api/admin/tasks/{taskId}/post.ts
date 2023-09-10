import createHttpError from 'http-errors';
import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, insertAudit } from '../../../../helpers/db';
import tasks from '../../../../tasks';

export const main = middyfy(null, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  const task = tasks.find((t) => t.id === event.pathParameters.taskId);
  if (!task) throw new createHttpError.NotFound('task not found');
  assertHasGroup(event, task.groups);
  await insertAudit({ action: 'run', object: event.pathParameters.taskId });

  await task.run();
});
