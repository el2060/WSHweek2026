// Playwright CLI run-code in the dedicated clte-erc browser.
async (page) => {
  const failures = [], errors = [];
  let states = 0, photos = 0;
  const correct = [0,1,0,1,1,0,1];
  const assert = (ok, label) => { if (!ok) failures.push(label); };
  const button = name => page.getByRole('button', { name, exact: true });
  page.on('pageerror', error => errors.push(error.message));
  const enter = async () => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await button('02 Fire').click();
    await page.evaluate(() => document.fonts.ready);
  };
  const audit = async label => {
    states++;
    const result = await page.evaluate(() => {
      const root = document.querySelector('#evacuation');
      const box = selector => root.querySelector(selector).getBoundingClientRect();
      const photo = box('.pov-camera'), context = box('.pov-context'), panel = box('.pov-decision'), rail = box('.pov-stage-rail');
      const overlap = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
      const visible = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
      const controls = [...root.querySelectorAll('button')].filter(visible);
      return {
        overflow: document.documentElement.scrollWidth>innerWidth+1,
        clips: controls.filter(el=>el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2).map(el=>el.textContent),
        small: [...root.querySelectorAll('.pov-situation,.route-photo-cue,.pov-choices strong,.pov-feedback p')].some(el=>parseFloat(getComputedStyle(el).fontSize)<18),
        fullWidth: Math.abs(photo.width-innerWidth)<2 && Math.abs(photo.x)<2,
        photoHeight: photo.height,
        covered: overlap(context,panel)||overlap(context,rail)||overlap(panel,rail),
        internalScroll: panel.height+2<root.querySelector('.pov-decision').scrollHeight,
        reducedStill: getComputedStyle(root.querySelector('.pov-camera img')).transform==='none',
        cueVisible: !root.querySelector('.route-photo-cue') || visible(root.querySelector('.route-photo-cue')),
      };
    });
    assert(!result.overflow, `${label}: overflow`);
    assert(!result.clips.length, `${label}: clipped controls ${result.clips.join(' | ')}`);
    assert(!result.small, `${label}: body text under 18px`);
    assert(result.fullWidth && result.photoHeight>=350, `${label}: photo is not immersive/full width (${result.photoHeight}px)`);
    assert(!result.covered && !result.internalScroll, `${label}: panels overlap or have internal scroll`);
    assert(result.reducedStill, `${label}: reduced motion ignored`);
    assert(result.cueVisible, `${label}: Block 56 cue hidden`);
  };
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const [width,height,scale] of [[1920,1080,1],[1440,900,1],[1366,768,1],[1024,768,1],[768,1024,1],[390,844,1],[320,740,1],[390,844,1.25]]) {
    await page.evaluate(()=>localStorage.removeItem('clte-safety-progress'));
    await page.setViewportSize({width,height}); await page.reload(); await enter();
    if (scale!==1) await page.addStyleTag({content:`html { font-size: ${scale*100}% !important; }`});
    if (scale===1 && [1440,390].includes(width)) {
      await page.locator('.pov-camera img').evaluate(img=>img.decode());
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:`output/playwright/fire-immersive-start-${width}.png`,fullPage:true,animations:'disabled'});
    }
    for (let stage=0;stage<7;stage++) {
      await page.getByRole('tab').nth(stage).click();
      assert(await page.locator('.pov-location').count()===0, `${width}/${stage}: competing instruction panel`);
      assert(await page.locator('.pov-situation').count()===1, `${width}/${stage}: missing situation`);
      assert(await page.locator('.pov-choices button').count()===2, `${width}/${stage}: expected two choices`);
      assert(await page.locator('.pov-feedback').count()===0, `${width}/${stage}: feedback before choosing`);
      assert(await page.locator('.pov-choices [aria-pressed="true"]').count()===0, `${width}/${stage}: preselected answer`);
      const views = await page.getByRole('button',{name:/^Show route view/}).all();
      for (let view=0;view<Math.max(1,views.length);view++) {
        if (views.length) {
          await views[view].focus(); await page.keyboard.press('Space');
          assert(await views[view].getAttribute('aria-pressed')==='true', `${width}/${stage}/${view}: gallery selection`);
        }
        const image=page.locator('.pov-camera img'); await image.evaluate(img=>img.decode()); photos++;
        if (views.length) assert(await image.getAttribute('src')===await views[view].locator('img').getAttribute('src'), `${width}/${stage}/${view}: wrong photo`);
        await audit(`${width}/${scale}/${stage}/photo-${view}`);
      }
      if (views.length) await views[0].click();
      for (const choice of [1-correct[stage],correct[stage]]) {
        await page.locator('.pov-choices button').nth(choice).click();
        assert(await page.locator(choice===correct[stage]?'.pov-feedback.good':'.pov-feedback.consider').count()===1, `${width}/${stage}/${choice}: feedback`);
        await audit(`${width}/${scale}/${stage}/choice-${choice}`);
      }
      if (stage===3) assert((await page.locator('.route-photo-cue').innerText()).includes('Do not cross here'), `${width}: crossing warning missing`);
      if (scale===1 && [1440,390].includes(width) && [0,3,4,6].includes(stage)) {
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:`output/playwright/fire-immersive-${stage}-${width}.png`,fullPage:true,animations:'disabled'});
      }
    }
    assert((await page.locator('.pov-status small').innerText())==='Route complete', `${width}: completion count`);
    await button('Route map').click();
    assert(await page.getByRole('dialog').isVisible(), `${width}: route map`);
    await button('Close route map').click();
    await button('Finish Fire 02').click();
    assert(await page.locator('#walkway').isVisible(), `${width}: continuation to injury`);
  }
  // Desktop parallax changes only the image; reduced motion and mobile stop it.
  await page.setViewportSize({width:1440,height:900}); await page.reload(); await enter();
  await page.emulateMedia({reducedMotion:'no-preference'});
  const panelBefore = await page.locator('.pov-decision').boundingBox();
  await page.mouse.move(120,240);
  await page.waitForFunction(()=>document.querySelector('#evacuation').style.getPropertyValue('--look-x')!=='');
  const first = await page.locator('#evacuation').evaluate(el=>el.style.getPropertyValue('--look-x'));
  await page.mouse.move(1320,700);
  const second = await page.locator('#evacuation').evaluate(el=>el.style.getPropertyValue('--look-x'));
  assert(first!==second, 'desktop pointer does not change parallax');
  assert(await page.locator('.pov-camera img').evaluate(el=>getComputedStyle(el).transform!=='none'), 'desktop depth transform missing');
  const panelAfter = await page.locator('.pov-decision').boundingBox();
  assert(JSON.stringify(panelBefore)===JSON.stringify(panelAfter), 'parallax moved the decision panel');
  await page.mouse.move(1400,20);
  assert(await page.locator('#evacuation').evaluate(el=>el.style.getPropertyValue('--look-x')==='0px'), 'pointer leave did not reset depth');
  await page.emulateMedia({reducedMotion:'reduce'}); await audit('desktop/reduced-motion');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.locator('.pov-camera img').evaluate(el=>getComputedStyle(el).transform==='none'), 'phone photo should stay still');
  assert(!errors.length, `runtime errors: ${errors.join(';')}`);
  assert(photos===112, `All 14 existing photos must load at each of the eight sizes; got ${photos}`);
  if(failures.length) throw new Error(failures.join('\n'));
  return {result:'PASS',states,photos,runtimeErrors:errors};
}
