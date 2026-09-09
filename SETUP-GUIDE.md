# Mullan Floor Mill — Setup Guide (all free, no coding needed)

You have 3 files:
- `index.html` — the website itself
- `apps-script.gs` — the free backend that stores orders (runs on Google Sheets)
- `SETUP-GUIDE.md` — this file

Right now the site works in **demo mode** (open `index.html` and try it — orders, tracking, and the owner dashboard all work), but demo data disappears when the page is reloaded, and different visitors won't see each other's orders. To make it a real, shared, working site, do the one-time setup below (about 10 minutes).

## Step 1 — Create the Google Sheet "database"

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it "Mullan Floor Mill Orders" (top-left, where it says "Untitled spreadsheet").
3. In the menu, click **Extensions → Apps Script**.
4. Delete anything in the code box, then open `apps-script.gs` from this folder, copy all of it, and paste it into the Apps Script editor.
5. Click the **Save** icon (disk icon) at the top.

## Step 2 — Publish it as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**. Google will ask you to authorize — click through and allow it (it's your own script, this is safe).
5. Copy the **Web App URL** it gives you (starts with `https://script.google.com/macros/s/...`).

## Step 3 — Connect the website to it

1. Open `index.html` in any text editor (Notepad works fine).
2. Near the top, find:
   ```
   SCRIPT_URL: "",
   ```
3. Paste your Web App URL between the quotes, so it looks like:
   ```
   SCRIPT_URL: "https://script.google.com/macros/s/AKf.../exec",
   ```
4. Save the file. The "Setup needed" banner at the top of the site will now disappear.

## Step 4 — Set your real password

The default owner password is `mullan123`. Log into the **Owner** tab with it once, then you can change pricing anytime from there. (To change the password itself, you can edit the `OwnerPassword` value directly in the "Settings" tab that now appears in your Google Sheet.)

## Step 5 — Put the site online for free

Any of these work with no cost:
- **Netlify Drop** ([app.netlify.com/drop](https://app.netlify.com/drop)) — drag the folder in, get a live link instantly.
- **GitHub Pages** — upload the folder to a GitHub repository and enable Pages in settings.
- Or just share `index.html` directly — it also works fine opened straight from a phone or computer, as long as it can reach the internet (needed to talk to the Google Sheet).

## How orders get to you

- When a customer places an order, they're shown a **"Send order to Mullan Floor Mill on WhatsApp"** button. Tapping it opens WhatsApp with your number (7624858405) and the order details already filled in — they just hit send. This means you get notified instantly, at no cost, without needing a WhatsApp Business API account.
- Every order is also saved in your Google Sheet automatically, so nothing is lost even if a customer doesn't send the WhatsApp message.
- From the **Owner** tab on the site, you can update an order's status and delivery charge, and tap **"Notify on WhatsApp"** to send the customer an update on their phone the same way.

## Things you can change anytime, no coding needed

- **Prices** — Owner tab → Pricing.
- **UPI ID / QR code / your WhatsApp number** — these are near the top of `index.html` in the `CONFIG` section, and the QR image is the `qr-code.jpeg` file in this folder (replace it with a new image of the same name if the UPI ID ever changes).
- **Minimum order quantities** — also in the `CONFIG` section (`MIN_KG_LOCAL` and `MIN_QUINTAL_OUTSTATION`).

## A note on limits

This setup is genuinely free and will comfortably handle a small-to-medium mill's order volume. If the business grows a lot (hundreds of orders a day), you'd eventually want a proper paid backend — but that's a "good problem to have," and this can run as-is for a long time before that becomes necessary.
