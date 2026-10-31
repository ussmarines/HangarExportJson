const {test} = require('node:test');
const assert = require('node:assert/strict');
const api = require('../extension/core.js');
const ship = (model = 'Synthetic Scout', customName = '') => ({model, manufacturer:'Synthetic Works', kind:'Ship', customName});
const entry = (items, page=1) => ({page, entry:1, items});
test('packs preserve legitimate identical copies, names and variants; exclude explicit non-vehicles', () => {
 const r = api.result([entry([ship(),ship('Synthetic Scout','Dawn'),ship('Synthetic Scout XL'),{...ship(),kind:'Upgrade'},{...ship(),kind:'Paint'},{...ship(),kind:'Equipment'}])],[]);
 assert.equal(r.fleet[0].quantity,2); assert.deepEqual(r.fleet[0].instances,[{customName:null,source:'pledge',includedWith:null},{customName:'Dawn',source:'pledge',includedWith:null}]); assert.equal(r.fleet.length,2); assert.equal(r.complete,false);
});
test('unknown, missing contents and ancillary mentions remain unresolved; ground vehicles included',()=>{
 const r=api.result([entry([{...ship(),kind:'Unknown'},{...ship(),ancillary:true},{...ship(),kind:'Ground Vehicle'}]),entry([])],[]);
 assert.equal(r.unresolved.length,3); assert.equal(r.fleet[0].category,'vehicle');
});
test('multiple pages collected in sequence, applied-upgrade correctness never asserted',async()=>{
 const seen=[]; const r=await api.collect({signal:new AbortController().signal,load:async p=>{seen.push(p);return {entries:[entry([ship(p===1?'Final model candidate':'Pack model')],p)],nextPage:p===1?2:null};}});
 assert.deepEqual(seen,[1,2]); assert.equal(r.fleet.length,2);assert.ok(r.warnings.includes('COMPLETENESS_NOT_QUALIFIED'));
});
test('repeated page stops instead of inflating quantities',async()=>{
 const r=await api.collect({signal:new AbortController().signal,load:async p=>({entries:[entry([ship()],p)],nextPage:p+1})});
 assert.equal(r.fleet[0].quantity,1);assert.equal(r.errors[0].code,'REPEATED_OR_IDENTICAL_PAGE');
});
test('errors preserve explicitly partial data',async()=>{
 const r=await api.collect({signal:new AbortController().signal,load:async p=>{if(p===2)throw Error('HTTP_ERROR');return {entries:[entry([ship()])],nextPage:2};}});
 assert.equal(r.fleet.length,1);assert.equal(r.errors[0].code,'HTTP_ERROR');assert.equal(r.complete,false);
});
test('cancellation prevents result',async()=>{
 const c=new AbortController(); await assert.rejects(api.collect({signal:c.signal,load:async()=>{c.abort();return {entries:[],nextPage:null};}}),{name:'AbortError'});
});
test('page and entry limits fail closed',async()=>{
 for(const limits of [{...api.LIMITS,pages:0},{...api.LIMITS,entries:0}]) {
 const r=await api.collect({signal:new AbortController().signal,limits,load:async()=>({entries:[entry([ship()])],nextPage:null})});assert.equal(r.errors.length,1);assert.equal(r.fleet.length,0);
 }
});
test('no purchase or identity fields survive allowlisted output',()=>{
 const r=api.result([entry([{...ship(),purchaseId:'SECRET',price:99,token:'SECRET'}])],[]);
 assert.ok(!JSON.stringify(r).includes('SECRET'));assert.ok(!JSON.stringify(r).includes('price'));
});
