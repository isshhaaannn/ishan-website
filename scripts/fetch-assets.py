import json, os, re, ssl, sys, time, urllib.request
import concurrent.futures as cf

CTX = ssl.create_default_context(); CTX.check_hostname=False; CTX.verify_mode=ssl.CERT_NONE
UA  = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(ROOT, "assets", "raw")

rows = json.load(open(os.path.join(ROOT, "data", "manifest.json")))

def slug(s):
    s = re.sub(r"[^A-Za-z0-9]+", "-", (s or "")).strip("-").lower()
    return s or "untitled"

def dest(r):
    parts = [slug(r["category"])]
    if r["client"]:  parts.append(slug(r["client"]))
    if r["project"]: parts.append(slug(r["project"]))
    if r["sub"]:     parts.append(slug(r["sub"]))
    d = os.path.join(RAW, *parts)
    os.makedirs(d, exist_ok=True)
    base = slug(os.path.splitext(r["title"])[0])
    return os.path.join(d, f"{base}--{r['id'][:8]}.jpg")

def get(r):
    p = dest(r)
    if os.path.exists(p) and os.path.getsize(p) > 4096:
        return ("skip", p)
    if not r["thumb"]:
        return ("nothumb", p)
    url = re.sub(r"=s\d+$", "=s1600", r["thumb"])
    last = None
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            d = urllib.request.urlopen(req, timeout=90, context=CTX).read()
            if len(d) < 2048: raise ValueError(f"tiny {len(d)}")
            open(p, "wb").write(d)
            return ("ok", p)
        except Exception as e:
            last = e; time.sleep(1.4 * (attempt + 1))
    return (f"FAIL {last}", p)

counts = {}
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for i, (status, p) in enumerate(ex.map(get, rows), 1):
        k = status.split()[0]
        counts[k] = counts.get(k, 0) + 1
        if i % 50 == 0 or i == len(rows):
            print(f"{i}/{len(rows)}  {counts}", flush=True)
        if k == "FAIL":
            print("FAIL", p, status, file=sys.stderr, flush=True)
print("DONE", counts, flush=True)
