// Playwright CLI run-code; use a dedicated browser because fixtures reset its progress.
async (page) => {
  const failures = [], errors = [], widows = [];
  let screens = 0;
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const button = name => page.getByRole('button', { name, exact: true });
  const assert = (value, label) => { if (!value) failures.push(label); };
  const nav = async name => {
    const menu = button('Toggle navigation');
    if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
    await button(name).click();
  };
  const fixture = { office: true, walkway: true, haze: true, evacuation: true, reporting: true, practice: false, guide: false, completion: false };
  const seed = async data => {
    await page.evaluate(value => {
      localStorage.setItem('clte-safety-progress', JSON.stringify(value));
      localStorage.removeItem('clte-decisions-v1-reporting');
      localStorage.removeItem('clte-office-v3');
      ['injury', 'haze'].forEach(kind => localStorage.removeItem(`clte-decisions-v1-${kind}`));
    }, data);
    await page.reload();
  };
  for (const [width, scale] of [[1440, 1], [1024, 1], [768, 1], [390, 1], [320, 1], [640, 1.25], [390, 1.25]]) {
    await page.setViewportSize({ width, height: 900 });
    await seed({});
    const enlarge = async () => { if (scale !== 1) await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` }); };
    await enlarge();
    await page.evaluate(() => document.fonts.ready);
    const audit = async (label, capture = false) => {
      screens++;
      const result = await page.evaluate(() => {
        const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
        const controls = [...document.querySelectorAll('main button, main a')].filter(visible);
        const clipped = controls.filter(el => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2).map(el => el.textContent.trim());
        const selectors = '.tagline,.scene-heading>p:last-child,.guided-heading>p:last-child,.moment-cue,.moment-takeaway p,.help-practice blockquote,.hazard-story,.hazard-prompt,.hazard-choice,.hazard-result p,.practice-choice-cue,.pov-location>p:not(.eyebrow),.pov-choices button>strong,.pov-feedback p,.report-story,.report-cue strong,.report-ticket p,.report-takeaway p,.choice-field button,.mock-input input,.mock-input textarea,.mock-preview dd,.guide-focus li,.practice-case>p,.completion>p:not(.eyebrow),.completion-review p';
        const small = [...document.querySelectorAll(selectors+',.journey-story,.journey-choices button,.journey-feedback p,.journey-reference li')].filter(visible).filter(el => parseFloat(getComputedStyle(el).fontSize) < 18).map(el => el.textContent);
        // Diagnostic: flag long prose with a single-word final line for manual review.
        const orphans = [...document.querySelectorAll('main p,main h1,main h2,main h3')].filter(visible).flatMap(el => {
          if (el.textContent.trim().split(/\s+/).length < 7) return [];
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), lines = [];
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (const word of node.textContent.matchAll(/\S+/g)) {
              const range = document.createRange(); range.setStart(node, word.index); range.setEnd(node, word.index + word[0].length);
              const rect = range.getBoundingClientRect();
              let line = lines.find(line => Math.abs(line.top - rect.top) < 2);
              if (!line) lines.push(line = { top: rect.top, words: [] });
              line.words.push(word[0]);
            }
          }
          return lines.length > 1 && lines.at(-1).words.length === 1 ? [el.textContent] : [];
        });
        return { overflow: document.documentElement.scrollWidth > innerWidth + 1, clipped, small, orphans };
      });
      const key = `${width}/${scale}/${label}`;
      assert(!result.overflow, `${key}: horizontal overflow`);
      assert(!result.clipped.length, `${key}: clipped controls ${result.clipped.join(' | ')}`);
      assert(!result.small.length, `${key}: body text below 18px: ${result.small.join(' | ')}`);
      widows.push(...result.orphans.map(text => `${key}: ${text}`));
      if (capture && scale === 1 && [1440, 390].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `output/playwright/report-refine-layout-${label}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
    };
    await audit('home', true);
    assert(await page.locator('.reading-phrase').evaluateAll(elements => elements.every(el => {
      const range = document.createRange(); range.selectNodeContents(el);
      return new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size === 1;
    })), `${width}/${scale}: home phrases must stay together`);
    await nav('01 Hazards'); await audit('hazards', true);
    const hotspots = await page.getByRole('button', { name: /^Inspect:/ }).all();
    for (let index = 0; index < hotspots.length; index++) {
      await hotspots[index].click(); await audit(`hazard-${index}`);
      for (let option=0; option<2; option++) { await page.locator('.hazard-choice').nth(option).click(); await audit(`hazard-${index}-choice-${option}`, index === 0); }
    }
    await nav('02 Fire');
    for (let index = 0; index < 7; index++) {
      await page.getByRole('tab').nth(index).click(); await audit(`fire-${index}`);
      await page.locator('.pov-choices button').first().click(); await audit(`fire-${index}-feedback`, [0, 3].includes(index));
    }
    await button('Route map').click(); await audit('route-map'); await button('Close route map').click();
    for (const [chapter, prefix, correct] of [['03 Injury', 'injury', [1,0,1]], ['04 Haze', 'haze', [0,1,0]]]) {
      await nav(chapter);
      for (let index = 0; index < 3; index++) {
        await page.locator('.journey-nav button').nth(index).click(); await audit(`${prefix}-${index}`, index === 0);
        await page.locator('.journey-choices button').nth(1-correct[index]).click(); await audit(`${prefix}-${index}-incorrect`);
        await page.locator('.journey-choices button').nth(correct[index]).click(); await audit(`${prefix}-${index}-feedback`, index === 2);
      }
      await page.locator('.journey-reference summary').click(); await audit(`${prefix}-reference`);
      await page.locator('.journey-reference summary').click();
    }
    await nav('05 Report');
    for (let index = 0; index < 4; index++) {
      await page.locator('.journey-nav button').nth(index).click();
      await audit(`report-${index}`);
      const correct = [0,1,0,1][index];
      await page.locator('.journey-choices button').nth(1-correct).click(); await audit(`report-${index}-incorrect`);
      await page.locator('.journey-choices button').nth(correct).click(); await audit(`report-${index}-feedback`, index === 0);
    }
    await button('Continue to report practice').click(); await audit('practice-type', true);
    await button('Incident').click(); await button('Fall, trip and slip').click(); await audit('practice-type-selected');
    await button('Next').click(); await audit('practice-impact', true);
    await button('Common area').click(); await button('Minor injury').click(); await button('NP Student').click();
    await button('Use example location').click(); await audit('practice-impact-selected');
    await button('Next').click(); await audit('practice-details', true);
    await button('Review my practice report').click(); await audit('practice-missing');
    await button('Add missing details').click();
    await button('Use example description').click(); await button('Use example actions').click();
    await button('Review my practice report').click(); await audit('practice-review', true);
    await button('Continue to contacts').click();
    for (const name of ['Emergency', 'Incident / near miss', 'Hazard / defect']) {
      await page.getByRole('tab', { name, exact: true }).click(); await audit(`contacts-${name.split(' ')[0].toLowerCase()}`, true);
      assert(await page.locator('.reading-number').evaluateAll(elements => elements.every(el => el.getClientRects().length === 1)), `${width}: contact number split`);
    }
    await button('Finish activity').click(); await audit('completion', true);
    await button('Start again').click(); await audit('reset'); await button('Keep progress').click();
    await button('Back to home').click(); await audit('home-complete');
    await seed(fixture); await enlarge(); await button('Continue: report practice').click(); await audit('practice-blank');
  }
  assert(errors.length === 0, `Runtime errors: ${errors.join('; ')}`);
  if (failures.length) throw new Error(failures.join('\n'));
  return { result: 'PASS', screens, failures, runtimeErrors: errors, widowReview: widows };
}
