/**
 * MULLAN FLOOR MILL — Order backend (free, runs on Google Sheets)
 * ------------------------------------------------------------
 * This script turns a Google Sheet into the "database" for the website:
 * every order and price change is stored as a row, so customers and the
 * owner always see the same live data — for zero hosting cost.
 *
 * Setup instructions are in SETUP-GUIDE.md. You should not need to edit
 * anything in this file — just paste it in as-is.
 */

const ORDERS_SHEET = 'Orders';
const SETTINGS_SHEET = 'Settings';
const ORDER_HEADERS = ['OrderID','Name','Phone','DeliveryType','City','Address','Quantity','Unit','PricePerUnit','Amount','Status','DeliveryCharge','ETA','PaymentRef','Notes','CreatedAt','UpdatedAt'];

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getSettings() {
  const sheet = getSheet(SETTINGS_SHEET, ['Key', 'Value']);
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) { settings[data[i][0]] = data[i][1]; }
  if (!settings.PricePerKg) { settings.PricePerKg = 75; setSetting('PricePerKg', 75); }
  if (!settings.PricePerQuintal) { settings.PricePerQuintal = 7000; setSetting('PricePerQuintal', 7000); }
  if (!settings.OwnerPassword) { settings.OwnerPassword = 'mullan123'; setSetting('OwnerPassword', 'mullan123'); }
  return settings;
}

function setSetting(key, value) {
  const sheet = getSheet(SETTINGS_SHEET, ['Key', 'Value']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) { sheet.getRange(i + 1, 2).setValue(value); return; }
  }
  sheet.appendRow([key, value]);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function findOrder(id) {
  const sheet = getSheet(ORDERS_SHEET, ORDER_HEADERS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const obj = {};
      ORDER_HEADERS.forEach((h, idx) => obj[h] = data[i][idx]);
      return obj;
    }
  }
  return null;
}

function getAllOrders() {
  const sheet = getSheet(ORDERS_SHEET, ORDER_HEADERS);
  const data = sheet.getDataRange().getValues();
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    ORDER_HEADERS.forEach((h, idx) => obj[h] = data[i][idx]);
    orders.push(obj);
  }
  return orders.reverse();
}

function doGet(e) {
  const action = e.parameter.action;
  const settings = getSettings();

  if (action === 'settings') {
    return jsonOut({ ok: true, pricePerKg: Number(settings.PricePerKg), pricePerQuintal: Number(settings.PricePerQuintal) });
  }
  if (action === 'track') {
    const order = findOrder(e.parameter.id);
    if (!order) return jsonOut({ ok: false, error: 'Order not found' });
    return jsonOut({ ok: true, order });
  }
  if (action === 'list') {
    if (e.parameter.password !== String(settings.OwnerPassword)) return jsonOut({ ok: false, error: 'Wrong password' });
    return jsonOut({ ok: true, orders: getAllOrders(), settings: { pricePerKg: Number(settings.PricePerKg), pricePerQuintal: Number(settings.PricePerQuintal) } });
  }
  return jsonOut({ ok: false, error: 'Unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const settings = getSettings();

  if (action === 'createOrder') {
    const sheet = getSheet(ORDERS_SHEET, ORDER_HEADERS);
    const id = 'MFM-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();
    const pricePerUnit = body.unit === 'Quintal' ? Number(settings.PricePerQuintal) : Number(settings.PricePerKg);
    const amount = pricePerUnit * Number(body.quantity);
    sheet.appendRow([id, body.name, body.phone, body.deliveryType, body.city || '', body.address || '', body.quantity, body.unit, pricePerUnit, amount, 'Order Received', '', '', body.paymentRef || '', body.notes || '', now, now]);
    return jsonOut({ ok: true, orderId: id, amount });
  }

  if (action === 'updateOrder') {
    if (body.password !== String(settings.OwnerPassword)) return jsonOut({ ok: false, error: 'Wrong password' });
    const sheet = getSheet(ORDERS_SHEET, ORDER_HEADERS);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === body.orderId) {
        const row = i + 1;
        if (body.status) sheet.getRange(row, ORDER_HEADERS.indexOf('Status') + 1).setValue(body.status);
        if (body.deliveryCharge !== undefined) sheet.getRange(row, ORDER_HEADERS.indexOf('DeliveryCharge') + 1).setValue(body.deliveryCharge);
        if (body.eta) sheet.getRange(row, ORDER_HEADERS.indexOf('ETA') + 1).setValue(body.eta);
        sheet.getRange(row, ORDER_HEADERS.indexOf('UpdatedAt') + 1).setValue(new Date().toISOString());
        return jsonOut({ ok: true });
      }
    }
    return jsonOut({ ok: false, error: 'Order not found' });
  }

  if (action === 'updateSettings') {
    if (body.password !== String(settings.OwnerPassword)) return jsonOut({ ok: false, error: 'Wrong password' });
    if (body.pricePerKg) setSetting('PricePerKg', body.pricePerKg);
    if (body.pricePerQuintal) setSetting('PricePerQuintal', body.pricePerQuintal);
    if (body.newPassword) setSetting('OwnerPassword', body.newPassword);
    return jsonOut({ ok: true });
  }

  return jsonOut({ ok: false, error: 'Unknown action' });
}
