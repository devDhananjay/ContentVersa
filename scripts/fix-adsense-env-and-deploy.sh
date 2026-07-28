#!/usr/bin/env bash
# Clean NEXT_PUBLIC_GOOGLE_ADSENSE_ID on EC2, pull main, restart pm2.
set -euo pipefail
PEM="${PEM:-$HOME/Downloads/content.pem}"
HOST="${HOST:-ec2-user@52.66.204.66}"

ssh -i "$PEM" -o StrictHostKeyChecking=no -o ConnectTimeout=20 "$HOST" bash <<'REMOTE'
set -euo pipefail
python3 <<'PY'
from pathlib import Path
import re
for rel in [".env", "build/.env"]:
    path = Path("/home/ec2-user/ContentVersa") / rel
    if not path.exists():
        print(rel, "missing")
        continue
    out = []
    seen = False
    pub = None
    for line in path.read_text().splitlines():
        if line.startswith("NEXT_PUBLIC_GOOGLE_ADSENSE_ID="):
            val = line.split("=", 1)[1].strip().strip("\"'")
            m = re.search(r"(?:ca-)?pub-(\d+)", val)
            if m and not seen:
                pub = f"ca-pub-{m.group(1)}"
                out.append(f"NEXT_PUBLIC_GOOGLE_ADSENSE_ID={pub}")
                seen = True
            continue
        out.append(line)
    path.write_text("\n".join(out) + "\n")
    print(rel, "cleaned", "has_id=" + str(bool(pub)))
PY
cd /home/ec2-user/ContentVersa
git pull origin main
cp -f .env build/.env
rsync -a node_modules/.prisma/ build/node_modules/.prisma/
pm2 restart next-app
sleep 3
echo "=== ads.txt ==="
curl -s https://contentverse.co.in/ads.txt
echo
echo "=== script check ==="
curl -s https://contentverse.co.in | python3 -c 'import sys,re; h=sys.stdin.read(); m=re.search(r"adsbygoogle.js\?client=([^\"]+)", h); print("script_client=", m.group(1) if m else "MISSING"); print("junk=", "RAPIDAPI" in (m.group(1) if m else ""))'
REMOTE
