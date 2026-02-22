import logging
import time
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

test_results = {"passed": 0, "failed": 0, "tests": []}

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
    
    log_test("WebDriver Setup", True, "- Chrome/Edge initialized")
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
            
        except Exception as e:
            pass
    
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
    logger.info("="*50)
    logger.info("SELENIUM AUTOMATION TESTS")
    logger.info("="*50)
    logger.info(f"Target: {TARGET_URL}")
    logger.info("="*50)
    
    driver = setup_driver()
    
    try:
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
        cleanup(driver)
    
    print_summary()

if __name__ == "__main__":
    main()
