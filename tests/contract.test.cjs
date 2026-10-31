const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { result } = require('../extension/core.js');
const fixturePath = path.join(__dirname, '../contracts/juliet-v2.synthetic.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

test('the shared interoperability fixture is exact production output, including every diagnostic', () => {
  const ship = (model, manufacturer, customName = '') => ({
    model,
    manufacturer,
    customName,
    kind: 'Ship',
  });
  const entries = [
    {
      page: 1,
      entry: 1,
      items: [
        ship('890 JUMP', 'Origin Jumpworks (ORIG)', 'Synthetic North'),
        ship('890 JUMP', 'Origin Jumpworks (ORIG)', 'Synthetic South'),
      ],
    },
    {
      page: 1,
      entry: 2,
      items: [
        { ...ship('PTV', 'Greycat Industrial (GRIN)'), kind: 'Ground Vehicle' },
        {
          model: 'Unresolved Synthetic Extra',
          manufacturer: '',
          kind: '',
          customName: '',
          ancillary: true,
        },
      ],
    },
    {
      page: 1,
      entry: 3,
      items: [ship('F8C Lightning Executive Edition', 'Anvil Aerospace (ANVL)')],
    },
  ];
  assert.deepEqual(result(entries, [{ page: 2, code: 'HTTP_ERROR' }]), fixture);
});

test('the synthetic consumer contract fits Juliet bounds without losing multiplicity or provenance', () => {
  assert.ok(fs.statSync(fixturePath).size < 2 * 1024 * 1024);
  assert.equal(fixture.complete, false);
  assert.equal(fixture.errors.length, 1);
  assert.equal(fixture.unresolved.length, 1);
  assert.equal(fixture.warnings.length, 4);
  const rows = fixture.fleet.flatMap((group) => {
    assert.equal(group.quantity, group.instances.length);
    assert.ok(group.model.length > 0 && group.model.length <= 160);
    return group.instances.map((instance) => {
      assert.ok(instance.customName === null || instance.customName.length <= 100);
      return { model: group.model, category: group.category, ...instance };
    });
  });
  assert.equal(rows.length, 5);
  assert.ok(rows.length <= 1000);
  assert.deepEqual(
    rows.filter((row) => row.model === '890 JUMP').map((row) => row.customName),
    ['Synthetic North', 'Synthetic South'],
  );
  assert.equal(rows.filter((row) => row.category === 'vehicle').length, 1);
  const included = rows.filter((row) => row.source === 'included');
  assert.equal(included.length, 1);
  assert.equal(included[0].model, '85X');
  assert.equal(included[0].customName, null);
  assert.equal(included[0].includedWith.length, 2);
});
