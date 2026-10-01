// Run in the dedicated verification browser, never a user's browser profile.
async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => {
    const fixtures = {
      'clte-pantry-v1': { spill: 'protect', 'pantry-bag': 'store', 'pantry-cable': 'secure', 'hot-mug': 'move' },
      'clte-cubicles-v2': { posture: 'adjust', glare: 'position', 'equipment-storage': 'lower', 'monitor-reach': 'assistance' },
      'clte-experiment-room-v2': { 'aisle-cable': 'reroute', 'aisle-bag': 'under-table', 'exit-route': 'clear' },
      'clte-decisions-v1-injury': { care: 'check', space: 'guide', help: 'ask' },
      'clte-decisions-v1-haze': { plan: 'change', shelter: 'indoors', urgent: 'call' },
    };
    Object.entries(fixtures).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
  });
  await page.reload();
  const scenarios = [
    { name: 'Pantry hazards', nav: '.hazard-picker button', choices: '.hazard-choice', count: 4 },
    { name: 'Office cubicle hazards', nav: '.cubicle-picker button', choices: '.hazard-choice', count: 4 },
    { name: 'Experiment Room', nav: '.experiment-picker button', choices: '.experiment-choices button', count: 3 },
    { name: 'Injury response', nav: '.journey-nav button', choices: '.journey-choices button', count: 3 },
    { name: 'Haze response', nav: '.journey-nav button', choices: '.journey-choices button', count: 3 },
  ];
  let checks = 0;
  const verify = async label => {
    // Wait for layout/ResizeObserver after feedback or navigation changes.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const result = await page.locator('.scene-stage').evaluate(stage => {
      const art = stage.querySelector('.scene-art-slot');
      const panel = stage.querySelector('.scene-decision-slot');
      const a = art.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const [x, y, width, height] = art.dataset.protectedRegion.split(',').map(Number);
      const focus = { left: a.left + a.width*x/100, right: a.left+a.width*(x+width)/100, top: a.top+a.height*y/100, bottom: a.top+a.height*(y+height)/100 };
      const overlaps = p.left < focus.right && p.right > focus.left && p.top < focus.bottom && p.bottom > focus.top;
      const images = Array.from(art.querySelectorAll('img'));
      const imageReady = images.every(img => img.complete && img.naturalWidth > 0);
      const cropped = images.some(img => Math.abs(img.getBoundingClientRect().width/img.getBoundingClientRect().height - img.naturalWidth/img.naturalHeight) > .01);
      const toggle = stage.querySelector('.hazard-focus-toggle')?.getBoundingClientRect();
      const blocksToggle = toggle && p.left < toggle.right && p.right > toggle.left && p.top < toggle.bottom && p.bottom > toggle.top;
      return { overlaps, imageReady, cropped, blocksToggle, placement: stage.dataset.panelPlacement, overflow: document.documentElement.scrollWidth > innerWidth, artWidth: a.width };
    });
    if (result.overlaps || result.blocksToggle || result.cropped || result.overflow || !result.imageReady) throw Error(`${label}: ${JSON.stringify(result)}`);
    if (result.artWidth < (await page.viewportSize()).width - 1) throw Error(`${label}: artwork does not fill the width`);
    checks++;
  };
  for (const width of [1920, 1440, 1101, 1024, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const scenario of scenarios) {
      if (await page.getByRole('button', { name: 'Toggle navigation' }).isVisible()) await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await page.getByRole('button', { name: scenario.name, exact: true }).click();
      await page.locator('.scene-art-slot img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      for (let index = 0; index < scenario.count; index++) {
        await page.locator(scenario.nav).nth(index).click();
        for (let choice = 0; choice < 2; choice++) {
          await page.locator(scenario.choices).nth(choice).click();
          await verify(`${width}/${scenario.name}/${index}/${choice}`);
        }
      }
      if (await page.locator('.hazard-focus-toggle').count()) {
        await page.locator('.hazard-focus-toggle').click();
        await verify(`${width}/${scenario.name}/overview`);
        if (await page.locator('.scene-stage').getAttribute('data-panel-placement') !== 'below') throw Error('Overview must show all of the illustration');
        await page.locator('.hazard-focus-toggle').click();
      } else {
        await page.locator('.journey-reference summary').click();
        await verify(`${width}/${scenario.name}/expanded reference`);
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 950 });
  if (await page.getByRole('button', { name: 'Toggle navigation' }).isVisible()) await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'Office cubicle hazards', exact: true }).click();
  await page.getByRole('button', { name: '4. Reaching', exact: true }).click();
  await page.locator('.cubicle-panel').evaluate(panel => { panel.style.fontSize = '150%'; panel.querySelectorAll('p,h2,button').forEach(el => { el.style.fontSize = '1.5em'; }); });
  await verify('enlarged decision text');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await verify('reduced motion');
  if (errors.length) throw Error(errors.join('\n'));
  await page.evaluate(value => { window.__sceneImmersionChecks = value; }, checks);
  return { passed: checks };
}
