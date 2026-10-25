import assert from 'node:assert/strict'
import { test } from 'node:test'
import { labourCounts, wagePrice, inflationPath, pricePath, mediumState, policyPath, deflationPath } from '../src/components/labour/models.ts'

const near = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual-expected)<epsilon, `${actual} != ${expected}`)

test('same unemployment reduction, different employment and participation', () => {
  const start=labourCounts(0,false), hired=labourCounts(40,false), exited=labourCounts(40,true)
  near(start.unemployment,12.5); near(hired.unemployment,7.5); near(exited.unemployment,60/760*100)
  assert.equal(hired.employed,740); assert.equal(exited.employed,700)
  near(exited.participation,76); near(exited.employment,70)
  for (let moved=0;moved<=80;moved+=1) for (const leave of [false,true]) {
    const s=labourCounts(moved,leave)
    near(s.employed+s.unemployed+s.outside,1000)
    near(s.force,s.employed+s.unemployed)
  }
})

test('wage-price intersection, markup and wage-setting shifts', () => {
  const s=wagePrice(10,3)
  near(s.realWage,1/1.1); near(s.natural,6.0454545454545)
  near(1.03-2*s.natural/100,s.realWage)
  near(wagePrice(20,3).natural,9.8333333333333)
  near(wagePrice(10,5).natural-s.natural,1)
  for(let m=5;m<=25;m++) for(let z=0;z<=8;z+=.5) {
    const state=wagePrice(m,z)
    assert.ok(state.natural>0 && state.natural<16)
    near(1+z/100-2*state.natural/100,state.realWage)
  }
})

test('anchored and adaptive expectations, zero gap and price compounding', () => {
  assert.deepEqual(inflationPath(4,0).slice(1).map(r=>r.inflation),[3,3,3,3,3,3])
  assert.deepEqual(inflationPath(4,1).map(r=>r.inflation),[2,3,4,5,6,7,8])
  assert.deepEqual(inflationPath(8,1).map(r=>r.inflation),[2,1,0,-1,-2,-3,-4])
  for(const row of inflationPath(6,1)) near(row.inflation,2)
  near(pricePath([6,4,2])[3],112.4448)
  near(pricePath([6,4,-2])[3],108.0352)
  for(let u=4;u<=8;u+=.5) for(let memory=0;memory<=1;memory+=.25) {
    const rows=inflationPath(u,memory)
    rows.slice(1).forEach((r,i)=>{
      near(r.inflation-r.expected,-.5*(u-6))
      near(r.price,rows[i].price*(1+r.inflation/100))
      assert.ok(r.price>0)
    })
  }
})

test('IS-LM-PC account identities, fiscal composition and supply shift', () => {
  const base=mediumState(100,3), tax=mediumState(110,2), oil=mediumState(100,5,900)
  near(base.Y,940); near(base.C,604); near(base.I,186)
  near(tax.Y,940); near(tax.C,598); near(tax.I,192); near(tax.neutral,2)
  near(oil.Y,900); near(oil.neutral,5); near(oil.pressure,0)
  for(const scenario of ['heat','tax','energy']) for(const s of policyPath(scenario)) {
    near(s.C+s.I+s.G,s.Y)
    near(s.pressure,.05*(s.Y-s.potential))
    near(s.pressure,-.5*(s.unemployment-s.natural))
    assert.ok(s.Y>0&&s.I>0&&s.C>0)
  }
  assert.deepEqual(policyPath('heat').map(r=>Math.round(r.inflation*100)/100),[2,3,4,4,3,2,2])
  assert.deepEqual(policyPath('tax').map(r=>Math.round(r.inflation*100)/100),[2,1,.5,.5])
  assert.deepEqual(policyPath('energy').map(r=>Math.round(r.inflation*100)/100),[2,4,5,5])
})

test('bounded zero-rate deflation feedback, anchoring does not close demand gap', () => {
  const adaptive=deflationPath(false), anchored=deflationPath(true)
  assert.deepEqual(adaptive.map(r=>r.Y),[930,920,900,860])
  assert.deepEqual(adaptive.map(r=>r.inflation),[-.5,-1.5,-3.5,-7.5])
  assert.ok(anchored.every(r=>r.Y===930&&r.real===0&&r.inflation===-.5&&r.gap===-10))
  adaptive.forEach((r,i)=>{ near(r.real,-r.expected); if(i) near(r.expected,adaptive[i-1].inflation) })
})
