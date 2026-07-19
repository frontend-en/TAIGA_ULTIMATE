from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/ru', wait_until='networkidle')

    # Check card styles
    card = page.locator('#services .grid > div').first
    if card.count():
        styles = card.evaluate('''el => {
            const style = getComputedStyle(el);
            return {
                background: style.backgroundColor,
                borderColor: style.borderColor,
                color: style.color
            }
        }''')
        print(f"Card: {styles}")

    page.screenshot(path='G:/ActiveMoney/TAIGA_ULTIMATE/screenshot2.png', full_page=True)
    print("Screenshot saved")
    browser.close()
