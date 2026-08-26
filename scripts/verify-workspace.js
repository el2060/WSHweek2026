// Playwright CLI run-code in a dedicated browser; only its local progress is reset.
async (page) => {
  const failures = [], errors = [], measurements = [];
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const button = name => page.getByRole('button', { name, exact: true });
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const nav = async name => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await button(name).click();
  };
  let states = 0;
  const check = async label => {
    states++;
    const result = await page.evaluate(() => {
      const visible = el => el.getBoundingClientRect().width && el.getBoundingClientRect().height;
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clips: [...document.querySelectorAll('main button')].filter(visible).filter(el => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2).map(el => el.textContent.trim()),
      };
    });
    assert(!result.overflow, `${label}: page overflow`);
    assert(!result.clips.length, `${label}: clipped controls ${result.clips.join(' | ')}`);
  };
  for (const [width,height] of [[3778,1870],[2560,1440],[2267,1122],[1920,1080],[1440,900],[1366,768],[1024,768],[900,900],[768,1024],[390,844],[320,740]]) {
    await page.setViewportSize({ width,height });
    await page.evaluate(() => ['clte-safety-progress','clte-decisions-v1-injury','clte-decisions-v1-haze','clte-decisions-v1-reporting','clte-office-v3'].forEach(key => localStorage.removeItem(key)));
    await page.reload(); await page.evaluate(() => document.fonts.ready);
    await check(`${width}/home`);
    if ([1920,390].includes(width)) await page.screenshot({path:`output/playwright/spacing-home-${width}.png`,fullPage:true});
    await nav('01 Hazards'); await check(`${width}/office`);
    assert(await page.locator('.hazard-choice').count() === 2, `${width}: first risk should be ready to try`);
    assert(await page.locator('.hazard-result').count() === 0, `${width}: no answer should be preselected`);
    assert((await page.locator('.scene-counter').innerText()).includes('0/5'), `${width}: no progress should be awarded on entry`);
    const measure = await page.evaluate(() => {
      const panel = document.querySelector('.office-workspace').getBoundingClientRect();
      const heading = document.querySelector('.scene-heading').getBoundingClientRect();
      const image = document.querySelector('.office-workspace .scene-frame').getBoundingClientRect();
      const type = document.querySelector('.hazard-choice');
      return {width:innerWidth,workspace:panel.width,usage:panel.width/innerWidth,gap:panel.top-heading.bottom,imageShare:image.width/panel.width,font:parseFloat(getComputedStyle(type).fontSize),root:parseFloat(getComputedStyle(document.documentElement).fontSize)};
    });
    measurements.push(measure);
    if (width >= 901) {
      assert(measure.usage >= (width > 3000 ? .7 : .85), `${width}: narrow workspace ${measure.usage}`);
      assert(measure.gap <= measure.root * 1.6, `${width}: excess gap after chapter heading`);
      assert(measure.imageShare < .5, `${width}: illustration dominates the workspace`);
    }
    assert(measure.font >= 18, `${width}: small decision text`);
    if ([3778,2267,1920,1366,390].includes(width)) await page.screenshot({path:`output/playwright/spacing-office-${width}.png`,fullPage:true});
    await page.locator('.hazard-picker button').last().click(); await check(`${width}/free-navigation`);
    await page.getByRole('button',{name:'Inspect: Loose cable',exact:true}).click();
    await button('Keep others clear and ask for the cable to be secured').click(); await check(`${width}/office-feedback`);
    for (const chapter of ['02 Fire','03 Injury','04 Haze','05 Report']) {
      await nav(chapter); await check(`${width}/${chapter}`);
      if (chapter === '02 Fire') {
        await page.getByRole('tab',{name:/Blk 56/}).click();
        await page.getByRole('button',{name:/Stay on the walkway — do not cross here/}).click();
      } else if (chapter === '03 Injury') {
        await page.locator('.journey-nav button').last().click(); await page.locator('.journey-choices button').nth(1).click();
      } else if (chapter === '04 Haze') {
        await page.locator('.journey-nav button').last().click(); await page.locator('.journey-choices button').first().click();
      } else await page.locator('.journey-choices button').first().click();
      await check(`${width}/${chapter}/feedback`);
      if ([2267,1920,390].includes(width)) await page.screenshot({path:`output/playwright/spacing-${chapter.split(' ')[1].toLowerCase()}-${width}.png`,fullPage:true});
    }
    await page.evaluate(() => localStorage.setItem('clte-safety-progress',JSON.stringify({office:true,evacuation:true,walkway:true,haze:true,reporting:true,practice:false,guide:false,completion:false})));
    await page.reload(); await button('Continue: report practice').click(); await check(`${width}/practice-type`);
    await button('Next').click(); await check(`${width}/practice-impact`);
    await button('Next').click(); await button('Review my practice report').click(); await check(`${width}/practice-review`);
    await page.evaluate(() => localStorage.setItem('clte-safety-progress',JSON.stringify({office:true,evacuation:true,walkway:true,haze:true,reporting:true,practice:true,guide:false,completion:false})));
    await page.reload(); await button('Continue: WSH contacts').click();
    for (const name of ['Emergency','Incident / near miss','Hazard / defect']) { await page.getByRole('tab',{name,exact:true}).click(); await check(`${width}/${name}`); }
    await button('Finish activity').click(); await check(`${width}/completion`);
  }
  assert(!errors.length, `Runtime errors: ${errors.join('; ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return {result:'PASS',states,measurements,runtimeErrors:errors};
}
