from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Add a resource first
        page.goto("http://localhost:3899/")
        page.get_by_label("Display Name:").fill("Gold")
        page.get_by_role("button", name="Add Resource").click()

        page.reload()

        # Navigate to the tiers page
        page.goto("http://localhost:3899/tiers")

        # Add a new tier
        page.get_by_label("Display Name:").fill("Tier 1")
        page.get_by_role("button", name="Add Tier").click()

        # Add the resource to the tier
        page.locator('select').nth(0).select_option(label="Gold")

        # Check that the resource is listed in the tier
        tier_content = page.locator('.tier-content')
        expect(tier_content.locator('li:has-text("Gold")')).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()