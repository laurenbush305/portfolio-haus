// Optional development regression suite; no production Node dependency.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PH_BASE_URL || 'http://127.0.0.1:4000';
const screenshots = process.env.PH_SCREENSHOT_DIR;
const routes=['/','/institutions/','/founders/','/work/','/about/','/start/','/method/','/receipts/','/tools/','/tools/can-they-repeat-it/','/tools/doctrine-build-lite/','/tools/opportunity-readiness-brief/','/contact/','/ways-to-work/','/government/','/insights/','/resources/','/404.html'];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PH_BROWSER_EXECUTABLE?{executablePath:process.env.PH_BROWSER_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 const p=await context.newPage();
 const errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 async function go(route){const r=await p.goto(base+route);assert.equal(r.status(),200,route);await p.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});}
 async function noOverflow(label){const dimensions=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth}));assert.ok(dimensions.doc<=dimensions.win,`${label} horizontal overflow: ${JSON.stringify(dimensions)}`);}
 async function shot(name){if(screenshots){fs.mkdirSync(screenshots,{recursive:true});await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:path.join(screenshots,name+'.png'),fullPage:true});}}
 for(const width of [1440,768,390,320]){
  await p.setViewportSize({width,height:1000});
  for(const route of routes){await go(route);await noOverflow(`${width} ${route}`);assert.equal(await p.locator('h1').count(),1);assert.ok(await p.locator('h1').isVisible());assert.equal(await p.locator('main').count(),1);
   const badImages=await p.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));assert.deepEqual(badImages,[],route);
   if(width===1440&&['/','/institutions/','/founders/','/work/','/start/','/about/'].includes(route))await shot(route==='/'?'home-desktop':route.split('/')[1]+'-desktop');
   if(width===390&&['/','/institutions/','/founders/','/work/','/start/'].includes(route))await shot(route==='/'?'home-mobile':route.split('/')[1]+'-mobile');
  }
 }
 // Mobile navigation exposes state, works with keyboard, and closes with Escape.
 await p.setViewportSize({width:390,height:844});await go('/');
 const menu=p.locator('.nav-toggle');assert.equal(await menu.getAttribute('aria-expanded'),'false');
 await menu.focus();await p.keyboard.press('Enter');assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.equal(await p.locator('.nav-links a:visible').count(),6);
 await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.ok(await menu.evaluate(e=>e===document.activeElement));
 await menu.click();await p.getByRole('link',{name:'Institutions',exact:true}).click();assert.ok(p.url().endsWith('/institutions/'));
 // Founder FAQ is native keyboard-operable disclosure.
 await go('/founders/');await p.locator('summary').first().focus();await p.keyboard.press('Enter');assert.ok(await p.locator('details').first().evaluate(e=>e.open));
 // Both inquiry query prefilling and local review carry the full input without sending a request.
 await go('/start/?path=founders&offer=headline&diagnosis=Missing%20Headline');
 assert.equal(await p.locator('#path').inputValue(),'founders');assert.equal(await p.locator('#offer').inputValue(),'Name the Headline™ Sprint');
 let submissions=0;p.on('request',r=>{if(r.method()==='POST')submissions++;});
 await p.locator('#intake-submit').click();assert.ok(await p.locator('#inquiry-review').isHidden());
 for(const [id,value] of Object.entries({name:'QA Test',organization:'Example organization',email:'test@example.org',project:'A research-led initiative',audience:'Board and partners',unclear:'The headline and evidence',deadline:'November 15',materials:'Research and an existing deck',budget:'To be determined'}))await p.locator('#'+id).fill(value);
 await p.locator('#support').selectOption({label:'Both'});await p.locator('#intake-submit').click();
 assert.ok(await p.locator('#inquiry-review').isVisible());const inquiry=await p.locator('#inquiry-text').inputValue();assert.ok(inquiry.includes('Name the Headline™ Sprint'));assert.ok(inquiry.includes('Missing Headline'));assert.ok(inquiry.includes('test@example.org'));assert.equal(submissions,0);
 const inquiryDownload=p.waitForEvent('download');await p.locator('#inquiry-download').click();const d=await inquiryDownload;assert.equal(d.suggestedFilename(),'portfolio-haus-inquiry.txt');assert.equal(fs.readFileSync(await d.path(),'utf8'),inquiry);
 assert.ok((await p.locator('#inquiry-email').getAttribute('href')).startsWith('mailto:biz.portfoliohaus@gmail.com?'));
 await noOverflow('intake result');await shot('start-review-mobile');
 // All six scoring outcomes, four buyer contexts; detailed diagnosis remains independent from commercial exits.
 const profiles={headline:[3,3,0,0,0,0,0,0,0,0],receipts:[0,0,3,3,0,0,0,0,0,0],audience:[0,0,0,0,3,3,0,0,0,0],deadline:[0,0,0,0,0,0,3,3,0,0],handoff:[0,0,0,0,0,0,0,0,3,3],ready:Array(10).fill(0)};
 const titles={headline:'Missing Headline',receipts:'Receipt Gap',audience:'Audience Fog',deadline:'Deadline Mode',handoff:'Handoff Risk',ready:'Ready to Travel'};
 for(const buyer of ['institutions','founders','opportunity','unsure']){
  for(const [key,choices] of Object.entries(profiles)){
   await go('/tools/can-they-repeat-it/');await p.locator('#ctri-path').selectOption(buyer);await p.locator('#ctri-start').click();
   for(let i=0;i<10;i++){await p.locator('#ctri-count').filter({hasText:`Question ${i+1} of 10`}).waitFor();await p.locator('.quiz-option').nth(choices[i]).click();if(i<9)await p.waitForFunction(n=>document.getElementById('ctri-count').textContent===`Question ${n} of 10`,i+2);}
   await p.locator('#ctri-result.active').waitFor();assert.equal(await p.locator('#r-title').innerText(),titles[key]);
   const offer=await p.locator('#r-offer').innerText();assert.ok(['Opportunity inquiry','Founder Message Audit','Receipts That Travel™','Institutional / Doctrine Build™ inquiry','A scoped conversation'].includes(offer),offer);
   if(buyer==='opportunity'||key==='deadline')assert.equal(offer,'Opportunity inquiry');
   else if(buyer==='founders')assert.equal(offer,key==='receipts'?'Receipts That Travel™':'Founder Message Audit');
   const href=await p.locator('#r-cta').getAttribute('href');assert.ok(href.startsWith('/'));assert.ok(!href.startsWith('mailto:'));
   assert.equal(await p.locator('#q-offer').innerText(),offer);await noOverflow(`${buyer} ${key} result`);
   if(buyer==='founders'&&key==='receipts'){const download=p.waitForEvent('download');await p.locator('#r-download').click();const file=await download;const text=fs.readFileSync(await file.path(),'utf8');assert.ok(text.includes('Receipt Gap'));assert.ok(text.includes('Receipts That Travel™'));await shot('diagnostic-result-mobile');}
  }
 }
 await p.locator('#ctri-restart').click();assert.equal(await p.locator('#ctri-count').textContent(),'Question 1 of 10');
 await p.locator('.quiz-option').nth(1).click();await p.waitForFunction(()=>document.getElementById('ctri-count').textContent==='Question 2 of 10');await p.locator('#ctri-back').click();assert.equal(await p.locator('.quiz-option.selected').innerText(),await p.locator('.quiz-option').nth(1).innerText());
 // Internal working instruments retain scoring, validation, exports, and edit flows.
 await go('/tools/doctrine-build-lite/');await p.locator('#dbl-run').click();assert.ok(await p.locator('#dbl-rating-error').isVisible());await p.locator('#d-org').fill('QA institution');
 for(const rate of ['clarity','audience','evidence','travel','handoff'])await p.locator(`input[name="rate-${rate}"][value="2"]`).check({force:true});
 await p.locator('#dbl-run').click();assert.ok(await p.locator('#dbl-output').isVisible());assert.equal(await p.locator('#o-path').innerText(),'Institutional / Doctrine Build™ inquiry');await noOverflow('Doctrine result');await p.locator('#dbl-edit').click();assert.equal(await p.locator('#d-org').inputValue(),'QA institution');
 await go('/tools/opportunity-readiness-brief/');await p.locator('#orb-next').click();assert.equal(await p.locator('#orb-count').textContent(),'Step 1 of 4');await p.locator('#f-name').fill('QA opportunity');await p.locator('#f-objective').fill('Explain the evidence');await p.locator('#orb-next').click();await p.locator('#f-audience').fill('Review committee');await p.locator('#orb-next').click();await p.locator('#orb-next').click();await p.locator('#f-success').fill('A clear decision');await p.locator('#orb-next').click();assert.ok(await p.locator('#orb-output').isVisible());await noOverflow('Opportunity result');await p.locator('#orb-edit').click();assert.equal(await p.locator('#f-name').inputValue(),'QA opportunity');
 // Haus Signal guided and typed routes use only canonical exits.
 for(const lane of ['Institutional communications','Founder messaging','A proposal, funding, or opportunity deadline','Proof that needs to travel','Not sure where to begin']){
  await go('/');await p.locator('.hs-launcher').click();await p.getByRole('button',{name:lane,exact:true}).click();
  if(lane!=='Not sure where to begin')await p.locator('.hs-opt').first().click();
  assert.ok(await p.locator('.hs-rec').isVisible());const href=await p.locator('.hs-cta').getAttribute('href');assert.ok(/^\/(start|founders|institutions)\//.test(href),href);await noOverflow('Haus Signal '+lane);await p.keyboard.press('Escape');assert.ok(await p.locator('.hs-panel').isHidden());
 }
 await go('/');await p.locator('.hs-launcher').click();await p.locator('#hs-input').fill('What will this cost?');await p.locator('.hs-send').click();assert.ok((await p.locator('.hs-body').innerText()).includes('Pricing depends on scope'));
 await p.locator('#hs-input').fill('<img src=x onerror=alert(1)>');await p.locator('.hs-send').click();assert.equal(await p.locator('.hs-body img').count(),0);
 assert.deepEqual(errors,[]);
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await nojs.newPage();await np.goto(base+'/');assert.equal(await np.locator('.nav-links a:visible').count(),6);await np.goto(base+'/start/');assert.ok(await np.locator('#intake-submit').isDisabled());assert.ok(await np.locator('a[href="mailto:biz.portfoliohaus@gmail.com"]').count()>0);await nojs.close();
 await browser.close();console.log('PASS: 18 routes × 4 viewports; 24 diagnostic result/context combinations; navigation/keyboard; FAQs; intake validation/download/no POST; both working tools; five Signal lanes + typed fallback; no-JS fallback; no horizontal scroll; no page errors or local HTTP failures.');
})().catch(e=>{console.error(e);process.exit(1)});
