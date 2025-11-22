# Google Apps Script - Appointment System Documentation

## 📚 Tổng quan

Hệ thống quản lý lịch hẹn với Google Sheets làm backend, hỗ trợ:
- ✅ **POST**: Gửi lịch hẹn mới vào Google Sheets
- ✅ **GET**: Truy vấn lịch hẹn đã đặt theo bác sĩ
- ✅ **Đa ngôn ngữ**: German, English, Vietnamese, Russian, Arabic
- ✅ **Visual indicators**: Slots đã đặt hiển thị màu xám, gạch ngang
- ✅ **Real-time query**: Fetch appointments khi chọn bác sĩ

---

## 📖 Tài liệu hướng dẫn

### 1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Hướng dẫn cài đặt đầy đủ
**Nội dung:**
- Bước 1-6: Cài đặt Google Sheets và Apps Script từ đầu
- API Endpoints: POST và GET với examples
- Testing: Browser và Postman
- Troubleshooting: Các lỗi thường gặp

**Khi nào đọc:**
- Lần đầu setup hệ thống
- Cần test API endpoints
- Gặp lỗi deployment

---

### 2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Quy trình re-deploy
**Nội dung:**
- Quy trình 3 bước: Save → Deploy → Verify
- Checklist sau mỗi lần sửa code
- Troubleshooting deployment issues
- Best practices

**Khi nào đọc:**
- Sau khi sửa code trong `appointmentSheet.gs`
- Deployment không hoạt động đúng
- Cần rollback về version cũ

---

### 3. **[APPOINTMENT_QUERY_GUIDE.md](APPOINTMENT_QUERY_GUIDE.md)** - Tính năng query lịch hẹn
**Nội dung:**
- Luồng hoạt động GET API
- Parameters và response format
- Frontend implementation details
- Visual indicators
- Performance optimization

**Khi nào đọc:**
- Hiểu cách query appointments hoạt động
- Customize visual indicators
- Debug date matching issues
- Optimize performance

---

### 4. **[EFFECTS_DOCUMENTATION.md](EFFECTS_DOCUMENTATION.md)** - Hiệu ứng nút và animations
**Nội dung:**
- 7 trạng thái của nút "Gửi đi"
- CSS animations chi tiết
- Status message box
- Đa ngôn ngữ cho effects

**Khi nào đọc:**
- Customize button effects
- Debug animation issues
- Add new animations
- Thay đổi màu sắc

---

## 🚀 Quick Start

### Setup lần đầu
```bash
1. Đọc SETUP_GUIDE.md → Follow Bước 1-4
2. Copy code từ appointmentSheet.gs → Apps Script Editor
3. Deploy → Copy Web App URL
4. Update URL trong appointment.html
5. Test theo Bước 5-6 trong SETUP_GUIDE.md
```

### Sau khi sửa code
```bash
1. Đọc DEPLOYMENT_CHECKLIST.md
2. Save code (Ctrl+S)
3. Deploy → Manage deployments → Edit → New version → Deploy
4. Test lại endpoints
```

---

## 📡 API Reference

### **POST - Save appointment**
```bash
POST https://script.google.com/macros/s/YOUR_ID/exec
Content-Type: application/json

{
  "symptom": "Zahnschmerzen",
  "doctor": "Dr. Kukadiya",
  "date": "22.11.2025",
  "time": "08:00",
  "description": "Starke Schmerzen seit 3 Tagen",
  "language": "de"
}
```

### **GET - Query appointments**
```bash
GET https://script.google.com/macros/s/YOUR_ID/exec?doctor=Kukadiya&fromDate=20.11.2025&toDate=30.11.2025
```

**Response:**
```json
{
  "status": "success",
  "doctor": "Kukadiya",
  "appointments": [
    {
      "timestamp": "2025-11-20T14:30:00.000Z",
      "symptom": "Zahnschmerzen",
      "doctor": "Dr. Kukadiya",
      "date": "22.11.2025",
      "time": "08:00",
      "description": "Starke Schmerzen seit 3 Tagen",
      "language": "de"
    }
  ],
  "count": 1
}
```

---

## 🎨 Visual System

### Available Slot (Còn trống)
- Background: Teal gradient `#14b8a6 → #0d9488`
- Text: White
- Cursor: Pointer
- Clickable: ✅

### Booked Slot (Đã đặt)
- Background: Gray gradient `#e5e7eb → #d1d5db`
- Text: Gray `#6b7280` with line-through
- Label: `✓ Gebucht`
- Cursor: not-allowed
- Clickable: ❌

---

## 🔧 Files Structure

```
google-apps-script/
├── appointmentSheet.gs           # Backend API code
├── README.md                     # This file
├── SETUP_GUIDE.md               # Complete setup instructions
├── DEPLOYMENT_CHECKLIST.md      # Re-deploy workflow
├── APPOINTMENT_QUERY_GUIDE.md   # Query feature details
└── EFFECTS_DOCUMENTATION.md     # Button effects & animations

Web/pages/
└── appointment.html              # Frontend booking page

Web/js/
└── service-translations.js       # Multilingual translations
```

---

## 🐛 Troubleshooting Quick Links

| Vấn đề | Xem tài liệu | Section |
|--------|--------------|---------|
| Test 5.2 trả về `"status":"online"` | [SETUP_GUIDE.md](SETUP_GUIDE.md) | Test 5.2 troubleshooting |
| Deployment không update | [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Quy trình Re-deploy |
| Slots hiển thị sai | [APPOINTMENT_QUERY_GUIDE.md](APPOINTMENT_QUERY_GUIDE.md) | Troubleshooting |
| Button animation không hoạt động | [EFFECTS_DOCUMENTATION.md](EFFECTS_DOCUMENTATION.md) | Technical Implementation |
| Lỗi `\n` characters | [SETUP_GUIDE.md](SETUP_GUIDE.md) | Notes section |

---

## 📝 Version History

### Version 1.2 (2025-11-20)
- ✅ Added GET endpoint for appointment queries
- ✅ Visual indicators for booked slots
- ✅ Date range filtering
- ✅ Fixed \n character display bug
- ✅ Complete documentation suite

### Version 1.1 (2025-11-19)
- ✅ Button effects with 7 states
- ✅ Status message box
- ✅ Multilingual support (5 languages)

### Version 1.0 (2025-11-18)
- ✅ Initial POST endpoint
- ✅ Google Sheets integration
- ✅ Basic booking form

---

## 🎯 Common Tasks

### Task 1: Test API hoạt động
```bash
# Step 1: Test status
curl "https://script.google.com/macros/s/YOUR_ID/exec"

# Expected: {"status":"online",...}

# Step 2: Test query
curl "https://script.google.com/macros/s/YOUR_ID/exec?doctor=Test"

# Expected: {"status":"success","doctor":"Test","appointments":[],"count":0}
```

### Task 2: Sửa code và re-deploy
```bash
1. Open Apps Script Editor
2. Edit code in appointmentSheet.gs
3. Save (Ctrl+S)
4. Deploy > Manage deployments > Edit > New version > Deploy
5. Test lại URL
```

### Task 3: Debug date matching
```javascript
// In browser console when testing appointment.html
console.log('Booked appointments:', bookedAppointments);
console.log('Checking date:', formatDate(currentDate) + '.2025');
console.log('Is booked:', isSlotBooked(currentDate, '08:00'));
```

---

## 🔗 Liên hệ & Support

**Dự án:** Digitized Brains - Appointment Booking System
**Tác giả:** Claude Code
**Ngày tạo:** 2025-11-20
**Version:** 1.2

**Issues:** Nếu gặp vấn đề, tham khảo:
1. [SETUP_GUIDE.md](SETUP_GUIDE.md) → Troubleshooting section
2. [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) → Common deployment scenarios
3. [APPOINTMENT_QUERY_GUIDE.md](APPOINTMENT_QUERY_GUIDE.md) → Troubleshooting section

---

**Chúc bạn setup thành công! 🚀**
