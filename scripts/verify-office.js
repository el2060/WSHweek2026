// Dedicated Playwright CLI browser. Only test-browser local progress is reset.
async (page) => {
  const failures = [], errors = [];
  let states = 0;
  const assert = (value, label) => { if (!value) failures.push(label); };
  const button = name => page.getByRole('button', { name, exact: true });
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const enter = async () => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await button('01 Hazards').click();
  };
  const audit = async label => {
    states++;
    const result = await page.evaluate(() => {
      const root = document.querySelector('#office');
      const visible = el => el.getBoundingClientRect().height > 0;
      const markers = [...root.querySelectorAll('.hazard-marker')];
      const image = root.querySelector('.scene-frame img');
      const imageBox = image.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clips: [...root.querySelectorAll('button')].filter(visible).filter(el => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2).map(el => el.textContent),
        small: [...root.querySelectorAll('.hazard-story,.hazard-prompt,.hazard-choice,.hazard-result p')].some(el => parseFloat(getComputedStyle(el).fontSize) < 18),
        targets: markers.every(el => { const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }),
        hitTargets: markers.every(el => { const r=el.getBoundingClientRect(); const x=r.x+r.width/2, y=r.y+r.height/2; return y<70 || y>innerHeight || el.contains(document.elementFromPoint(x,y)); }),
        image: image.complete && image.naturalWidth > 0,
        ratio: imageBox.width / imageBox.height,
        motion: root.querySelector('.hazard-result') ? getComputedStyle(root.querySelector('.hazard-result')).animationName : 'none',
      };
    });
    assert(!result.overflow, `${label}: overflow`);
    assert(!result.clips.length, `${label}: clips ${result.clips.join(',')}`);
    assert(!result.small, `${label}: small text`);
    assert(result.targets && result.hitTargets, `${label}: obscured/small markers`);
    assert(result.image && Math.abs(result.ratio-1672/941)<.01, `${label}: missing/cropped scene`);
    assert(result.motion === 'none', `${label}: reduced motion ignored`);
  };
  for (const width of [1920,1440,1024,768,390,320]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(() => ['clte-safety-progress','clte-office-v3'].forEach(key => localStorage.removeItem(key)));
    await page.reload(); await enter(); await page.evaluate(() => document.fonts.ready);
    await page.locator('.scene-frame img').evaluate(img => img.decode());
    assert((await page.locator('.scene-counter').innerText()).includes('0/5'), `${width}: pre-awarded progress`);
    assert(await page.locator('.hazard-result').count() === 0, `${width}: pre-applied action`);
    await page.locator('.hazard-picker button').last().focus(); await page.keyboard.press('Enter');
    assert((await page.locator('.hazard-panel h3').innerText()).includes('printer'), `${width}: free navigation`);
    await button('Review remaining').click();
    assert((await page.locator('.hazard-panel h3').innerText()).includes('Bag'), `${width}: untried hazard navigation`);
    for (let index=0; index<5; index++) {
      if (index>0) await button('Next hazard').click();
      await audit(`${width}/${index}/before`);
      assert((await page.locator('.hazard-prompt').innerText()).length>10, `${width}/${index}: prompt missing`);
      assert(await page.locator('.hazard-choice').count() === 2, `${width}/${index}: meaningful alternatives missing`);
      assert(await page.locator('.hazard-choice[aria-pressed="true"]').count() === 0, `${width}/${index}: preselected answer`);
      const panelWords = (await page.locator('.hazard-panel').innerText()).trim().split(/\s+/).length;
      assert(panelWords <= 65, `${width}/${index}: wordy initial panel (${panelWords})`);
      if ([1440,390].includes(width) && index===2) {
        await page.evaluate(() => window.scrollTo(0,0));
        await page.screenshot({path:`output/playwright/office-concise-cable-before-${width}.png`,fullPage:true});
      }
      let priorFeedback = '';
      for (const option of [1,0]) {
        await page.locator('.hazard-choice').nth(option).focus(); await page.keyboard.press('Space');
        await audit(`${width}/${index}/choice-${option}`);
        const feedback = await page.locator('.hazard-result p').innerText();
        assert(feedback.length>35 && feedback.trim().split(/\s+/).length<=26, `${width}/${index}: feedback should be useful and brief`);
        assert(feedback!==priorFeedback, `${width}/${index}: choice did not change feedback`);
        priorFeedback=feedback;
        assert(await page.locator('[draggable="true"],.hazard-placed-token,.hazard-cue').count()===0, `${width}/${index}: unnecessary interaction or duplicate instruction remains`);
        assert(await page.locator('.hazard-choice').nth(option).getAttribute('aria-pressed')==='true', `${width}/${index}: choice not selected`);
        const correct = option===0;
        assert((await page.locator('.hazard-result strong').innerText())===(correct?'Correct':'Not safe — choose again'), `${width}/${index}: feedback label`);
        assert(await page.locator(`.hazard-choice.selected.${correct?'correct':'incorrect'} svg.lucide-${correct?'check':'x'}`).count()===1, `${width}/${index}: missing right/wrong icon`);
        assert((await page.locator('.scene-counter').innerText()).includes(`${index+(correct?1:0)}/5`), `${width}/${index}: incorrect progress awarded`);
        assert(await page.locator('.hazard-marker.done').count()===index+(correct?1:0), `${width}/${index}: wrong choice marked done`);
        if (!correct && [1440,390].includes(width) && index===0) {
          await page.evaluate(() => window.scrollTo(0,0));
          await page.screenshot({path:`output/playwright/office-incorrect-${width}.png`,fullPage:true});
        }
      }
      assert((await page.locator('.scene-counter').innerText()).includes(`${index+1}/5`), `${width}/${index}: duplicate progress`);
      assert(await page.locator('.hazard-marker.done').count() === index+1, `${width}/${index}: marker not updated`);
      if ([1440,390].includes(width)) {
        await page.evaluate(() => window.scrollTo(0,0));
        await page.screenshot({path:`output/playwright/office-guided-${index}-${width}.png`,fullPage:true,animations:'disabled'});
      }
    }
    assert(await page.locator('.decision-options').count() === 0, `${width}: old quiz remains`);
    // Changing a correct answer must not leave stale completion or green markers.
    await page.locator('.hazard-choice').nth(1).click();
    assert(await button('Continue to Fire').count()===0, `${width}: wrong answer can complete`);
    await page.reload(); await enter();
    assert((await page.locator('.hazard-panel h3').innerText()).includes('printer'), `${width}: resume did not find remaining hazard`);
    assert((await page.locator('.scene-counter').innerText()).includes('4/5'), `${width}: persisted wrong answer counted`);
    assert(await page.locator('.hazard-choice.selected.incorrect').count()===1, `${width}: persisted wrong answer lost`);
    await button('Review remaining').click();
    await page.locator('.hazard-choice').first().click();
    await page.reload(); await enter();
    assert((await page.locator('.scene-counter').innerText()).includes('5/5'), `${width}: persistence failed`);
    await button('Continue to Fire').click();
    assert(await page.locator('#evacuation').isVisible(), `${width}: completion did not lead to Fire`);
  }
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('button',{name:/Ngee Ann Polytechnic.*Home/}).click();
  await button('Start again').click(); await button('Reset activity').click(); await enter();
  assert((await page.locator('.scene-counter').innerText()).includes('0/5'), 'reset failed');
  await page.evaluate(() => localStorage.setItem('clte-office-v3','{"invalid":true}'));
  await page.reload(); await enter();
  assert((await page.locator('.scene-counter').innerText()).includes('0/5'), 'invalid saved state not handled');
  await page.evaluate(() => {
    localStorage.removeItem('clte-office-v3');
    localStorage.setItem('clte-office-v2',JSON.stringify({bag:'cubby',drawer:'close',cable:'owner',files:'shelf',drink:'table'}));
  });
  await page.reload(); await enter();
  assert((await page.locator('.scene-counter').innerText()).includes('0/5'), 'legacy choices pre-awarded progress');
  assert(await page.locator('.hazard-choice[aria-pressed="true"]').count()===0, 'legacy choices pre-selected');
  assert(errors.length===0, `runtime errors: ${errors.join(';')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return {result:'PASS',states,runtimeErrors:errors};
}
