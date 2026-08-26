// Run with Playwright CLI in a dedicated test browser. No real calls/submissions.
async (page) => {
  const failures = [], errors = [], images = new Set();
  let states = 0;
  const assert = (value, label) => { if (!value) failures.push(label); };
  const button = name => page.getByRole('button', { name, exact: true });
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const enter = async () => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await button('05 Report').click();
  };
  const audit = async label => {
    states++;
    const result = await page.evaluate(() => {
      const root = document.querySelector('.reporting-guided');
      const visible = el => el.getBoundingClientRect().height > 0;
      const image = root.querySelector('.report-visual img');
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clipped: [...root.querySelectorAll('button')].filter(visible).filter(el => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2).map(el => el.textContent),
        small: [...root.querySelectorAll('.report-story,.report-cue strong,.report-ticket p,.report-takeaway p')].some(el => parseFloat(getComputedStyle(el).fontSize) < 18),
        image: image.complete && image.naturalWidth > 0,
        source: image.getAttribute('src'),
        animation: getComputedStyle(root.querySelector('.report-workspace')).animationName,
      };
    });
    assert(!result.overflow, `${label}: overflow`);
    assert(!result.clipped.length, `${label}: clipped ${result.clipped.join(',')}`);
    assert(!result.small, `${label}: small learning text`);
    assert(result.image, `${label}: missing image`);
    assert(result.animation === 'none', `${label}: reduced motion ignored`);
    images.add(result.source);
  };
  for (const width of [1920,1440,1024,768,390,320]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(() => ['clte-safety-progress','clte-reporting-v1'].forEach(key => localStorage.removeItem(key)));
    await page.reload(); await enter(); await page.evaluate(() => document.fonts.ready);
    assert((await page.locator('.report-count').innerText()).includes('0/4'), `${width}: progress awarded on entry`);
    // All moments are reachable before any action, including by keyboard.
    await page.locator('.report-moments button').last().focus(); await page.keyboard.press('Enter');
    assert((await page.locator('.report-situation h2').innerText()).includes('chair'), `${width}: free navigation`);
    assert(await page.locator('.report-stamp').count() === 0, `${width}: pre-labelled record`);
    await button('Try an untried situation').click();
    assert((await page.locator('.report-situation h2').innerText()).includes('breathe'), `${width}: find an untried moment`);
    await button('Next situation').click();
    assert((await page.locator('.report-situation h2').innerText()).includes('student'), `${width}: next moment`);
    const headingTop = await page.locator('.report-situation h2').evaluate(el => el.getBoundingClientRect().top);
    assert(headingTop >= 64 && headingTop < 300, `${width}: next situation left offscreen`);
    await button('Back').click();
    for (let index = 0; index < 4; index++) {
      await page.locator('.report-moments button').nth(index).click();
      await page.locator('.report-visual img').evaluate(img => img.decode());
      await audit(`${width}/${index}/before`);
      assert((await page.locator('.report-cue').innerText()).includes(['call, not a form','record an incident','record a near miss','request a repair'][index]), `${width}/${index}: unclear cue`);
      await page.locator('.report-action').focus(); await page.keyboard.press('Space');
      await audit(`${width}/${index}/after`);
      assert(await page.locator('.report-stamp').count() === 1, `${width}/${index}: no visible action result`);
      assert((await page.locator('.report-takeaway').innerText()).length > 40, `${width}/${index}: no learning feedback`);
      await page.locator('.report-action').click();
      assert((await page.locator('.report-count').innerText()).includes(`${index+1}/4`), `${width}/${index}: duplicate progress`);
      if ([1440,390].includes(width)) {
        await page.evaluate(() => window.scrollTo(0,0));
        await page.screenshot({path:`output/playwright/report-guided-${index}-${width}.png`,fullPage:true,animations:'disabled'});
      }
    }
    assert(await page.locator('.channel-drop').count() === 0, `${width}: old quiz still shown`);
    assert(await page.locator('.reporting-guided a').count() === 0, `${width}: practice must not initiate external action`);
    await page.reload(); await enter();
    assert((await page.locator('.report-count').innerText()).includes('4/4'), `${width}: progress not restored`);
    await button('Continue to report practice').click();
    assert(await page.locator('.mock-shell').isVisible(), `${width}: handoff to report practice`);
    assert(await page.locator('.choice-field button[aria-pressed="true"]').count() === 0, `${width}: practice answers preselected`);
  }
  // Reset must clear the scenario's own saved state too.
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('button',{name:/Ngee Ann Polytechnic.*Home/}).click();
  await button('Start again').click();
  await page.getByRole('dialog').getByRole('button',{name:'Reset activity',exact:true}).click();
  await enter();
  assert((await page.locator('.report-count').innerText()).includes('0/4'), 'reset: saved practice remains');
  assert(images.size === 4, 'each situation needs a distinct relevant visual');
  assert(errors.length === 0, `runtime: ${errors.join('; ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return {result:'PASS',states,distinctImages:images.size,runtimeErrors:errors};
}
