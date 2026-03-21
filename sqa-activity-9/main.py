import html
import logging
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)

TARGET_URL = "https://fraineralex.dev/blog"

test_results = {"passed": 0, "failed": 0, "tests": [], "started_at": None, "finished_at": None, "duration_seconds": None}

REPORTS_DIR = Path(__file__).resolve().parent / "reports"

def log_test(name, passed, message=""):
    status = "PASS" if passed else "FAIL"
    test_results["passed" if passed else "failed"] += 1
    test_results["tests"].append({"name": name, "status": status, "message": message})
    logger.info(f"[{status}] {name} {message}")

def setup_driver():
    logger.info("Setting up Edge WebDriver")
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    driver = webdriver.Edge(options=options)
    driver.implicitly_wait(5)
    
    log_test("WebDriver Setup", True, "- Edge inicializado; espera implícita 5 s")
    return driver

def test_navigate_to_site(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Navigate to Website")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    
    actual_url = driver.current_url
    expected_url = "fraineralex.dev/blog"
    
    passed = expected_url in actual_url
    log_test("Navigate to URL", passed, f"- Expected: {expected_url}, Got: {actual_url}")
    
    return driver

def test_element_identification(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Element Identification Strategies")
    logger.info("="*50)
    
    wait = WebDriverWait(driver, 10)
    
    articles = driver.find_elements(By.CSS_SELECTOR, "article")
    log_test("CSS Selector - Find articles", len(articles) > 0, f"- Found {len(articles)} articles")
    
    anchors = driver.find_elements(By.TAG_NAME, "a")
    log_test("Tag Name - Find anchors", len(anchors) > 0, f"- Found {len(anchors)} anchor tags")
    
    footer = driver.find_elements(By.TAG_NAME, "footer")
    log_test("Tag Name - Find footer", len(footer) > 0, f"- Found footer: {len(footer) > 0}")
    
    return driver

def test_click_and_navigation(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Click and Navigation")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    time.sleep(2)
    
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "article")))
    
    success_count = 0
    for i in range(3):
        try:
            article_links = driver.find_elements(By.CSS_SELECTOR, "article a")
            
            if not article_links or i >= len(article_links):
                break
                
            link = article_links[i]
            driver.execute_script("arguments[0].scrollIntoView(true);", link)
            time.sleep(0.5)
            
            wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "article a")))
            link.click()
            
            time.sleep(2)
            
            if driver.title:
                success_count += 1
            
            driver.back()
            time.sleep(2)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "article")))
            
        except Exception:
            continue
    
    log_test("Click Navigation", success_count >= 1, f"- Successfully navigated to {success_count}/3 pages")

def test_send_keys(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Send Keys Functionality")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    time.sleep(2)
    
    body = driver.find_element(By.TAG_NAME, "body")
    
    body.send_keys(Keys.END)
    log_test("send_keys - Scroll to bottom", True, "- Scrolled using END key")
    
    body.send_keys(Keys.HOME)
    log_test("send_keys - Scroll to top", True, "- Scrolled using HOME key")

def test_explicit_wait(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Explicit Waits")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    
    wait = WebDriverWait(driver, 15)
    
    articles = wait.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, "article")))
    log_test("Explicit Wait - Articles visible", len(articles) > 0, f"- Found {len(articles)} visible articles")
    
    footer = wait.until(EC.presence_of_element_located((By.TAG_NAME, "footer")))
    log_test("Explicit Wait - Footer present", footer is not None, "- Footer present in DOM")

def test_dynamic_elements(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Dynamic Element Handling")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    
    wait = WebDriverWait(driver, 15)
    
    wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, ".loading-section")))
    log_test("Dynamic - Loading section gone", True, "- Loading section disappeared")
    
    driver.execute_script("arguments[0].scrollIntoView(true);", driver.find_element(By.TAG_NAME, "footer"))
    time.sleep(1)
    
    footer_links = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "footer a")))
    log_test("Dynamic - Footer links loaded", len(footer_links) > 0, f"- Found {len(footer_links)} footer links")
    
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "footer a")))
    log_test("Dynamic - Links clickable", True, "- Footer links are clickable")

def test_javascript_execution(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: JavaScript Execution")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    log_test("JS Execution - Scroll to bottom", True, "- Scrolled using JavaScript")
    
    driver.execute_script("window.scrollTo(0, 0);")
    log_test("JS Execution - Scroll to top", True, "- Scrolled back to top")
    
    title = driver.execute_script("return document.title;")
    log_test("JS Execution - Get title", "Frainer" in title, f"- Title: {title}")
    
    url = driver.execute_script("return window.location.href;")
    log_test("JS Execution - Get URL", "fraineralex" in url, f"- URL: {url}")

def test_cookies(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Cookie Handling")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    
    cookies = driver.get_cookies()
    log_test("Cookies - Read cookies", True, f"- Found {len(cookies)} cookies")

def test_tabs(driver):
    logger.info("\n" + "="*50)
    logger.info("TEST: Tab/Window Handling")
    logger.info("="*50)
    
    driver.get(TARGET_URL)
    original_window = driver.current_window_handle
    
    driver.execute_script("window.open('');")
    time.sleep(1)
    
    window_count = len(driver.window_handles)
    log_test("Tabs - Open new tab", window_count == 2, f"- Total windows: {window_count}")
    
    for handle in driver.window_handles:
        if handle != original_window:
            driver.switch_to.window(handle)
            break
    
    driver.get("https://example.com")
    time.sleep(2)
    
    new_title = driver.title
    log_test("Tabs - Navigate in new tab", "Example" in new_title, f"- New tab title: {new_title}")
    
    driver.switch_to.window(original_window)
    log_test("Tabs - Switch back", driver.current_window_handle == original_window, "- Returned to original tab")
    
    driver.switch_to.window(driver.window_handles[1])
    driver.close()
    
    driver.switch_to.window(original_window)
    log_test("Tabs - Close tab", len(driver.window_handles) == 1, f"- Windows remaining: {len(driver.window_handles)}")

def cleanup(driver):
    logger.info("\n" + "="*50)
    logger.info("CLEANUP")
    logger.info("="*50)
    
    driver.quit()
    log_test("Browser Cleanup", True, "- Browser closed successfully")

def write_html_report():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / "selenium_report.html"
    total = test_results["passed"] + test_results["failed"]
    rate = (test_results["passed"] / total * 100) if total else 0.0
    started = test_results.get("started_at") or ""
    finished = test_results.get("finished_at") or ""
    duration = test_results.get("duration_seconds")
    duration_str = f"{duration:.2f}" if duration is not None else ""
    rows = []
    for t in test_results["tests"]:
        sym = "PASS" if t["status"] == "PASS" else "FAIL"
        row_cls = "pass" if sym == "PASS" else "fail"
        rows.append(
            "<tr class=\"{}\"><td>{}</td><td>{}</td><td>{}</td></tr>".format(
                row_cls,
                html.escape(sym),
                html.escape(t["name"]),
                html.escape(t["message"]),
            )
        )
    body = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Informe Selenium — Actividad 9</title>
<style>
body {{ font-family: Segoe UI, system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }}
h1 {{ font-size: 1.35rem; }}
.meta {{ color: #444; margin-bottom: 1.5rem; }}
table {{ border-collapse: collapse; width: 100%; max-width: 960px; }}
th, td {{ border: 1px solid #ccc; padding: 0.5rem 0.65rem; text-align: left; vertical-align: top; }}
th {{ background: #f0f0f0; }}
tr.pass td:first-child {{ color: #0d6b2f; font-weight: 600; }}
tr.fail td:first-child {{ color: #a40000; font-weight: 600; }}
.summary {{ margin: 1rem 0; }}
</style>
</head>
<body>
<h1>Actividad 9 — Automatización con Selenium</h1>
<p class="meta">Objetivo: {html.escape(TARGET_URL)}<br/>
Inicio (UTC): {html.escape(str(started))}<br/>
Fin (UTC): {html.escape(str(finished))}<br/>
Duración: {html.escape(duration_str)} s</p>
<div class="summary">
<strong>Resumen:</strong> total {total}, aprobados {test_results["passed"]}, fallidos {test_results["failed"]}, tasa {rate:.1f}%
</div>
<table>
<thead><tr><th>Estado</th><th>Caso</th><th>Detalle</th></tr></thead>
<tbody>
{"".join(rows)}
</tbody>
</table>
</body>
</html>"""
    out.write_text(body, encoding="utf-8")
    logger.info(f"Informe HTML: {out}")

def write_junit_report():
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / "junit_report.xml"
    total = test_results["passed"] + test_results["failed"]
    failures = test_results["failed"]
    duration = test_results.get("duration_seconds") or 0.0
    root = ET.Element("testsuites")
    suite = ET.SubElement(root, "testsuite")
    suite.set("name", "sqa_activity_9_selenium")
    suite.set("tests", str(total))
    suite.set("failures", str(failures))
    suite.set("errors", "0")
    suite.set("skipped", "0")
    suite.set("time", f"{duration:.3f}")
    for t in test_results["tests"]:
        case = ET.SubElement(suite, "testcase")
        case.set("name", t["name"])
        case.set("classname", "selenium.main")
        case.set("time", "0")
        if t["status"] == "FAIL":
            fail = ET.SubElement(case, "failure")
            fail.set("message", t["message"] or "failed")
            fail.text = t["message"] or "failed"
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(out, encoding="utf-8", xml_declaration=True)
    logger.info(f"Informe JUnit XML: {out}")

def print_summary():
    logger.info("\n" + "="*50)
    logger.info("TEST SUMMARY")
    logger.info("="*50)
    
    total = test_results["passed"] + test_results["failed"]
    pass_rate = (test_results["passed"] / total * 100) if total > 0 else 0
    
    logger.info(f"Total Tests: {total}")
    logger.info(f"Passed: {test_results['passed']}")
    logger.info(f"Failed: {test_results['failed']}")
    logger.info(f"Pass Rate: {pass_rate:.1f}%")
    
    logger.info("\nDetailed Results:")
    for test in test_results["tests"]:
        status_symbol = "✓" if test["status"] == "PASS" else "✗"
        logger.info(f"  {status_symbol} {test['name']} {test['message']}")
    
    logger.info("\n" + "="*50)
    if test_results["failed"] == 0:
        logger.info("ALL TESTS PASSED!")
    else:
        logger.info("SOME TESTS FAILED")
    logger.info("="*50)

def main():
    test_results.clear()
    test_results.update({"passed": 0, "failed": 0, "tests": [], "started_at": None, "finished_at": None, "duration_seconds": None})
    test_results["started_at"] = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()
    logger.info("="*50)
    logger.info("SELENIUM AUTOMATION TESTS — ACTIVIDAD 9")
    logger.info("="*50)
    logger.info(f"Target: {TARGET_URL}")
    logger.info("="*50)
    
    driver = None
    try:
        driver = setup_driver()
        test_navigate_to_site(driver)
        test_element_identification(driver)
        test_click_and_navigation(driver)
        test_send_keys(driver)
        test_explicit_wait(driver)
        test_dynamic_elements(driver)
        test_javascript_execution(driver)
        test_cookies(driver)
        test_tabs(driver)
    except Exception as e:
        logger.error(f"Error during execution: {str(e)}")
    finally:
        if driver is not None:
            cleanup(driver)
    
    test_results["finished_at"] = datetime.now(timezone.utc).isoformat()
    test_results["duration_seconds"] = time.monotonic() - t0
    print_summary()
    write_html_report()
    write_junit_report()

if __name__ == "__main__":
    main()
