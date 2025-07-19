import { test, expect, vi } from 'vitest';
import { fixedGroups } from '@odir/shared';
import { call } from '../../../../local/testHelpers';
import { main } from './get';
import tasks from '../../../tasks';

vi.mock('../../../tasks', () => ({
  default: [
    {
      id: '01FQWY151AJ6TJJBT44MM2HNZ8',
      name: 'A task',
      groups: [fixedGroups.Admin],
      run: vi.fn(),
    },
    {
      id: '01FQWY1BPYFF3KS7BY8B4NJJSC',
      name: 'Some other task',
      groups: [fixedGroups.Admin],
      run: vi.fn().mockImplementation(() => { throw new Error('kaboom'); }),
    },
  ],
}));

test('lists tasks', async () => {
  // when we call the endpoint
  const response = await call(main)(null);

  // we get back the tasks
  expect(response).toEqual([
    { id: '01FQWY151AJ6TJJBT44MM2HNZ8', name: 'A task', groups: [fixedGroups.Admin] },
    { id: '01FQWY1BPYFF3KS7BY8B4NJJSC', name: 'Some other task', groups: [fixedGroups.Admin] },
  ]);
  // nothing should have been run
  tasks.forEach((t) => expect(t.run).not.toHaveBeenCalled());
});
