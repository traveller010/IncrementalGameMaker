from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3890")
        page.screenshot(path="jules-scratch/verification/01_initial_page.png")

        # Navigate to Tier Editor
        page.get_by_role("link", name="Tiers").click()
        page.screenshot(path="jules-scratch/verification/02_tier_editor.png")

        # Add a new tier
        page.get_by_label("Display Name:").fill("Test Tier")
        page.get_by_role("button", name="Add Tier").click()
        page.screenshot(path="jules-scratch/verification/03_tier_added.png")

        # Add a resource
        page.get_by_role("link", name="Resources").click()
        page.get_by_label("Display Name:").fill("Test Resource")
        page.get_by_role("button", name="Add Resource").click()

        # Add a generator
        page.get_by_role("link", name="Generators").click()
        page.get_by_label("Display Name:").fill("Test Generator")
        page.get_by_label("Resource Produced:").select_option(label="Test Resource (test_resource)")
        page.get_by_role("button", name="Add Cost").click()
        page.locator("#costResource-0").select_option(label="Test Resource (test_resource)")
        page.locator("#costAmount-0").fill("10")
        page.wait_for_timeout(1000)
        page.get_by_role("button", name="Add Generator").click()

        # Add an upgrade
        page.get_by_role("link", name="Upgrades").click()
        page.get_by_label("Display Name:").fill("Test Upgrade")
        page.get_by_label("Target:").select_option(label="Test Generator")
        page.get_by_role("button", name="Add Cost").click()
        page.locator("#costResource-0").select_option(label="Test Resource (test_resource)")
        page.locator("#costAmount-0").fill("10")
        page.wait_for_timeout(1000)
        page.get_by_role("button", name="Add Upgrade").click()

        # Navigate back to Tier Editor
        page.get_by_role("link", name="Tiers").click()

        # Add an item group
        page.get_by_label("Resource:").select_option(label="Test Resource (test_resource)")
        page.get_by_label("Generator:").select_option(label="Test Generator (test_generator)")
        page.get_by_label("Upgrade:").select_option(label="Test Upgrade (test_upgrade)")
        page.get_by_role("button", name="Add Group").click()
        page.screenshot(path="jules-scratch/verification/04_item_group_added.png")

        # Edit a resource
        page.get_by_role("link", name="Resources").click()
        page.get_by_role("button", name="Edit").click()
        page.get_by_label("Display Name:").fill("Edited Resource")
        page.get_by_role("button", name="Save Changes").click()
        page.screenshot(path="jules-scratch/verification/05_resource_edited.png")

        browser.close()

if __name__ == "__main__":
    run()