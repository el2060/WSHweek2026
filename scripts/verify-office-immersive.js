// Playwright CLI, dedicated test browser. Only test-browser progress is reset.
async (page) => {
  const failures=[], measurements=[];
  const button=name=>page.getByRole('button',{name,exact:true});
  for(const [width,height,scale] of [[3778,1830,1],[1920,1000,1],[1440,900,1],[1366,768,1],[1101,800,1],[1440,900,1.25],[390,844,1],[320,740,1.25]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>localStorage.removeItem('clte-office-v3'));
    await page.reload();
    if(scale!==1)await page.addStyleTag({content:`html{font-size:${16*scale}px!important}`});
    if(await button('Toggle navigation').isVisible())await button('Toggle navigation').click();
    await button('01 Hazards').click();
    await page.locator('.scene-frame img').evaluate(img=>img.decode());
    for(let hazard=0;hazard<5;hazard++) {
      await page.locator('.hazard-picker button').nth(hazard).click();
      for(const answer of [-1,0,1]) {
        if(answer>=0)await page.locator('.hazard-choice').nth(answer).click();
        // Let ResizeObserver + responsive layout settle before measuring geometry.
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const result=await page.evaluate(()=>{
          const box=el=>el.getBoundingClientRect();
          const panel=box(document.querySelector('.hazard-panel'));
          const obstacles=[...document.querySelectorAll('.hazard-panel,.hazard-picker,.office-footnote')];
          const overlaps=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
          const covered=[...document.querySelectorAll('.hazard-marker')].flatMap(el=>{
            const r=box(el);
            return obstacles.filter(other=>overlaps(r,box(other))).map(other=>`${el.getAttribute('aria-label')} by ${other.className}`);
          });
          const markers=[...document.querySelectorAll('.hazard-marker')].map(box);
          const crowded=markers.some((a,i)=>markers.slice(i+1).some(b=>Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2)<(a.width+b.width)/2));
          const root=parseFloat(getComputedStyle(document.documentElement).fontSize);
          return {panelRem:panel.height/root,covered,crowded,overflow:document.documentElement.scrollWidth>innerWidth+1,sceneHeight:box(document.querySelector('.office-workspace')).height};
        });
        measurements.push({width,scale,hazard,answer,...result});
        if(result.covered.length||result.crowded||result.overflow)failures.push({width,scale,hazard,answer,...result});
      }
    }
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`output/playwright/office-immersive-${width}-${scale}.png`,fullPage:true,animations:'disabled'});
  }
  return {result:failures.length?'FAIL':'PASS',states:measurements.length,maxPanelRem:Math.max(...measurements.filter(x=>x.width>1100&&x.scale===1).map(x=>x.panelRem)),failures};
}
