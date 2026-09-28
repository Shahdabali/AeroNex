import sys, pathlib
from playwright.sync_api import sync_playwright

here = pathlib.Path(__file__).parent
out = here / "frames"; out.mkdir(exist_ok=True)
times = [float(x) for x in sys.argv[1:]]  # stills mode if times given
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((here / "video.html").as_uri(), wait_until="networkidle")
    pg.evaluate("window.ready")
    if times:
        for t in times:
            pg.evaluate(f"render({t})")
            pg.screenshot(path=str(here / f"still_{t:05.2f}.png"))
    else:
        for f in range(600):
            pg.evaluate(f"render({f/30})")
            pg.screenshot(path=str(out / f"{f:04d}.jpg"), type="jpeg", quality=95)
    b.close()
