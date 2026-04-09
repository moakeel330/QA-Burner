import os
import asyncio
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the Gemini 2.5 Flash model
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

async def analyze_website(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        
        findings = []
        console_errors = []
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        try:
            start_time = asyncio.get_event_loop().time()
            await page.goto(url, timeout=60000, wait_until="domcontentloaded")
            end_time = asyncio.get_event_loop().time()
            await asyncio.sleep(2) 

            # Performance
            duration = end_time - start_time
            if duration > 3: findings.append(f"Load time: {round(duration, 2)}s.")

            # Accessibility
            images = await page.query_selector_all('img')
            missing = 0
            for img in images:
                alt = await img.get_attribute('alt')
                if alt is None or alt.strip() == "": missing += 1
            if missing > 0: findings.append(f"Found {missing} images missing alt text.")

            # SEO
            h1s = await page.query_selector_all('h1')
            if not h1s: findings.append("No H1 tag found.")
            
            # Security & Tech Debt
            if not url.startswith("https"): findings.append("Using insecure HTTP.")
            content = await page.content()
            if "jquery" in content.lower(): findings.append("Detected jQuery usage.")

            # Console
            if console_errors: findings.append(f"Found {len(console_errors)} JS exceptions.")

            # Capture Evidence
            await page.screenshot(path="../frontend/public/leak.png")

        except Exception as e:
            findings.append(f"Crawl failed: {str(e)}")
        
        await browser.close()
        return findings

@app.get("/roast")
async def get_roast(url: str, intensity: int = 5):
    tech_findings = await analyze_website(url)
    
    # Personality mapping based on slider
    personality = "passive-aggressive" if intensity < 4 else "toxic and sarcastic"
    if intensity > 8: personality = "absolutely soul-crushing, elite hacker who is personally offended by this code"

    prompt = f"""
    SYSTEM: You are a {personality} Senior QA Engineer. 
    A dev submitted this site: {url}.
    Bugs found: {", ".join(tech_findings)}.
    TASK: Write a devastatingly funny 2-sentence roast. 
    If intensity is high, be brutal. No advice.
    """

    try:
        response = model.generate_content(prompt)
        roast_text = response.text
    except:
        roast_text = "My AI circuits fried. Your code is a technical OSHA violation."

    return {"url": url, "findings": tech_findings, "roast": roast_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)