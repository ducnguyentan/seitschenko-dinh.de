/**
 * ============================================================
 *  Anamnesebogen – Google Apps Script Web App Handler
 * ============================================================
 *
 *  SETUP INSTRUCTIONS
 *  ------------------
 *  Dieses Script gehört zum Spreadsheet "Seitschenko.Dinh - Appointment Bookings".
 *  Es erstellt automatisch ein neues Tab "Anamnesebogen" in diesem Spreadsheet.
 *
 *  1. Öffne das Spreadsheet "Seitschenko.Dinh - Appointment Bookings".
 *  2. Menü → Erweiterungen → Apps Script.
 *  3. Neues Script erstellen (+ Datei) → Datei "anamnesebogen" benennen.
 *  4. Gesamten Inhalt dieser Datei einfügen (vorhandenen Code ersetzen).
 *  5. Speichern (Ctrl+S).
 *  6. Klicke "Bereitstellen" → "Neue Bereitstellung".
 *     - Typ: Web App
 *     - Ausführen als: Ich (eigenes Google-Konto)
 *     - Zugriff: Jeder
 *  7. App autorisieren wenn aufgefordert.
 *  8. Web App-URL kopieren (endet auf /exec).
 *  9. In Anamnesebogen.html: SHEET_URL durch diese URL ersetzen.
 *
 *  RESULT: Jede Formular-Einreichung erzeugt 1 neue Zeile im Tab "Anamnesebogen"
 *          innerhalb des Spreadsheets "Seitschenko.Dinh - Appointment Bookings".
 *
 *  COLUMN ORDER  (Zeile 1 wird beim ersten Aufruf automatisch als Header erstellt)
 *  Timestamp | Anrede | Nachname | Vorname | Geburtsdatum |
 *  Geburtsort | Straße | PLZ | Ort | Mobil | Festnetz |
 *  E-Mail | Arbeitgeber_Name | Arbeitgeber_Tel | Beruf |
 *  Hausarzt_Name | Hausarzt_Straße | Hausarzt_PLZ | Hausarzt_Ort |
 *  Versicherung_Name | Versicherungstyp | Familienversichert |
 *  HV_Name | HV_Vorname | HV_Geburtsdatum | HV_Geburtsort |
 *  HV_Straße | HV_PLZ | HV_Ort |
 *  Herzschwäche | Arrhythmien | Herzasthma | Endokarditis |
 *  Herzschrittmacher | Herzklappenfehler | Herzinfarkt |
 *  Herzinfarkt_Wann | Herz_Sonstige |
 *  Blutdruck_Hoch | Blutdruck_Niedrig | Ohnmacht | Schlaganfall |
 *  Schlaganfall_Wann | Kreislauf_Sonstige |
 *  Diabetes | Magen_Darm | Schilddrüse | Stoffwechsel_Sonstige |
 *  Epilepsie | Krämpfe | Nerven_Sonstige |
 *  Hämophilie | Anämie | Blut_Sonstige |
 *  Tumorerkrankungen | Tumor_Welche |
 *  Hepatitis | Hepatitis_Typ | TBC | HIV | MRSA |
 *  Atemwege | Atemwege_Welche | Infektion_Sonstige |
 *  Sonstige_Erkrankung | Sonstige_Erkrankung_Welche |
 *  Allergie_Antibiotika | Allergie_Andere | Allergie_Welche |
 *  Medikamente_Einnahme | Blutverdünner | Bisphosphonate |
 *  Antidepressiva | Herzmedikamente | Sonstige_Medikamente |
 *  Rauchen | Alkohol | Drogen |
 *  Schwanger | Schwanger_Woche |
 *  Letztes_Rontgen | Knirschen | Zahnfleisch | Mundgeruch |
 *  Erinnerung | Datum | Unterschrift
 * ============================================================
 */

// ── Configuration ──────────────────────────────────────────────────────────────

/**
 * Tab name within "Seitschenko.Dinh - Appointment Bookings".
 * The tab is created automatically if it doesn't exist.
 */
const SHEET_TAB_NAME = 'Anamnesebogen';

/**
 * Optional: Hard-code the Spreadsheet ID to target a specific spreadsheet.
 * Leave empty to use the spreadsheet this script is bound to (recommended).
 * Find the ID in the spreadsheet URL: .../spreadsheets/d/<ID>/edit
 */
const SPREADSHEET_ID = '';

// ── CORS headers ───────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Opens the target spreadsheet (bound or by ID) and returns the
 * "Anamnesebogen" sheet tab, creating it if it doesn't exist.
 */
function getOrCreateAnamneseSheet() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_TAB_NAME);

  if (!sheet) {
    Logger.log('📋 Tab "' + SHEET_TAB_NAME + '" nicht gefunden – wird erstellt.');
    sheet = ss.insertSheet(SHEET_TAB_NAME);
    Logger.log('✅ Tab "' + SHEET_TAB_NAME + '" erfolgreich erstellt.');
  }

  return sheet;
}

/**
 * Writes the header row if the sheet is empty and applies teal styling.
 */
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER_ROW);
    sheet.getRange(1, 1, 1, HEADER_ROW.length)
         .setFontWeight('bold')
         .setBackground('#5eb3b3')
         .setFontColor('#ffffff');
    // Freeze header row so it stays visible while scrolling
    sheet.setFrozenRows(1);
    Logger.log('✅ Header-Zeile erstellt (' + HEADER_ROW.length + ' Spalten).');
  }
}

// ── Anamnesebogen POST handler (called from shared doPost in Code.gs) ─────────

/**
 * Handles an Anamnesebogen form submission.
 * Called by doPost() in Code.gs when it detects Anamnesebogen data
 * (i.e. the request body contains the "Nachname" or "Anrede" key).
 *
 * @param {Object} data – Already-parsed JSON object from the form
 * @param {Object} corsHeaders – CORS headers to include in the response
 * @returns {TextOutput} JSON response { result: 'success'|'error', ... }
 */
function handleAnamnesePost(data, corsHeaders) {
  Logger.log('📥 Anamnesebogen von: ' + (data['Nachname'] || '?') + ', ' + (data['Vorname'] || '?'));

  const sheet = getOrCreateAnamneseSheet();
  ensureHeader(sheet);

  const row = HEADER_ROW.map(function(col) {
    var val = data[col];
    return (val !== undefined && val !== null) ? String(val) : '';
  });

  sheet.appendRow(row);
  Logger.log('✅ Anamnesebogen Zeile ' + sheet.getLastRow() + ' geschrieben.');

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', form: 'anamnesebogen', row: sheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Column definitions ─────────────────────────────────────────────────────────

/** 88 columns – must match the keys sent by the Anamnesebogen web form. */
const HEADER_ROW = [
  // ── Persönliche Daten (A–L) ────────────────────────────────────────────────
  'Timestamp', 'Anrede', 'Nachname', 'Vorname', 'Geburtsdatum',
  'Geburtsort', 'Straße', 'PLZ', 'Ort', 'Mobil', 'Festnetz', 'E-Mail',

  // ── Beruf & Arbeitgeber (M–O) ──────────────────────────────────────────────
  'Arbeitgeber_Name', 'Arbeitgeber_Tel', 'Beruf',

  // ── Hausarzt (P–S) ────────────────────────────────────────────────────────
  'Hausarzt_Name', 'Hausarzt_Straße', 'Hausarzt_PLZ', 'Hausarzt_Ort',

  // ── Versicherung (T–V) ────────────────────────────────────────────────────
  'Versicherung_Name', 'Versicherungstyp', 'Familienversichert',

  // ── Hauptversicherter (W–AE) ──────────────────────────────────────────────
  'HV_Name', 'HV_Vorname', 'HV_Geburtsdatum', 'HV_Geburtsort',
  'HV_Straße', 'HV_PLZ', 'HV_Ort',

  // ── Herzerkrankungen (AF–AN) ──────────────────────────────────────────────
  'Herzschwäche', 'Arrhythmien', 'Herzasthma', 'Endokarditis',
  'Herzschrittmacher', 'Herzklappenfehler', 'Herzinfarkt',
  'Herzinfarkt_Wann', 'Herz_Sonstige',

  // ── Kreislauf (AO–AT) ─────────────────────────────────────────────────────
  'Blutdruck_Hoch', 'Blutdruck_Niedrig', 'Ohnmacht', 'Schlaganfall',
  'Schlaganfall_Wann', 'Kreislauf_Sonstige',

  // ── Stoffwechsel (AU–AX) ──────────────────────────────────────────────────
  'Diabetes', 'Magen_Darm', 'Schilddrüse', 'Stoffwechsel_Sonstige',

  // ── Nerven (AY–BA) ────────────────────────────────────────────────────────
  'Epilepsie', 'Krämpfe', 'Nerven_Sonstige',

  // ── Blut (BB–BD) ──────────────────────────────────────────────────────────
  'Hämophilie', 'Anämie', 'Blut_Sonstige',

  // ── Tumor (BE–BF) ─────────────────────────────────────────────────────────
  'Tumorerkrankungen', 'Tumor_Welche',

  // ── Infektionskrankheiten (BG–BL) ────────────────────────────────────────
  'Hepatitis', 'Hepatitis_Typ', 'TBC', 'HIV', 'MRSA', 'Infektion_Sonstige',

  // ── Atemwege (BM–BN) ──────────────────────────────────────────────────────
  'Atemwege', 'Atemwege_Welche',

  // ── Sonstige Erkrankungen (BO–BP) ─────────────────────────────────────────
  'Sonstige_Erkrankung', 'Sonstige_Erkrankung_Welche',

  // ── Allergien (BQ–BS) ────────────────────────────────────────────────────
  'Allergie_Antibiotika', 'Allergie_Andere', 'Allergie_Welche',

  // ── Medikamente (BT–BY) ───────────────────────────────────────────────────
  'Medikamente_Einnahme', 'Blutverdünner', 'Bisphosphonate',
  'Antidepressiva', 'Herzmedikamente', 'Sonstige_Medikamente',

  // ── Lebensgewohnheiten (BZ–CB) ────────────────────────────────────────────
  'Rauchen', 'Alkohol', 'Drogen',

  // ── Schwangerschaft (CC–CD) ───────────────────────────────────────────────
  'Schwanger', 'Schwanger_Woche',

  // ── Zahngesundheit (CE–CH) ────────────────────────────────────────────────
  'Letztes_Rontgen', 'Knirschen', 'Zahnfleisch', 'Mundgeruch',

  // ── Abschluss (CI–CK) ────────────────────────────────────────────────────
  'Erinnerung', 'Datum', 'Unterschrift'
];
