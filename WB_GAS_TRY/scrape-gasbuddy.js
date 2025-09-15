const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  const page = await browser.newPage();

//   https://www.gasbuddy.com/gasprices/california/fremont
  try {
    await page.goto('https://www.gasbuddy.com/gasprices/california/san-jose', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for window.__APOLLO_STATE__ to contain at least one Station
    await page.waitForFunction(() => {
      if (!window.__APOLLO_STATE__ || !window.__APOLLO_STATE__.ROOT_QUERY) return false;
      return Object.keys(window.__APOLLO_STATE__).some(k => k.startsWith('Station:'));
    }, { timeout: 60000 });

    // Get the __APOLLO_STATE__ object directly from the page context
    const apolloState = await page.evaluate(() => window.__APOLLO_STATE__);

    // Get all station objects from apolloState
    const stationKeys = Object.keys(apolloState).filter(k => k.startsWith('Station:'));
    const stations = stationKeys.slice(0, 10).map(key => {
      const station = apolloState[key];
      return {
        name: station.name,
        price: (
          station['prices({"fuel":1})'] &&
          station['prices({"fuel":1})'][0] &&
          (
            station['prices({"fuel":1})'][0].cash?.formattedPrice ||
            station['prices({"fuel":1})'][0].credit?.formattedPrice ||
            'N/A'
          )
        ),
        address: [
          station.address?.line1,
          station.address?.locality
        ].filter(Boolean).join(', ')
      };
    });

    // Print only the 10 lines of station info in the requested format
    stations.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}; ${s.price}; ${s.address};`);
    });

    await new Promise(res => setTimeout(res, 20000)); // Give you time to inspect the browser
  } catch (error) {
    // Only print error if nothing is found
    console.error('Scraping failed:', error);
  } finally {
    await browser.close();
  }
})();
