import puppeteer from "puppeteer";

const baseAssetsPath = process.cwd() + "/public";

const captue = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // This assumes your local dev server is running
  await page.goto("https://kapi.run", { waitUntil: "networkidle0" });

  // Capture OG Image
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.screenshot({
    path: `${baseAssetsPath}/og.webp`,
    type: "webp",
  });

  // Capture Twitter Image
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 2 });
  await page.screenshot({
    path: `${baseAssetsPath}/twitter.webp`,
    type: "webp",
  });

  console.log("✅ Screenshot saved as og.webp, twitter.webp");

  await browser.close();
};

captue();
