# 🚀 Cách Deploy Apps Script Sau Khi Sửa Code

## ⚠️ QUAN TRỌNG: Code sửa ở local PHẢI deploy lại

Khi bạn sửa file `appointmentSheet.gs` ở local (trong VS Code), những thay đổi **CHƯA ÁP DỤNG** cho đến khi bạn:

1. Copy code mới vào Apps Script Editor
2. Deploy lại version mới

## 📋 Các Bước Deploy

### Bước 1: Mở Apps Script Editor
1. Mở Google Sheet của bạn
2. Click **Extensions** > **Apps Script**
3. Sẽ mở ra Apps Script Editor

### Bước 2: Cập Nhật Code
1. Trong Apps Script Editor, select tất cả code cũ trong file `Code.gs` (hoặc `Mã.gs`)
2. **Delete hết**
3. Copy **toàn bộ** nội dung từ file `appointmentSheet.gs` (file local đã được sửa)
4. Paste vào Apps Script Editor
5. Click **Save** (icon đĩa mềm hoặc Ctrl+S)

### Bước 3: Deploy Version Mới
1. Click **Deploy** > **Manage deployments**
2. Click vào icon **Edit** (hình bút chì) ở deployment hiện tại
3. Trong phần **Version**, click dropdown và chọn **New version**
4. (Optional) Thêm mô tả version: "Fixed date parsing error in addNextWeek"
5. Click **Deploy**
6. Copy Web App URL (nếu cần)

### Bước 4: Test
1. Reload lại Google Sheet (F5)
2. Click **📅 Calendar** > **➕ Thêm tuần mới**
3. Check xem lỗi còn không

## 🔍 Cách Kiểm Tra Version Đang Chạy

Để đảm bảo code mới đã deploy:

1. Apps Script Editor > **Deploy** > **Manage deployments**
2. Check **Version** number - phải là version mới nhất
3. Nếu vẫn lỗi, check **View** > **Logs** để xem log messages

## 📝 Logs Cần Thấy (Nếu Code Mới Đã Deploy)

Khi chạy `addNextWeek()`, bạn sẽ thấy logs này trong Apps Script > View > Logs:

```
📊 Last row in Calendar: 10
📅 Last date value from cell: 29.11.2025 (type: string)
📝 Converting to string: 29.11.2025
✅ Final parsed date: 2025-11-29T00:00:00.000Z
📅 Next week start date: 2025-11-30T00:00:00.000Z
📅 Next week start date type: object
📅 Is valid date: true
```

Nếu **KHÔNG THẤY** logs này → Code cũ vẫn đang chạy → Chưa deploy đúng

## ⚠️ Lưu Ý Quan Trọng

### 1. Deploy vs Save
- **Save**: Chỉ lưu code trong Editor (chưa chạy)
- **Deploy**: Phát hành version mới để chạy

### 2. Version Management
- Mỗi lần sửa code quan trọng → Deploy New version
- Không xóa deployment cũ, chỉ tạo version mới
- Có thể rollback về version cũ nếu cần

### 3. Testing
- Test trong chính Sheet (không phải local)
- Check logs: **Apps Script Editor** > **View** > **Logs**
- Logs chỉ hiện sau khi chạy function

## 🐛 Troubleshooting

### "Lỗi vẫn còn sau khi deploy"
→ Clear cache: Ctrl+F5 trên Google Sheet
→ Hoặc đóng/mở lại tab

### "Không thấy logs"
→ Logs chỉ hiện trong Apps Script Editor (không phải Sheet)
→ Chạy function → Ngay lập tức check View > Logs

### "Deployment bị conflict"
→ Chỉ edit deployment hiện tại, đừng tạo deployment mới
→ Hoặc delete deployment cũ trước khi tạo mới

## 📞 Next Steps

Sau khi deploy xong:
1. ✅ Test addNextWeek() function
2. ✅ Verify logs hiển thị đúng
3. ✅ Test toàn bộ Calendar workflow
4. ✅ Integrate với appointment.html (pending task)
