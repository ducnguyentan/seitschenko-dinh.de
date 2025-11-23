# Calendar Synchronization Guide

## 📋 Tổng quan

Hệ thống tự động đồng bộ dữ liệu giữa:
- **New_Appointments sheet**: Lưu trữ thông tin appointments đã book
- **Calendar sheet**: Hiển thị time slots với status (available, booked, blocked, hidden)
- **appointment.html**: Frontend hiển thị calendar cho patients

## 🔄 Cơ chế đồng bộ

### 1. Automatic Sync (Realtime)

**Khi nào:** User book appointment qua website

**Workflow:**
```
User clicks time slot → appointment.html → doPost() → New_Appointments
                                              ↓
                                    updateCalendarStatus()
                                              ↓
                                      Calendar sheet updated
```

**Code location:** [appointmentSheet.gs:127-136](appointmentSheet.gs#L127-L136)

```javascript
// 🔄 SYNC: Update Calendar status to "booked"
if (date && date !== '-' && time && time !== '-') {
  Logger.log('🔄 Syncing Calendar: ' + date + ' ' + time);
  var syncSuccess = updateCalendarStatus(date, time, 'booked');
  if (syncSuccess) {
    Logger.log('✅ Calendar synchronized successfully');
  } else {
    Logger.log('⚠️ Calendar sync failed (date/time not found in Calendar)');
  }
}
```

### 2. Cross-Check on API Request

**Khi nào:** appointment.html gọi API để lấy time slots

**Workflow:**
```
appointment.html → getAvailableTimeSlots(date) → Read Calendar sheet
                                                         ↓
                                              getBookedTimesForDate(date)
                                                         ↓
                                              Compare & override status
                                                         ↓
                                              Return accurate slots
```

**Code location:** [appointmentSheet.gs:668-694](appointmentSheet.gs#L668-L694)

```javascript
// 🔍 CROSS-CHECK: Get booked times from New_Appointments for accuracy
var bookedTimes = getBookedTimesForDate(dateStr);

// 🔍 CROSS-CHECK: Override status if time is booked in New_Appointments
if (bookedTimes.indexOf(timeLabel) !== -1) {
  status = 'booked';
  Logger.log('✅ Cross-check override: ' + timeLabel + ' → booked');
}
```

**Lợi ích:** Đảm bảo accuracy ngay cả khi Calendar chưa được sync

### 3. Manual Full Sync

**Khi nào:** Admin muốn sync toàn bộ Calendar với New_Appointments

**Cách dùng:**
1. Mở Google Sheet
2. Click menu **📅 Kalender** > **🔄 Vollständige Synchronisierung**
3. Chờ sync hoàn tất (sẽ hiển thị số slots đã update)

**Code location:** [appointmentSheet.gs:1028-1147](appointmentSheet.gs#L1028-L1147)

**Tính năng:**
- Scan toàn bộ New_Appointments để build booking map
- Update tất cả Calendar slots cho đúng status
- **Giữ nguyên** manually set statuses (blocked, hidden)
- Chỉ update `available` ↔ `booked`

## 📊 Status Priority

Khi sync, status được quyết định theo thứ tự:

1. **booked** - Có appointment trong New_Appointments → `booked`
2. **blocked** - Manually set bởi admin → Giữ nguyên `blocked`
3. **hidden** - Manually set bởi admin → Giữ nguyên `hidden`
4. **available** - Không có appointment → `available`

## 🛠️ Functions Reference

### `updateCalendarStatus(dateStr, timeStr, newStatus)`

**Mục đích:** Update status của 1 time slot trong Calendar

**Parameters:**
- `dateStr` (string): Date in DD.MM.YYYY format (e.g., "24.11.2025")
- `timeStr` (string): Time in HH:MM format (e.g., "14:00")
- `newStatus` (string): New status - "available", "blocked", "booked", "hidden"

**Returns:** `true` if success, `false` if date/time not found

**Example:**
```javascript
updateCalendarStatus("24.11.2025", "14:00", "booked");
// → Updates Calendar: 24.11.2025 14:00 status to "booked"
```

**Code location:** [appointmentSheet.gs:899-957](appointmentSheet.gs#L899-L957)

---

### `getBookedTimesForDate(dateStr)`

**Mục đích:** Lấy danh sách tất cả time slots đã booked cho một date

**Parameters:**
- `dateStr` (string): Date in DD.MM.YYYY format

**Returns:** Array of time strings (e.g., `["08:00", "14:00", "16:00"]`)

**Example:**
```javascript
var bookedTimes = getBookedTimesForDate("24.11.2025");
// → ["08:00", "14:00", "16:00"]
```

**Code location:** [appointmentSheet.gs:966-1021](appointmentSheet.gs#L966-L1021)

---

### `syncCalendarWithAppointments()`

**Mục đích:** Manual full sync - Update toàn bộ Calendar based on New_Appointments

**Parameters:** None

**Returns:** Message string with number of updated slots

**Example:**
```javascript
syncCalendarWithAppointments();
// → "Sync complete: 12 slots updated"
```

**Code location:** [appointmentSheet.gs:1028-1147](appointmentSheet.gs#L1028-L1147)

**Access:** Menu **📅 Kalender** > **🔄 Vollständige Synchronisierung**

## 🔍 Troubleshooting

### Calendar không sync sau khi book appointment

**Nguyên nhân:** Code chưa deploy hoặc date/time format không khớp

**Giải pháp:**
1. Check Apps Script logs: **View** > **Logs**
2. Tìm log: `🔄 Syncing Calendar: ...`
3. Nếu thấy `⚠️ Calendar sync failed`, check:
   - Date format đúng DD.MM.YYYY không?
   - Time format đúng HH:MM không?
   - Date có tồn tại trong Calendar sheet không?
4. Chạy manual sync: **📅 Kalender** > **🔄 Vollständige Synchronisierung**

### Website vẫn hiển thị slot available dù đã booked

**Nguyên nhân:** Browser cache hoặc API response cũ

**Giải pháp:**
1. Hard refresh: `Ctrl + Shift + R` (hoặc `Cmd + Shift + R`)
2. Check Network tab trong DevTools:
   - Tìm request `?action=getTimeSlots&date=...`
   - Xem Response JSON
   - Check `status` của time slot đó
3. Nếu vẫn sai, check Apps Script logs để xem cross-check có hoạt động không

### Làm sao biết sync đã thành công?

**Cách kiểm tra:**

1. **Check Calendar sheet trực tiếp:**
   - Mở Google Sheet
   - Tìm date và time đã book
   - Xem Status row → Phải là `booked` (màu vàng)

2. **Check Apps Script Logs:**
   - Apps Script Editor > **View** > **Logs**
   - Tìm logs:
     ```
     🔄 Syncing Calendar: 24.11.2025 14:00
     ✅ Calendar synchronized successfully
     ```

3. **Check API response:**
   - Open appointment.html
   - F12 > Network tab
   - Reload page
   - Click vào request `getTimeSlots`
   - Check Response:
     ```json
     {
       "status": "success",
       "slots": {
         "14:00": {
           "time": "14:00",
           "status": "booked",
           "available": false
         }
       }
     }
     ```

## 📝 Best Practices

### Để đảm bảo sync hoạt động tốt:

1. **Luôn deploy code mới sau khi sửa:**
   - Save > Deploy > Manage deployments > Edit > New version

2. **Test sync sau khi deploy:**
   - Book 1 test appointment qua website
   - Check Calendar sheet ngay lập tức
   - Verify status đã chuyển sang `booked`

3. **Chạy manual sync định kỳ:**
   - Mỗi tuần chạy **🔄 Vollständige Synchronisierung**
   - Đảm bảo data consistency

4. **Không manually edit New_Appointments:**
   - Nếu cần sửa date/time, update cả Calendar
   - Hoặc delete appointment và chạy sync

5. **Check logs thường xuyên:**
   - Nếu user báo lỗi, check Apps Script logs trước
   - Logs sẽ cho biết chính xác vấn đề ở đâu

## 🎯 Summary

| Feature | When | How | Auto/Manual |
|---------|------|-----|-------------|
| Realtime sync | Book appointment | `doPost()` calls `updateCalendarStatus()` | ✅ Automatic |
| Cross-check | Load calendar | `getAvailableTimeSlots()` calls `getBookedTimesForDate()` | ✅ Automatic |
| Full sync | Admin request | Menu > Vollständige Synchronisierung | ⚙️ Manual |

**✅ Kết luận:**
- Automatic sync đảm bảo Calendar luôn up-to-date khi có booking mới
- Cross-check đảm bảo API response luôn accurate
- Manual sync là safety net khi cần fix inconsistencies
