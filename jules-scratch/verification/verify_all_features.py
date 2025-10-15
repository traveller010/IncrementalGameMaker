from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Version and Home Page
        page.goto("http://localhost:3899/")
        expect(page.locator('.version-display')).to_have_text('v0.1.0')
        page.screenshot(path="jules-scratch/verification/01_home_page.png")

        # 2. Verify Upgrades Page
        page.get_by_role("link", name="Upgrades").click()
        expect(page.locator('h2:has-text("Game Upgrades")')).to_be_visible()
        page.screenshot(path="jules-scratch/verification/02_upgrades_page.png")

        # 3. Verify Formula Editor Validation
        page.get_by_role("link", name="Generators").click()
        page.locator('.value-input').first.fill("invalid")
        page.wait_for_selector('.error-message:has-text("Invalid number")')
        page.screenshot(path="jules-scratch/verification/03_formula_validation.png")
        page.locator('.value-input').first.fill("1") # Correct the value

        # 4. Verify Tiers Page Functionality
        # Add a resource to be used in the tier
        page.get_by_role("link", name="Resources").click()
        page.get_by_label("Display Name:").fill("Gold")
        page.get_by_role("button", name="Add Resource").click()

        # Navigate to tiers and add a new one
        page.get_by_role("link", name="Tiers").click()
        page.get_by_label("Display Name:", exact=True).fill("Forest Zone")
        page.get_by_role("button", name="Add Tier").click()

        # Add the resource to the tier
        page.get_by_label("Select Resource:").select_option(label="Gold")

        # Check that the resource is now in the tier list
        tier_content = page.locator('.tier-content .item-lists')
        expect(tier_content.locator('li:has-text("Gold")')).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_tiers_page.png")

        browser.close()

if __name__ == "__main__":
    run_verification()