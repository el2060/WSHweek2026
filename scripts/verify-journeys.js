// Dedicated Playwright CLI browser; only its test progress is changed.
async (page) => {
  const failures=[], errors=[], images=new Set(), wordCounts=[];
  const scenarios=[['03 Injury','injury',[1,0,1],'Continue to Haze','#haze'],['04 Haze','haze',[0,1,0],'Continue to Report','#reporting'],['05 Report','reporting',[0,1,0,1],'Continue to report practice','#practice']];
  let states=0;
  const assert=(ok,label)=>{if(!ok)failures.push(label);};
  const button=name=>page.getByRole('button',{name,exact:true});
  const nav=async name=>{
    const menu=button('Toggle navigation');
    if(await menu.isVisible()&&await menu.getAttribute('aria-expanded')!=='true')await menu.click();
    await button(name).click();
    if(await menu.isVisible())assert(await menu.getAttribute('aria-expanded')==='false',`${name}: menu stayed open after choosing a scenario`);
    await page.locator('.journey-art img').evaluate(img=>img.decode());
  };
  page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  const audit=async label=>{
    states++;
    const result=await page.evaluate(()=>{
      const root=document.querySelector('.decision-journey'), panel=root.querySelector('.journey-panel'), image=root.querySelector('.journey-art img');
      const visible=el=>el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
      const box=el=>el.getBoundingClientRect();
      const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
      const imageBox=box(image), panelBox=box(panel), navBox=box(root.querySelector('.journey-nav'));
      return {
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        clips:[...root.querySelectorAll('button,summary')].filter(visible).filter(el=>el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2).map(el=>el.textContent),
        small:[...root.querySelectorAll('.journey-story,.journey-choices button,.journey-feedback p,.journey-reference li')].filter(visible).some(el=>parseFloat(getComputedStyle(el).fontSize)<18),
        fullWidth:Math.abs(imageBox.width-innerWidth)<2,
        imageLoaded:image.complete&&image.naturalWidth>0,
        imageHeight:imageBox.height,
        overlap:overlap(panelBox,navBox),
        innerScroll:panel.scrollHeight>panel.clientHeight+2,
        movement:getComputedStyle(image).transform!=='none',
        panelWords:panel.innerText.trim().split(/\s+/).length,
      };
    });
    assert(!result.overflow&&!result.overlap&&!result.innerScroll,`${label}: overflow/overlap/internal scrolling`);
    assert(!result.clips.length,`${label}: clipped ${result.clips.join(' | ')}`);
    assert(!result.small,`${label}: text under 18px`);
    assert(result.fullWidth&&result.imageLoaded&&result.imageHeight>=250,`${label}: illustration not immersive`);
    assert(!result.movement,`${label}: unexpected movement`);
    return result;
  };
  for(const [width,scale]of [[1920,1],[1440,1],[1024,1],[768,1],[390,1],[320,1],[390,1.25]]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>['clte-safety-progress',...['injury','haze','reporting'].map(kind=>`clte-decisions-v1-${kind}`)].forEach(key=>localStorage.removeItem(key)));
    await page.reload();await page.evaluate(()=>document.fonts.ready);
    if(scale!==1)await page.addStyleTag({content:`html{font-size:${scale*100}%!important}`});
    for(const [chapter,kind,correct,continueLabel,target]of scenarios){
      await nav(chapter);
      assert((await page.locator('.journey-count').innerText()).startsWith('0/'),`${width}/${kind}: pre-awarded progress`);
      await page.locator('.journey-nav button').last().focus();await page.keyboard.press('Enter');
      assert((await page.locator('.journey-step').innerText()).includes(`${correct.length} of`),`${width}/${kind}: last step locked`);
      await button('Review remaining').click();
      for(let step=0;step<correct.length;step++){
        await page.locator('.journey-nav button').nth(step).click();
        await page.locator('.journey-art img').evaluate(img=>img.decode());
        if(kind==='reporting'&&step>0&&width<=1100)assert(await page.locator('.journey-art').evaluate(el=>el.getBoundingClientRect().top>=0),'New report scene should be visible after changing situation');
        images.add(await page.locator('.journey-art img').getAttribute('src'));
        const before=await audit(`${width}/${scale}/${kind}/${step}/before`);
        wordCounts.push(before.panelWords);
        assert(before.panelWords<=65,`${width}/${kind}/${step}: wordy initial panel (${before.panelWords})`);
        assert(await page.locator('.journey-choices button').count()===2,`${kind}/${step}: not two choices`);
        assert(await page.locator('.journey-choices [aria-pressed=true]').count()===0,`${kind}/${step}: preselected answer`);
        for(const option of [1-correct[step],correct[step]]){
          const good=option===correct[step];
          await page.locator('.journey-choices button').nth(option).focus();await page.keyboard.press('Space');
          await audit(`${width}/${scale}/${kind}/${step}/${good?'correct':'incorrect'}`);
          assert(await page.locator(`.journey-feedback>.${good?'correct':'incorrect'}`).count()===1,`${kind}/${step}: incorrect feedback state`);
          assert((await page.locator('.journey-feedback p').innerText()).trim().split(/\s+/).length<=28,`${kind}/${step}: long feedback`);
          assert((await page.locator('.journey-count').innerText()).startsWith(`${step+(good?1:0)}/`),`${kind}/${step}: wrong progress`);
          assert(await page.locator(`.journey-choices .${good?'correct':'incorrect'} svg`).count()===1,`${kind}/${step}: missing feedback icon`);
        }
        if(scale===1&&[1440,390].includes(width)){
          await page.evaluate(()=>window.scrollTo(0,0));
          await page.screenshot({path:`output/playwright/breezy-${kind}-${step}-${width}.png`,fullPage:true,animations:'disabled'});
        }
      }
      await page.locator('.journey-reference summary').click();await audit(`${width}/${kind}/reference`);
      assert((await page.locator('.journey-reference').innerText()).includes('995'),`${kind}: emergency reference missing`);
      assert(await page.locator('.decision-journey a[href^="tel:"]').count()===0,`${kind}: real call in practice`);
      await page.locator('.journey-reference summary').click();
      await page.reload();await nav(chapter);
      if(scale!==1)await page.addStyleTag({content:`html{font-size:${scale*100}%!important}`});
      assert((await page.locator('.journey-count').innerText()).startsWith(`${correct.length}/`),`${kind}: persistence failed`);
      await button(continueLabel).click();
      assert(await page.locator(target).isVisible(),`${kind}: continuation failed`);
      if(kind==='reporting')assert(await page.locator('.choice-field [aria-pressed=true]').count()===0,'practice report prefilled');
    }
  }
  // Unknown/legacy progress must not become an answered new question.
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(()=>{
    ['injury','haze','reporting'].forEach(kind=>localStorage.setItem(`clte-decisions-v1-${kind}`,'{"invalid":true}'));
    localStorage.setItem('clte-guided-v1-haze','{"done":[true,true,true],"plan":"indoors"}');
    localStorage.setItem('clte-reporting-v1','["help","injury","near-miss","repair"]');
  });
  await page.reload();
  for(const [chapter]of scenarios){await nav(chapter);assert((await page.locator('.journey-count').innerText()).startsWith('0/'),`${chapter}: invalid or legacy answer accepted`);}
  // A wrong answer persists as wrong; resume returns to that unfinished decision.
  await page.evaluate(()=>localStorage.setItem('clte-decisions-v1-haze',JSON.stringify({plan:'change',shelter:'covered',urgent:'call'})));
  await page.reload();await nav('04 Haze');
  assert((await page.locator('.journey-step').innerText()).includes('2 of 3'),'resume must find unfinished decision');
  assert(await page.locator('.journey-choices .incorrect').count()===1,'wrong answer should persist honestly');
  assert(await button('Continue to Report').count()===0,'wrong answer completed scenario');
  await page.locator('.journey-choices button').nth(1).click();
  assert(await button('Continue to Report').count()===1,'correction did not enable completion');
  await page.locator('.journey-choices button').first().click();
  assert(await button('Continue to Report').count()===0,'changing answer left stale completion');
  // Reset uses the existing app confirmation and clears both storage generations.
  await page.getByRole('button',{name:/Ngee Ann Polytechnic.*Home/}).click();
  await button('Start again').click();await button('Reset activity').click();
  for(const [chapter,kind]of scenarios){
    await nav(chapter);assert((await page.locator('.journey-count').innerText()).startsWith('0/'),`${kind}: reset failed`);
  }
  assert(images.size===4,'expected four relevant illustrations');
  assert(!errors.length,`runtime errors: ${errors.join(';')}`);
  if(failures.length)throw new Error(failures.join('\n'));
  return {result:'PASS',states,distinctImages:images.size,maxInitialPanelWords:Math.max(...wordCounts),runtimeErrors:errors};
}
