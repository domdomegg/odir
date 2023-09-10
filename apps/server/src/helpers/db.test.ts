import { ulid } from 'ulid';
import { JSONSchema } from '../schemas';
import {
  insert, scan, get, insertAudit, update, inTransaction, updateT, insertT, AuditDefinition, assertMatchesSchema, assertHasGroup, assertHasGroupForProperties, checkPrevious,
} from './db';
import {
  auditLogTable, tables, Table, teamTable,
} from './tables';
import { makeTeam, setMockDate } from '../../local/testHelpers';
import { auditContext } from './auditContext';

describe('scan', () => {
  test.each(Object.entries(tables))('%s table is empty by default', async (name, table) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await scan(table as Table<any, any, any>)).toHaveLength(0);
  });

  test('can retrieve several items', async () => {
    const teams = new Array(123).fill(0).map(() => makeTeam());
    await Promise.all(teams.map((f) => insert(teamTable, f)));

    expect(await scan(teamTable)).toHaveLength(123);
  });

  // a test for pagination would be nice, but looks difficult to write efficiently
  // maybe we could intercept the ScanCommand and add a low limit for this?
});

describe('insert', () => {
  test('can insert an item', async () => {
    const team = makeTeam();

    await insert(teamTable, team);

    expect(await scan(teamTable)).toEqual([team]);
  });

  test('can insert two items', async () => {
    const teams = [makeTeam(), makeTeam()];

    await insert(teamTable, teams[0]);
    await insert(teamTable, teams[1]);

    const scanResult = await scan(teamTable);
    expect(scanResult).toHaveLength(2);
    expect(scanResult).toContainEqual(teams[0]);
    expect(scanResult).toContainEqual(teams[1]);
  });

  test('fails with condition expression that evaluates to false', async () => {
    await expect(insert(teamTable, makeTeam(), 'id = mission')).rejects.toThrowError('failed conditional expression');

    expect(await scan(teamTable)).toHaveLength(0);
  });

  test('fails with an invalid condition expression', async () => {
    await expect(insert(teamTable, makeTeam(), '?')).rejects.toThrowError('Invalid ConditionExpression');

    expect(await scan(teamTable)).toHaveLength(0);
  });

  test('fails if an item with that id already exists', async () => {
    const team = makeTeam();
    await insert(teamTable, team);

    await expect(insert(teamTable, makeTeam({ id: team.id }))).rejects.toThrowError();

    expect(await scan(teamTable)).toEqual([team]);
  });

  // describe('composite key tables', () => {
  //   test('can insert an item', async () => {
  //     const donation = makeDonation();

  //     await insert(donationTable, donation);

  //     expect(await scan(donationTable)).toEqual([donation]);
  //   });

  //   test('can insert multiple items', async () => {
  //     const fundraisers = [makeTeam(), makeTeam()];
  //     const donations = [
  //       makeDonation({ fundraiserId: fundraisers[0].id }),
  //       makeDonation({ fundraiserId: fundraisers[0].id }),
  //       makeDonation({ fundraiserId: fundraisers[1].id }),
  //     ];

  //     await insert(donationTable, donations[0]);
  //     await insert(donationTable, donations[1]);
  //     await insert(donationTable, donations[2]);

  //     const scanResult = await scan(donationTable);
  //     expect(scanResult).toHaveLength(3);
  //     expect(scanResult).toContainEqual(donations[0]);
  //     expect(scanResult).toContainEqual(donations[1]);
  //     expect(scanResult).toContainEqual(donations[2]);
  //   });

  //   // this is more a bug than a feature, but we'd like to know if this behavior changes so here's a test for that
  //   test("can insert multiple items with same sort key if they're in in different partitions", async () => {
  //     const fundraisers = [makeTeam(), makeTeam()];
  //     const donationId = ulid();
  //     const donations = [
  //       makeDonation({ fundraiserId: fundraisers[0].id, id: donationId }),
  //       makeDonation({ fundraiserId: fundraisers[1].id, id: donationId }),
  //     ];

  //     await insert(donationTable, donations[0]);
  //     await insert(donationTable, donations[1]);

  //     const scanResult = await scan(donationTable);
  //     expect(scanResult).toHaveLength(2);
  //     expect(scanResult).toContainEqual(donations[0]);
  //     expect(scanResult).toContainEqual(donations[1]);
  //   });

  //   test('fails if an item with that id already exists', async () => {
  //     const fundraiser = makeTeam();
  //     const donation = makeDonation({ fundraiserId: fundraiser.id });
  //     await insert(donationTable, donation);

  //     await expect(insert(donationTable, makeDonation({ fundraiserId: fundraiser.id, id: donation.id }))).rejects.toThrowError();

  //     expect(await scan(donationTable)).toEqual([donation]);
  //   });
  // });
});

describe('get', () => {
  test('can get an item', async () => {
    const fundraiser = makeTeam();
    await insert(teamTable, fundraiser);

    const result = await get(teamTable, { id: fundraiser.id });

    expect(result).toEqual(fundraiser);
  });

  // test('composite key tables: can get an item', async () => {
  //   const donation = makeDonation();
  //   await insert(donationTable, donation);

  //   const result = await get(donationTable, { fundraiserId: donation.fundraiserId, id: donation.id });

  //   expect(result).toEqual(donation);
  // });

  test("get fails if item doesn't exist", async () => {
    await expect(() => get(teamTable, { id: ulid() })).rejects.toThrowError('not found');
  });

  // test("composite key tables: get fails if item doesn't exist", async () => {
  //   await expect(() => get(donationTable, { fundraiserId: ulid(), id: ulid() })).rejects.toThrowError('not found');
  // });
});

// describe('query', () => {
//   test('can query an item', async () => {
//     const fundraiser = makeTeam();
//     const donation = makeDonation({ fundraiserId: fundraiser.id });
//     await insert(teamTable, fundraiser);
//     await insert(donationTable, donation);

//     const result = await query(donationTable, { fundraiserId: fundraiser.id });

//     expect(result).toEqual([donation]);
//   });

//   test('can query multiple items', async () => {
//     const fundraiser = makeTeam();
//     const donations = [makeDonation({ fundraiserId: fundraiser.id }), makeDonation({ fundraiserId: fundraiser.id })];
//     await insert(teamTable, fundraiser);
//     await insert(donationTable, donations[0]);
//     await insert(donationTable, donations[1]);

//     const result = await query(donationTable, { fundraiserId: fundraiser.id });

//     expect(result).toHaveLength(2);
//     expect(result).toContainEqual(donations[0]);
//     expect(result).toContainEqual(donations[1]);
//   });

//   test('query returns empty array on empty table', async () => {
//     const result = await query(donationTable, { fundraiserId: ulid() });

//     expect(result).toEqual([]);
//   });

//   test('query returns empty array on empty partition of non-empty table', async () => {
//     const fundraiser = makeTeam();
//     const donation = makeDonation({ fundraiserId: fundraiser.id });
//     await insert(teamTable, fundraiser);
//     await insert(donationTable, donation);

//     const result = await query(donationTable, { fundraiserId: ulid() });

//     expect(result).toEqual([]);
//   });
// });

describe('update', () => {
  test('can update an item', async () => {
    const team = makeTeam();
    await insert(teamTable, team);

    await update(teamTable, { id: team.id }, { name: 'Cows' });

    expect(await get(teamTable, { id: team.id })).toEqual({ ...team, name: 'Cows' });
  });

  test('fails to update an item if conditions not met', async () => {
    const team = makeTeam();

    await insert(teamTable, team);

    await expect(() => update(teamTable, { id: team.id }, { name: 'Cows' }, '#name = :currentName', { ':currentName': `name-${ulid()}` }, { '#name': 'name' })).rejects.toThrowError('failed conditional expression');

    expect(await get(teamTable, { id: team.id })).toEqual(team);
  });
});

describe('updateT', () => {
  test('can update an item using updateT and inTransaction', async () => {
    const team = makeTeam({ name: 'Original' });
    await insert(teamTable, team);

    await inTransaction([updateT(teamTable, { id: team.id }, { name: 'New' })]);

    expect(await get(teamTable, { id: team.id })).toEqual({ ...team, name: 'New' });
  });

  test('fails to updateT an item if conditions not met', async () => {
    const team = makeTeam();
    await insert(teamTable, team);

    await expect(() => inTransaction([
      updateT(teamTable, { id: team.id }, { name: 'New' }, '#name = :currentName', { ':currentName': `name-${ulid()}` }, { '#name': 'name' }),
    ])).rejects.toThrowError('failed conditional expression');

    expect(await get(teamTable, { id: team.id })).toEqual(team);
  });
});

// describe('plusT', () => {
//   test('can update an item using plusT and inTransaction', async () => {
//     const fundraiser = makeTeam({ donationsCount: 1 });
//     await insert(teamTable, fundraiser);

//     await inTransaction([plusT(teamTable, { id: fundraiser.id }, { donationsCount: 1 })]);

//     expect(await get(teamTable, { id: fundraiser.id })).toEqual({ ...fundraiser, donationsCount: 2 });
//   });

//   test('fails to plusT an item if conditions not met', async () => {
//     const fundraiser = makeTeam({ donationsCount: 1 });
//     await insert(teamTable, fundraiser);

//     await expect(() => inTransaction([
//       updateT(teamTable, { id: fundraiser.id }, { donationsCount: 1 }, 'donationsCount = :currentDonationsCount', { ':currentDonationsCount': 100 }),
//     ])).rejects.toThrowError('failed conditional expression');

//     expect(await get(teamTable, { id: fundraiser.id })).toEqual(fundraiser);
//   });
// });

describe('insertT', () => {
  test('can insert an item using insertT and inTransaction', async () => {
    const team = makeTeam();

    await inTransaction([insertT(teamTable, team)]);

    expect(await scan(teamTable)).toHaveLength(1);
    expect(await get(teamTable, { id: team.id })).toEqual(team);
  });

  test('fails to insertT an item if conditions not met', async () => {
    const team = makeTeam();

    await expect(() => inTransaction([
      insertT(teamTable, team, '#name = :currentName', { ':currentName': 'Moo' }, { '#name': 'name' }),
    ])).rejects.toThrowError('failed conditional expression');

    expect(await scan(teamTable)).toHaveLength(0);
  });

  test('fails to insertT an item if an item with its id already exists', async () => {
    const team = makeTeam();
    await insert(teamTable, team);

    await expect(() => inTransaction([insertT(teamTable, makeTeam({ id: team.id }))])).rejects.toThrowError();

    expect(await scan(teamTable)).toHaveLength(1);
  });
});

describe('inTransaction', () => {
  test('can do multiple things at once in a transaction successfully', async () => {
    const team1 = makeTeam({ name: 'Old' });
    const team2 = makeTeam();
    await insert(teamTable, team1);

    await inTransaction([insertT(teamTable, team2), updateT(teamTable, { id: team1.id }, { name: 'New' })]);

    expect(await scan(teamTable)).toHaveLength(2);
    expect(await get(teamTable, { id: team1.id })).toEqual({ ...team1, name: 'New' });
    expect(await get(teamTable, { id: team2.id })).toEqual(team2);
  });

  test('all edits fail if one edit fails in a transaction', async () => {
    const team1 = makeTeam({ name: 'Old' });
    const team2 = makeTeam();
    await insert(teamTable, team1);

    await expect(() => inTransaction([
      insertT(teamTable, team2),
      updateT(teamTable, { id: team1.id }, { name: 'New' }, '#name = :name', {}, { '#name': 'name' }),
    ])).rejects.toThrowError('failed conditional expression');

    expect(await scan(teamTable)).toHaveLength(1);
    expect(await get(teamTable, { id: team1.id })).toEqual(team1);
  });

  test('all edits fail if editing the same item twice in a transaction', async () => {
    const team = makeTeam({ name: 'A' });
    await insert(teamTable, team);

    await expect(() => inTransaction([
      updateT(teamTable, { id: team.id }, { name: 'B' }),
      updateT(teamTable, { id: team.id }, { name: 'C' }),
    ])).rejects.toThrowError('cannot include multiple operations on one item');

    expect(await get(teamTable, { id: team.id })).toEqual(team);
  });
});

describe('insertAudit', () => {
  test('can insert an audit log', async () => {
    const now = new Date().getTime() / 1000;
    setMockDate(now);
    auditContext.value = {
      route: 'POST /a/path/with/{param}',
      routeRaw: 'POST /a/path/with/ABCD123',
      sourceIp: '123.123.123.123',
      subject: 'public',
      userAgent: 'some browser',
      logGroupName: 'aws/lambda/odir-server-stage-myFunc',
      logStreamName: '2022/01/01/[$LATEST]123456789',
      awsRegion: 'eu-test-1',
    };
    const person = {
      id: ulid(),
      firstName: 'Person',
      lastName: 'McPersonface',
    };
    const auditDefinition: AuditDefinition = {
      action: 'create',
      object: person.id,
      metadata: { tableName: 'persons', data: person },
    };

    await insertAudit(auditDefinition);

    const audits = await scan(auditLogTable);
    expect(audits).toMatchObject([{
      object: auditDefinition.object,
      subject: auditContext.value.subject,
      action: auditDefinition.action,
      at: Math.floor(now),
      sourceIp: auditContext.value.sourceIp,
      userAgent: auditContext.value.userAgent,
      routeRaw: auditContext.value.routeRaw,
      metadata: { tableName: 'persons', data: person },
      ttl: null,
    }]);
  });
});

describe('assertMatchesSchema', () => {
  const messageSchema: JSONSchema<{ message: string }> = {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
    required: ['message'],
    additionalProperties: false,
  };

  test('does not throw for object matching schema', () => {
    assertMatchesSchema(messageSchema, { message: 'hello' });
  });

  test('does not throw for object matching schema ($ref)', () => {
    assertMatchesSchema({ $ref: '#/definitions/exists', definitions: { exists: messageSchema } }, { message: 'hello' });
  });

  test('throws for object with additional property', () => {
    expect(() => assertMatchesSchema(messageSchema, { message: 'hello', extra: 'not allowed' }))
      .toThrowError('failed validation');
  });

  test('throws for object with missing property', () => {
    expect(() => assertMatchesSchema(messageSchema, {}))
      .toThrowError('failed validation');
  });

  test('throws for object with wrong type', () => {
    expect(() => assertMatchesSchema(messageSchema, 'a string'))
      .toThrowError('failed validation');
  });

  test('throws for object with wrong nested type', () => {
    expect(() => assertMatchesSchema(messageSchema, { message: 1 }))
      .toThrowError('failed validation');
  });

  test('throws for invalid schema syntax', () => {
    expect(() => assertMatchesSchema({ not: 'a schema' } as never, { message: 'hello' }))
      .toThrowError('schema is invalid');
  });

  test('throws for invalid schema semantics', () => {
    expect(() => assertMatchesSchema({ $ref: '#/definitions/doesNotExist', definitions: { exists: messageSchema } }, { message: 'hello' }))
      .toThrowError("can't resolve reference #/definitions/doesNotExist");
  });
});

describe.each([
  ['not', ['National']],
  ['not', ['National', 'Test']],
  ['', []],
  ['', ['NotTest']],
])('assertHasGroup', (notThrow, eventGroups) => {
  test.each([
    ['group name', 'National'],
    ['group array with one entry', ['National']],
    ['group array with multiple entries', ['National', 'Test']],
    ['groupsWithAccess object with one entry', { groupsWithAccess: ['National'] }],
    ['groupsWithAccess object with multiple entry', { groupsWithAccess: ['National', 'Test'] }],
  ])(`does ${notThrow} throw for event and %s`, (_description, checkGroups) => {
    const e = expect(() => assertHasGroup({ auth: { payload: { groups: eventGroups } } }, checkGroups));
    if (!notThrow) e.toThrow();
    else e.not.toThrow();
  });
});

test('assertHasGroup handles multiple arguments', () => {
  expect(() => assertHasGroup({ auth: { payload: { groups: ['A'] } } }, 'A', 'B')).not.toThrow();
  expect(() => assertHasGroup({ auth: { payload: { groups: ['B'] } } }, 'A', 'B')).not.toThrow();
  expect(() => assertHasGroup({ auth: { payload: { groups: ['C'] } } }, 'A', 'B')).toThrow();
});

describe.each([
  ['not', ['National'], 'a', ['a']],
  ['not', ['National', 'Test'], 'a', ['a']],
  ['not', ['National'], 'a', ['a', 'b']],
  ['not', ['National', 'Test'], 'a', ['a', 'b']],
  ['', [], 'a', ['a']],
  ['', ['NotTest'], 'a', ['a']],
  ['', [], 'a', ['a', 'b']],
  ['', ['NotTest'], 'a', ['a', 'b']],
  ['not', ['National'], 'a', ['b']],
  ['not', ['National', 'Test'], 'a', ['b']],
  ['not', [], 'a', ['b']],
  ['not', ['NotTest'], 'a', ['b']],
])('assertHasGroupForProperties: does %s throw with groups %s, editing property %s and checking properties %s', (notThrow, eventGroups, eventProperty, propertiesToCheck) => {
  test.each([
    ['by group name', 'National'],
    ['by group array with one entry', ['National']],
    ['by group array with multiple entries', ['National', 'Test']],
    ['by groupsWithAccess object with one entry', { groupsWithAccess: ['National'] }],
    ['by groupsWithAccess object with multiple entry', { groupsWithAccess: ['National', 'Test'] }],
  ])('%s', (_description, checkGroups) => {
    const e = expect(() => assertHasGroupForProperties({ auth: { payload: { groups: eventGroups } }, body: { [eventProperty]: null } }, propertiesToCheck, checkGroups));
    if (!notThrow) e.toThrow();
    else e.not.toThrow();
  });
});

describe('checkPrevious', () => {
  test('allows edits where previous is a match', async () => {
    // given a team in the db
    const team = await insert(teamTable, makeTeam());

    await update(teamTable, { id: team.id }, ...checkPrevious({ name: 'New', previous: { donationsCount: team.name } }));
  });

  test('prevents edits where previous is not a match', async () => {
    // given a team in the db
    const team = await insert(teamTable, makeTeam());

    await expect(() => update(teamTable, { id: team.id }, ...checkPrevious({ name: 'New', previous: { name: `${team.name}2` } }))).rejects.toThrowError('failed conditional expression');
  });
});
