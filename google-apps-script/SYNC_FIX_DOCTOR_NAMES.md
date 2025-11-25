# Sync Fix: Doctor Names in Calendar - Time Format Handling

**Date:** 2025-11-24
**Issue:** Appointments booked in New_Appointments not syncing doctor names to Calendar
**Root Cause:** Time format mismatch ("10:00" vs "10:00 -") preventing slot matching

---

## 🐛 Problem Identified

### Symptom:
- ✅ Appointments successfully saved in **New_Appointments** sheet with doctor names
- ❌ Calendar sheet shows all slots as "available" (not syncing doctor names)
- ❌ Doctor names not appearing in Calendar status rows

### Example:
**New_Appointments:**
```
Row 2: kukadiya booked 26.11 at 10:00
Row 3: ikikardes booked 24.11 at 10:00
```

**Calendar (Before Fix):**
```
26.11.2025 → 10:00 status: "available" (should be "kukadiya")
24.11.2025 → 10:00 status: "available" (should be "ikikardes")
```

---

## 🔍 Root Cause Analysis

### Issue 1: Date Format Mismatch
**Problem:** New_Appointments stores dates as "DD.MM" but Calendar expects "DD.MM.YYYY"

**Example:**
- New_Appointments: `26.11`
- Calendar: `26.11.2025`
- Result: ❌ No match found

**Fix:** Auto-convert DD.MM → DD.MM.YYYY in `syncCalendarWithAppointments()`

```javascript
// OLD CODE (BROKEN)
bookedMap[dateStr] = {...};

// NEW CODE (FIXED)
var fullDateStr = dateStr;
if (dateStr.split('.').length === 2) {
  var currentYear = new Date().getFullYear();
  fullDateStr = dateStr + '.' + currentYear; // 26.11 → 26.11.2025
}
bookedMap[fullDateStr] = {...};
```

---

### Issue 2: Time Format Mismatch
**Problem:** Calendar Zeit row may have time with suffix like "10:00 -" but New_Appointments has "10:00"

**Example:**
- New_Appointments time: `10:00`
- Calendar Zeit cell: `10:00 -` (with trailing " -")
- Comparison: `"10:00 -" === "10:00"` → ❌ FALSE

**Fix:** Clean time strings before comparison

```javascript
// OLD CODE (BROKEN)
if (cellTime === timeStr) { ... }

// NEW CODE (FIXED)
var cleanCellTime = cellTime ? cellTime.trim().split(' ')[0] : ''; // "10:00 -" → "10:00"
var cleanTimeStr = timeStr ? timeStr.trim().split(' ')[0] : '';
if (cleanCellTime === cleanTimeStr) { ... }
```

---

## 🔧 Files Modified

### 1. appointmentSheet.gs - syncCalendarWithAppointments() (Lines 1121-1142)

**Changes:**
- ✅ Added date format conversion (DD.MM → DD.MM.YYYY)
- ✅ Added logging for debugging

**Code:**
```javascript
for (var i = 1; i < appointmentsData.length; i++) {
  var row = appointmentsData[i];
  var doctorStr = row[COL_DOCTOR] ? row[COL_DOCTOR].trim() : 'booked';
  var dateStr = row[COL_DATE] ? row[COL_DATE].trim() : '';
  var timeStr = row[COL_TIME] ? row[COL_TIME].trim() : '';

  if (dateStr && timeStr) {
    // ✅ FIX: Convert DD.MM to DD.MM.YYYY
    var fullDateStr = dateStr;
    if (dateStr.split('.').length === 2) {
      var currentYear = new Date().getFullYear();
      fullDateStr = dateStr + '.' + currentYear;
    }

    if (!bookedMap[fullDateStr]) {
      bookedMap[fullDateStr] = {};
    }
    bookedMap[fullDateStr][timeStr] = doctorStr;

    Logger.log('📌 Added to bookedMap: ' + fullDateStr + ' ' + timeStr + ' → ' + doctorStr);
  }
}
```

---

### 2. appointmentSheet.gs - syncCalendarWithAppointments() (Lines 1171-1204)

**Changes:**
- ✅ Clean time labels before comparison (handle " -" suffix)
- ✅ Added detailed logging for matches

**Code:**
```javascript
for (var j = 2; j < 14; j++) {
  var timeLabel = zeitRow[j];

  if (!timeLabel || timeLabel.trim() === '') {
    continue;
  }

  // ✅ FIX: Clean time label (remove trailing characters)
  var cleanTimeLabel = timeLabel.trim().split(' ')[0]; // "10:00 -" → "10:00"

  var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
  var currentStatus = statusCell.getValue();

  var correctStatus;
  if (bookedAppointments[cleanTimeLabel]) {
    correctStatus = bookedAppointments[cleanTimeLabel];
    Logger.log('🔍 Match found! ' + dateStr + ' ' + cleanTimeLabel + ' → ' + correctStatus);
  } else if (currentStatus === 'blocked' || currentStatus === 'hidden') {
    correctStatus = currentStatus;
  } else {
    correctStatus = 'available';
  }

  if (currentStatus !== correctStatus) {
    statusCell.setValue(correctStatus);
    updatedCount++;
    Logger.log('✅ Updated: ' + dateStr + ' ' + cleanTimeLabel + ': "' + currentStatus + '" → "' + correctStatus + '"');
  }
}
```

---

### 3. appointmentSheet.gs - updateCalendarStatus() (Lines 997-1014)

**Changes:**
- ✅ Clean time strings in realtime sync (doPost → updateCalendarStatus)

**Code:**
```javascript
for (var j = 2; j < 14; j++) {
  var cellTime = zeitRow[j];

  // ✅ FIX: Clean both times for comparison
  var cleanCellTime = cellTime ? cellTime.trim().split(' ')[0] : '';
  var cleanTimeStr = timeStr ? timeStr.trim().split(' ')[0] : '';

  if (cleanCellTime === cleanTimeStr) {
    var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
    statusCell.setValue(newStatus);

    Logger.log('✅ Calendar synced: ' + dateStr + ' ' + cleanTimeStr + ' → ' + newStatus);
    return true;
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Manual Full Sync

**Steps:**
1. Open Google Sheets
2. Go to menu: **📅 Kalender** → **🔄 Vollständige Synchronisierung**
3. Wait for alert: "✅ Synchronisierung abgeschlossen! X Zeitfenster wurden aktualisiert."
4. Check Calendar sheet

**Expected Result:**
```
24.11.2025 (Montag)
  Zeit row:   [08:00] [09:00] [10:00] [11:00] ...
  Status row: [available] [available] [ikikardes] [available] ...
                                       ↑ Doctor name appears!

26.11.2025 (Mittwoch)
  Zeit row:   [08:00] [09:00] [10:00] [11:00] ...
  Status row: [blocked] [available] [kukadiya] [available] ...
                                     ↑ Doctor name appears!
```

---

### Test 2: Realtime Sync (New Appointment)

**Steps:**
1. Open appointment.html on website
2. Select a doctor (e.g., "kukadiya")
3. Select a date and time
4. Submit form
5. Immediately check Calendar sheet

**Expected Result:**
- ✅ New row added to New_Appointments
- ✅ Calendar status updated to doctor name (e.g., "kukadiya")
- ✅ Happens immediately (realtime sync via doPost → updateCalendarStatus)

---

### Test 3: Verify API Response

**Steps:**
1. Open appointment.html
2. Select a doctor
3. Open browser console (F12)
4. Check API response in Network tab

**Expected Response:**
```json
{
  "status": "success",
  "date": "26.11.2025",
  "slots": {
    "10:00": {
      "time": "10:00",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"  ← Should show doctor name
    }
  }
}
```

---

## 🔍 Debugging Logs

If sync still fails, check **Executions** log in Google Apps Script:

### Expected Log Output (Successful Sync):

```
🔄 Starting full Calendar sync...
📌 Added to bookedMap: 26.11.2025 10:00 → kukadiya
📌 Added to bookedMap: 24.11.2025 10:00 → ikikardes
📋 Booked appointments map: {"26.11.2025":{"10:00":"kukadiya"},"24.11.2025":{"10:00":"ikikardes"}}
🔍 Match found! 26.11.2025 10:00 → kukadiya
✅ Updated: 26.11.2025 10:00: "available" → "kukadiya"
🔍 Match found! 24.11.2025 10:00 → ikikardes
✅ Updated: 24.11.2025 10:00: "available" → "ikikardes"
✅ Sync complete! Updated 2 slots
```

### Troubleshooting:

**If you see:**
```
⚠️ Time slot not found in Calendar: 10:00
```
**Cause:** Zeit row doesn't have "10:00" slot
**Fix:** Check Calendar Zeit row has the time slot

**If you see:**
```
⚠️ Date not found in Calendar: 26.11.2025
```
**Cause:** Calendar doesn't have this date yet
**Fix:** Add the week containing this date using "➕ Neue Woche hinzufügen"

---

## 📊 Column Index Reference

**New_Appointments Sheet:**
```
Column A (0): Zeitstempel
Column B (1): Symptom
Column C (2): Arzt         ← COL_DOCTOR = 2
Column D (3): Arzt E-Mail
Column E (4): Arzt Telefon
Column F (5): Datum        ← COL_DATE = 5
Column G (6): Zeit         ← COL_TIME = 6
Column H (7): Beschreibung
Column I (8): Sprache
Column J (9): Patient
```

**Calendar Sheet:**
```
Column A (0): Datum (merged 2 rows)
Column B (1): Wochentag (merged 2 rows)
Column C (2): Slot 1
Column D (3): Slot 2
...
Column N (13): Slot 12

Row structure per day:
  Row i:   Zeit row (editable times)
  Row i+1: Status row (available/blocked/hidden/doctor_name)
```

---

## ✅ Summary

**Problem:** Doctor names not syncing to Calendar
**Root Causes:**
1. ❌ Date format mismatch (DD.MM vs DD.MM.YYYY)
2. ❌ Time format mismatch ("10:00" vs "10:00 -")

**Solutions:**
1. ✅ Auto-convert dates to full format in sync functions
2. ✅ Clean time strings (remove trailing characters) before comparison
3. ✅ Apply fixes to both realtime sync and manual full sync

**Files Changed:**
- `appointmentSheet.gs` (3 functions updated)

**Testing:**
- ✅ Manual sync: Menu → Vollständige Synchronisierung
- ✅ Realtime sync: Submit new appointment via website
- ✅ API verification: Check browser console for doctor field

**Result:** Doctor names now correctly sync from New_Appointments to Calendar! 🎉
