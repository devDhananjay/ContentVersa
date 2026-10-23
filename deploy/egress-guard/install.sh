#!/usr/bin/env bash
# Install egress-guard on the EC2 host (run as root or via sudo).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR=/home/ec2-user/egress-guard
NGINX_GUARD=/etc/nginx/egress-guard

mkdir -p "$INSTALL_DIR" "$NGINX_GUARD" /var/lib/egress-guard
install -m 0755 "$ROOT/monitor.py" "$INSTALL_DIR/monitor.py"
install -m 0644 "$ROOT/00-egress-guard.conf" /etc/nginx/conf.d/00-egress-guard.conf
install -m 0644 "$ROOT/server-snippet.conf" "$NGINX_GUARD/server-snippet.conf"

if [[ ! -f "$NGINX_GUARD/blocked-ips.geo" ]]; then
  printf '%s\n' '# empty deny list' > "$NGINX_GUARD/blocked-ips.geo"
fi
if [[ ! -f "$NGINX_GUARD/whitelist.txt" ]]; then
  cat > "$NGINX_GUARD/whitelist.txt" << 'EOF'
# One IP per line — never auto-blocked
127.0.0.1
::1
EOF
fi

# Patch ContentVerse + Vidyora HTTPS server blocks to include the snippet once.
python3 - << 'PY'
from pathlib import Path

snippet = "    include /etc/nginx/egress-guard/server-snippet.conf;\n"
marker = "include /etc/nginx/egress-guard/server-snippet.conf"

def patch(path: Path, after_server_name: bool = True) -> None:
    text = path.read_text()
    if marker in text:
        print(f"already patched: {path}")
        return
    # Insert after first server_name line of the first (HTTPS) server block.
    lines = text.splitlines(keepends=True)
    out = []
    inserted = False
    for i, line in enumerate(lines):
        out.append(line)
        if inserted:
            continue
        if "server_name" in line and any(
            h in line for h in ("contentverse", "vidyora", "yogovoyage")
        ):
            out.append(snippet)
            inserted = True
    if not inserted:
        raise SystemExit(f"could not patch {path}")
    path.write_text("".join(out))
    print(f"patched: {path}")

patch(Path("/etc/nginx/conf.d/contentverse.conf"))
patch(Path("/etc/nginx/conf.d/vidyora.conf"))
patch(Path("/etc/nginx/conf.d/yogovoyage.conf"))
PY

# Soft rate limits on main location / for public sites (idempotent).
python3 - << 'PY'
from pathlib import Path

limits = """
        limit_req zone=egress_req burst=50 nodelay;
        limit_conn egress_conn 30;
"""

def patch_location(path: Path) -> None:
    text = path.read_text()
    if "limit_req zone=egress_req" in text:
        print(f"limits already set: {path}")
        return
    # Only the main app location / { proxy_pass ... }
    needle = None
    for candidate in (
        "    location / {\n        proxy_pass http://127.0.0.1:3000;\n",
        "    location / {\n        proxy_pass http://127.0.0.1:3002;\n",
        "    location / {\n        proxy_pass http://127.0.0.1:3003;\n",
    ):
        if candidate in text:
            needle = candidate
            break
    if not needle:
        print(f"skip limits (no main location): {path}")
        return
    text = text.replace(needle, needle + limits, 1)
    path.write_text(text)
    print(f"limits added: {path}")

patch_location(Path("/etc/nginx/conf.d/contentverse.conf"))
patch_location(Path("/etc/nginx/conf.d/vidyora.conf"))
patch_location(Path("/etc/nginx/conf.d/yogovoyage.conf"))
PY

nginx -t
nginx -s reload

# Cron every 5 minutes as root (needs to write geo deny list + nginx reload)
CRON_LINE='*/5 * * * * /usr/bin/python3 /home/ec2-user/egress-guard/monitor.py >> /var/log/egress-guard.log 2>&1'
(crontab -l 2>/dev/null | grep -v egress-guard/monitor.py; echo "$CRON_LINE") | crontab -
touch /var/log/egress-guard.log
chown root:root /var/log/egress-guard.log
chmod 644 /var/log/egress-guard.log

# First run
/usr/bin/python3 "$INSTALL_DIR/monitor.py"
echo "egress-guard installed"
