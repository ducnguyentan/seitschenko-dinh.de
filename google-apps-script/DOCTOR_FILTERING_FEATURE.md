# Doctor Filtering Feature - Calendar Display Logic

**Date Implemented:** 2025-11-23

## 🎯 Feature Overview

Calendar slots are now **dynamically filtered** based on doctor selection:
- ❌ **No doctor selected** → Hide all booked slots (show only available/blocked)
- ✅ **Doctor selected** → Show only that doctor's booked slots + available/blocked

This prevents patients from seeing other doctors' appointments when booking.

---

## 📊 Filtering Logic

### **User Experience Flow:**

1. **Initial State (No Doctor Selected):**
   - Calendar shows: `available` (green), `blocked` (red)
   - Calendar hides: All `booked` slots (regardless of doctor)
   - Reason: User hasn't chosen a doctor yet

2. **After Selecting Doctor (e.g., "kukadiya"):**
   - Calendar shows: `available` (green), `blocked` (red), `booked by kukadiya` (yellow)
   - Calendar hides: `booked by ikikardes`, `booked by taifour`, etc.
   - Reason: User only needs to see their selected doctor's availability

---

## 🔧 Implementation Details

### **Frontend Filtering (appointment.html)**

**File:** [appointment.html:1457-1505](appointment.html#L1457-L1505)

**Changes:**

#### Before (No Filtering):
```javascript
Object.values(calendarSlots).forEach(slotData => {
  const time = slotData.time;
  const status = slotData.status; // 'available', 'blocked', 'booked'

  if (status === 'booked') {
    // Show all booked slots (no filtering)
    slot.innerHTML = `...booked...`;
  }
  slotsGrid.appendChild(slot);
});
```

#### After (With Filtering):
```javascript
Object.values(calendarSlots).forEach(slotData => {
  const time = slotData.time;
  const status = slotData.status; // 'available', 'blocked', 'booked'
  const doctorName = slotData.doctor; // null if available, doctor name if booked

  // 🔍 FILTER LOGIC: Hide booked slots based on doctor selection
  if (status === 'booked') {
    // No doctor selected → Hide all booked slots
    if (!selectedDoctor) {
      return; // Skip rendering this booked slot
    }

    // Doctor selected → Show only selected doctor's booked slots
    if (doctorName !== selectedDoctor) {
      return; // Skip rendering other doctors' booked slots
    }
  }

  // Render slot (only if passed filtering)
  if (status === 'booked') {
    slot.innerHTML = `...booked...`;
  } else if (status === 'blocked') {
    slot.innerHTML = `...blocked...`;
  } else {
    slot.innerHTML = `...available...`;
  }
  slotsGrid.appendChild(slot);
});
```

---

## 📱 API Integration

### **Backend Already Provides Doctor Field**

**API Response Structure:** (from getAvailableTimeSlots())

```json
{
  "status": "success",
  "date": "24.11.2025",
  "dayName": "Montag",
  "slots": {
    "08:00": {
      "time": "08:00",
      "status": "available",
      "available": true,
      "doctor": null
    },
    "09:00": {
      "time": "09:00",
      "status": "blocked",
      "available": false,
      "doctor": null
    },
    "10:00": {
      "time": "10:00",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"  // ← Frontend uses this to filter
    },
    "10:30": {
      "time": "10:30",
      "status": "booked",
      "available": false,
      "doctor": "ikikardes"  // ← Different doctor
    }
  }
}
```

**Key Points:**
- ✅ `doctor` field is `null` for available/blocked slots
- ✅ `doctor` field contains doctor name for booked slots (e.g., `"kukadiya"`)
- ✅ Frontend compares `slotData.doctor` with `selectedDoctor` variable

---

## 🧪 Testing Scenarios

### **Test 1: No Doctor Selected**

**Steps:**
1. Open appointment.html
2. Do NOT select a doctor
3. View calendar

**Expected Result:**
```
24.11.2025 (Montag)
[08:00 Available] [09:00 Blocked] [11:00 Available] [14:00 Available]
```
- ❌ 10:00 (booked by kukadiya) → HIDDEN
- ❌ 10:30 (booked by ikikardes) → HIDDEN

**Actual Behavior:**
- Only available and blocked slots visible
- No booked slots shown

---

### **Test 2: Doctor "kukadiya" Selected**

**Steps:**
1. Open appointment.html
2. Select "Zahnärztin Dr. Kukadiya" from dropdown
3. View calendar

**Expected Result:**
```
24.11.2025 (Montag)
[08:00 Available] [09:00 Blocked] [10:00 ✓ Gebucht] [11:00 Available] [14:00 Available]
```
- ✅ 10:00 (booked by kukadiya) → VISIBLE (yellow)
- ❌ 10:30 (booked by ikikardes) → HIDDEN

**Actual Behavior:**
- Available and blocked slots visible
- Only kukadiya's booked slots visible
- Other doctors' booked slots hidden

---

### **Test 3: Switch Between Doctors**

**Steps:**
1. Select "kukadiya"
2. Observe calendar (shows kukadiya's bookings)
3. Switch to "ikikardes"
4. Observe calendar (shows ikikardes' bookings)

**Expected Result:**
- Calendar dynamically updates
- Only selected doctor's booked slots visible
- Available/blocked slots always visible

---

## 🔍 Technical Flow

### **1. User Selects Doctor**

**Function:** `selectDoctorFromDropdown(doctorId, name, location, avatar)`

**File:** [appointment.html:1700-1730](appointment.html#L1700-L1730)

```javascript
function selectDoctorFromDropdown(doctorId, name, location, avatar) {
  // Update selected doctor
  selectedDoctor = doctorId; // e.g., "kukadiya"

  // Update UI
  document.getElementById('selected-doctor-name').textContent = name;

  // Regenerate calendar with new filter
  generateCalendar();
}
```

---

### **2. Calendar Regenerates**

**Function:** `generateCalendar()`

**File:** [appointment.html:1400-1503](appointment.html#L1400-L1503)

```javascript
async function generateCalendar() {
  // Fetch time slots from Google Sheets
  const calendarSlots = await fetchTimeSlotsFromCalendar(dateStrFull);

  // Loop through slots
  Object.values(calendarSlots).forEach(slotData => {
    const doctorName = slotData.doctor; // e.g., "kukadiya"

    // FILTERING HAPPENS HERE
    if (status === 'booked') {
      if (!selectedDoctor) return; // Hide all booked
      if (doctorName !== selectedDoctor) return; // Hide other doctors
    }

    // Render slot (only if passed filter)
    slotsGrid.appendChild(slot);
  });
}
```

---

### **3. API Provides Doctor Data**

**Function:** `getAvailableTimeSlots(dateStr)`

**File:** [appointmentSheet.gs:668-756](appointmentSheet.gs#L668-L756)

```javascript
function getAvailableTimeSlots(dateStr) {
  // ... fetch Calendar data ...

  // Cross-check with New_Appointments
  var bookedAppointments = getBookedAppointmentsForDate(dateStr);
  // bookedAppointments = {"10:00": "kukadiya", "10:30": "ikikardes"}

  // Build response with doctor field
  slots[timeLabel] = {
    time: timeLabel,
    status: isBooked ? 'booked' : status,
    available: !isBooked,
    doctor: doctorName // null or doctor name
  };

  return { status: 'success', date: dateStr, slots: slots };
}
```

---

## 🎨 Visual Examples

### **Example 1: No Doctor Selected**

**UI State:**
```
┌─────────────────────────────────────────┐
│  [Select a Doctor ▼]                    │
└─────────────────────────────────────────┘

Calendar:
┌─────────┬─────────┬─────────┬─────────┐
│ 08:00   │ 09:00   │ 11:00   │ 14:00   │
│ (green) │ (red)   │ (green) │ (green) │
└─────────┴─────────┴─────────┴─────────┘

(10:00 and 10:30 are HIDDEN because they are booked)
```

---

### **Example 2: Doctor "kukadiya" Selected**

**UI State:**
```
┌─────────────────────────────────────────┐
│  [Dr. Kukadiya ▼]                       │
└─────────────────────────────────────────┘

Calendar:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ 08:00   │ 09:00   │ 10:00   │ 11:00   │ 14:00   │
│ (green) │ (red)   │ (yellow)│ (green) │ (green) │
│         │         │ Gebucht │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┘

(10:00 is VISIBLE because booked by kukadiya)
(10:30 is HIDDEN because booked by ikikardes)
```

---

## 🚀 Deployment Checklist

### **Prerequisites:**
- ✅ Backend deployed (Google Apps Script with doctor assignment feature)
- ✅ API returns `doctor` field in response
- ✅ Frontend updated (appointment.html with filtering logic)

### **Steps to Deploy:**
1. Save appointment.html changes
2. Upload to web server
3. Test on live site:
   - No doctor selected → No booked slots visible
   - Select doctor → Only that doctor's booked slots visible
   - Switch doctors → Calendar updates correctly

---

## 📝 Summary

| Scenario | Available Slots | Blocked Slots | Booked Slots (kukadiya) | Booked Slots (ikikardes) |
|----------|----------------|---------------|-------------------------|--------------------------|
| No doctor selected | ✅ Show | ✅ Show | ❌ Hide | ❌ Hide |
| Doctor "kukadiya" selected | ✅ Show | ✅ Show | ✅ Show | ❌ Hide |
| Doctor "ikikardes" selected | ✅ Show | ✅ Show | ❌ Hide | ✅ Show |

**Files Modified:**
- `appointment.html` (1 change: filtering logic in generateCalendar())

**Backend Requirements:**
- ✅ API must return `doctor` field (already implemented in DOCTOR_ASSIGNMENT_FEATURE.md)

**Result:** ✅ Calendar dynamically filters booked slots based on doctor selection, improving user experience and preventing appointment confusion.
