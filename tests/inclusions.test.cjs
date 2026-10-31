const {test} = require('node:test');
const assert = require('node:assert/strict');
const {result} = require('../extension/core.js');
// Public model labels and synthetic scenarios only; never real account records.
const ship = (model, manufacturer, customName = '') => ({model, manufacturer, customName, kind:'Ship'});
const origin = model => ship(model, 'Origin Jumpworks (ORIG)');
const rsi = model => ship(model, 'Roberts Space Industries (RSI)');
const anvil = model => ship(model, 'Anvil Aerospace (ANVL)');
const row = (items, entry=1, page=1) => ({items,entry,page});
const derived = r => r.fleet.flatMap(group => group.instances.filter(i=>i.source==='included').map(instance=>({model:group.model,quantity:group.quantity,category:group.category,instance})));

test('three verified final-model parents add exactly four permanent parent-linked vehicles',()=>{
 const r=result([row([origin('890 JUMP'),rsi('Constellation Mk V Centaurus'),anvil('Carrack Expedition with Pisces Expedition')])],[]);
 assert.equal(r.version,2);assert.equal(r.complete,false);
 assert.equal(r.fleet.reduce((sum,g)=>sum+g.quantity,0),7);
 assert.deepEqual(derived(r).map(v=>v.model).sort(),['85X','C8X Pisces Expedition','Skylark','Ursa']);
 assert.equal(r.fleet.find(g=>g.model==='Ursa').category,'vehicle');
 assert.equal(r.inclusionRules.revision,'2026-10-31');
 assert.match(r.inclusionRules.source,/Included-Vessels-Snub-Fighters-and-Rovers$/);
});

test('included craft retain parent provenance, never inherit the parent custom name',()=>{
 const parent={...origin('890 Jump'),customName:'Synthetic Parent Name'};
 const r=result([row([parent])],[]);
 const included=derived(r)[0].instance;
 assert.equal(included.customName,null);
 assert.deepEqual(included.includedWith,[{model:'890 Jump',customName:'Synthetic Parent Name'}]);
 assert.equal(r.fleet[0].instances[0].source,'pledge');
});

test('multiple parents share one included allocation; independent pledged child is additional',()=>{
 const r=result([row([origin('890 JUMP'),origin('890 JUMP')]),row([origin('85X')],2)],[]);
 const child=r.fleet.find(g=>g.model==='85X');
 assert.equal(child.quantity,2);
 assert.equal(child.instances.filter(i=>i.source==='included').length,1);
 assert.equal(child.instances.find(i=>i.source==='included').includedWith.length,2);
 assert.equal(child.instances.filter(i=>i.source==='pledge').length,1);
});

test('same-pledge child is ambiguous and is never silently counted twice or discarded',()=>{
 const r=result([row([anvil('Carrack Expedition w/ C8X'),anvil('C8X Pisces Expedition'),rsi('URSA Rover')])],[]);
 assert.equal(derived(r).length,0);
 assert.equal(r.fleet.reduce((sum,g)=>sum+g.quantity,0),3);
 assert.deepEqual(r.unresolved.map(v=>v.reason),['INCLUSION_OVERLAP','INCLUSION_OVERLAP']);
});

test('untyped same-pledge child also blocks speculative duplicate inference',()=>{
 const r=result([row([origin('890 Jump'),{model:'85X',kind:'',manufacturer:'',ancillary:true}])],[]);
 assert.equal(derived(r).length,0);
 assert.ok(r.unresolved.some(v=>v.reason==='INCLUSION_OVERLAP'));
});

test('an overlap blocks model-wide inferred allocation regardless of parent traversal order',()=>{
 const ambiguous=row([origin('890 Jump'),origin('85X')]);
 const other=row([origin('890 Jump')],2,2);
 for(const rows of [[ambiguous,other],[other,ambiguous]]) {
  const r=result(rows,[]);
  assert.equal(derived(r).length,0);
  assert.equal(r.fleet.find(g=>g.model==='85X').quantity,1);
  assert.ok(r.unresolved.some(v=>v.reason==='INCLUSION_OVERLAP'));
 }
});

test('upgrading away from a parent removes its implicit craft; upgrade and paint items never trigger rules',()=>{
 const r=result([{...row([rsi('Perseus'),{...origin('890 Jump'),kind:'Upgrade'},{...rsi('Constellation Mk V Centaurus'),kind:'Skin'}]),pledgeName:'Original 890 Jump'}],[]);
 assert.equal(derived(r).length,0);
 assert.equal(r.fleet.length,1);
});

test('temporary loaner providers never create substitute or Arena Commander craft',()=>{
 const r=result([row([ship('Merchantman','Banu (BANU)'),ship('E1 Spirit','Crusader Industries (CRUS)'),origin('G12'),rsi('Perseus')])],[]);
 assert.equal(derived(r).length,0);assert.equal(r.fleet.length,4);
 assert.ok(r.warnings.includes('TEMPORARY_LOANERS_NOT_INCLUDED'));
});

test('a directly pledged model is kept even if that model can also be a temporary loaner',()=>{
 const r=result([row([ship('Merchantman','Banu (BANU)'),ship('Hull C','Musashi Industrial and Starflight Concern (MISC)')])],[]);
 assert.equal(r.fleet.length,2);assert.equal(derived(r).length,0);
});

test('exact parent variant and manufacturer are required; base Carrack is never treated as C8X edition',()=>{
 for(const parent of [anvil('Carrack Expedition'),anvil('Carrack'),anvil('Carrack Expedition Special Edition'),ship('890 Jump','Unknown Maker'),rsi('Constellation Andromeda')]) {
  assert.equal(derived(result([row([parent])],[])).length,0);
 }
 for(const model of ['Carrack Expedition w/ C8X','Carrack Expedition w/C8X','Carrack Expedition with Pisces Expedition']) {
  assert.equal(derived(result([row([anvil(model)])],[])).length,2);
 }
});

test('partial collection keeps only inclusions supported by parents actually collected',()=>{
 const r=result([row([rsi('Constellation Mk V Centaurus')])],[{page:2,code:'HTTP_ERROR'}]);
 assert.deepEqual(derived(r).map(v=>v.model),['Skylark']);
 assert.equal(r.errors.length,1);assert.equal(r.complete,false);
});
