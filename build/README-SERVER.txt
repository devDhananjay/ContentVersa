ContentVerse — standalone server bundle

1. Upload this entire "build" folder to your server.
2. Set environment variables (DATABASE_URL, JWT_SECRET, GOOGLE_*, NEXT_PUBLIC_APP_URL=https://contentverse.co.in, AWS_S3_* or UPLOAD_DIR, etc.)
3. From inside this folder run:
   NODE_ENV=production node server.js
   (default port 3000 — set PORT=8080 if needed)

Requires Node.js 20+ on the server.
