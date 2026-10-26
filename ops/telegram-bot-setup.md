# Telegram bot — 5–6 tips / day (2–3h gap)

Browser login se auto-send nahi. **Bot** sirf un groups mein jahan tum add karoge (max 8).

## 1) Bot banao
1. Telegram → [@BotFather](https://t.me/BotFather) → `/newbot`  
2. Token copy → server `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_IDS=-100xxxxxxxxxx,-100yyyyyyyyyy
```

`TELEGRAM_CHAT_IDS` = comma-separated group/channel IDs (max 8).

Live (EC2): private DM `6017754332` + channel **ContentVerse India Tips** `-1004371530121`  
Invite: https://t.me/+TPRn45-lJA44N2U1 — bot `@ContentVerseTipsBot` is admin (post rights).

## 2) Group mein bot
1. Group → Add members → apna bot  
2. Bot ko **post permission** (admin recommended for channels)  
3. Chat ID nikalne ke liye: group mein koi message →  
   `https://api.telegram.org/bot<TOKEN>/getUpdates`  
   → `chat":{"id":-100...}`

## 3) EC2 cron (IST, 6 slots)

```cron
TZ=Asia/Kolkata
0 8  * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 0 >> /tmp/telegram-tips.log 2>&1
0 11 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 1 >> /tmp/telegram-tips.log 2>&1
0 14 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 2 >> /tmp/telegram-tips.log 2>&1
0 17 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 3 >> /tmp/telegram-tips.log 2>&1
0 20 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 4 >> /tmp/telegram-tips.log 2>&1
0 22 * * * cd /home/ec2-user/ContentVersa && bash scripts/cron-telegram-tips.sh 5 >> /tmp/telegram-tips.log 2>&1
```

≈ har 2–3 ghante, **6 baar / din** — mass nahi.

## 4) Test

```bash
bash scripts/cron-telegram-tips.sh 0
```

Manual copy desk ab bhi: `/admin/telegram-share`
