import puppeteer, { type Page } from "puppeteer";

const USER_COOKIE_NAME = "kapi_user";

const screenShotsPath = process.cwd() + "/assets/screenshots";

const sessionId = "cm9fo079g0000mz2gkl3qhpfk";

const assets = [
  {
    url: "https://kapi.run",
    path: `${screenShotsPath}/homepage.webp`,
  },
  {
    url: "https://kapi.run",
    path: `${screenShotsPath}/github.png`,
    format: "png",
    dimensions: {
      width: 1280,
      height: 640,
    },
  },
  {
    url: `https://kapi.run/sessions/${sessionId}`,
    path: `${screenShotsPath}/session.webp`,
  },
  {
    url: `https://kapi.run/orders/${sessionId}`,
    path: `${screenShotsPath}/orders.webp`,
  },
];

const setLocalStorage = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "cart-storage",
      JSON.stringify({
        state: {
          items: [
            {
              menuItem: {
                id: "152678321",
                name: "Iced Latte",
                description:
                  "315 ml | Espresso poured over cold milk and ice. (brewed using our finest house blend - silver oak cafe blend - made with some of india's highest scoring coffee beans. ) [Energy: 136 kcal, Protein: 6.48g, Carbohydrates: 10.13g, Fiber: 0g, Fat: 7.88g]",
                isVeg: true,
                imageUrl:
                  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/6/4/68c29dea-baba-4e3d-89b1-982de326e30f_dac3051b-249b-4b77-9636-19b7928e9225.jpg",
                basePrice: 26000,
                addons: [
                  {
                    groupId: "179433705",
                    groupName: "",
                    choices: [
                      {
                        id: "127293887",
                        name: "Better Bet - Plant-based Milk ( Vegan)",
                        price: 1905,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                      {
                        id: "127293739",
                        name: "Lactose-free Milk (Amul)",
                        price: 1905,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                      {
                        id: "127293746",
                        name: "Regular Milk",
                        price: 0,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                    ],
                    maxAddons: 1,
                    minAddons: 1,
                  },
                ],
              },
              quantity: 1,
              selectedVariants: [],
              selectedAddons: [
                {
                  groupId: "179433705",
                  groupName: "",
                  addons: [
                    {
                      id: "127293746",
                      name: "Regular Milk",
                      price: 0,
                      inStock: true,
                      isVeg: true,
                      isEnabled: true,
                    },
                  ],
                },
              ],
              id: "gCTZp48DPK-2HzGa63ufl",
              total: 26000,
            },
            {
              menuItem: {
                id: "152678311",
                name: "Latte",
                description:
                  "230 ml | Espresso with extra milk and steamed microfoam. (brewed using our finest house blend - silver oak cafe blend - made with some of india's highest scoring coffee beans. ) [Energy: 159 kcal, Protein: 7.32g, Carbohydrates: 13.03g, Fiber: 0g, Fat: 8.77g]",
                isVeg: true,
                imageUrl:
                  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/6/4/604a68ed-2efa-471b-ba3c-f104455a5620_be2d0783-5321-4bbf-b9aa-680e0dbb7ccb.jpg",
                basePrice: 25000,
                addons: [
                  {
                    groupId: "179433704",
                    groupName: "",
                    choices: [
                      {
                        id: "127293860",
                        name: "Altco (Cashew & Oat Milk)",
                        price: 1905,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                      {
                        id: "127293760",
                        name: "Lactose-free Milk (Amul)",
                        price: 1905,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                      {
                        id: "127293805",
                        name: "Regular Milk",
                        price: 0,
                        inStock: true,
                        isVeg: true,
                        isEnabled: true,
                      },
                    ],
                    maxAddons: 1,
                    minAddons: 1,
                  },
                ],
              },
              quantity: 1,
              selectedVariants: [],
              selectedAddons: [
                {
                  groupId: "179433704",
                  groupName: "",
                  addons: [
                    {
                      id: "127293760",
                      name: "Lactose-free Milk (Amul)",
                      price: 1905,
                      inStock: true,
                      isVeg: true,
                      isEnabled: true,
                    },
                  ],
                },
              ],
              id: "v0oCf4CO9JubOlsFH8026",
              total: 26905,
            },
          ],
          totalAmount: 52905,
        },
        version: 0,
      })
    );
  });
};

const captue = async () => {
  const browser = await puppeteer.launch();

  await browser.setCookie({
    name: USER_COOKIE_NAME,
    value: JSON.stringify({ id: "P0urf_TuDKGd3KkHpYSiA", name: "Aryakumar" }),
    domain: "kapi.run",
    secure: true,
    path: "/",
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2560, height: 1440 });

  // const baseAssetsPath = process.cwd() + "/public";

  // // Capture OG Image
  // await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  // await page.screenshot({
  //   path: `${baseAssetsPath}/og.png`,
  //   type: "png",
  // });

  // // Capture Twitter Image
  // await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 2 });
  // await page.screenshot({
  //   path: `${baseAssetsPath}/twitter.png`,
  //   type: "png",
  // });

  await assets.reduce(async (prevPromise, asset) => {
    await prevPromise;
    if (asset.dimensions) {
      await page.setViewport(asset.dimensions);
    }
    await page.goto(asset.url, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: asset.path,
      type: (asset.format || "webp") as "png" | "jpeg" | "webp",
    });
    if (asset.url === "https://kapi.run") {
      await setLocalStorage(page);
    }
  }, Promise.resolve());

  console.log("✅ Screenshots captured!");

  await browser.close();
};

captue();
