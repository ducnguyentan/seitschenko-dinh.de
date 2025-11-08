# Zahnarztpraxen Seitschenko-Dinh - Website Documentation

## Tổng quan dự án

Website nha khoa chuyên nghiệp dựa trên nội dung từ https://seitschenko-dinh.de/ với thiết kế hiện đại từ DigitizedBrains template.

## Cấu trúc Website

### Trang chủ
- **File**: `zahnarzt-index.html`
- **Nội dung**: Giới thiệu phòng khám, đội ngũ, 8 dịch vụ chính, phòng lab, liên hệ
- **Ngôn ngữ**: Tiếng Đức (mặc định), Tiếng Anh, Tiếng Việt

### Các trang dịch vụ (Thư mục: `zahnarzt-pages/`)

1. **kinderzahnheilkunde.html** - Nha khoa Trẻ em
   - Không gian thân thiện cho trẻ
   - Phương pháp điều trị nhẹ nhàng
   - Giáo dục sức khỏe răng miệng vui chơi

2. **angstpatienten.html** - Bệnh nhân Lo lắng
   - Tư vấn chi tiết trước điều trị
   - Các phương pháp an thần (Sedation, Hypnosis)
   - Gây tê nhẹ nhàng và công nghệ hiện đại

3. **prophylaxe.html** - Phòng ngừa
   - Làm sạch chuyên nghiệp (PZR)
   - Loại bỏ cao răng và đánh bóng
   - Fluorid hóa và hướng dẫn vệ sinh

4. **zahnerhaltung.html** - Bảo tồn Răng
   - Trám răng composite
   - Điều trị tủy (Root canal)
   - Nha chu và Inlay/Onlay

5. **aesthetische-zahnheilkunde.html** - Nha khoa Thẩm mỹ
   - Tẩy trắng răng (Bleaching)
   - Mặt dán sứ (Veneers)
   - Bonding và Smile Design

6. **zahnersatz.html** - Răng giả
   - Mão răng (Crowns)
   - Cầu răng (Bridges)
   - Hàm giả bán phần và toàn phần

7. **oralchirurgie.html** - Phẫu thuật Răng miệng
   - Nhổ răng khôn
   - Cắt chóp chân răng (Apicoectomy)
   - Bộc lộ răng và ghép xương

8. **implantologie.html** - Cấy ghép Implant
   - Cấy ghép đơn lẻ
   - Cầu răng trên implant
   - PRF (Platelet-Rich Fibrin) therapy

## Thông tin Liên hệ

### Địa điểm 1: Schwarzbach
- **Địa chỉ**: Schwarzbach 2, 42277 Wuppertal
- **Điện thoại**: 0202 660828
- **Email**: schwarzbach@seitschenko-dinh.de

### Địa điểm 2: Wall
- **Địa chỉ**: Wall 3, 42103 Wuppertal
- **Điện thoại**: 0202 451642
- **Email**: wall@seitschenko-dinh.de

## Đội ngũ Lãnh đạo

- **Vera Seitschenko-Dinh** - Leitende Zahnärztin (Nha sĩ trưởng)
- **Brandon Dinh** - Praxisleitung (Quản lý phòng khám)
- **Sofia Dinh** - Praxisleitung (Quản lý phòng khám)

## Tính năng Kỹ thuật

### Responsive Design
- Desktop, Tablet, Mobile friendly
- Tailwind CSS framework
- Modern animations và scroll reveals

### Đa ngôn ngữ
- **File**: `js/service-translations.js`
- **Ngôn ngữ hỗ trợ**:
  - Tiếng Đức (de) - Mặc định
  - Tiếng Anh (en)
  - Tiếng Việt (vi)
- **Lưu trữ**: LocalStorage cho preference

### Components
- Header với navigation sticky
- Language switcher (Desktop + Mobile)
- Service cards với hover effects
- Team section với avatars
- Contact forms
- Footer với quick links
- AI Chatbot integration

### CSS & JavaScript
- **CSS**:
  - `css/tailwind.min.css` - Framework
  - `css/style.css` - Custom styles
- **JavaScript**:
  - `js/chatbot.js` - AI chatbot
  - `js/service-translations.js` - Multilingual support
  - Inline JS cho page functionality

## Cách sử dụng

### Chạy Website
1. Mở file `zahnarzt-index.html` trong trình duyệt
2. Hoặc deploy lên web server

### Đường dẫn Files
```
web/
├── zahnarzt-index.html          # Trang chủ
├── zahnarzt-pages/              # Thư mục các trang phụ
│   ├── kinderzahnheilkunde.html
│   ├── angstpatienten.html
│   ├── prophylaxe.html
│   ├── zahnerhaltung.html
│   ├── aesthetische-zahnheilkunde.html
│   ├── zahnersatz.html
│   ├── oralchirurgie.html
│   └── implantologie.html
├── css/
│   ├── tailwind.min.css
│   └── style.css
└── js/
    ├── chatbot.js
    └── service-translations.js
```

### Chỉnh sửa Nội dung

#### Thay đổi văn bản
- Chỉnh sửa trong file `js/service-translations.js`
- Tìm key tương ứng (ví dụ: `hero.title`)
- Cập nhật cho cả 3 ngôn ngữ (de, en, vi)

#### Thêm trang mới
1. Copy một trang hiện có
2. Chỉnh sửa nội dung
3. Thêm translations vào `service-translations.js`
4. Link từ trang chủ

#### Thay đổi màu sắc
- Chỉnh sửa gradient colors trong các service cards
- Logo gradient: `from-blue-500 to-cyan-500`
- Service cards: Mỗi card có gradient riêng

## FAQ Section

Mỗi trang dịch vụ có 4 câu hỏi thường gặp (FAQ) với:
- Câu hỏi phổ biến từ bệnh nhân
- Câu trả lời chi tiết và dễ hiểu
- Hỗ trợ 3 ngôn ngữ

## Tối ưu SEO

### Meta Tags
- Title tag động theo ngôn ngữ
- Description tag cho mỗi trang
- Lang attribute cập nhật theo ngôn ngữ

### Structure
- Semantic HTML5
- Proper heading hierarchy (H1, H2, H3)
- Alt text cho images
- Internal linking structure

## Browser Support
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers

## Future Enhancements
- [ ] Online appointment booking
- [ ] Patient portal
- [ ] Before/After gallery
- [ ] Blog integration
- [ ] Google Maps integration
- [ ] Customer testimonials
- [ ] Newsletter signup

## Credits
- **Design**: Based on DigitizedBrains template
- **Content**: Adapted from seitschenko-dinh.de
- **Created**: November 2025
- **Framework**: Tailwind CSS
- **Icons**: Heroicons (SVG)
- **Images**: Unsplash

## License
All rights reserved © 2025 Zahnarztpraxen Seitschenko-Dinh
