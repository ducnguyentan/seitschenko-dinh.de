# Hướng Dẫn Sử Dụng Hình Ảnh - Images Guide

## Cấu Trúc Thư Mục / Directory Structure

```
web/
├── assets/
│   └── img/
│       ├── practice.jpg                      # Hình phòng khám (About section)
│       ├── laboratory.jpg                    # Hình phòng lab (Lab section)
│       ├── kinderzahnheilkunde.jpg          # Nha khoa trẻ em
│       ├── angstpatienten.jpg               # Bệnh nhân lo lắng
│       ├── prophylaxe.jpg                   # Phòng ngừa
│       ├── zahnerhaltung.jpg                # Bảo tồn răng
│       ├── aesthetische-zahnheilkunde.jpg   # Nha khoa thẩm mỹ
│       ├── zahnersatz.jpg                   # Răng giả
│       ├── oralchirurgie.jpg                # Phẫu thuật răng miệng
│       ├── implantologie.jpg                # Cấy ghép implant
│       └── logo.svg                         # Logo (có sẵn)
```

## Hình Ảnh Đã Được Cập Nhật / Updated Images

### ✅ Trang Chính (index.html)
1. **practice.jpg** - Hình phòng khám hiện đại
   - Vị trí: About section
   - Kích thước: 800x600px
   - Đường dẫn: `assets/img/practice.jpg`

2. **laboratory.jpg** - Phòng lab nha khoa
   - Vị trí: Laboratory section
   - Kích thước: 800x600px
   - Đường dẫn: `assets/img/laboratory.jpg`

### ✅ Các Trang Phụ (Service Pages)
Các hình ảnh đã được tải về và sẵn sàng sử dụng cho hero banner:

1. **kinderzahnheilkunde.jpg** - Nha khoa trẻ em
2. **angstpatienten.jpg** - Chăm sóc bệnh nhân lo lắng
3. **prophylaxe.jpg** - Dịch vụ phòng ngừa
4. **zahnerhaltung.jpg** - Bảo tồn răng
5. **aesthetische-zahnheilkunde.jpg** - Nha khoa thẩm mỹ
6. **zahnersatz.jpg** - Răng giả
7. **oralchirurgie.jpg** - Phẫu thuật răng miệng
8. **implantologie.jpg** - Cấy ghép implant

## Thay Thế Hình Ảnh / Replacing Images

### Cách 1: Sử dụng hình ảnh có sẵn từ thư mục
Trong thư mục `web/assets/img/` có nhiều hình ảnh chất lượng cao từ phòng khám thực tế:

**Hình ảnh phòng khám:**
- `praxis-02-scaled.jpeg` - Nội thất phòng khám
- `img_0368-scaled.jpeg` - Phòng điều trị
- `img_0370-scaled.jpeg` - Khu vực tiếp đón
- `img_0373-scaled.jpeg` - Phòng chờ
- `img_0383-scaled.jpeg` - Thiết bị y tế
- `img_0384-scaled.jpeg` - Không gian làm việc

**Hình ảnh điều trị:**
- `z7157290503408_*.jpg` - 15 hình ảnh chất lượng cao về dịch vụ nha khoa

### Cách 2: Thay thế bằng hình ảnh mới

1. **Chuẩn bị hình ảnh:**
   - Định dạng: JPG hoặc PNG
   - Kích thước đề xuất:
     - Trang chính: 800x600px
     - Service pages: 1200x600px
   - Tối ưu hóa kích thước file (<200KB)

2. **Đổi tên file:**
   ```bash
   # Ví dụ: Thay hình nha khoa trẻ em
   mv your-image.jpg web/assets/img/kinderzahnheilkunde.jpg
   ```

3. **Hoặc cập nhật trong HTML:**
   ```html
   <!-- Trong index.html -->
   <img src="assets/img/your-new-image.jpg" alt="Description">

   <!-- Trong service pages -->
   <img src="../assets/img/your-new-image.jpg" alt="Description">
   ```

## Sử Dụng Hình Ảnh Thực Tế / Using Real Practice Photos

Để sử dụng hình ảnh thực tế có sẵn, bạn có thể:

### Ví dụ 1: Thay hình phòng khám trong About section
```bash
cp web/assets/img/praxis-02-scaled.jpeg web/assets/img/practice.jpg
```

### Ví dụ 2: Sử dụng hình thực tế cho service pages
```bash
# Nha khoa trẻ em
cp web/assets/img/z7157290503408_*.jpg web/assets/img/kinderzahnheilkunde.jpg

# Phòng ngừa
cp web/assets/img/z7157290503424_*.jpg web/assets/img/prophylaxe.jpg
```

## Logo

Logo hiện tại sử dụng gradient với chữ cái "SD":
- Vị trí: Header và Footer
- File: `assets/img/logo.svg`
- Có thể thay thế bằng logo thực tế của phòng khám

## Tối Ưu Hóa Hình Ảnh / Image Optimization

Để tối ưu hóa hiệu suất trang web, nên:

1. **Nén hình ảnh** sử dụng tools như:
   - [TinyPNG](https://tinypng.com/)
   - [ImageOptim](https://imageoptim.com/)

2. **Responsive images** - Tạo nhiều kích thước:
   ```html
   <img srcset="assets/img/practice-small.jpg 400w,
                assets/img/practice.jpg 800w,
                assets/img/practice-large.jpg 1200w"
        sizes="(max-width: 600px) 400px, 800px"
        src="assets/img/practice.jpg"
        alt="Moderne Zahnarztpraxis">
   ```

3. **Lazy loading** - Đã được thêm vào:
   ```html
   <img src="assets/img/practice.jpg" loading="lazy" alt="...">
   ```

## Lưu Ý / Notes

- ✅ Tất cả đường dẫn hình ảnh đã được cập nhật để sử dụng local files
- ✅ Hình ảnh mẫu từ Unsplash đã được tải về
- ✅ Tên phòng khám đã được cập nhật thành "Seitschenko-Dinh"
- 📁 Có nhiều hình ảnh thực tế chất lượng cao sẵn sàng sử dụng trong thư mục
- 🔄 Có thể thay thế hình ảnh mẫu bằng hình thực tế bất cứ lúc nào

## Checklist Hoàn Thành / Completion Checklist

- [x] Tạo thư mục `web/assets/img/`
- [x] Tải hình ảnh cho trang chính (practice.jpg, laboratory.jpg)
- [x] Tải hình ảnh cho 8 trang dịch vụ
- [x] Cập nhật đường dẫn trong index.html
- [x] Cập nhật tên trong header/footer
- [ ] Thay thế bằng hình ảnh thực tế (tùy chọn)
- [ ] Tối ưu hóa kích thước file (khuyến nghị)
- [ ] Thêm logo thực tế (tùy chọn)
