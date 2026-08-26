// Run with: npx --package @playwright/cli playwright-cli -s=clte-redesign run-code --filename scripts/verify-guided.js
async (page) => {
  const failures = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (condition, message) => { if (!condition) failures.push(message); };
  const button = name => page.getByRole('button', { name, exact: true });
  const navigate = async name => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await page.getByRole('button', { name: new RegExp(`${name}$`) }).click();
  };
  const overflow = async label => {
    const result = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth }));
    assert(result.scroll <= result.width + 1, `${label}: horizontal overflow ${result.scroll}/${result.width}`);
  };
  await page.evaluate(() => ['clte-safety-progress', 'clte-guided-v1-injury', 'clte-guided-v1-haze'].forEach(key => localStorage.removeItem(key)));
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate('03 Injury');
  await button('03 Get help').click();
  assert(await button('Practise asking for help').isVisible(), 'Injury help must be accessible before other moments');
  await button('Practise asking for help').click();
  assert(await page.getByRole('status').innerText().then(text => text.includes('WSH Portal')), 'Injury reporting takeaway missing');
  assert(await page.locator('a[href^="tel:"]').count() === 0, 'Practice must not contain a real telephone link');
  await button('02 Keep clear').click();
  const marker = page.getByRole('switch', { name: 'Keep-clear marker' });
  await marker.focus();
  await page.keyboard.press('Space');
  assert(await marker.getAttribute('aria-checked') === 'true', 'Keyboard must activate keep-clear marker');
  assert(await page.locator('.keep-clear-marker').isVisible(), 'Scene should show active marker');
  await button('01 Check in').click();
  await page.getByRole('button', { name: /Tap to check in/ }).click();
  assert(await button('Continue to Haze').isVisible(), 'All three actions should enable scenario completion');
  await page.screenshot({ path: 'output/playwright/injury-desktop.png', fullPage: true, animations: 'disabled' });
  await button('Continue to Haze').click();
  assert(await page.locator('.header-tools').innerText().then(text => text.includes('1/5')), 'Injury scenario completion not saved');
  await button('Postpone it').click();
  assert(await button('Postpone it').getAttribute('aria-pressed') === 'true', 'Postpone is a valid plan');
  await button('Move it indoors').click();
  assert(await button('Move it indoors').getAttribute('aria-pressed') === 'true', 'Indoor plan is also valid');
  assert(await page.locator('.moment-count').innerText() === '1/3 moments practised', 'Changing plan should not double-count');
  await button('02 Move indoors').click();
  await button('Move together indoors').focus();
  await page.keyboard.press('Enter');
  assert(await page.locator('.shelter-interaction').evaluate(el => el.classList.contains('is-indoors')), 'Colleague should move indoors');
  await page.screenshot({ path: 'output/playwright/haze-desktop.png', fullPage: true, animations: 'disabled' });
  await button('03 Get help').click();
  await button('Practise requesting an ambulance').click();
  assert(await page.getByRole('status').innerText().then(text => text.includes('6460 6999')), 'Emergency feedback must include Guard Post');
  await button('Continue to Report').click();
  assert(await page.locator('.header-tools').innerText().then(text => text.includes('2/5')), 'Haze completion not saved');
  await page.reload();
  await navigate('04 Haze');
  assert(await page.locator('.moment-count').innerText() === '3/3 moments practised', 'Haze moments must survive reload');
  await navigate('03 Injury');
  assert(await page.locator('.moment-count').innerText() === '3/3 moments practised', 'Injury moments must survive reload');

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [scenario, labels] of [
      ['03 Injury', ['Check in — practised', 'Keep clear — practised', 'Get help — practised']],
      ['04 Haze', ['Adjust the plan — practised', 'Move indoors — practised', 'Get help — practised']],
    ]) {
      await navigate(scenario);
      for (const label of labels) {
        await button(label).click();
        await overflow(`${scenario}/${label}/${width}`);
        const font = await page.locator('.moment-cue').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
        assert(font >= 18, `${scenario}/${width}: instruction text under 18px`);
        const clipped = await page.locator('.moment-panel button').evaluateAll(elements => elements.some(el => el.scrollWidth > el.clientWidth + 2));
        assert(!clipped, `${scenario}/${label}/${width}: clipped button content`);
      }
      if (width === 390) {
        await button(labels[1]).click();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `output/playwright/${scenario.startsWith('03') ? 'injury' : 'haze'}-mobile.png`, fullPage: true, animations: 'disabled' });
      }
    }
    for (const scenario of ['01 Hazards', '02 Fire', '05 Report']) {
      await navigate(scenario);
      await overflow(`${scenario}/${width}`);
      if (scenario === '02 Fire' && width === 1440) await page.screenshot({ path: 'output/playwright/fire-desktop.png', fullPage: true, animations: 'disabled' });
      if (scenario === '02 Fire' && width === 390) await page.screenshot({ path: 'output/playwright/fire-mobile.png', fullPage: true, animations: 'disabled' });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate('02 Fire');
  await page.getByRole('button', { name: /Use the nearest safe exit/ }).click();
  await button('Next checkpoint').click();
  await page.getByRole('button', { name: /Walk steadily/ }).click();
  assert(await page.locator('.pov-feedback').innerText().then(text => text.includes('Good call')), 'Fire decision flow regressed');
  for (const label of [/Stay with the group on the walkway/, /Stay on the walkway — do not cross here/, /Walkway \+ zebra crossing/, /Zone A with the CLTE group/, /Tell the warden \+ remain here/]) {
    await button('Next checkpoint').click();
    await page.getByRole('button', { name: label }).click();
  }
  await button('Route map').click();
  assert(await page.getByRole('dialog', { name: 'Block 27 to Admin Field route map' }).isVisible(), 'Route map must remain available');
  await button('Close route map').click();
  await button('Finish Fire 02').click();
  assert(await page.locator('.header-tools').innerText().then(text => text.includes('3/5')), 'Full Fire route must still complete');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await navigate('04 Haze');
  await button('Move indoors — practised').click();
  assert(await page.locator('.colleague-token').evaluate(el => getComputedStyle(el).transitionDuration) === '0s', 'Reduced motion must disable colleague animation');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await button('Ngee Ann Polytechnic · CLTE workplace safety online activity · Home').click();
  await button('Start again').click();
  await button('Keep progress').click();
  assert(await page.locator('.header-tools').innerText().then(text => text.includes('3/5')), 'Cancel reset must retain progress');
  await button('Start again').click();
  await button('Reset activity').click();
  await navigate('03 Injury');
  assert(await page.locator('.moment-count').innerText() === '0/3 moments practised', 'Reset must clear Injury moments');
  await navigate('04 Haze');
  assert(await page.locator('.moment-count').innerText() === '0/3 moments practised', 'Reset must clear Haze moments');
  assert(errors.length === 0, `Runtime errors: ${errors.join('; ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return { failures, runtimeErrors: errors, testedWidths: [1440, 1024, 768, 390, 320], result: 'PASS' };
}
