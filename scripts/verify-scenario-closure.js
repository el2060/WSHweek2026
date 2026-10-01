// Run after scenario fixtures have been answered in the dedicated test browser.
async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => { localStorage.removeItem('clte-safety-progress'); sessionStorage.removeItem('clte-safety-progress'); });
  await page.reload();
  const scenarios = [
    ['Pantry hazards', 'office'], ['Office cubicle hazards', 'cubicles'], ['Experiment Room', 'experiment'],
    ['Fire evacuation', 'evacuation'], ['Injury response', 'walkway'], ['Haze response', 'haze'],
  ];
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height:950});
    for (const [name, key] of scenarios) {
      if (await page.getByRole('button', {name:'Toggle navigation'}).isVisible()) await page.getByRole('button', {name:'Toggle navigation'}).click();
      await page.getByRole('button', {name, exact:true}).click();
      const finish = key === 'evacuation' ? page.getByRole('button', {name:'Finish scenario', exact:true}) : page.getByRole('button', {name:'Finish', exact:true});
      await finish.click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('heading', {name:'Scenario complete.', exact:true}).waitFor();
      if (!await page.evaluate(value=>JSON.parse(localStorage.getItem('clte-safety-progress'))[value], key)) throw Error(`${name}: progress not saved at completion`);
      if (!await page.locator('.app-shell').evaluate(el=>el.inert)) throw Error(`${name}: background is interactive`);
      if (!await page.locator('#scenario-closure-title').evaluate(el=>document.activeElement===el)) throw Error(`${name}: closure title not focused`);
      if (await page.locator('.scenario-hub').count()) throw Error(`${name}: returned home too early`);
      if (await dialog.evaluate(el=>el.scrollWidth>el.clientWidth)) throw Error(`${name}: dialog overflow`);
      await page.keyboard.press('Tab');
      if (!await dialog.getByRole('button',{name:'Back to home',exact:true}).evaluate(el=>document.activeElement===el)) throw Error('First tab does not reach home action');
      await page.keyboard.press('Shift+Tab');
      if (!await dialog.getByRole('button',{name:'Review scenario',exact:true}).evaluate(el=>document.activeElement===el)) throw Error('Focus escaped the dialog');
      if (key==='office') await page.screenshot({path:`output/scenario-closure-${width}.png`, animations:'disabled'});
      await dialog.getByRole('button',{name:'Review scenario',exact:true}).click();
      if (await page.getByRole('dialog').count()) throw Error('Review did not dismiss closure');
      if (await page.locator('.app-shell').evaluate(el=>el.inert)) throw Error('Background remained inert');
      if (!await finish.evaluate(el=>document.activeElement===el)) throw Error('Review did not restore focus');
      await finish.click();
      await page.keyboard.press('Escape');
      if (await page.getByRole('dialog').count()) throw Error('Escape did not return to the scene');
      await finish.click();
      await page.getByRole('dialog').getByRole('button',{name:'Back to home',exact:true}).click();
      await page.locator('.scenario-hub').waitFor();
      if (await page.evaluate(()=>document.body.style.overflow==='hidden')) throw Error('Body scrolling stayed locked');
    }
  }
  await page.reload();
  if (!await page.evaluate(()=>JSON.parse(localStorage.getItem('clte-safety-progress')).completion)) throw Error('Completed activity did not persist');
  if (errors.length) throw Error(errors.join('\n'));
  return {passed:'All six scenarios, desktop/mobile, saved progress, focus trap, review, Escape and explicit home navigation'};
}
