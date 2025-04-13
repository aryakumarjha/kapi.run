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
    path: `${baseAssetsPath}/og.png`,
    type: "png",
  });

  // Capture Twitter Image
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 2 });
  await page.screenshot({
    path: `${baseAssetsPath}/twitter.png`,
    type: "png",
  });

  console.log("✅ Screenshot saved as og.png, twitter.png");

  await browser.close();
};

captue();
