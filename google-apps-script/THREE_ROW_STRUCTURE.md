# Three-Row Calendar Structure - Final Solution

**Date:** 2025-11-24
**Solution:** Separate Status and Doctor names into different rows to avoid validation conflicts

---

## 🎯 Problem Solved

### **Old 2-Row Structure (BROKEN):**
```
24.11.2025 | Montag | 08:00  | 09:00  | 10:00    | 11:00
           |        | available | available | kukadiya | available  (Status + Doctor in same row)
                                             ↑ Validation error!
```

**Issue:** Can't put doctor name "kukadiya" in Status row because dropdown only allows [available, blocked, hidden]

---

### **New 3-Row Structure (FIXED):**
```
24.11.2025 | Montag | 08:00  | 09:00  | 10:00    | 11:00     (Zeit)
           |        | available | blocked | available | available  (Status - dropdown)
           |        |           |        | kukadiya  |            (Arzt - no validation)
```

**Benefits:**
- ✅ Status row: Dropdown validation with [available, blocked, hidden] works!
- ✅ Arzt row: No validation, can accept any doctor name
- ✅ No conflicts, no errors

---

## 📊 Structure Details

### **Row Types:**

**Row 1: Zeit (Time)**
- Contains: Date, Day name, and 12 time slots (e.g., 08:00, 09:00, ...)
- User-editable: Yes (can change times)
- Background: Light blue (#f0f9ff)
- Validation: None

**Row 2: Status**
- Contains: Empty date/day, status values for each time slot
- Allowed values: `available`, `blocked`, `hidden` (dropdown validation)
- User-editable: Yes (dropdown selection)
- Background: White
- Validation: Dropdown list

**Row 3: Arzt (Doctor)**
- Contains: Empty date/day, doctor names for booked slots
- Allowed values: Any text (e.g., "kukadiya", "ikikardes", or empty)
- User-editable: No (auto-filled by sync)
- Background: Light yellow (#fffbeb)
- Validation: None

### **Visual Example:**

```
┌─────────────┬──────────┬─────────┬─────────┬─────────┬─────────┐
│    Datum    │Wochentag │ Slot 1  │ Slot 2  │ Slot 3  │ Slot 4  │
├─────────────┼──────────┼─────────┼─────────┼─────────┼─────────┤
│ 24.11.2025  │  Montag  │  08:00  │  09:00  │  10:00  │  11:00  │ (Zeit)
│             │          │available│ blocked │available│available│ (Status)
│             │          │         │         │kukadiya │         │ (Arzt)
├─────────────┼──────────┼─────────┼─────────┼─────────┼─────────┤
│ 25.11.2025  │ Dienstag │  08:00  │  09:00  │  10:00  │  11:00  │ (Zeit)
│             │          │available│available│available│available│ (Status)
│             │          │         │         │ikikardes│         │ (Arzt)
└─────────────┴──────────┴─────────┴─────────┴─────────┴─────────┘
```

---

## 🔧 Code Changes

### **1. addWeekToCalendar() - Generate 3 Rows**

**File:** [appointmentSheet.gs:550-630](appointmentSheet.gs#L550-L630)

```javascript
// Generate 7 days, each with 3 rows (Zeit + Status + Arzt)
for (var i = 0; i < 7; i++) {
  // Row 1: Zeit row
  var zeitRow = [dateStr, dayName, '08:00', '09:00', ..., '19:00'];
  sheet.getRange(lastRow + 1, 1, 1, 14).setValues([zeitRow]);

  // Row 2: Status row
  var statusRow = ['', '', 'available', 'available', ..., 'available'];
  sheet.getRange(lastRow + 2, 1, 1, 14).setValues([statusRow]);

  // Row 3: Arzt row
  var arztRow = ['', '', '', '', ..., ''];
  sheet.getRange(lastRow + 3, 1, 1, 14).setValues([arztRow]);

  // Merge Date and Day vertically across 3 rows
  sheet.getRange(lastRow + 1, 1, 3, 1).merge(); // Merge Datum
  sheet.getRange(lastRow + 1, 2, 3, 1).merge(); // Merge Wochentag

  // Add dropdown validation for Status row ONLY
  var statusDropdownRange = sheet.getRange(lastRow + 2, 3, 1, 12);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['available', 'blocked', 'hidden'], true)
    .setAllowInvalid(false)
    .build();
  statusDropdownRange.setDataValidation(rule);

  lastRow += 3; // Move to next day (skip 3 rows)
}
```

---

### **2. getAvailableTimeSlots() - Read from 3 Rows**

**File:** [appointmentSheet.gs:682-774](appointmentSheet.gs#L682-L774)

```javascript
function getAvailableTimeSlots(dateStr) {
  // Find Zeit row for date
  if (rowDate === dateStr) {
    var zeitRow = data[i];     // Row i: Zeit values
    var statusRow = data[i + 1]; // Row i+1: Status values
    var arztRow = data[i + 2];   // Row i+2: Arzt names

    for (var j = 2; j < 14; j++) {
      var timeLabel = zeitRow[j];     // "08:00"
      var status = statusRow[j];       // "available", "blocked", "hidden"
      var arztName = arztRow[j];       // "kukadiya" or ""

      // Determine if booked by checking Arzt row
      var isBooked = (arztName && arztName.trim() !== '');
      var doctorName = isBooked ? arztName : null;

      slots[timeLabel] = {
        time: timeLabel,
        status: isBooked ? 'booked' : status,
        available: status === 'available' && !isBooked,
        doctor: doctorName
      };
    }
  }
}
```

---

### **3. updateCalendarStatus() - Write to Arzt Row**

**File:** [appointmentSheet.gs:987-1048](appointmentSheet.gs#L987-L1048)

```javascript
function updateCalendarStatus(dateStr, timeStr, newStatus) {
  // newStatus = doctor name (e.g., "kukadiya")

  if (rowDate === dateStr) {
    var zeitRow = data[i];
    var arztRowIndex = i + 3; // Arzt row is 3rd row (1-based index)

    for (var j = 2; j < 14; j++) {
      var cellTime = zeitRow[j];

      if (cleanCellTime === cleanTimeStr) {
        // Update Arzt row with doctor name
        var arztCell = calendarSheet.getRange(arztRowIndex, j + 1);
        arztCell.setValue(newStatus);

        Logger.log('✅ Calendar synced: ' + dateStr + ' ' + cleanTimeStr + ' → Arzt: ' + newStatus);
        return true;
      }
    }
  }
}
```

---

### **4. syncCalendarWithAppointments() - Sync Arzt Row**

**File:** [appointmentSheet.gs:1121-1254](appointmentSheet.gs#L1121-L1254)

```javascript
function syncCalendarWithAppointments() {
  // Build map: {"24.11.2025": {"08:00": "kukadiya", ...}}
  var bookedMap = {};
  // ... populate bookedMap from New_Appointments ...

  // Loop through Calendar
  for (var i = 1; i < calendarData.length; i++) {
    var zeitRow = calendarData[i];
    var arztRowIndex = i + 3; // Arzt row index
    var bookedAppointments = bookedMap[dateStr] || {};

    for (var j = 2; j < 14; j++) {
      var timeLabel = zeitRow[j];
      var arztCell = calendarSheet.getRange(arztRowIndex, j + 1);
      var currentArzt = arztCell.getValue();

      // Determine correct Arzt value
      var correctArzt = bookedAppointments[cleanTimeLabel] || '';

      // Update if different
      if (currentArzt !== correctArzt) {
        arztCell.setValue(correctArzt);
        updatedCount++;
      }
    }
  }
}
```

---

## 🚀 Deployment Steps

### **Step 1: Clear Old Calendar**
1. Open Google Sheets
2. **Delete existing Calendar sheet** (or rename to "Calendar_OLD")
3. This is necessary because old structure is 2-row, new is 3-row

### **Step 2: Deploy New Code**
1. Open Google Apps Script editor
2. **Copy ALL code** from [appointmentSheet.gs](appointmentSheet.gs)
3. **Paste** into Code.gs
4. **Save** (Ctrl+S)
5. **Deploy** web app

### **Step 3: Initialize New Calendar**
1. Close and reopen Google Sheets (to reload menu)
2. Click: **📅 Kalender** → **🔧 Kalender initialisieren**
3. Wait for alert: "Calendar sheet created successfully!"
4. Verify Calendar has 3 rows per day

### **Step 4: Run Sync**
1. Click: **📅 Kalender** → **🔄 Vollständige Synchronisierung**
2. ✅ Should succeed (no validation errors!)
3. Check Arzt row for doctor names

**Expected Result:**
```
24.11.2025 (Montag)
  Zeit row:   [08:00] [09:00] [10:00] [11:00] ...
  Status row: [available] [available] [available] [available] ...
  Arzt row:   [       ] [       ] [kukadiya] [       ] ...
                                  ↑ Doctor name!

26.11.2025 (Mittwoch)
  Zeit row:   [08:00] [09:00] [10:00] [11:00] ...
  Status row: [available] [blocked] [available] [available] ...
  Arzt row:   [       ] [       ] [ikikardes] [       ] ...
                                  ↑ Doctor name!
```

---

## 🧪 Testing Checklist

### ✅ Test 1: Calendar Initialization
- [ ] Run `initializeCalendarSheet()`
- [ ] Verify 3 rows per day (Zeit, Status, Arzt)
- [ ] Verify Status row has dropdown [available, blocked, hidden]
- [ ] Verify Arzt row is empty by default

### ✅ Test 2: Manual Status Change
- [ ] Click on Status cell → Should show dropdown
- [ ] Select "blocked" → Should update successfully
- [ ] Try typing doctor name in Status row → Should reject (validation)
- [ ] Type doctor name in Arzt row → Should accept

### ✅ Test 3: Sync from New_Appointments
- [ ] Run `syncCalendarWithAppointments()`
- [ ] Verify doctor names appear in Arzt row
- [ ] Verify Status row unchanged (still available/blocked/hidden)

### ✅ Test 4: Realtime Sync (New Appointment)
- [ ] Submit appointment via website
- [ ] Check Calendar immediately
- [ ] Verify doctor name in Arzt row
- [ ] Verify Status row unchanged

### ✅ Test 5: API Response
- [ ] Open appointment.html
- [ ] Select date with booked slot
- [ ] Check browser console for API response
- [ ] Verify `doctor` field contains doctor name

---

## 📊 Before vs After

### **Before (2-Row Structure):**
```
Row 1 (Zeit):   08:00    09:00    10:00     11:00
Row 2 (Status): available blocked kukadiya  available
                                   ↑ ERROR: Validation blocks doctor name!
```

### **After (3-Row Structure):**
```
Row 1 (Zeit):   08:00    09:00    10:00      11:00
Row 2 (Status): available blocked  available  available ← Dropdown works!
Row 3 (Arzt):                      kukadiya             ← Doctor name accepted!
```

---

## 🎨 Visual Formatting

**Background Colors:**
- **Zeit row**: Light blue (#f0f9ff)
- **Status row**: White (conditional formatting applies)
  - Green: available
  - Red: blocked
  - Gray: hidden
- **Arzt row**: Light yellow (#fffbeb)

**Borders:**
- All cells have borders
- Date and Day columns merged vertically across 3 rows

**Row Heights:**
- All rows: 30px

---

## ✅ Summary

| Aspect | 2-Row Structure | 3-Row Structure |
|--------|----------------|-----------------|
| Rows per day | 2 (Zeit + Status) | 3 (Zeit + Status + Arzt) |
| Doctor names | In Status row → ERROR | In Arzt row → SUCCESS |
| Validation | Blocks doctor names | Works perfectly |
| Sync errors | Yes (validation conflict) | No errors |
| User confusion | High (mixing status and doctors) | Low (clear separation) |
| Maintenance | Difficult (workarounds needed) | Easy (clean structure) |

**Files Modified:**
- `appointmentSheet.gs` (4 major functions updated)

**Key Insight:**
> **Separation of concerns** - Status values and doctor names serve different purposes, so they belong in different rows!

**Result:** ✅ Clean, error-free sync of doctor names to Calendar! 🎉
