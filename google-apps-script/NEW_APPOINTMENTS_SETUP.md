# New_Appointments Sheet Setup Guide

## 🐛 Vấn đề đã fix

**Triệu chứng:**
- Form appointment.html submit thành công (hiển thị "Erfolgreich gesendet!")
- Nhưng **không có dữ liệu** xuất hiện trong Google Sheet
- Tab **New_Appointments không tồn tại**

**Nguyên nhân:**
- Code `doPost()` tìm sheet `New_Appointments` nhưng sheet này chưa được tạo
- Code cũ crash khi `sheet` là `null`

**Giải pháp:**
- ✅ Tự động tạo sheet nếu chưa tồn tại (trong `doPost()`)
- ✅ Thêm function `initializeNewAppointmentsSheet()` để tạo sheet manually
- ✅ Thêm menu item để admin dễ dàng tạo sheet

---

## 📋 Cách tạo New_Appointments Sheet

### Option 1: Tự động (Khuyến nghị)

**Khi nào:** Khi có appointment đầu tiên được submit

**Cách hoạt động:**
1. User submit form appointment.html
2. `doPost()` kiểm tra sheet `New_Appointments`
3. Nếu chưa tồn tại → **Tự động tạo**
4. Thêm header row với formatting
5. Lưu appointment data

**Không cần làm gì!** Sheet sẽ tự động được tạo.

---

### Option 2: Manual (Proactive)

**Khi nào:** Muốn tạo sheet trước khi có appointment đầu tiên

**Các bước:**

1. **Mở Google Sheet**
2. **Reload page** để load menu mới (F5)
3. Click menu **📅 Kalender** > **📋 New_Appointments erstellen**
4. Chờ alert: "✅ New_Appointments sheet wurde erfolgreich erstellt!"
5. Kiểm tra: Tab **New_Appointments** đã xuất hiện với header row

---

## 📊 New_Appointments Sheet Structure

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Zeitstempel | Timestamp when appointment was booked | 23.11.2025 14:35:22 |
| B | Symptom | Patient's symptom/reason | Zahnschmerzen |
| C | Arzt | Doctor name | Dr. Schmidt |
| D | Arzt E-Mail | Doctor email (to be filled) | - |
| E | Arzt Telefon | Doctor phone (to be filled) | - |
| F | Datum | Appointment date | 24.11.2025 |
| G | Zeit | Appointment time | 14:00 |
| H | Beschreibung | Additional description | Starke Schmerzen |
| I | Sprache | Language code | de |
| J | Patient Name | Patient's full name | Max Mustermann |
| K | Patient Geburtsjahr | Patient's birth year | 1990 |
| L | Patient Telefon | Patient's phone | 0123456789 |
| M | Patient E-Mail | Patient's email | max@example.com |

**Total:** 13 columns (A-M)

---

## 🔧 Code Changes

### 1. Auto-create in doPost()

**File:** [appointmentSheet.gs:29-45](appointmentSheet.gs#L29-L45)

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log('📋 Creating New_Appointments sheet...');
      sheet = ss.insertSheet('New_Appointments');
    }

    // Parse incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      // ... header creation code
    }
    // ... rest of function
  }
}
```

**Thay đổi:**
- ✅ Check `if (!sheet)` trước khi access
- ✅ Tự động `insertSheet()` nếu chưa tồn tại
- ✅ Không crash nếu sheet is null

---

### 2. Manual initialization function

**File:** [appointmentSheet.gs:1163-1246](appointmentSheet.gs#L1163-L1246)

```javascript
function initializeNewAppointmentsSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    if (sheet) {
      SpreadsheetApp.getUi().alert('⚠️ New_Appointments sheet existiert bereits!');
      return 'Sheet already exists';
    }

    // Create sheet
    sheet = ss.insertSheet('New_Appointments');

    // Create header with formatting
    sheet.appendRow([...headers...]);

    // Format header (bold, colored, borders)
    var headerRange = sheet.getRange(1, 1, 1, 13);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#14b8a6');
    // ...

    // Set column widths
    sheet.setColumnWidth(1, 150);  // Zeitstempel
    // ...

    // Freeze header row
    sheet.setFrozenRows(1);

    SpreadsheetApp.getUi().alert('✅ New_Appointments sheet wurde erfolgreich erstellt!');
  }
}
```

**Tính năng:**
- ✅ Check nếu sheet đã tồn tại
- ✅ Tạo sheet với proper formatting
- ✅ Set column widths for readability
- ✅ Freeze header row
- ✅ Show success/error alerts

---

### 3. Menu item

**File:** [appointmentSheet.gs:879-891](appointmentSheet.gs#L879-L891)

```javascript
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Kalender')
    .addItem('🔧 Kalender initialisieren', 'initializeCalendarSheet')
    .addItem('➕ Neue Woche hinzufügen', 'addNextWeek')
    .addSeparator()
    .addItem('📋 New_Appointments erstellen', 'initializeNewAppointmentsSheet')  // ← NEW
    .addSeparator()
    .addItem('🔄 Vollständige Synchronisierung', 'syncCalendarWithAppointments')
    .addSeparator()
    .addItem('ℹ️ Hilfe', 'showCalendarHelp')
    .addToUi();
}
```

---

## 🧪 Testing Steps

### Test 1: Auto-creation
1. Delete **New_Appointments** sheet (nếu tồn tại)
2. Mở appointment.html
3. Fill form và submit
4. Check Google Sheet → Tab **New_Appointments** xuất hiện
5. Verify: Header row có màu xanh, data row được thêm

### Test 2: Manual creation
1. Delete **New_Appointments** sheet
2. Mở Google Sheet
3. Click **📅 Kalender** > **📋 New_Appointments erstellen**
4. Verify: Alert success
5. Check: Tab có header row đẹp, columns có width phù hợp

### Test 3: Duplicate creation protection
1. Đảm bảo **New_Appointments** đã tồn tại
2. Click **📅 Kalender** > **📋 New_Appointments erstellen**
3. Verify: Alert "⚠️ New_Appointments sheet existiert bereits!"
4. Sheet cũ không bị xóa/thay đổi

---

## 🔍 Troubleshooting

### Sheet vẫn không được tạo sau khi submit

**Check:**
1. Mở Apps Script Editor > **View** > **Logs**
2. Tìm log: `📋 Creating New_Appointments sheet...`
3. Nếu không thấy → Code chưa deploy

**Giải pháp:**
- Deploy lại code (Deploy > Manage deployments > Edit > New version)

### Error: "Cannot read property 'getLastRow' of null"

**Nguyên nhân:** Code cũ đang chạy (chưa deploy fix)

**Giải pháp:**
1. Deploy code mới
2. Clear cache: Close/reopen Google Sheet
3. Test lại

### Sheet được tạo nhưng không có formatting

**Nguyên nhân:** `doPost()` tạo sheet nhưng chưa kịp format

**Giải pháp:**
- Chạy manual: **📅 Kalender** > **📋 New_Appointments erstellen**
- Hoặc wait cho appointment thứ 2 (header sẽ được format)

---

## 📝 Summary

| Feature | Status | Access |
|---------|--------|--------|
| Auto-create on first appointment | ✅ Automatic | Via website form |
| Manual create with formatting | ✅ Manual | Menu > New_Appointments erstellen |
| Duplicate protection | ✅ Built-in | Alert if exists |
| Proper column widths | ✅ Yes | Auto-set |
| Header formatting | ✅ Yes | Teal background, bold, borders |

**✅ Kết luận:**
- New_Appointments sheet sẽ **tự động tạo** khi có appointment đầu tiên
- Admin có thể **manually tạo** trước qua menu
- Code **không crash** nếu sheet chưa tồn tại
