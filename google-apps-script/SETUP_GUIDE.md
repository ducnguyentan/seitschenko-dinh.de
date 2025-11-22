# Google Sheets Integration - Setup Guide

## Hướng dẫn tích hợp Google Sheets với Appointment Booking System

**Tính năng:**
- ✅ **Gửi lịch hẹn** (POST): Lưu thông tin đặt lịch vào Google Sheet
- ✅ **Truy vấn lịch hẹn** (GET): Hiển thị các slot đã đặt theo bác sĩ

---

## Bước 1: Tạo Google Sheet

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một Google Sheet mới
3. Đặt tên cho Sheet (ví dụ: "Digitized Brains - Appointment Bookings")
4. **Không cần tạo header thủ công** - Sheet sẽ tự động tạo header khi nhận dữ liệu đầu tiên

**Cấu trúc header tự động:**
| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| Zeitstempel / Timestamp | Symptom / Grund | Arzt / Doctor | Datum / Date | Zeit / Time | Beschreibung / Description | Sprache / Language |

---

## Bước 2: Cài đặt Google Apps Script

### 2.1. Mở Apps Script Editor
1. Trong Google Sheet, nhấp vào **Extensions** (Tiện ích mở rộng) > **Apps Script**
2. Một tab mới sẽ mở ra với Apps Script Editor

### 2.2. Copy code
1. Xóa toàn bộ code mặc định trong file `Code.gs`
2. Mở file `appointmentSheet.gs` từ project của bạn
3. Copy toàn bộ code (221 dòng)
4. Paste vào `Code.gs` trong Apps Script Editor
5. Nhấn **Save** (hoặc Ctrl+S)

### 2.3. Đặt tên project (tùy chọn)
1. Nhấp vào "Untitled project" ở góc trên bên trái
2. Đặt tên: "Appointment Booking API"
3. Nhấn OK

---

## Bước 3: Deploy Web App

### 3.1. Tạo deployment mới
1. Trong Apps Script Editor, nhấp vào **Deploy** > **New deployment**
2. Nhấp vào biểu tượng **bánh răng** (⚙️) bên cạnh "Select type"
3. Chọn **Web app**

### 3.2. Cấu hình deployment
Điền thông tin như sau:

| Trường | Giá trị | Mô tả |
|--------|---------|-------|
| **Description** | `Appointment API - POST & GET` | Mô tả deployment (tùy chọn) |
| **Execute as** | **Me (your email)** | Script chạy với quyền của bạn |
| **Who has access** | **Anyone** | Cho phép website gọi API |

⚠️ **Quan trọng:** Phải chọn "Anyone" để website có thể gọi API

### 3.3. Deploy
1. Nhấn nút **Deploy** (màu xanh)
2. Hệ thống sẽ yêu cầu xác nhận quyền

### 3.4. Authorize (Cấp quyền)
1. Nhấn **Authorize access**
2. Chọn tài khoản Google của bạn
3. Google sẽ cảnh báo "Google hasn't verified this app"
4. Nhấn **Advanced** (Nâng cao)
5. Nhấn **Go to [Project name] (unsafe)**
6. Nhấn **Allow** để cấp quyền:
   - See, edit, create, and delete your spreadsheets
   - Connect to an external service

### 3.5. Lấy Web App URL
1. Sau khi deploy thành công, một dialog sẽ hiện ra
2. **Copy Web App URL** (có dạng: `https://script.google.com/macros/s/AKfycby.../exec`)
3. Lưu URL này lại - bạn sẽ cần nó ở Bước 4

**Ví dụ URL:**
```
https://script.google.com/macros/s/AKfycbzmjZCo_A6TxfnjkniOG2AQnE_5A5Ja8Y49I2YUkdoozJZcuzBsndRMUwzdtzgVqlwTTg/exec
```

---

## Bước 4: Cập nhật appointment.html

### 4.1. Mở file appointment.html
Đường dẫn: `Web/pages/appointment.html`

### 4.2. Tìm và thay thế URL
1. Tìm dòng **1592** (hoặc search "GOOGLE_SHEET_URL"):
   ```javascript
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```

2. Thay thế `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` bằng Web App URL từ Bước 3.5

3. Kết quả:
   ```javascript
   const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzmjZCo_A6TxfnjkniOG2AQnE_5A5Ja8Y49I2YUkdoozJZcuzBsndRMUwzdtzgVqlwTTg/exec';
   ```

4. **Lưu file** (Ctrl+S)

⚠️ **Lưu ý:** Đảm bảo URL không có khoảng trắng thừa ở đầu/cuối

---

## Bước 5: Test API với Browser/Postman

### 5.1. Test GET Request (Truy vấn)
Mở trình duyệt và nhập URL:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**Kết quả mong đợi:**
```json
{
  "status": "online",
  "message": "Appointment receiver is active. Use ?doctor=NAME to query appointments."
}
```

✅ Nếu thấy response trên → API đã hoạt động!

### 5.2. Test GET với tham số doctor
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?doctor=Kukadiya
```

**⚠️ Nếu thấy `"status":"online"` thay vì `"status":"success"`:**

**Nguyên nhân:** Deployment chưa cập nhật với code mới (doGet function)

**Giải pháp:**
1. Quay lại Apps Script Editor
2. Verify code có function `doGet()` với logic query (dòng 101-135)
3. Click **Deploy** > **Manage deployments**
4. Click ✏️ icon **Edit** bên cạnh deployment hiện tại
5. Chọn **New version** trong dropdown "Version"
6. Click **Deploy**
7. Test lại URL với `?doctor=Kukadiya`

**Kết quả mong đợi (sau khi re-deploy):**
```json
{
  "status": "success",
  "doctor": "Kukadiya",
  "appointments": [],
  "count": 0
}
```

✅ Nếu thấy `"status": "success"` → Query hoạt động!

---

## Bước 6: Test tích hợp trên Website

### 6.1. Test chức năng GỬI lịch hẹn (POST)
1. Mở `appointment.html` trong trình duyệt
2. **Chọn lý do khám** (ví dụ: Zahnschmerzen)
3. **Chọn bác sĩ** (ví dụ: Dr. Kukadiya)
4. **Chọn ngày giờ** (ví dụ: 22.11.2025 - 08:00)
5. **Nhập mô tả** (tùy chọn): "Starke Schmerzen seit 3 Tagen"
6. Nhấn nút **"Gửi đi"** / **"Absenden"** / **"Send"**

**Kiểm tra:**
- ✅ Nút hiển thị "Đang gửi..." với loading spinner
- ✅ Status box màu xanh xuất hiện
- ✅ Sau 1.5s: Nút chuyển màu xanh lá, checkmark icon
- ✅ Status box: "✅ Gửi thành công!"
- ✅ Sau 3s: Tự động redirect về trang chủ

**Kiểm tra Google Sheet:**
1. Mở Google Sheet
2. Xem dòng mới nhất (row 2 nếu là lần đầu)
3. Verify dữ liệu:
   - Column A: Timestamp (ví dụ: 11/20/2025 14:30:00)
   - Column B: Zahnschmerzen
   - Column C: Dr. Kukadiya
   - Column D: 22.11.2025
   - Column E: 08:00
   - Column F: Starke Schmerzen seit 3 Tagen
   - Column G: de

### 6.2. Test chức năng XEM lịch đã đặt (GET)
1. **Reload trang** appointment.html
2. **Chọn bác sĩ** Dr. Kukadiya (cùng bác sĩ đã đặt ở bước 6.1)
3. **Xem console** (F12 → Console tab)

**Console log mong đợi:**
```
Fetching appointments for Dr. Kukadiya... https://script.google.com/...
✓ Loaded 1 appointments for Dr. Kukadiya
```

4. **Kiểm tra calendar:**
   - Ngày 22.11.2025, slot 08:00 hiển thị **màu xám**
   - Text có **gạch ngang**: ~~08:00~~
   - Dưới có label: **"✓ Gebucht"**
   - **Không thể click** vào slot này (cursor: not-allowed)

5. **Chọn slot khác:**
   - Các slot còn lại vẫn màu **xanh ngọc bích**
   - **Có thể click** bình thường

✅ Nếu slot đã đặt hiển thị đúng → Tích hợp hoàn tất!

---

## 📊 API Endpoints Summary

### **POST - Gửi lịch hẹn mới**
- **URL:** `https://script.google.com/macros/s/YOUR_ID/exec`
- **Method:** POST
- **Content-Type:** application/json
- **Body:**
  ```json
  {
    "symptom": "Zahnschmerzen",
    "doctor": "Dr. Kukadiya",
    "date": "22.11.2025",
    "time": "08:00",
    "description": "Starke Schmerzen",
    "language": "de"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Appointment data saved successfully",
    "timestamp": "2025-11-20T14:30:00.000Z"
  }
  ```

### **GET - Truy vấn lịch hẹn**
- **URL:** `https://script.google.com/macros/s/YOUR_ID/exec?doctor=Kukadiya&fromDate=20.11.2025&toDate=30.11.2025`
- **Method:** GET
- **Parameters:**
  - `doctor` (required): Tên bác sĩ
  - `date` (optional): Ngày cụ thể DD.MM.YYYY
  - `fromDate` (optional): Từ ngày DD.MM.YYYY
  - `toDate` (optional): Đến ngày DD.MM.YYYY
- **Response:**
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
        "description": "Starke Schmerzen",
        "language": "de"
      }
    ],
    "count": 1
  }
  ```

---

## 🔧 Cấu trúc dữ liệu trong Google Sheet

| Column | Tiêu đề | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| A | Zeitstempel / Timestamp | Thời gian gửi (auto) | 11/20/2025 14:30:00 |
| B | Symptom / Grund | Lý do khám | Zahnschmerzen |
| C | Arzt / Doctor | Bác sĩ được chọn | Dr. Kukadiya |
| D | Datum / Date | Ngày hẹn | 22.11.2025 |
| E | Zeit / Time | Giờ hẹn | 08:00 |
| F | Beschreibung / Description | Mô tả chi tiết | Starke Schmerzen seit 3 Tagen |
| G | Sprache / Language | Ngôn ngữ | de |

**Header tự động tạo** với:
- Font: Bold
- Background: #14b8a6 (Teal)
- Text color: White

---

## ⚠️ Troubleshooting (Xử lý sự cố)

### Lỗi "Script function not found: doPost"
- **Nguyên nhân**: Code chưa được save hoặc deploy chưa thành công
- **Giải pháp**:
  1. Mở Apps Script Editor
  2. Save code (Ctrl+S)
  3. Deploy lại (Deploy > New deployment)

### Lỗi "Authorization required"
- **Nguyên nhân**: Chưa cấp quyền cho Apps Script
- **Giải pháp**: Làm lại **Bước 3.4** (Authorize access)

### Dữ liệu không xuất hiện trong Sheet
- **Nguyên nhân**: URL trong appointment.html chưa đúng
- **Giải pháp**:
  1. Kiểm tra lại URL ở **Bước 4**
  2. Đảm bảo URL kết thúc bằng `/exec`
  3. Không có khoảng trắng thừa

### Lỗi CORS trong Console
- **Không phải lỗi**: Khi dùng `mode: 'no-cors'`, browser không hiển thị response
- **Kiểm tra**: Xem dữ liệu trong Google Sheet để confirm

### Console log: "Failed to fetch appointments"
- **Nguyên nhân**: URL sai hoặc deployment chưa public
- **Giải pháp**:
  1. Test GET bằng browser (Bước 5.1)
  2. Verify "Who has access" = "Anyone"
  3. Check console.log để xem URL đang gọi

### Slots đã đặt không hiển thị màu xám
- **Nguyên nhân**: Date format không match
- **Giải pháp**:
  1. Mở Console (F12)
  2. Check log "✓ Loaded X appointments"
  3. Verify format ngày trong Sheet: DD.MM.YYYY
  4. Check năm đúng (2025 không phải 2024)

---

## 🎯 Checklist hoàn thành

Đánh dấu ✅ khi hoàn thành mỗi bước:

- [ ] **Bước 1**: Tạo Google Sheet mới
- [ ] **Bước 2**: Copy code vào Apps Script Editor và Save
- [ ] **Bước 3**: Deploy Web App với "Who has access" = "Anyone"
- [ ] **Bước 3**: Authorize và copy Web App URL
- [ ] **Bước 4**: Update GOOGLE_SHEET_URL trong appointment.html
- [ ] **Bước 5.1**: Test GET API status (trình duyệt)
- [ ] **Bước 5.2**: Test GET API với parameter doctor
- [ ] **Bước 6.1**: Test POST - Gửi lịch hẹn thành công
- [ ] **Bước 6.1**: Verify dữ liệu xuất hiện trong Google Sheet
- [ ] **Bước 6.2**: Test GET - Slots đã đặt hiển thị màu xám
- [ ] **Bước 6.2**: Verify console log "✓ Loaded X appointments"

✅ **Tất cả checklist hoàn thành** → Hệ thống sẵn sàng sử dụng!

---

## 📝 Ghi chú quan trọng

### Re-deploy khi sửa code
Nếu bạn sửa code trong Apps Script:
1. Save code (Ctrl+S)
2. **Deploy** > **Manage deployments**
3. Click ✏️ **Edit** (deployment hiện tại)
4. Chọn **Version**: "New version"
5. Click **Deploy**
6. **Không cần** thay đổi URL trong appointment.html

### Backup Google Sheet
Khuyến nghị backup định kỳ:
1. **File** > **Make a copy**
2. Hoặc **File** > **Download** > **CSV**

### Giới hạn Google Apps Script
- **Execution time**: Max 6 phút/request
- **Data size**: Max 50MB/response
- **Quota**:
  - Free: 20,000 URL fetches/day
  - Workspace: 100,000 URL fetches/day

Với appointment system, quota này **quá đủ** cho hàng trăm bookings mỗi ngày!

---

## 🔗 Tài liệu tham khảo

- **Google Apps Script Docs**: https://developers.google.com/apps-script
- **Web Apps Guide**: https://developers.google.com/apps-script/guides/web
- **Spreadsheet Service**: https://developers.google.com/apps-script/reference/spreadsheet

---

**Ngày cập nhật**: 2025-11-20
**Version**: 2.0 (POST + GET API)
**Tác giả**: Claude Code - Digitized Brains Project

---

## ✨ Tính năng đã hoàn thành

✅ **POST API** - Gửi và lưu lịch hẹn vào Google Sheets
✅ **GET API** - Truy vấn lịch hẹn theo bác sĩ và date range
✅ **UI Indicators** - Hiển thị slots đã đặt (màu xám, disabled)
✅ **Real-time Updates** - Auto-fetch khi chọn bác sĩ
✅ **Error Handling** - Validation và error messages đầy đủ
✅ **Multilingual** - Hỗ trợ 5 ngôn ngữ (DE, EN, VI, RU, AR)
✅ **Responsive** - Hoạt động trên mobile, tablet, desktop
✅ **Animations** - Button effects, loading states, transitions

**Hệ thống đã sẵn sàng cho production!** 🚀

---

## Tính năng

✅ **Lưu trữ tự động**: Mọi booking đều được lưu vào Google Sheet
✅ **Timestamp**: Ghi lại thời gian gửi chính xác
✅ **Đa ngôn ngữ**: Lưu cả ngôn ngữ người dùng chọn
✅ **Mô tả chi tiết**: Lưu cả mô tả tự do của người dùng
✅ **UI feedback**: Loading state, success/error messages
✅ **Auto-format**: Header tự động tạo với màu sắc

---

## Bảo mật

⚠️ **Lưu ý**:
- Cấu hình "Who has access: Anyone" cho phép bất kỳ ai có URL đều có thể gửi dữ liệu
- Đây là cần thiết để website có thể gửi dữ liệu
- Google Sheet CHỈ có thể xem/sửa bởi chủ sở hữu
- Không ai khác có thể đọc dữ liệu trong Sheet ngoài bạn

**Để tăng bảo mật hơn** (tùy chọn):
- Thêm API key vào code
- Kiểm tra origin domain trong doPost()
- Thêm rate limiting

---

## Truy xuất dữ liệu ngược lại

### Xem dữ liệu trực tiếp:
Mở Google Sheet để xem tất cả bookings

### Export dữ liệu:
- **File** > **Download** > **CSV** hoặc **Excel**

### Lọc và sắp xếp:
- Sử dụng Filter trong Google Sheets
- Sắp xếp theo ngày, bác sĩ, v.v.

### Tích hợp vào website (nâng cao):
Tạo thêm function `doGet()` trong Apps Script để đọc dữ liệu:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  // Convert to JSON
  var jsonData = [];
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    jsonData.push(row);
  }

  return ContentService
    .createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console trong trình duyệt (F12) để xem lỗi JavaScript
2. Execution log trong Apps Script Editor (View > Logs)
3. Đảm bảo URL đúng và không có khoảng trắng

---

**Ngày tạo**: 2025-11-20
**Phiên bản**: 1.0
**Tác giả**: Claude Code - Digitized Brains Project
