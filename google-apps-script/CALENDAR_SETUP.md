# Calendar Sheet Setup Guide

## 📋 Overview

Calendar sheet quản lý khung giờ làm việc theo tuần với 11 time slots mỗi ngày (8:00 - 18:00). Người dùng có thể tự cấu hình các khung giờ available/blocked/booked trực tiếp trong Google Sheets.

## 🚀 Setup Steps

### Step 1: Deploy Apps Script

1. Mở Google Sheet của bạn
2. Go to **Extensions > Apps Script**
3. Copy toàn bộ code từ `appointmentSheet.gs`
4. **Save** (Ctrl+S)
5. **Deploy > New deployment** hoặc **Manage deployments > Edit > New version**

### Step 2: Tạo Calendar Sheet

Có 2 cách:

#### Option A: Chạy function trong Apps Script
```javascript
// Trong Apps Script Editor, chọn function "initializeCalendarSheet"
// Click "Run" button
```

#### Option B: Gọi qua URL
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=initCalendar
```

### Step 3: Verify Calendar Sheet

Sau khi chạy, bạn sẽ thấy sheet mới tên "Calendar" với:

| Datum / Date | Wochentag / Day | 08:00 | 09:00 | 10:00 | ... | 18:00 |
|--------------|-----------------|-------|-------|-------|-----|-------|
| 23.11.2025   | Samstag         | available | available | available | ... | available |
| 24.11.2025   | Sonntag         | available | available | available | ... | available |
| ...          | ...             | ...   | ...   | ...   | ... | ...   |

## 🎨 Time Slot Status

Có 3 trạng thái cho mỗi time slot:

### 1. **available** (Xanh lá - Available)
- Màu nền: Light green `#d1fae5`
- Chữ: Dark green `#065f46`
- Ý nghĩa: Khung giờ trống, bệnh nhân có thể đặt

### 2. **blocked** (Đỏ - Blocked)
- Màu nền: Light red `#fee2e2`
- Chữ: Dark red `#991b1b`
- Ý nghĩa: Khung giờ đã bị khóa, không cho phép đặt lịch

### 3. **booked** (Vàng - Booked)
- Màu nền: Light yellow `#fef3c7`
- Chữ: Dark brown `#92400e`
- Ý nghĩa: Khung giờ đã được đặt bởi bệnh nhân

## 📝 Cách sử dụng

### Để chặn một khung giờ (Block time):
```
1. Mở Calendar sheet
2. Tìm ngày và giờ muốn block
3. Thay "available" thành "blocked"
4. Cell sẽ tự động chuyển màu đỏ
```

### Để đánh dấu đã đặt (Mark as booked):
```
1. Tìm ngày và giờ đã được đặt
2. Thay "available" thành "booked"
3. Cell sẽ tự động chuyển màu vàng
```

### Để mở lại khung giờ (Make available):
```
1. Tìm cell đã block hoặc booked
2. Thay lại thành "available"
3. Cell sẽ chuyển màu xanh lá
```

## 🔗 API Endpoints

### Get time slots for a specific date:
```
GET https://script.google.com/macros/s/YOUR_ID/exec?action=getTimeSlots&date=23.11.2025
```

**Response:**
```json
{
  "status": "success",
  "date": "23.11.2025",
  "dayName": "Samstag",
  "slots": {
    "08:00": {
      "time": "08:00",
      "status": "available",
      "available": true
    },
    "09:00": {
      "time": "09:00",
      "status": "blocked",
      "available": false
    },
    "10:00": {
      "time": "10:00",
      "status": "booked",
      "available": false
    },
    ...
  }
}
```

## 📊 Calendar Structure

```
Column A: Datum / Date (DD.MM.YYYY)
Column B: Wochentag / Day (Montag, Dienstag, ...)
Column C-M: Time slots (08:00 - 18:00)
  - Column C: 08:00
  - Column D: 09:00
  - Column E: 10:00
  - Column F: 11:00
  - Column G: 12:00
  - Column H: 13:00
  - Column I: 14:00
  - Column J: 15:00
  - Column K: 16:00
  - Column L: 17:00
  - Column M: 18:00
```

## 🔄 Auto-Refresh Calendar

Calendar được tạo với 14 ngày (2 tuần) bắt đầu từ hôm nay. Để update calendar với ngày mới:

1. Chạy lại `initializeCalendarSheet()` function
2. Hoặc tạo trigger tự động chạy hàng tuần:
   ```
   Apps Script > Triggers > Add Trigger
   - Function: initializeCalendarSheet
   - Event: Time-driven
   - Type: Week timer
   - Day: Monday
   - Time: 00:00 - 01:00
   ```

## ⚠️ Important Notes

1. **Date Format**: Luôn dùng format `DD.MM.YYYY` (e.g., `23.11.2025`)
2. **Time Format**: Luôn dùng format `HH:00` (e.g., `08:00`, `14:00`)
3. **Case Sensitive**: Status phải viết thường: `available`, `blocked`, `booked`
4. **Conditional Formatting**: Đã được setup tự động, không cần config thêm
5. **Re-deployment**: Sau khi sửa code, nhớ re-deploy với **New version**

## 🐛 Troubleshooting

### Calendar sheet không hiển thị?
→ Chạy lại `initializeCalendarSheet()` trong Apps Script

### Màu sắc không đổi?
→ Check xem text có đúng `available`, `blocked`, `booked`, `ẩn` (lowercase)

### API trả về "Calendar sheet not found"?
→ Sheet phải có tên chính xác là "Calendar" (có C viết hoa)

### Time slots không load trong appointment.html?
→ Check deployment ID có đúng trong `GOOGLE_SHEET_URL` không

### Lỗi khi thêm tuần mới (addNextWeek)?
→ Xem logs để debug:
1. Apps Script > View > Logs (hoặc Ctrl+Enter)
2. Check xem ngày cuối cùng có format đúng DD.MM.YYYY không
3. Đảm bảo row cuối cùng có dữ liệu ngày hợp lệ

### TypeError: Cannot read properties of undefined?
→ Code đã được cập nhật với validation. Nếu vẫn lỗi:
1. Check Apps Script logs để xem error message chi tiết
2. Verify rằng Calendar sheet có ít nhất 1 tuần dữ liệu
3. Thử chạy lại `initializeCalendarSheet()` để reset

## 📞 Support

Nếu có vấn đề, check:
1. Apps Script logs: View > Logs
2. Execution history: Apps Script > Executions
3. Sheet name phải là "Calendar" (case-sensitive)
