# CLAUDE.md - DigitizedBrains NewWeb Project

## Tổng quan dự án
Website tổng hợp về giải pháp chuyển đổi số và AI cho doanh nghiệp Việt Nam

## Cấu trúc thư mục mục tiêu
```
NewWeb/
├── index.html (Trang chủ tổng quan, menu điều hướng)
├── css/
│   └── style.css (CSS chung cho toàn bộ website)
├── js/
│   ├── chatbot.js (Chatbot tương tác)
│   └── multilang.js (Hỗ trợ đa ngôn ngữ)
├── pages/
│   ├── about/index.html
│   ├── digital-transformation-solution/
│   ├── digital-transformation/
│   ├── ai-agent/
│   ├── blog/
│   ├── resources/
│   └── contact/index.html
└── assets/
    ├── img/ (Logo, hình ảnh)
    └── icons/ (Biểu tượng)
```

## Nhiệm vụ đã hoàn thành
- [x] Kiểm tra cấu trúc thư mục hiện tại
- [x] Phân tích các file nguồn trong digitizedbrains/web/
- [x] Xác định yêu cầu thiết kế
- [ ] Tạo cấu trúc thư mục hoàn chỉnh
- [ ] Tạo CSS/JS chung
- [ ] Copy và chuyển đổi các trang từ nguồn
- [ ] Tạo các trang blog mới
- [ ] Tạo file PDF resources

## Nhiệm vụ đang thực hiện
- Tạo file CLAUDE.md với quy tắc thiết kế

## Quy tắc thiết kế nhất quán Claude Code cần tuân theo

### 1. Cấu trúc HTML
- Sử dụng HTML5 semantic tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Tất cả style inline phải được chuyển vào file `css/style.css`
- JavaScript phải được tách riêng vào thư mục `js/`

### 2. Thiết kế responsive
- Hỗ trợ desktop, tablet, mobile
- Sử dụng CSS Grid và Flexbox
- Breakpoints: 768px (tablet), 480px (mobile)

### 3. Đa ngôn ngữ
- Hỗ trợ 3 ngôn ngữ: Tiếng Việt, English, Deutsch
- Thanh chọn ngôn ngữ ở header
- Nội dung được lưu trong object JavaScript

### 4. Logo và thương hiệu
- Logo DB đặt tại `assets/img/logo.png`
- Phông nền gradient: cam (#FF6B35) sang hồng (#FF69B4)
- Màu chủ đạo: cam, hồng, trắng

### 5. Chatbot
- Xuất hiện trên tất cả các trang
- Sử dụng chatbot.js từ digitizedbrains/web/js/chatbot.js
- Vị trí: góc phải dưới, responsive

### 6. Navigation
- Menu chính ở header
- Breadcrumb cho trang con
- Footer với quick links chia 2 cột

### 7. Tài liệu tham khảo
- Lấy nội dung từ các file trong digitizedbrains/web/
- Bổ sung thông tin từ thư mục document/
- Tập trung vào doanh nghiệp Việt Nam
- Loại bỏ nội dung về truyền thông/truyền hình

### 8. File paths và linking
- Sử dụng relative paths
- Đường dẫn phải nhất quán và chính xác
- Kiểm tra tất cả links hoạt động

### 9. Performance
- Optimize images trong assets/
- Minify CSS/JS khi cần
- Lazy loading cho hình ảnh

### 10. SEO và accessibility
- Meta tags phù hợp
- Alt text cho images
- Proper heading hierarchy (h1, h2, h3...)
- ARIA labels khi cần

## Ghi chú đặc biệt
- KHÔNG tạo content về truyền thông/truyền hình
- Tập trung vào giải pháp doanh nghiệp Việt Nam
- Đảm bảo tất cả trang có chatbot và responsive
- Quick links footer luôn chia 2 cột

- Dùng kỹ thuật SQL để lưu trữ tất cả dữ liệu của người sử dụng nhập vào từ tất cả các trang, tạo các liên kết để lưu trữ dữ liệu từ tất cả các trang vào thư mục web/dulieuSQL.
- Nhúng liên kết 
'<iframe
	src="https://ducnguyen1978-ai-game.hf.space"
	frameborder="0"
	width="850"
	height="450"
></iframe>' 

 Trong trang ai-agents/index.html, tạo thêm nội dung cho See Demo bao gồm hai ứng dụng nằm trong hai thư mục là Applied_Agents và AI_Speech_Text