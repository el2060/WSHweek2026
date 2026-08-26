// Run in a dedicated test browser; fixtures affect only that browser's CLTE progress.
async (page) => {
  const failures = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (value, message) => { if (!value) failures.push(message); };
  const button = name => page.getByRole('button', { name, exact: true });
  const fixture = { office: true, walkway: true, haze: true, evacuation: true, reporting: true, practice: false, guide: false, completion: false };
  const nav = async label => {
    if (await button('Toggle navigation').isVisible()) await button('Toggle navigation').click();
    await button(label).click();
  };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.reload();
    await nav('02 Fire');
    await page.getByRole('tab', { name: /Blk 56/ }).click();
    assert(await page.getByRole('heading', { name: 'Stay on this side' }).isVisible(), `${width}: Block 56 direction missing`);
    assert(await page.locator('.route-photo-cue').innerText().then(text => text.includes('Do not cross here')), `${width}: photo must warn against crossing`);
    await page.getByRole('button', { name: /Use the zebra crossing in the photo/ }).click();
    assert(await page.locator('.pov-feedback').innerText().then(text => text.includes('Stay on the walkway')), `${width}: incorrect crossing needs correction`);
    await page.getByRole('button', { name: /Stay on the walkway — do not cross here/ }).click();
    assert(await page.locator('.pov-feedback.good').innerText().then(text => text.includes('Why this helps')), `${width}: staying on walkway is correct`);
    await page.screenshot({ path: `output/playwright/erc-blk56-${width}.png`, fullPage: true, animations: 'disabled' });

    await page.evaluate(value => localStorage.setItem('clte-safety-progress', JSON.stringify(value)), fixture);
    await page.reload();
    await button('Continue: report practice').click();
    assert(await page.locator('.choice-field [aria-pressed="true"]').count() === 0, `${width}: practice Type answers should start blank`);
    assert(await page.locator('.mock-steps .done').count() === 0, `${width}: no practice steps should be pre-completed`);
    await page.screenshot({ path: `output/playwright/erc-practice-blank-${width}.png`, fullPage: true, animations: 'disabled' });
    await button('Next').click();
    assert(await page.locator('.choice-field [aria-pressed="true"]').count() === 0, `${width}: Impact answers should start blank`);
    assert(await page.getByRole('textbox', { name: 'Exact location' }).inputValue() === '', `${width}: location should start blank`);
    await button('Next').click();
    assert(await page.getByRole('textbox', { name: 'What happened?' }).inputValue() === '', `${width}: incident description should start blank`);
    assert(await page.getByRole('textbox', { name: 'What did you do?' }).inputValue() === '', `${width}: actions should start blank`);
    assert(await page.getByText('No photo attached', { exact: true }).isVisible(), `${width}: no fake attachment`);
    await button('Review my practice report').click();
    assert(await page.getByText('A few details still to add', { exact: true }).isVisible(), `${width}: blank review must identify missing details`);
    assert(await button('Continue to contacts').count() === 0, `${width}: blank report must not claim completion`);
    await button('Add missing details').click();
    await button('Incident').focus();
    await page.keyboard.press('Space');
    await button('Fall, trip and slip').click();
    await button('Next').click();
    await button('Common area').click();
    await button('Use example location').click();
    assert(await page.getByRole('textbox', { name: 'Exact location' }).inputValue() === 'Wet walkway beside Block 73', `${width}: example location should be opt-in`);
    await button('Minor injury').click();
    await button('NP Student').click();
    await button('Next').click();
    await button('Use example description').click();
    assert(await page.getByRole('textbox', { name: 'What did you do?' }).inputValue() === '', `${width}: description example must not fill actions too`);
    await button('Use example actions').click();
    await button('Review my practice report').click();
    assert(await page.getByText('Practice details entered', { exact: true }).isVisible(), `${width}: completed review missing`);
    assert(await page.locator('.mock-preview').evaluate(el => document.activeElement === el), `${width}: report preview should receive focus`);
    await button('Continue to contacts').click();
    await button('Finish activity').click();
    assert(await page.getByRole('heading', { name: 'Activity complete', exact: true }).isVisible(), `${width}: Finish activity must end on completion`);
    assert(await page.locator('.completion-actions .primary').innerText().then(text => text.includes('Back to home')), `${width}: completion must not direct back to contacts as primary`);
    assert(await page.evaluate(() => JSON.parse(localStorage.getItem('clte-safety-progress')).completion), `${width}: finished state must persist`);
    await page.screenshot({ path: `output/playwright/erc-completion-${width}.png`, fullPage: true, animations: 'disabled' });
    await button('Back to home').click();
    await button('Review activity').click();
    assert(await page.getByRole('heading', { name: 'Activity complete', exact: true }).isVisible(), `${width}: Review activity should open completion, not contacts`);
    await button('Review contacts').click();
    assert(await button('Finish activity').count() === 0, `${width}: optional contacts should not ask to finish again`);
    await button('Back to completion').click();
    assert(await page.getByRole('heading', { name: 'Activity complete', exact: true }).isVisible(), `${width}: optional contacts must return to completion`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: page overflow`);
  }
  assert(errors.length === 0, `Runtime errors: ${errors.join('; ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return { result: 'PASS', failures, runtimeErrors: errors, widths: [1440, 390] };
}
