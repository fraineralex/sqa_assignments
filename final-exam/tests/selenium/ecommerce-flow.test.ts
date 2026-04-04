import { existsSync } from "node:fs";
import { join } from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import edge from "selenium-webdriver/edge.js";

const demoUrl = "https://www.saucedemo.com/";

function targetBrowser(): "edge" | "chrome" {
  const raw = process.env.SELENIUM_BROWSER?.trim().toLowerCase();
  if (raw === "chrome" || raw === "edge") {
    return raw;
  }
  return process.platform === "win32" ? "edge" : "chrome";
}

function chromiumAutomationArgs(): string[] {
  return [
    "--window-size=1280,900",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-features=RendererCodeIntegrity",
  ];
}

function chromeGpuWorkaroundArgs(): string[] {
  return [
    "--enable-unsafe-swiftshader",
    "--disable-3d-apis",
    "--disable-accelerated-2d-canvas",
    "--disable-accelerated-video-decode",
  ];
}

function resolveChromeBinary(): string | undefined {
  const fromEnv =
    process.env.CHROME_BINARY?.trim() ||
    process.env.GOOGLE_CHROME_BIN?.trim() ||
    process.env.SELENIUM_CHROME_BINARY?.trim();
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }
  const candidates: string[] = [
    join("C:", "Program Files", "Google", "Chrome", "Application", "chrome.exe"),
    join("C:", "Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
  ];
  const local = process.env.LOCALAPPDATA;
  if (local) {
    candidates.push(join(local, "Google", "Chrome", "Application", "chrome.exe"));
  }
  for (const p of candidates) {
    if (existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

function resolveEdgeBinary(): string | undefined {
  const fromEnv = process.env.EDGE_BINARY?.trim() || process.env.MSEDGE_BINARY?.trim();
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }
  const candidates: string[] = [
    join("C:", "Program Files", "Microsoft", "Edge", "Application", "msedge.exe"),
    join("C:", "Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe"),
  ];
  const local = process.env.LOCALAPPDATA;
  if (local) {
    candidates.push(join(local, "Microsoft", "Edge", "Application", "msedge.exe"));
  }
  for (const p of candidates) {
    if (existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

async function buildDriver() {
  const headless = process.env.SELENIUM_HEADLESS === "1";
  const browser = targetBrowser();

  if (browser === "edge") {
    const options = new edge.Options();
    for (const arg of chromiumAutomationArgs()) {
      options.addArguments(arg);
    }
    if (headless) {
      options.addArguments("--headless=new");
    }
    const edgePath = resolveEdgeBinary();
    if (edgePath) {
      options.setEdgeChromiumBinaryPath(edgePath);
    }
    const driver = await new Builder()
      .forBrowser("MicrosoftEdge")
      .setEdgeOptions(options)
      .build();
    await driver.manage().setTimeouts({ pageLoad: 45_000, implicit: 5_000, script: 30_000 });
    return driver;
  }

  const options = new chrome.Options();
  for (const arg of chromiumAutomationArgs()) {
    options.addArguments(arg);
  }
  for (const arg of chromeGpuWorkaroundArgs()) {
    options.addArguments(arg);
  }
  if (headless) {
    options.addArguments("--headless=new");
  }
  const systemChrome = resolveChromeBinary();
  if (systemChrome) {
    options.setChromeBinaryPath(systemChrome);
  }
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  await driver.manage().setTimeouts({ pageLoad: 45_000, implicit: 5_000, script: 30_000 });
  return driver;
}

async function main() {
  const driver = await buildDriver();
  try {
    await driver.get(demoUrl);
    await driver.wait(until.titleContains("Swag"), 10_000);

    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();

    await driver.wait(until.elementLocated(By.className("inventory_list")), 10_000);

    const productTitles = await driver.findElements(By.className("inventory_item_name"));
    if (productTitles.length === 0) {
      throw new Error("No product links found on inventory page");
    }
    await productTitles[0].click();

    await driver.wait(until.elementLocated(By.id("add-to-cart")), 10_000);
    await driver.findElement(By.id("add-to-cart")).click();

    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
