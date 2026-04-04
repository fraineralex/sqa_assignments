import { existsSync } from "node:fs";
import { Builder, By, until } from "selenium-webdriver";

const appiumUrl = process.env.APPIUM_SERVER_URL ?? "http://127.0.0.1:4723";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `Missing environment variable ${name}. See README section for Appium (Android Studio + emulator + Appium 2).`,
    );
  }
  return v;
}

function buildCapabilities(): Record<string, unknown> {
  const appPath = requireEnv("APPIUM_APP_PATH");
  if (!existsSync(appPath)) {
    throw new Error(`APPIUM_APP_PATH does not exist on disk: ${appPath}`);
  }

  const appPackage = requireEnv("APPIUM_APP_PACKAGE");
  const appActivity = requireEnv("APPIUM_APP_ACTIVITY");

  const caps: Record<string, unknown> = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": process.env.APPIUM_DEVICE_NAME ?? "Android Emulator",
    "appium:app": appPath,
    "appium:appPackage": appPackage,
    "appium:appActivity": appActivity,
    "appium:noReset": true,
    "appium:newCommandTimeout": 180,
    "appium:autoGrantPermissions": true,
  };

  const platformVersion = process.env.APPIUM_PLATFORM_VERSION?.trim();
  if (platformVersion) {
    caps["appium:platformVersion"] = platformVersion;
  }

  const udid = process.env.APPIUM_UDID?.trim();
  if (udid) {
    caps["appium:udid"] = udid;
  }

  return caps;
}

async function assertAppiumReachable(): Promise<void> {
  const origin = new URL(appiumUrl).origin;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${origin}/status`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Appium /status returned ${res.status}`);
    }
  } catch (err) {
    throw new Error(
      `Appium is not reachable at ${origin}. Start Appium 2, boot an Android emulator from Android Studio (or connect a device), then retry. Cause: ${String(err)}`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  await assertAppiumReachable();

  const resProductList = process.env.APPIUM_RES_PRODUCT_LIST ?? "product_list";
  const resFirstProduct = process.env.APPIUM_RES_FIRST_PRODUCT ?? "product_item_0";
  const resAddCart = process.env.APPIUM_RES_ADD_CART ?? "add_to_cart_button";

  const capabilities = buildCapabilities();

  const driver = await new Builder()
    .disableEnvironmentOverrides()
    .usingServer(appiumUrl)
    .withCapabilities(capabilities)
    .forBrowser("android")
    .build();

  await driver.manage().setTimeouts({ implicit: 15_000, script: 60_000, pageLoad: 120_000 });

  try {
    await driver.wait(until.elementLocated(By.id(resProductList)), 90_000);

    const firstProduct = await driver.findElement(By.id(resFirstProduct));
    await firstProduct.click();

    await driver.wait(until.elementLocated(By.id(resAddCart)), 60_000);
    await driver.findElement(By.id(resAddCart)).click();

    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
