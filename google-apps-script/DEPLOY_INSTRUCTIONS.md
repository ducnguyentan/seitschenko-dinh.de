# 🚀 HƯỚNG DẪN DEPLOY VÀ SYNC DỮ LIỆU

## ⚠️ VẤN ĐỀ HIỆN TẠI
- ✅ Code đã sẵn sàng trong `appointmentSheet_NEW.gs`
- ✅ Data có trong sheet New_Appointments (z, t, 5325252, aiagent.tailieu@gmail.com)
- ❌ Sheet Patients vẫn trống vì chưa chạy function sync

## 📋 BƯỚC 1: DEPLOY CODE VÀO GOOGLE APPS SCRIPT

### 1.1. Mở Apps Script Editor
1. Mở Google Sheets của bạn
2. Menu: **Extensions** → **Apps Script**
3. Cửa sổ Apps Script editor sẽ mở ra

### 1.2. Thay Thế Code
1. **Select All** (Ctrl+A) code cũ trong editor
2. **Delete** (Delete key)
3. Mở file `appointmentSheet_NEW.gs` từ máy tính
4. **Copy toàn bộ** code (Ctrl+A → Ctrl+C)
5. **Paste** vào Apps Script editor (Ctrl+V)
6. **Save** project (Ctrl+S hoặc click biểu tượng 💾)

### 1.3. Kiểm Tra Đã Deploy Thành Công
- Editor không báo lỗi syntax
- Thấy tên project ở góc trên bên trái
- Code có chứa function `syncAllPatientsFromAppointments` (dòng ~1116)

---

## 📊 BƯỚC 2: RELOAD GOOGLE SHEETS

### 2.1. Quay Lại Google Sheets
1. Đóng tab Apps Script (hoặc quay lại tab Google Sheets)
2. **Reload trang** (F5 hoặc Ctrl+R)
3. Đợi 3-5 giây để menu load

### 2.2. Kiểm Tra Menu Mới
1. Tìm menu **"📅 Kalender"** ở thanh menu
2. Click vào menu → phải thấy các item:
   ```
   📅 Kalender
   ├── 🔧 Initialize Calendar
   ├── ➕ Add Next Week
   ├── ─────────────────
   ├── 📋 Create New_Appointments
   ├── 👥 Create Patients Sheet
   ├── ⭐ Create Dentist Reviews  ← MỚI
   ├── ─────────────────
   ├── 🔄 Full Sync
   ├── 👤 Sync All Patients       ← MỚI - QUAN TRỌNG
   └── 📊 View Form URLs          ← MỚI
   ```

**⚠️ NẾU KHÔNG THẤY MENU:**
- Reload lại trang (F5)
- Hoặc đóng và mở lại Google Sheets
- Hoặc chạy function `onOpen()` trong Apps Script

---

## 🔄 BƯỚC 3: CHẠY SYNC PATIENTS

### 3.1. Chạy Function Sync
1. Click menu **"📅 Kalender"**
2. Click **"👤 Sync All Patients"**
3. **Đợi 5-15 giây** (có thể thấy "Loading..." ở góc trên)

### 3.2. Cho Phép Quyền (Nếu Được Hỏi)
**Lần đầu chạy có thể yêu cầu quyền:**
1. Popup hiện: "Authorization required"
2. Click **"Continue"**
3. Chọn tài khoản Google của bạn
4. Click **"Advanced"** (hoặc "Nâng cao")
5. Click **"Go to [Project name] (unsafe)"**
6. Click **"Allow"** tất cả các quyền
7. Function sẽ chạy lại tự động

### 3.3. Kiểm Tra Kết Quả
**Popup thành công sẽ hiện:**
```
✅ Sync Abgeschlossen!

Synchronisiert: 1 Patienten
Übersprungen: 0 Zeilen (fehlende Daten)
```

**Click OK** để đóng popup.

---

## ✅ BƯỚC 4: KIỂM TRA DỮ LIỆU

### 4.1. Mở Patients Sheet
1. Click tab **"Patients"** ở dưới cùng
2. Kiểm tra row 2 (dưới header)

### 4.2. Xác Nhận Dữ Liệu Đã Sync
Phải thấy data như sau:

| Patient ID | Vorname | Nachname | Geburtsjahr | Email | Telefon | ... |
|------------|---------|----------|-------------|-------|---------|-----|
| Z325252 | z | t | 1990 | aiagent.tailieu@gmail.com | 5325252 | ... |

**Giải thích Patient ID:**
- Lấy chữ cái đầu tiên của firstname: `z` → `Z` (viết hoa)
- Lấy 6 chữ số cuối của phone: `5325252` → `325252`
- Patient ID = `Z325252`

---

## 🔧 BƯỚC 5: TẠO GOOGLE FORM (NẾU CHƯA CÓ)

### 5.1. Tạo Dentist Reviews Sheet + Form
1. Menu **"📅 Kalender"**
2. Click **"⭐ Create Dentist Reviews"**
3. **Đợi 10-15 giây** (đang tạo Google Form)
4. Popup hiện: "✅ Dentist Reviews sheet created!"

### 5.2. Xem Thông Tin Form
1. Menu **"📅 Kalender"**
2. Click **"📊 View Form URLs"**
3. Popup hiện:
   ```
   📋 REVIEW FORM INFORMATIONEN

   🔗 PUBLIC FORM URL:
   https://docs.google.com/forms/d/e/.../viewform

   📝 EDIT FORM URL:
   https://docs.google.com/forms/d/.../edit

   🆔 FORM ID:
   abc123def456...
   ```

### 5.3. Test Form
1. Copy **PUBLIC FORM URL**
2. Mở trong trình duyệt
3. Điền thông tin test
4. Click **Submit**
5. Check sheet **"Form Responses 1"** (tự động tạo)

---

## 🧪 BƯỚC 6: TEST TOÀN BỘ HỆ THỐNG

### Test 1: Sync Thủ Công
- ✅ Đã làm ở Bước 3
- ✅ Data đã vào Patients sheet

### Test 2: Treatment Completion Email
1. Vào **Patients** sheet
2. Tìm bệnh nhân có email (row 2)
3. Column 12: Nhập `"Successful treatment"` (hoặc text bất kỳ)
4. Column 13: **Tick ✅ checkbox**
5. **Đợi 5-10 giây**
6. Check email `aiagent.tailieu@gmail.com`
7. Phải nhận được email với Google Form link

### Test 3: Submit Review
1. Click link trong email
2. Form đã điền sẵn:
   - Patient ID: Z325252
   - Patient Name: z t
   - Doctor Name: (nha sĩ đã chọn)
   - Treatment Date: (ngày hẹn)
3. Chọn rating ⭐⭐⭐⭐⭐ (1-5 sao)
4. Nhập comment (optional)
5. Click **Submit**
6. Check sheet **"Form Responses 1"** → có response mới

---

## ❌ KHẮ PHỤC SỰ CỐ

### Lỗi 1: Menu Không Hiện
**Triệu chứng:** Không thấy menu "📅 Kalender"

**Giải pháp:**
1. Reload trang (F5)
2. Apps Script → Run function `onOpen` manually
3. Close và mở lại Google Sheets

### Lỗi 2: Sync Báo "0 Patienten"
**Triệu chứng:** Popup hiện "Synchronisiert: 0 Patienten"

**Nguyên nhân:** Data không đủ điều kiện
- Thiếu firstname hoặc lastname
- Thiếu phone number
- Data là dấu "-"

**Giải pháp:**
1. Check New_Appointments row 2
2. Columns 10, 11, 13 phải có data (không phải "-")
3. Phone phải có ít nhất 6 số

### Lỗi 3: Email Không Gửi
**Triệu chứng:** Tick checkbox nhưng không nhận email

**Nguyên nhân:**
- Trigger `onEditTrigger` chưa cài
- Email không hợp lệ
- MailApp quota (100 emails/ngày)

**Giải pháp:**
1. Apps Script → **Triggers** (⏰ icon bên trái)
2. Check có trigger `onEditTrigger` với event type `On edit`
3. Nếu không có → Add Trigger:
   - Function: `onEditTrigger`
   - Event source: **From spreadsheet**
   - Event type: **On edit**
   - Click **Save** → Allow permissions

### Lỗi 4: Form Không Tạo Được
**Triệu chứng:** Error khi click "⭐ Create Dentist Reviews"

**Giải pháp:**
1. Apps Script → View → **Execution log**
2. Check error message
3. Có thể do quyền → Re-authorize
4. Hoặc form đã tồn tại → Check "📊 View Form URLs"

### Lỗi 5: Patient ID Sai Format
**Triệu chứng:** Patient ID không đúng pattern (ví dụ: `undefined123456`)

**Nguyên nhân:** Firstname hoặc phone không hợp lệ

**Giải pháp:**
1. Check New_Appointments column 10 (Patient Vorname)
2. Check column 13 (Patient Telefon)
3. Phone phải có ít nhất 6 chữ số
4. Firstname không được trống

---

## 📝 CHECKLIST HOÀN THÀNH

**Deployment:**
- [ ] Code copied vào Apps Script
- [ ] Code saved thành công
- [ ] Reload Google Sheets

**Menu:**
- [ ] Menu "📅 Kalender" hiện ra
- [ ] Menu có item "👤 Sync All Patients"
- [ ] Menu có item "⭐ Create Dentist Reviews"
- [ ] Menu có item "📊 View Form URLs"

**Sync:**
- [ ] Chạy "👤 Sync All Patients"
- [ ] Popup hiện "Synchronisiert: 1 Patienten"
- [ ] Patients sheet có data row 2
- [ ] Patient ID đúng format (Z325252)

**Google Form:**
- [ ] Chạy "⭐ Create Dentist Reviews"
- [ ] Sheet "Dentist_Reviews" được tạo
- [ ] Chạy "📊 View Form URLs" → thấy URLs
- [ ] Test form → submit thành công

**Triggers:**
- [ ] Apps Script → Triggers → có `onEditTrigger`
- [ ] Event type: "On edit"

**Email Test:**
- [ ] Tick checkbox "Hoàn tất điều trị"
- [ ] Email gửi đến bệnh nhân
- [ ] Email có Google Form link
- [ ] Form có pre-filled data

---

## 🎯 KẾT LUẬN

Sau khi hoàn thành các bước trên:

✅ **Hệ thống hoạt động tự động:**
1. Bệnh nhân đặt lịch → Data vào New_Appointments
2. Data tự động sync vào Patients
3. Nhân viên nhập kết quả điều trị
4. Tick checkbox → Email tự động gửi
5. Bệnh nhân click link → Google Form mở sẵn data
6. Submit form → Data vào "Form Responses 1"

✅ **Sync thủ công khi cần:**
- Menu "👤 Sync All Patients" để sync toàn bộ appointments cũ

✅ **Google Form thay thế web form:**
- Không cần host review.html
- Form tự động link với Google Sheets
- Pre-filled data cho trải nghiệm tốt hơn

---

## 📞 HỖ TRỢ

Nếu vẫn gặp lỗi sau khi làm theo hướng dẫn:

1. **Check Apps Script Execution Log:**
   - Apps Script → View → Executions
   - Xem error messages

2. **Check Sheet Structure:**
   - New_Appointments: 16 columns
   - Patients: 13 columns
   - Dentist_Reviews: 7 columns

3. **Check Data Format:**
   - Phone: số nguyên, ít nhất 6 chữ số
   - Email: định dạng email hợp lệ
   - Names: không được "-" hoặc trống

---

**Ngày cập nhật:** 2025-12-04
**Version:** appointmentSheet_NEW.gs (2369 dòng)
**Status:** ✅ Code đầy đủ, sẵn sàng deploy
