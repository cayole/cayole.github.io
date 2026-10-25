import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compoundPath, basketComparison, capitalSteady, capitalPath, balancedPath, growthAccounting, productivityEmployment, productivityWage } from '../src/components/growth/models.ts'

const near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`)
const finite=value=>{for(const v of Object.values(value)) if(typeof v==='number') assert.ok(Number.isFinite(v))}

test('compound growth uses consistent base and complete finite horizon',()=>{
  const rows=compoundPath(2,3)
  assert.equal(rows.length,41);near(rows[0].first,100);near(rows[40].first,220.8039663614853)
  near(rows[40].second,326.2037791999078)
  for(let a=0;a<=5;a+=.5) for(let b=0;b<=5;b+=.5) for(const row of compoundPath(a,b)) {
    finite(row);near(row.first,100*(1+a/100)**row.year)
  }
  near(compoundPath(0,0)[40].second,100)
})

test('exchange changes converted income, not unchanged local purchasing power',()=>{
  near(basketComparison(5).riverConverted,1200);near(basketComparison(5).marketRatio,.4)
  near(basketComparison(2).marketRatio,1)
  for(let e=1;e<=8;e+=.5){const s=basketComparison(e);finite(s);near(s.riverBaskets,30);near(s.hillBaskets,30);near(s.pppExchange,2)}
})

test('capital law, initial stock, high capital and positive steady state agree',()=>{
  const rows=capitalPath(20,10),s=capitalSteady(20)
  near(rows[0].investment,.2);near(rows[0].replacement,.1);near(rows[1].capital,1.1)
  near(s.capital,4);near(s.output,2);near(s.consumption,1.6)
  assert.ok(rows[40].capital<4);assert.ok(capitalPath(20,10,9)[0].net<0)
  for(let saving=0;saving<=60;saving+=5) for(let d=5;d<=20;d+=5) for(const initial of [1,4,9]) {
    const path=capitalPath(saving,d,initial)
    path.forEach((r,i)=>{finite(r);assert.ok(r.capital>0);near(r.investment+r.consumption,r.output);if(i<40)near(path[i+1].capital,(1-d/100)*r.capital+r.investment)})
    const ss=capitalSteady(saving,d);near(saving/100*ss.output,ss.replacement)
  }
  near(capitalPath(20,10,0)[1].capital,0) // Zero is absorbing in this particular model.
})

test('golden rule consumption, including zero and full saving',()=>{
  near(capitalSteady(50).consumption,2.5);near(capitalSteady(20).consumption,1.6);near(capitalSteady(80).consumption,1.6)
  near(capitalSteady(0).consumption,0);near(capitalSteady(100).consumption,0)
  for(let s=0;s<=100;s++){const r=capitalSteady(s);finite(r);assert.ok(r.consumption<=2.5+1e-10);near(r.output-r.replacement,r.consumption)}
})

test('balanced growth uses exact discrete dilution and separately normalized indices',()=>{
  const s=balancedPath(20,2,1),r=s.rows[30]
  near(s.required,13.02);near(s.effectiveGrowth,3.02);near(s.capitalPerEffective,(.2/.1302)**2)
  near(r.perWorkerIndex,100*1.02**30);near(r.totalIndex,100*(1.02*1.01)**30)
  near(balancedPath(30,2,1).outputPerEffective/s.outputPerEffective,1.5)
  near(balancedPath(30,2,1).rows[30].perWorkerIndex,r.perWorkerIndex)
  for(let saving=10;saving<=40;saving+=5) for(let a=0;a<=4;a+=.5) for(let n=0;n<=3;n+=.5) {
    const b=balancedPath(saving,a,n);finite(b)
    const k=b.capitalPerEffective,y=b.outputPerEffective
    near(((.9*k+saving/100*y)/((1+a/100)*(1+n/100))),k)
    b.rows.forEach(finite)
  }
  near(balancedPath(20,0,2).rows[30].perWorkerIndex,100)
})

test('growth accounting distinguishes residual, labor productivity and labor-augmenting A',()=>{
  const s=growthAccounting(4,4,1)
  near(s.capitalContribution,4/3);near(s.labourContribution,2/3);near(s.residual,2);near(s.technology,3);near(s.labourProductivity,3)
  assert.ok(growthAccounting(0,10,3).residual<0)
  for(let y=0;y<=8;y+=.5) for(let k=0;k<=10;k+=.5) for(let n=0;n<=3;n+=.5){const r=growthAccounting(y,k,n);finite(r);near(r.capitalContribution+r.labourContribution+r.residual,y);near(r.technology*2/3,r.residual)}
})

test('employment uses exact ratio, preserves starting point and responds to demand',()=>{
  for(const [g,n] of [[0,100/1.2],[10,110/1.2],[20,100],[30,130/1.2]])near(productivityEmployment(20,g).employment,n)
  near(productivityEmployment(20,10,0).employment,100)
  for(let a=0;a<=40;a+=5) for(let y=-10;y<=40;y+=5) for(let f=0;f<=10;f++) {
    const r=productivityEmployment(a,y,f/10);finite(r);near(r.employment*r.productivity,r.output);assert.ok(r.employment>0)
  }
})

test('wage expectations cancel only when aligned; impossible interior solutions stay absent',()=>{
  near(productivityWage(100,100).unemployment,6.0454545454545)
  near(productivityWage(120,120).unemployment,6.0454545454545)
  near(productivityWage(110,120).unemployment,9.8333333333333)
  near(productivityWage(110,110).realWage,1)
  assert.equal(productivityWage(130,100).unemployment,null)
  for(let a=100;a<=130;a+=5) for(let e=100;e<=130;e+=5) {
    const r=productivityWage(a,e);finite(r)
    if(r.unemployment!==null)near(r.expected*(1.03-2*r.unemployment/100),r.realWage)
    else assert.ok(r.raw<0||r.raw>100)
  }
})
