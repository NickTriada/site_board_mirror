const puppeteer = require('puppeteer');

console.log("Starting GasBuddy scraper...");

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  console.log("Opening new page...");
  const page = await browser.newPage();

  try {
    console.log("Navigating to GasBuddy...");
    await page.goto('https://www.gasbuddy.com/gasprices/california/san-jose', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    console.log("Page loaded!");

    // Wait for window.__APOLLO_STATE__ to contain at least one Station
    await page.waitForFunction(() => {
      if (!window.__APOLLO_STATE__ || !window.__APOLLO_STATE__.ROOT_QUERY) return false;
      return Object.keys(window.__APOLLO_STATE__).some(k => k.startsWith('Station:'));
    }, { timeout: 60000 });

    // Get the __APOLLO_STATE__ object directly from the page context
    const apolloState = await page.evaluate(() => window.__APOLLO_STATE__);

    // Defensive: check if it's present
    if (!apolloState) {
      throw new Error('Could not find __APOLLO_STATE__ in page');
    }

    console.log('apolloState keys:', Object.keys(apolloState));

    // Get all station objects from apolloState
    const stationKeys = Object.keys(apolloState).filter(k => k.startsWith('Station:'));
    if (!stationKeys.length) throw new Error('No Station objects found in apolloState');
    console.log('Found station keys:', stationKeys.slice(0, 10));

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
          station.address?.locality,
          station.address?.region,
          station.address?.postalCode
        ].filter(Boolean).join(', ')
      };
    });

    // Print the stations
    stations.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} - ${s.price} - ${s.address}`);
    });

    // Save a debug snapshot of the main content for inspection
    const mainHtml = await page.evaluate(() => document.querySelector('main')?.innerHTML || '');
    require('fs').writeFileSync('debug-main.html', mainHtml, 'utf-8');

    // Use setTimeout instead of page.waitForTimeout for compatibility
    await new Promise(res => setTimeout(res, 20000)); // Give you time to inspect the browser
  } catch (error) {
    console.error('Scraping failed:', error);
  } finally {
    await browser.close();
  }
})();
