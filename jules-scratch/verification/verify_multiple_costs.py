from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the resource editor page
        page.goto("http://localhost:3890/")

        # Add a new resource
        page.get_by_label("Display Name:").fill("Gold")
        page.get_by_label("Starting Amount:").fill("1000")
        page.get_by_role("button", name="Add Resource").click()

        # Wait for the resource to be added and reload the page
        page.wait_for_timeout(1000)
        page.reload()
        page.wait_for_timeout(1000)

        # Navigate to the generators page
        page.goto("http://localhost:3890/generators")

        # Fill in the generator details
        page.get_by_label("Display Name:").fill("Test Generator")
        page.get_by_label("Resource Produced:").select_option(label="Gold (gold)")
        page.get_by_label("Base Production Amount:").fill("100")

        # Add the first cost
        page.get_by_role("button", name="+ Add Cost").click()
        page.get_by_label("Cost Amount:").first.fill("10")
        page.get_by_label("Cost Resource:").first.select_option(label="Gold (gold)")

        # Add the second cost
        page.get_by_role("button", name="+ Add Cost").click()
        page.get_by_label("Cost Amount:").nth(1).fill("20")
        page.get_by_label("Cost Resource:").nth(1).select_option(label="Gold (gold)")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()