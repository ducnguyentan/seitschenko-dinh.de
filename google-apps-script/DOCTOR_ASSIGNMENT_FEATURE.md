# Doctor Assignment Feature - Calendar với Tên Nha Sĩ

**Date Implemented:** 2025-11-23

## 🎯 Feature Overview

Calendar slots giờ hiển thị **tên nha sĩ** thay vì generic "booked" status. Điều này cho phép:
- ✅ Biết appointment nào thuộc về nha sĩ nào
- ✅ Filter calendar theo doctor trên website
- ✅ Hiển thị chỉ appointments của doctor được chọn

---

## 📊 Structure Changes

### **Before (Old System):**

**Calendar Status Values:**
- `available` - Slot trống
- `blocked` - Admin đã block
- `booked` - Đã book (không biết ai book)
- `hidden` - Ẩn khỏi website

**Problem:** Không biết appointment nào thuộc về nha sĩ nào!

---

### **After (New System):**

**Calendar Status Values:**
- `available` - Slot trống
- `blocked` - Admin đã block
- `hidden` - Ẩn khỏi website
- `Dr. Schmidt` - Booked by Dr. Schmidt
- `Dr. Nguyen` - Booked by Dr. Nguyen
- `kukadiya` - Booked by kukadiya (doctor name from form)

**Example Calendar:**
```
| Datum      | Wochentag | 08:00       | 09:00     | 10:00       | 11:00     |
|------------|-----------|-------------|-----------|-------------|-----------|
| 24.11.2025 | Montag    | blocked     | available | kukadiya    | available |
|            |           | (red)       | (green)   | (yellow)    | (green)   |
```

**Benefits:**
✅ Admin nhìn ngay biết slot nào thuộc về doctor nào
✅ Website có thể filter appointments theo doctor
✅ Conditional formatting vẫn hoạt động (yellow cho booked)

---

## 🔧 Implementation Details

### **1. Sync với Doctor Name trong doPost()**

**File:** [appointmentSheet.gs:150-172](appointmentSheet.gs#L150-L172)

**Before:**
```javascript
var syncSuccess = updateCalendarStatus(fullDate, time, 'booked');
```

**After:**
```javascript
// Use doctor name as status (instead of generic "booked")
var doctorStatus = doctor || 'booked';

Logger.log('🔄 Syncing Calendar: ' + fullDate + ' ' + time + ' → ' + doctorStatus);
var syncSuccess = updateCalendarStatus(fullDate, time, doctorStatus);
if (syncSuccess) {
  Logger.log('✅ Calendar synchronized successfully with doctor: ' + doctorStatus);
}
```

**How it works:**
1. Get `doctor` name from form data
2. Use doctor name as Calendar status
3. If doctor name empty → Fallback to `'booked'`
4. Update Calendar slot with doctor name

---

### **2. API trả về Doctor Info**

**File:** [appointmentSheet.gs:704-742](appointmentSheet.gs#L704-L742)

**New API Response Structure:**
```json
{
  "status": "success",
  "date": "24.11.2025",
  "dayName": "Montag",
  "slots": {
    "08:00": {
      "time": "08:00",
      "status": "blocked",
      "available": false,
      "doctor": null
    },
    "09:00": {
      "time": "09:00",
      "status": "available",
      "available": true,
      "doctor": null
    },
    "10:00": {
      "time": "10:00",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"  // ← NEW FIELD
    }
  }
}
```

**Changes:**
```javascript
// Determine if slot is booked (status is not available/blocked/hidden)
var isBooked = (status !== 'available' && status !== 'blocked' && status !== 'hidden');
var doctorName = isBooked ? status : null;

slots[timeLabel] = {
  time: timeLabel,
  status: isBooked ? 'booked' : status,  // Normalize to 'booked' for frontend
  available: status === 'available' && !isBooked,
  doctor: doctorName  // null if available, doctor name if booked
};
```

**Key Points:**
- `status` = `'booked'` (normalized for frontend compatibility)
- `doctor` = actual doctor name (`'kukadiya'`, `'Dr. Schmidt'`, etc.)
- Frontend có thể filter by doctor using `doctor` field

---

### **3. Cross-Check với Doctor Names**

**File:** [appointmentSheet.gs:1033-1089](appointmentSheet.gs#L1033-L1089)

**New Function:** `getBookedAppointmentsForDate(dateStr)`

**Returns:** `{"08:00": "Dr. Schmidt", "14:00": "Dr. Nguyen"}`

**Before:**
```javascript
function getBookedTimesForDate(dateStr) {
  // Returns: ["08:00", "14:00"] (no doctor info)
}
```

**After:**
```javascript
function getBookedAppointmentsForDate(dateStr) {
  // Returns: {"08:00": "Dr. Schmidt", "14:00": "Dr. Nguyen"}

  var COL_DOCTOR = 2;   // Column C: Arzt
  var COL_DATE = 5;     // Column F: Datum
  var COL_TIME = 6;     // Column G: Zeit

  for (var i = 1; i < data.length; i++) {
    var appointmentDoctor = row[COL_DOCTOR] ? row[COL_DOCTOR].trim() : '';
    var appointmentDate = row[COL_DATE] ? row[COL_DATE].trim() : '';
    var appointmentTime = row[COL_TIME] ? row[COL_TIME].trim() : '';

    if (appointmentDate === dateStr || appointmentDayMonth === searchDayMonth) {
      bookedAppointments[appointmentTime] = appointmentDoctor || 'booked';
    }
  }

  return bookedAppointments;
}
```

**Usage in getAvailableTimeSlots():**
```javascript
var bookedAppointments = getBookedAppointmentsForDate(dateStr);
// bookedAppointments = {"10:30": "kukadiya"}

if (bookedAppointments[timeLabel]) {
  doctorName = bookedAppointments[timeLabel];
  isBooked = true;
  Logger.log('✅ Cross-check override: ' + timeLabel + ' → ' + doctorName);
}
```

---

### **4. Full Sync với Doctor Names**

**File:** [appointmentSheet.gs:1115-1192](appointmentSheet.gs#L1115-L1192)

**Updated:** `syncCalendarWithAppointments()`

**Before:**
```javascript
var bookedMap = {};  // { "24.11.2025": ["08:00", "14:00"] }
bookedMap[dateStr].push(timeStr);

if (bookedTimes.indexOf(timeLabel) !== -1) {
  correctStatus = 'booked';
}
```

**After:**
```javascript
var bookedMap = {};  // { "24.11.2025": {"08:00": "Dr. Schmidt", "14:00": "Dr. Nguyen"} }
bookedMap[dateStr][timeStr] = doctorStr;

if (bookedAppointments[timeLabel]) {
  // Slot is booked → Set to doctor name
  correctStatus = bookedAppointments[timeLabel];
}
```

**How Sync Works:**
1. Build map: `{"24.11.2025": {"10:30": "kukadiya"}}`
2. Loop through Calendar slots
3. If slot booked → Set status to doctor name
4. If not booked + not blocked/hidden → Set to `'available'`

---

## 🎨 Conditional Formatting

**Calendar sheet vẫn có conditional formatting rules:**

| Status Value | Background | Font Color | Rule |
|--------------|------------|------------|------|
| `available` | Light green (#d1fae5) | Dark green (#065f46) | whenTextEqualTo('available') |
| `blocked` | Light red (#fee2e2) | Dark red (#991b1b) | whenTextEqualTo('blocked') |
| `hidden` | Light gray (#e5e7eb) | Dark gray (#6b7280) | whenTextEqualTo('hidden') |
| `kukadiya` | Light yellow (#fef3c7) | Dark brown (#92400e) | whenTextNotEqualTo('available', 'blocked', 'hidden') ← DEFAULT |

**Problem:** Doctor names không match any rule → Use default formatting

**Solution:** Conditional formatting rules áp dụng cho 3 values cụ thể (`available`, `blocked`, `hidden`). Tất cả values khác (doctor names) sẽ nhận default cell background (trắng).

**Future Enhancement:** Có thể thêm script-based formatting để highlight doctor names với màu vàng.

---

## 📱 Frontend Integration (appointment.html)

### **API Response có Doctor Field:**

```javascript
// Example API response
{
  "status": "success",
  "date": "24.11.2025",
  "slots": {
    "10:30": {
      "time": "10:30",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"
    }
  }
}
```

### **Filter by Doctor (Frontend Implementation Needed):**

```javascript
// Pseudo-code for frontend
function filterSlotsByDoctor(slots, selectedDoctor) {
  if (!selectedDoctor) {
    return slots; // Show all slots
  }

  var filteredSlots = {};
  for (var time in slots) {
    var slot = slots[time];

    // Show slot if:
    // 1. Available (not booked by anyone)
    // 2. Booked by selected doctor
    if (slot.available || slot.doctor === selectedDoctor) {
      filteredSlots[time] = slot;
    }
  }
  return filteredSlots;
}

// Usage
var selectedDoctor = "kukadiya";
var filteredSlots = filterSlotsByDoctor(response.slots, selectedDoctor);
// Result: Only shows available slots + slots booked by kukadiya
```

---

## 🧪 Testing

### **Test 1: Book Appointment với Doctor Name**

**Steps:**
1. Submit appointment form với:
   - Doctor: "kukadiya"
   - Date: "24.11"
   - Time: "10:30"

2. Check Apps Script Logs:
```
📅 Converted date format: 24.11 → 24.11.2025
🔄 Syncing Calendar: 24.11.2025 10:30 → kukadiya
✅ Calendar synced: 24.11.2025 10:30 → kukadiya
✅ Calendar synchronized successfully with doctor: kukadiya
```

3. Check Calendar Sheet:
   - Row 24.11.2025 → Column 10:30 → Status row = "kukadiya"
   - Background: Default (white) or need manual formatting

---

### **Test 2: API trả về Doctor Name**

**Request:**
```
GET ?action=getTimeSlots&date=24.11.2025
```

**Expected Response:**
```json
{
  "status": "success",
  "date": "24.11.2025",
  "dayName": "Montag",
  "slots": {
    "10:00": {
      "time": "10:00",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"
    },
    "10:30": {
      "time": "10:30",
      "status": "booked",
      "available": false,
      "doctor": "kukadiya"
    }
  }
}
```

---

### **Test 3: Full Sync với Doctor Names**

**Steps:**
1. Manually change Calendar slot from "kukadiya" → "available"
2. Run **📅 Kalender** > **🔄 Vollständige Synchronisierung**
3. Check logs:
```
✅ Updated: 24.11.2025 10:30: available → kukadiya
```
4. Verify Calendar slot = "kukadiya" again

---

## 🔍 Troubleshooting

### **Issue: Calendar slot vẫn hiển thị "booked" thay vì doctor name**

**Cause:** Code cũ chưa deploy

**Solution:**
1. Deploy code mới (với doctor assignment changes)
2. Delete existing appointments
3. Book lại appointment mới
4. Verify Calendar shows doctor name

---

### **Issue: API không trả về doctor field**

**Cause:** Code cũ đang chạy

**Solution:**
1. Deploy code mới
2. Clear browser cache
3. Test API again: `?action=getTimeSlots&date=24.11.2025`

---

### **Issue: Conditional formatting không đúng cho doctor names**

**Expected:** Doctor names nên có background màu vàng (như "booked")

**Current:** Doctor names có background trắng (default)

**Solution (Optional):**
Add script-based formatting in `addWeekToCalendar()`:
```javascript
// After setting status cell value
if (status !== 'available' && status !== 'blocked' && status !== 'hidden') {
  // This is a doctor name
  statusCell.setBackground('#fef3c7'); // Light yellow
  statusCell.setFontColor('#92400e');   // Dark brown
}
```

---

## 📝 Summary

| Feature | Before | After |
|---------|--------|-------|
| Calendar Status | `booked` (generic) | `kukadiya` (doctor name) |
| API Response | No doctor info | `doctor: "kukadiya"` field |
| Cross-check | `["08:00", "14:00"]` | `{"08:00": "Dr. Schmidt"}` |
| Full Sync | Sets to `'booked'` | Sets to doctor name |
| Frontend Filtering | Not possible | Can filter by doctor |

**Files Modified:**
- `appointmentSheet.gs` (4 changes)
  - doPost(): Use doctor name as status
  - getAvailableTimeSlots(): Add doctor field to response
  - getBookedAppointmentsForDate(): Return doctor names
  - syncCalendarWithAppointments(): Sync with doctor names

**Result:** ✅ Calendar giờ hiển thị tên nha sĩ, API trả về doctor info, có thể filter theo doctor trên website
