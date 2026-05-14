# Hướng dẫn: Anamnesebogen → Google Sheets

> Tài liệu này mô tả toàn bộ luồng dữ liệu từ form bệnh nhân đến Google Sheets,
> và các bước setup từ đầu.

---

## 1. Tổng quan kiến trúc

```
Bệnh nhân điền form          Google Apps Script          Google Sheets
(Anamnesebogen.html)  ──►  (Web App – anamnesebogen.gs) ──►  "Seitschenko.Dinh - Appointment Bookings"
       │                            │                              │
  [Submit button]              doPost(e)                    Tab: "Anamnesebogen"
  fetch(SHEET_URL, POST)       parse JSON                   Append 1 row per submission
  body: JSON object            getOrCreateAnamneseSheet()   (tab auto-created on first run)
                               ensureHeader()
                               appendRow(row)
```

Không có server trung gian. Form gửi **JSON trực tiếp** đến Google Apps Script Web App.
Script chạy trong spreadsheet **"Seitschenko.Dinh - Appointment Bookings"** và ghi vào tab riêng **"Anamnesebogen"** — giữ tất cả dữ liệu phòng khám trong một spreadsheet duy nhất.

---

## 2. Luồng dữ liệu chi tiết

### 2.1 Form thu thập dữ liệu (Anamnesebogen.html)

Hàm `collectFormData()` chạy khi bệnh nhân nhấn **Absenden / Submit**:

| Loại trường | Cách thu thập | Ví dụ key |
|---|---|---|
| Text / Date / Tel / Email | `input[name]` → `data[name] = value` | `Nachname`, `Vorname`, `E-Mail` |
| Radio (Anrede) | `input[name="Anrede"]:checked` → `.value` | `Anrede` = `"Frau"` |
| Checkbox multi (Versicherung) | Ghép các giá trị checked bằng `,` | `Versicherungstyp` = `"gesetzlich versichert, zahnzusatzversichert"` |
| Radio (Familienversichert) | `input[name="Familienversichert"]:checked` | `Familienversichert` = `"Nein"` |
| Ja/Nein buttons (Gesundheit) | Object `ynValues` được cập nhật mỗi khi bấm | `Herzinfarkt` = `"Ja"` |
| Radio (Erinnerung) | `input[name="Erinnerung"]:checked` | `Erinnerung` = `"E-Mail"` |
| Timestamp | `new Date().toISOString()` tự động | `Timestamp` = `"2025-05-13T..."` |

**Object JSON được gửi đi:**
```json
{
  "Timestamp": "2025-05-13T10:22:00.000Z",
  "Anrede": "Frau",
  "Nachname": "Mustermann",
  "Vorname": "Anna",
  "Geburtsdatum": "1985-03-15",
  "E-Mail": "anna@example.com",
  "Versicherungstyp": "gesetzlich versichert",
  "Herzinfarkt": "Nein",
  "Allergie_Antibiotika": "Ja",
  ...
}
```

### 2.2 Gửi lên Google Apps Script

```javascript
// Trong Anamnesebogen.html
const SHEET_URL = 'https://script.google.com/macros/s/AKfycb.../exec';

const response = await fetch(SHEET_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 2.3 Google Apps Script xử lý (anamnesebogen.gs)

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);   // parse JSON
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  // Tạo header nếu sheet trống
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER_ROW);   // dòng tiêu đề teal
  }

  // Map JSON keys → columns theo HEADER_ROW
  const row = HEADER_ROW.map(col => data[col] ?? '');
  sheet.appendRow(row);   // ghi 1 dòng mới
}
```

---

## 3. Cấu trúc Google Sheets

### Dòng 1 – Header (tự động tạo, nền teal #5eb3b3)

| STT | Cột | Mô tả |
|---|---|---|
| A | Timestamp | ISO 8601 UTC – thời điểm gửi |
| B | Anrede | Frau / Herr / Divers |
| C | Nachname | Họ |
| D | Vorname | Tên |
| E | Geburtsdatum | YYYY-MM-DD |
| F | Geburtsort | Nơi sinh |
| G | Straße | Địa chỉ |
| H | PLZ | Mã bưu chính |
| I | Ort | Thành phố |
| J | Mobil | SĐT di động |
| K | Festnetz | SĐT bàn (tuỳ chọn) |
| L | E-Mail | Email |
| M | Arbeitgeber_Name | Tên nơi làm việc |
| N | Arbeitgeber_Tel | SĐT nơi làm việc |
| O | Beruf | Nghề nghiệp |
| P | Hausarzt_Name | Tên bác sĩ gia đình |
| Q | Hausarzt_Straße | Địa chỉ bác sĩ |
| R | Hausarzt_PLZ | Mã bưu chính bác sĩ |
| S | Hausarzt_Ort | Thành phố bác sĩ |
| T | Versicherung_Name | Tên công ty bảo hiểm |
| U | Versicherungstyp | Loại BH (có thể nhiều, cách nhau `,`) |
| V | Familienversichert | Ja / Nein |
| W–AE | HV_* | Thông tin chủ hộ bảo hiểm (9 cột) |
| AF–AN | Herz* | Bệnh tim (9 cột) |
| AO–AT | Kreislauf* | Tuần hoàn (6 cột) |
| AU–AX | Stoff* / Diabetes | Chuyển hoá (4 cột) |
| AY–BA | Nerven* | Thần kinh (3 cột) |
| BB–BD | Blut* | Máu (3 cột) |
| BE–BF | Tumor* | Ung thư (2 cột) |
| BG–BL | Hepatitis / TBC / HIV / MRSA | Nhiễm khuẩn (6 cột) |
| BM–BO | Atemwege* | Hô hấp (3 cột) |
| BP–BQ | Sonstige_Erkrankung* | Bệnh khác (2 cột) |
| BR–BT | Allergie* | Dị ứng (3 cột) |
| BU–BZ | Medikamente / Blutverdünner / ... | Thuốc (6 cột) |
| CA–CC | Rauchen / Alkohol / Drogen | Thói quen (3 cột) |
| CD–CE | Schwanger / Schwanger_Woche | Thai sản (2 cột) |
| CF–CI | Letztes_Rontgen / Knirschen / Zahnfleisch / Mundgeruch | Sức khoẻ răng (4 cột) |
| CJ | Erinnerung | Post / E-Mail / SMS |
| CK | Datum | Ngày ký |
| CL | Unterschrift | Chữ ký (tên gõ) |

**Tổng cộng: 88 cột**

### Giá trị Ja/Nein fields
- `"Ja"` = bệnh nhân trả lời CÓ
- `"Nein"` = trả lời KHÔNG
- `""` (trống) = chưa trả lời

---

## 4. Setup từ đầu (step-by-step)

### Bước 1: Mở spreadsheet "Seitschenko.Dinh - Appointment Bookings"

1. Vào Google Drive → tìm và mở spreadsheet **"Seitschenko.Dinh - Appointment Bookings"**
2. Tab "Anamnesebogen" **chưa cần tạo** – script sẽ tự tạo khi nhận dữ liệu đầu tiên

> **Lưu ý:** Không cần tạo spreadsheet mới. Dữ liệu Anamnesebogen sẽ lưu cùng với dữ liệu đặt hẹn trong một spreadsheet duy nhất.

### Bước 2: Mở Apps Script

1. Trong spreadsheet: menu **Extensions → Apps Script**
2. Nhấn **+ New file** (biểu tượng +) → chọn **Script**
3. Đặt tên file: `anamnesebogen`

### Bước 3: Paste code

1. **Xoá toàn bộ** nội dung trong file `anamnesebogen.gs` vừa tạo
2. **Paste toàn bộ** nội dung file `anamnesebogen.gs` từ project này vào
3. Nhấn **Ctrl+S** để lưu
4. Đặt tên project (nếu chưa có): `Seitschenko-Dinh Sheets Handler`

### Bước 4: Deploy Web App

1. Nhấn nút **Deploy** (góc trên phải) → **New deployment**
2. Cấu hình:
   ```
   Type:           Web app
   Description:    Anamnesebogen v1
   Execute as:     Me (your Google account)
   Who has access: Anyone
   ```
3. Nhấn **Deploy**
4. Google sẽ yêu cầu **cấp quyền** → nhấn **Authorize access**
   - Chọn tài khoản Google của bạn
   - Nhấn **Advanced** → **Go to Anamnesebogen Handler (unsafe)**
   - Nhấn **Allow**
5. **Sao chép Web App URL** – trông như sau:
   ```
   https://script.google.com/macros/s/AKfycbXXXXXXXXXXXXX/exec
   ```

> ⚠️ **Quan trọng:** URL kết thúc bằng `/exec`, không phải `/dev`.
> URL `/dev` chỉ dành cho test, không public.

### Bước 5: Cấu hình URL trong HTML

Mở file `Web/pages/Anamnesebogen.html`, tìm dòng:

```javascript
const SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Thay bằng URL vừa copy:

```javascript
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbXXXXXXXXX/exec';
```

Lưu file.

### Bước 6: Kiểm tra

1. Mở `Anamnesebogen.html` trong trình duyệt
2. Điền form với dữ liệu test
3. Nhấn **Absenden**
4. Sau ~2 giây: modal thành công hiện lên
5. Mở Google Sheets → kiểm tra dòng mới được ghi

---

## 5. Kiểm tra và debug

### Test thủ công trong Apps Script

Trong Apps Script editor:
1. Chọn hàm `doPost` từ dropdown
2. Nhấn **Run** → sẽ báo lỗi vì không có `e.postData` → bình thường

Để test thực sự, dùng **Execution log**:
1. Thêm `console.log(JSON.stringify(data))` vào đầu `doPost`
2. Submit form → vào Apps Script → **Executions** để xem log

### Kiểm tra lỗi CORS

Nếu browser console báo CORS error:
- Đảm bảo đã deploy với **Who has access: Anyone**
- Đảm bảo dùng URL kết thúc `/exec` không phải `/dev`
- Sau khi thay đổi code, phải **Deploy lại** (New deployment)

### Form hiển thị demo mode (modal nhưng không ghi sheet)

Xảy ra khi `SHEET_URL` vẫn là `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'`.
→ Thay URL thật theo Bước 5.

### Google Sheets không có dữ liệu nhưng modal thành công

Xảy ra khi Apps Script báo `result: success` nhưng không ghi được.
Kiểm tra:
- Apps Script → **Executions** → xem có lỗi không
- `SPREADSHEET_ID` trong `.gs` để trống → script dùng sheet hiện tại (bound) → đúng
- Nếu script được tạo từ **đúng file Google Sheets** thì sẽ tự tìm sheet

---

## 6. Cập nhật script (khi thay đổi code)

> ⚠️ Sau mỗi lần sửa `anamnesebogen.gs`, phải **deploy lại** thì thay đổi mới có hiệu lực.

1. Apps Script editor → sửa code → Lưu
2. **Deploy** → **Manage deployments**
3. Chọn deployment hiện tại → nhấn biểu tượng bút chì (Edit)
4. **Version:** chọn `New version`
5. **Deploy** → URL giữ nguyên (không cần cập nhật HTML)

---

## 7. Bảo mật và GDPR

| Điểm | Trạng thái |
|---|---|
| Truyền dữ liệu | HTTPS (Google endpoint) |
| Lưu trữ | Google Sheets (server EU nếu tài khoản EU) |
| Quyền truy cập sheet | Chỉ tài khoản Google chủ sheet |
| Script chạy qua | Tài khoản của bạn (Execute as: Me) |
| Bệnh nhân đồng ý | Checkbox confirm trong form (bắt buộc tick) |
| Thông báo bảo mật | Hiển thị trong form: *"Daten werden verschlüsselt übertragen"* |

> Cân nhắc thêm **Google Workspace** (G Suite) để đảm bảo dữ liệu lưu trong EU
> nếu phòng khám có yêu cầu DSGVO nghiêm ngặt.

---

## 8. Các file liên quan

| File | Vai trò |
|---|---|
| `Web/pages/Anamnesebogen.html` | Form + JS submit + `SHEET_URL` placeholder |
| `Web/google-apps-script/anamnesebogen.gs` | Script cần paste vào Apps Script |
| `Web/google-apps-script/ANAMNESEBOGEN_SETUP.md` | File này |
