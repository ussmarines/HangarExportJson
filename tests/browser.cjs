'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { item, row, page: htmlPage } = require('./fixtures.cjs');
const api = require('../extension/core.js');
(async () => {
  const output = path.resolve('output/playwright');
  await fs.mkdir(output, { recursive: true });
  const extension = path.resolve(process.env.HANGAR_EXTENSION_PATH || 'extension');
  const context = await chromium.launchPersistentContext(path.join(output, 'synthetic-profile'), {
    channel: 'chromium',
    headless: true,
    acceptDownloads: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  const requests = [],
    unexpected = [],
    browserErrors = [];
  let scenario = 'normal';
  const fixtures = {
    1: htmlPage(
      1,
      [
        row([
          item(),
          item({ name: 'Dawn' }),
          item({ model: 'Synthetic Scout XL' }),
          item({ model: 'Synthetic Rover', kind: 'Ground Vehicle' }),
          item({ model: 'Unapplied upgrade', kind: 'Upgrade' }),
          item({ kind: 'Skin' }),
          item({ kind: 'FPS Equipment' }),
          item({ kind: 'Component' }),
          item({ model: 'Upgrade - Synthetic A To Synthetic B', kind: '', manufacturer: '' }),
          item({ model: 'Star Citizen Digital Download', kind: '', manufacturer: '', ancillary: true }),
          item({ model: 'Synthetic paint', kind: 'Paint', ancillary: true }),
        ]),
      ],
      2,
    ),
    2: htmlPage(
      2,
      [
        row(
          [
            item({ model: 'Final upgraded model' }),
            item({ model: 'Unknown inclusion', kind: '', manufacturer: '', ancillary: true }),
          ],
          '<h3>Original base-model pledge — upgraded</h3>',
        ),
      ],
      2,
      '<img src="https://example.invalid/must-not-load.png"><script src="https://example.invalid/must-not-run.js"></script>',
    ),
  };
  const inclusionPages = {
    1: htmlPage(
      1,
      [
        row([
          item({
            model: '890 JUMP',
            manufacturer: 'Origin Jumpworks (ORIG)',
            name: 'Synthetic Flagship',
          }),
          item({ model: '890 JUMP', manufacturer: 'Origin Jumpworks (ORIG)' }),
        ]),
        row([
          item({
            model: 'Constellation Mk V Centaurus',
            manufacturer: 'Roberts Space Industries (RSI)',
          }),
        ]),
      ],
      2,
    ),
    2: htmlPage(
      2,
      [
        row([
          item({
            model: 'Carrack Expedition with Pisces Expedition',
            manufacturer: 'Anvil Aerospace (ANVL)',
          }),
        ]),
        row([
          item({
            model: '85X',
            manufacturer: 'Origin Jumpworks (ORIG)',
            name: 'Independent Synthetic Ship',
          }),
        ]),
        row([item({ model: 'Merchantman', manufacturer: 'Banu (BANU)' })]),
      ],
      2,
    ),
  };
  await context.route('**/*', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (
      url.origin !== 'https://robertsspaceindustries.com' ||
      !/^\/(en\/)?account\/pledges$/.test(url.pathname) ||
      request.method() !== 'GET'
    ) {
      unexpected.push(request.url());
      return route.abort();
    }
    const number = Number(url.searchParams.get('page') || 1);
    requests.push({ number, method: request.method(), url: request.url() });
    // Navigation uses a clean shell; collection gets the complete synthetic HTML.
    const collection = url.searchParams.has('pagesize');
    if (!collection)
      return route.fulfill({ contentType: 'text/html', body: htmlPage(1, [row([item()])]) });
    if (scenario === 'cancel' || scenario === 'timeout') return; // pending until cancellation or the real request timeout
    if (scenario === 'empty')
      return route.fulfill({ contentType: 'text/html', body: htmlPage(1, [row([item({ kind: 'Paint' })])]) });
    if (scenario === 'http')
      return route.fulfill({ status: 429, contentType: 'text/html', body: 'Rate limited' });
    if (scenario === 'limit')
      return route.fulfill({ contentType: 'text/html', body: 'x'.repeat(api.LIMITS.bytes + 1) });
    if (scenario === 'unknown')
      return route.fulfill({
        contentType: 'text/html',
        body: '<h1>Sign in or unknown markup</h1>',
      });
    if (scenario === 'inclusions')
      return route.fulfill({ contentType: 'text/html', body: inclusionPages[number] });
    return route.fulfill({ contentType: 'text/html', body: fixtures[number] || fixtures[2] });
  });
  const tab = await context.newPage();
  tab.on('pageerror', (error) => browserErrors.push(error.message));
  const downloadOutput = async () => {
    const download = tab.waitForEvent('download');
    await tab.getByRole('button', { name: 'Export my fleet as JSON' }).click();
    const file = await download;
    assert.match(
      file.suggestedFilename(),
      /^hangar-export-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/,
    );
    return JSON.parse(await fs.readFile(await file.path(), 'utf8'));
  };
  try {
    await tab.goto(api.BASE);
    await tab.getByRole('button', { name: 'Export my fleet as JSON' }).waitFor();
    assert.equal(requests.length, 1, 'no collection before click');
    const first = await downloadOutput();
    assert.equal(first.fleet[0].quantity, 2);
    assert.equal(first.fleet[0].instances[1].customName, 'Dawn');
    assert.equal(first.fleet.length, 4);
    assert.equal(first.unresolved.length, 1);
    assert.equal(first.complete, false);
    await tab.getByRole('status').filter({ hasText: '5 vehicles exported to JSON. Download requested.' }).waitFor();
    assert.equal(await tab.locator('#hangar-export-json pre').count(), 0);
    assert.ok(!(await tab.locator('#hangar-export-json').innerText()).includes('ANCILLARY_CONTENT_UNVERIFIED'));

    assert.ok(first.fleet.some((v) => v.model === 'Final upgraded model'));
    assert.ok(!JSON.stringify(first).includes('Original base-model'));
    assert.deepEqual(
      requests.filter((r) => r.url.includes('pagesize')).map((r) => r.number),
      [1, 2],
    );
    await tab.screenshot({ path: path.join(output, 'synthetic-export.png'), fullPage: true });
    await fs.writeFile(path.join(output, 'synthetic-export.json'), JSON.stringify(first, null, 2));
    await tab.setViewportSize({ width: 360, height: 640 });
    await tab.screenshot({ path: path.join(output, 'synthetic-summary-mobile.png'), fullPage: true });
    await tab.setViewportSize({ width: 1280, height: 720 });
    assert.deepEqual(unexpected, [], 'fetched HTML must not load images or scripts');
    scenario = 'inclusions';
    const expanded = await downloadOutput();
    assert.equal(expanded.version, 2);
    assert.equal(
      expanded.fleet.reduce((sum, g) => sum + g.quantity, 0),
      10,
    );
    const added = expanded.fleet.flatMap((g) =>
      g.instances
        .filter((i) => i.source === 'included')
        .map((i) => ({ model: g.model, instance: i })),
    );
    assert.deepEqual(added.map((v) => v.model).sort(), [
      '85X',
      'C8X Pisces Expedition',
      'Skylark',
      'Ursa',
    ]);
    const secondary = expanded.fleet.find((g) => g.model === '85X');
    assert.equal(secondary.quantity, 2);
    assert.equal(secondary.instances.find((i) => i.source === 'included').includedWith.length, 2);
    assert.equal(
      secondary.instances.find((i) => i.source === 'pledge').customName,
      'Independent Synthetic Ship',
    );
    assert.ok(!expanded.fleet.some((g) => ['Hull C', 'Defender', 'Hercules C2'].includes(g.model)));
    await tab.screenshot({ path: path.join(output, 'synthetic-inclusions.png'), fullPage: true });
    await fs.writeFile(
      path.join(output, 'synthetic-inclusions.json'),
      JSON.stringify(expanded, null, 2),
    );
    scenario = 'cancel';
    let downloads = 0;
    tab.on('download', () => downloads++);
    await tab.getByRole('button', { name: 'Export my fleet as JSON' }).click();
    assert.equal(
      await tab.getByRole('button', { name: 'Export my fleet as JSON' }).isEnabled(),
      false,
    );
    await tab.getByRole('button', { name: 'Cancel', exact: true }).click();
    await tab.getByRole('status').filter({ hasText: 'Cancelled' }).waitFor();
    assert.equal(downloads, 0);
    scenario = 'timeout';
    const timedOut = await downloadOutput();
    assert.equal(timedOut.errors[0].code, 'REQUEST_TIMEOUT');
    assert.equal(
      await tab.getByRole('button', { name: 'Export my fleet as JSON' }).isEnabled(),
      true,
    );
    scenario = 'http';
    const limited = await downloadOutput();
    assert.equal(limited.errors[0].code, 'RATE_LIMITED');
    await tab.getByRole('status').filter({ hasText: '0 vehicles exported to JSON. Collection interrupted — partial export.' }).waitFor();
    scenario = 'empty';
    const emptyFleet = await downloadOutput();
    assert.equal(emptyFleet.fleet.length, 0);
    await tab.getByRole('status').filter({ hasText: '0 vehicles exported to JSON. No vehicles could be confirmed.' }).waitFor();
    scenario = 'unknown';
    const unknown = await downloadOutput();
    assert.equal(unknown.errors[0].code, 'UNRECOGNIZED_PAGE');
    scenario = 'limit';
    const oversized = await downloadOutput();
    assert.equal(oversized.errors[0].code, 'RESPONSE_LIMIT');
    // Exercise the production parser with synthetic DOM. No real RSI HTML is saved.
    await tab.addScriptTag({ path: path.join(extension, 'core.js') });
    const parsed = await tab.evaluate(
      ({ html }) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        return HangarExportJson.parse(template.content, 1);
      },
      { html: fixtures[1] },
    );
    assert.equal(parsed.nextPage, 2, 'next arrow, never last arrow');
    const hostile = htmlPage(1, [
      row([item({ model: '<img src=x onerror=alert(1)>', name: '<script>bad</script>' })]),
    ]);
    const hostileParsed = await tab.evaluate((html) => {
      const template = document.createElement('template');
      template.innerHTML = html;
      return HangarExportJson.parse(template.content, 1);
    }, hostile);
    assert.equal(hostileParsed.entries[0].items[0].customName, '<script>bad</script>');
    const parserChecks = await tab.evaluate(
      ({ badNext, missingNext, wrongPage, empty, ambiguousName }) => {
        const parse = (html) => {
          try {
            const template = document.createElement('template');
            template.innerHTML = html;
            return HangarExportJson.parse(template.content, 1);
          } catch (error) {
            return { error: error.message };
          }
        };
        return {
          badNext: parse(badNext),
          missingNext: parse(missingNext),
          wrongPage: parse(wrongPage),
          empty: parse(empty),
          ambiguousName: parse(ambiguousName),
        };
      },
      {
        badNext: fixtures[1].replace(
          'href="/account/pledges?page=2"',
          'href="https://example.invalid/account/pledges?page=2"',
        ),
        missingNext: fixtures[1].replace('class="gt btn"', 'class="unknown btn"'),
        wrongPage: fixtures[1].replace(
          'class="active" href="/account/pledges?page=1"',
          'class="active" href="/account/pledges?page=7"',
        ),
        empty: htmlPage(1, []),
        ambiguousName: htmlPage(1, [
          row([
            item({ name: 'Dawn' }).replace(
              '</span>',
              '</span><span class="custom-name-text">Other</span>',
            ),
          ]),
        ]),
      },
    );
    assert.equal(parserChecks.badNext.error, 'UNKNOWN_PAGINATION');
    assert.equal(parserChecks.missingNext.error, 'UNKNOWN_PAGINATION');
    assert.equal(parserChecks.wrongPage.error, 'PAGE_MISMATCH');
    assert.equal(parserChecks.empty.error, 'EMPTY_OR_UNRECOGNIZED_HANGAR');
    const ambiguous = api.result(parserChecks.ambiguousName.entries, []);
    assert.equal(ambiguous.fleet[0].instances[0].customName, null);
    assert.equal(ambiguous.unresolved[0].reason, 'AMBIGUOUS_CUSTOM_NAME');
    assert.equal(await tab.locator('img[src="x"]').count(), 0);
    assert.deepEqual(browserErrors, []);
    assert.deepEqual(unexpected, []);
    console.log(
      JSON.stringify(
        {
          browser: context.browser().version(),
          platform: process.platform,
          extensionLoaded: true,
          synthetic: true,
          checks: [
            'automatic content-script injection',
            'two pages and nested pack',
            'copies and variant',
            'custom name',
            'ground vehicle',
            'excluded non-vehicles',
            'downloaded JSON',
            'compact summary counts instances and hides diagnostics',
            'empty and interrupted summary states',
            'untyped non-fleet labels and typed ancillary exclusion',
            'no automatic collection',
            'no fetched resource execution',
            'four verified included vehicles',
            'non-stacking secondary allocation',
            'independent pledged child preserved',
            'temporary replacements excluded',
            'single concurrent run',
            'cancel without download',
            'real 15-second request timeout and recovery',
            '429 stops without retry',
            'unknown markup',
            'stream byte limit',
            'next versus last pagination',
            'untrusted labels',
          ],
          screenshots: [
            'output/playwright/synthetic-export.png',
            'output/playwright/synthetic-inclusions.png',
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
