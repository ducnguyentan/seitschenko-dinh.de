# Deployment Checklist - Google Apps Script

## ⚠️ QUAN TRỌNG: Khi sửa code

Mỗi khi bạn sửa code trong `appointmentSheet.gs`, bạn **PHẢI re-deploy** để changes có hiệu lực!

---

## 🔄 Quy trình Re-deploy

### Bước 1: Save Code
1. Mở Apps Script Editor
2. Sửa code trong `Code.gs`
3. **Save** (Ctrl+S hoặc click icon đĩa mềm)
4. Đợi message "Saved" xuất hiện

### Bước 2: Re-deploy
1. Click menu **Deploy** (góc trên bên phải)
2. Chọn **Manage deployments**
3. Trong danh sách deployments, tìm deployment đang active
4. Click icon **✏️ Edit** (bút chì) bên cạnh deployment đó
5. Trong dialog Edit deployment:
   - **Version**: Chọn **"New version"** trong dropdown
   - **Description**: (optional) Ghi chú về thay đổi, ví dụ: "Added GET endpoint for appointment queries"
6. Click nút **Deploy** (màu xanh)
7. Đợi message "Deployment updated successfully"
8. Click **Done**

### Bước 3: Verify
1. Copy Web App URL (nếu chưa có)
2. Paste vào browser
3. Test endpoint:
   - Status check: `https://...../exec`
   - Query test: `https://...../exec?doctor=Kukadiya`

---

## ✅ Checklist sau mỗi lần sửa code

- [ ] Code đã Save (Ctrl+S)
- [ ] Deploy > Manage deployments
- [ ] Edit deployment hiện tại (✏️ icon)
- [ ] Chọn "New version"
- [ ] Click Deploy
- [ ] Test URL trong browser để verify

---

## 🐛 Troubleshooting

### Vẫn thấy kết quả cũ sau khi re-deploy
**Nguyên nhân:** Browser cache

**Giải pháp:**
1. Hard refresh: Ctrl+F5 (Windows) hoặc Cmd+Shift+R (Mac)
2. Hoặc mở Incognito/Private window
3. Test lại URL

### Lỗi "This deployment is not authorized"
**Nguyên nhân:** Deployment bị revoke authorization

**Giải pháp:**
1. Deploy > Manage deployments
2. Archive deployment cũ
3. Tạo New deployment
4. Authorize lại
5. Update URL mới trong appointment.html

### Lỗi "Script function not found"
**Nguyên nhân:** Function name không đúng hoặc code lỗi syntax

**Giải pháp:**
1. Check console trong Apps Script Editor (View > Logs)
2. Verify function `doGet(e)` và `doPost(e)` tồn tại
3. Test run function trong Editor (Run > Test as web app)

---

## 📝 Version History

Mỗi lần re-deploy tạo một version mới. Bạn có thể:

1. View version history:
   - Deploy > Manage deployments
   - Click vào deployment
   - Xem list các versions

2. Rollback về version cũ:
   - Edit deployment
   - Chọn version cũ trong dropdown
   - Deploy

---

## 🎯 Best Practices

### 1. Luôn test sau khi deploy
```bash
# Test status endpoint
curl "https://script.google.com/macros/s/YOUR_ID/exec"

# Test query endpoint
curl "https://script.google.com/macros/s/YOUR_ID/exec?doctor=Kukadiya"
```

### 2. Ghi chú version
Khi deploy version mới, ghi rõ thay đổi:
- "v1.0 - Initial POST endpoint"
- "v1.1 - Added GET endpoint for queries"
- "v1.2 - Fixed date parsing bug"

### 3. Backup trước khi sửa
1. File > Make a copy (Apps Script)
2. Hoặc copy code ra file text
3. Để có thể rollback nếu cần

### 4. Test local trước
1. Dùng Logger.log() để debug
2. Test function bằng "Run" button trong Editor
3. Check Execution log (View > Executions)

---

## 🔍 Verify Deployment Status

### Cách 1: Browser Test
```
https://script.google.com/macros/s/YOUR_ID/exec
```

**Expected:**
```json
{"status":"online","message":"Appointment receiver is active. Use ?doctor=NAME to query appointments."}
```

### Cách 2: With Parameters
```
https://script.google.com/macros/s/YOUR_ID/exec?doctor=Test
```

**Expected:**
```json
{"status":"success","doctor":"Test","appointments":[],"count":0}
```

### Cách 3: POST Request (Postman/curl)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "symptom": "Test",
    "doctor": "Test",
    "date": "01.01.2025",
    "time": "10:00",
    "description": "Test booking",
    "language": "en"
  }'
```

---

## 📊 Common Deployment Scenarios

### Scenario 1: Thêm function mới (doGet)
1. Edit Code.gs
2. Add doGet() function
3. Save
4. Re-deploy với "New version"
5. Test GET endpoint

### Scenario 2: Sửa logic trong doPost
1. Edit doPost() function
2. Save
3. Re-deploy với "New version"
4. Test POST endpoint

### Scenario 3: Thay đổi response format
1. Edit return statement
2. Save
3. Re-deploy
4. Update frontend code nếu cần
5. Test integration

---

**Ngày tạo**: 2025-11-20
**Version**: 1.0
**Tác giả**: Claude Code - Digitized Brains Project

**NHỚ:** Mỗi lần sửa code = Phải re-deploy! 🚀
