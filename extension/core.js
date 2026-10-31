/* Shared, dependency-free collector. See docs/VALIDATION.md for the observed RSI contract. */
(function (root) {
  'use strict';
  const BASE = 'https://robertsspaceindustries.com/en/account/pledges';
  const LIMITS = Object.freeze({pages: 100, entries: 10000, bytes: 5000000, totalBytes: 25000000, timeout: 15000, duration: 300000, delay: 1500});
  // Deliberately partial, reviewed local rules. Never derive from the Loaner Ship Matrix.
  const INCLUSION_REFERENCE = Object.freeze({
    revision: '2026-10-31',
    quantityPolicy: 'one-included-instance-per-model',
    source: 'https://support.robertsspaceindustries.com/hc/en-us/articles/4408770370455-Included-Vessels-Snub-Fighters-and-Rovers'
  });
  const INCLUSION_RULES = [
    {parents: ['890 Jump'], manufacturer: 'Origin Jumpworks (ORIG)', children: [
      {model: '85X', manufacturer: 'Origin Jumpworks (ORIG)', category: 'ship', aliases: ['85X']}
    ]},
    {parents: ['Constellation Mk V Centaurus'], manufacturer: 'Roberts Space Industries (RSI)', children: [
      {model: 'Skylark', manufacturer: 'Roberts Space Industries (RSI)', category: 'ship', aliases: ['Skylark']}
    ]},
    {parents: ['Carrack Expedition with Pisces Expedition', 'Carrack Expedition w/ C8X', 'Carrack Expedition w/C8X'], manufacturer: 'Anvil Aerospace (ANVL)', children: [
      {model: 'C8X Pisces Expedition', manufacturer: 'Anvil Aerospace (ANVL)', category: 'ship', aliases: ['C8X Pisces Expedition']},
      {model: 'Ursa', manufacturer: 'Roberts Space Industries (RSI)', category: 'vehicle', aliases: ['Ursa', 'URSA Rover']}
    ]}
  ];
  const sameLabel = (left, right) => typeof left === 'string' && typeof right === 'string' && left.trim().toLowerCase() === right.trim().toLowerCase();
  const text = (node, selector) => {
    const matches = node.querySelectorAll(selector);
    const value = matches.length === 1 ? matches[0].textContent.trim() : '';
    return value.length <= 200 ? value : '';
  };
  function parse(doc, page) {
    const list = doc.querySelector('.list-items');
    if (!list) throw new Error('UNRECOGNIZED_PAGE');
    const rows = [...list.children];
    if (rows.length > LIMITS.entries) throw new Error('ENTRY_LIMIT');
    const entries = rows.map((row, index) => {
      // Never read purchase IDs, hidden inputs, account identity, or whole-row text.
      const items = [...row.querySelectorAll('.item')].filter(item => !item.parentElement.closest('.item'));
      if (items.length > LIMITS.entries) throw new Error('ITEM_LIMIT');
      return {page, entry: index + 1, explicitlyEmpty: text(row, '.items-col').replace(/^Contains:\s*/i, '') === 'No items.', items: items.map(item => ({
        model: text(item, '.title'), kind: text(item, '.kind'),
        manufacturer: text(item, '.liner'), customName: text(item, '.custom-name-text'),
        customNameUnresolved: item.querySelectorAll('.custom-name-text').length > 1 || [...item.querySelectorAll('.custom-name-text')].some(e => e.textContent.trim().length > 200),
        ancillary: !!item.closest('.without-images')
      }))};
    });
    const next = doc.querySelector('a.gt');
    // Follow only the observed same-origin pagination contract; do not navigate arbitrary links.
    const href = next?.getAttribute('href') || next?.closest('a')?.getAttribute('href');
    let nextPage = null;
    if (next) {
      if (!href) throw new Error('UNKNOWN_PAGINATION');
      const url = new URL(href, BASE);
      nextPage = Number(url.searchParams.get('page'));
      if (url.origin !== new URL(BASE).origin || !/^\/(en\/)?account\/pledges$/.test(url.pathname) || !Number.isInteger(nextPage) || nextPage !== page + 1) throw new Error('UNKNOWN_PAGINATION');
    }
    const activePages = [...doc.querySelectorAll('a.active[href*="pledges?page="]')];
    if (activePages.some(a => Number(new URL(a.getAttribute('href'), BASE).searchParams.get('page')) !== page)) throw new Error('PAGE_MISMATCH');
    const pageLinks = [...doc.querySelectorAll('a[href*="pledges?page="]')];
    if (!next && pageLinks.some(a => Number(new URL(a.getAttribute('href'), BASE).searchParams.get('page')) > page)) throw new Error('UNKNOWN_PAGINATION');
    // Zero rows is not enough evidence of a genuinely empty account.
    if (!rows.length) throw new Error('EMPTY_OR_UNRECOGNIZED_HANGAR');
    return {entries, nextPage};
  }
  function result(entries, errors) {
    const fleet = [], unresolved = [], included = new Map(), blockedInclusions = new Set();
    const add = (item, instance) => {
      let group = fleet.find(v => v.model === item.model && v.manufacturer === item.manufacturer && v.category === item.category);
      if (!group) { group = {model: item.model, manufacturer: item.manufacturer, category: item.category, quantity: 0, instances: []}; fleet.push(group); }
      group.quantity++;
      group.instances.push(instance);
    };
    for (const entry of entries) {
      const parents = [];
      if (!entry.items.length && !entry.explicitlyEmpty) unresolved.push({page: entry.page, entry: entry.entry, reason: 'MISSING_CONTENTS'});
      for (const item of entry.items) {
        const where = {page: entry.page, entry: entry.entry};
        if (item.customNameUnresolved) unresolved.push({...where, reason: 'AMBIGUOUS_CUSTOM_NAME'});
        if (item.ancillary) { unresolved.push({...where, reason: 'ANCILLARY_CONTENT_UNVERIFIED'}); continue; }
        // Exact labels only. No inference from pledge names, upgrade targets or marketing text.
        if (/^(paint|skin|equipment|fps equipment|upgrade|insurance|decoration|hangar decoration|weapon|component|credits)$/i.test(item.kind)) continue;
        if (!/^(ship|vehicle|ground vehicle)$/i.test(item.kind) || !item.model || !item.manufacturer) {
          unresolved.push({...where, reason: 'UNRECOGNIZED_ITEM', model: item.model || null}); continue;
        }
        const category = /^ship$/i.test(item.kind) ? 'ship' : 'vehicle';
        add({...item, category}, {customName: item.customName || null, source: 'pledge', includedWith: null});
        parents.push(item);
      }
      // Only directly observed final-model parents trigger rules. Generated children never recurse.
      for (const parent of parents) {
        const rule = INCLUSION_RULES.find(rule => sameLabel(parent.manufacturer, rule.manufacturer) && rule.parents.some(model => sameLabel(parent.model, model)));
        if (!rule) continue;
        for (const child of rule.children) {
          const key = `${child.manufacturer}\n${child.model}`;
          // A same-pledge match could be an already represented inclusion OR an independent copy.
          // Preserve the observed item and report uncertainty rather than guessing an extra copy.
          const overlaps = entry.items.some(item => item !== parent && child.aliases.some(model => sameLabel(item.model, model)));
          if (overlaps) {
            blockedInclusions.add(key);
            unresolved.push({page: entry.page, entry: entry.entry, reason: 'INCLUSION_OVERLAP', model: child.model, parentModel: parent.model});
            continue;
          }
          const parentReference = {model: parent.model, customName: parent.customName || null};
          if (included.has(key)) {
            included.get(key).instance.includedWith.push(parentReference);
          } else {
            // RSI currently allocates one copy of a secondary model even with multiple parents.
            const instance = {customName: null, source: 'included', includedWith: [parentReference]};
            included.set(key, {child, instance});
          }
        }
      }
    }
    for (const [key, {child, instance}] of included) {
      if (!blockedInclusions.has(key)) add(child, instance);
    }
    return {format: 'HangarExportJson', version: 2, complete: false, inclusionRules: {...INCLUSION_REFERENCE}, fleet, unresolved,
      errors: [...errors], warnings: ['COMPLETENESS_NOT_QUALIFIED', 'UNTYPED_CONTENT_NOT_INFERRED', 'INCLUDED_VESSEL_RULES_PARTIAL', 'TEMPORARY_LOANERS_NOT_INCLUDED']};
  }
  async function collect({load, signal, progress = () => {}, limits = LIMITS}) {
    const entries = [], errors = [], fingerprints = new Set();
    const started = Date.now();
    let page = 1, itemCount = 0;
    try {
      for (let count = 0; ; count++) {
        signal.throwIfAborted();
        if (count >= limits.pages || Date.now() - started > limits.duration) throw new Error('COLLECTION_LIMIT');
        progress(page);
        const parsed = await load(page, signal);
        signal.throwIfAborted();
        const fingerprint = JSON.stringify(parsed.entries.map(e => e.items));
        if (fingerprints.has(fingerprint)) throw new Error('REPEATED_OR_IDENTICAL_PAGE');
        fingerprints.add(fingerprint);
        if (entries.length + parsed.entries.length > limits.entries) throw new Error('ENTRY_LIMIT');
        itemCount += parsed.entries.reduce((sum, entry) => sum + entry.items.length, 0);
        if (itemCount > limits.entries) throw new Error('ITEM_LIMIT');
        entries.push(...parsed.entries);
        if (parsed.nextPage === null) break;
        if (parsed.nextPage !== page + 1) throw new Error('UNKNOWN_PAGINATION');
        page = parsed.nextPage;
      }
    } catch (error) {
      if (signal.aborted) throw error;
      errors.push({page, code: /^[A-Z_]+$/.test(error.message) ? error.message : 'COLLECTION_FAILED'});
    }
    return result(entries, errors);
  }
  const api = {BASE, LIMITS, parse, result, collect};
  if (typeof module !== 'undefined') module.exports = api;
  else root.HangarExportJson = api;
})(globalThis);
