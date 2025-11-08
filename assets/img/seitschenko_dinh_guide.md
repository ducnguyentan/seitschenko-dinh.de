# Hướng dẫn (dành cho Claude code) — Tạo trang web tương tự **seitschenko-dinh.de**

**Mục tiêu:** tái tạo một website nhiều trang cho phòng khám nha khoa "Seitschenko‑Dinh" (Wuppertal) với cấu trúc, giao diện, nội dung và trải nghiệm tương tự. Hướng dẫn này đưa ra cấu trúc, layout, CSS/JS, và ví dụ mã để Claude (hoặc dev) tạo site tĩnh hoặc React/Next.js.

---

## 1. Kiến trúc trang
- Trang chủ (/)
- Giới thiệu (/ueber-uns/)
- Các dịch vụ (/leistungen/) và các trang con:
  - Behandlungen von Kindern (/leistungen/behandlungen-von-kindern/)
  - Angstpatienten (/leistungen/angstpatienten/)
  - Vorsorge → Keimbestimmung (/leistungen/vorsorge/keimbestimmung/)
  - Erhaltende Zahnmedizin → Füllungen, Wurzelbehandlungen
  - Ästhetische Zahnheilkunde → Veneers, Bleaching
  - Zahnersatz, Oralchirurgie, Implantologie
- Labor (/labor/)
- Karriere (/karriere/)
- Impressum (/impressum/)
- Datenschutzerklärung (/datenschutzerklaerung/)
- Các trang phụ: contact modal / appointment form

## 2. Thiết kế & Layout
- Header: logo trái, menu ngang (Start, Über uns, Leistungen (dropdown), Labor, Karriere, Kontakt).
- Hero section: hình lớn + tiêu đề ngắn, CTA "Termin" và "Kontakt".
- Sections theo khối (card/grid) cho các dịch vụ với ảnh nhỏ, tiêu đề và đường dẫn "Mehr erfahren".
- Footer: 2 địa điểm (Schwarzbach, Wall) với địa chỉ/điện thoại, link Impressum / Datenschutzerklärung, copyright.

Responsive: mobile menu (hamburger) + stacked sections.
Accessibility: semantic tags, alt cho ảnh, ARIA labels cho menu, keyboard focus.

## 3. Component / Blocks (chi tiết)
- Header (Logo, Nav, CTA buttons)
- Hero (title, subtitle, CTA primary/secondary)
- ServiceCard (image, title, excerpt, learn-more link)
- TeamGrid (avatar, name, role, contact)
- ContactModal (email buttons, phone numbers, simple appointment form)
- Footer (locations, contact, legal links)

## 4. Ví dụ cấu trúc file (Next.js / React static)
```
/pages
  index.js
  ueber-uns.js
  labor.js
  impressum.js
  /leistungen
    index.js
    behandlungen-von-kindern.js
    angstpatienten.js
    vorsorge.js
    ...
/public
  /images
    hero.jpg
    team-*.jpg
/styles
  globals.css
/components
  Header.jsx
  Footer.jsx
  ServiceCard.jsx
  TeamGrid.jsx
  ContactModal.jsx
```

## 5. HTML + CSS mẫu (tailwind-ready)
- Sử dụng Tailwind utility classes (hoặc cung cấp CSS thuần).
- Header sample (React/JSX):
```jsx
export default function Header(){ return (
  <header className="flex items-center justify-between py-4 px-6">
    <a href="/" className="flex items-center gap-3">
      <img src="/images/logo.svg" alt="Seitschenko-Dinh" className="h-10"/>
      <span className="font-semibold">Seitschenko‑Dinh</span>
    </a>
    <nav className="hidden md:flex gap-6">
      <a href="/">Start</a>
      <a href="/ueber-uns/">Über uns</a>
      <div className="group relative">
        <button className="flex items-center">Leistungen</button>
        <div className="absolute hidden group-hover:block mt-2 p-4 bg-white shadow-lg">...dropdown...</div>
      </div>
      <a href="/labor/">Labor</a>
      <a href="/karriere/">Karriere</a>
    </nav>
    <div className="flex gap-3">
      <a href="#termin" className="btn-primary">Termin</a>
      <button className="md:hidden">☰</button>
    </div>
  </header>
)}
```

## 6. Nội dung — cấu trúc văn bản (dùng để điền vào các trang)
- Mỗi trang nên có: H1, 1–2 mô tả ngắn (50–120 từ), các subheadings (H2/H3) và bullet points cho dịch vụ/ưu điểm, CTA (Termin / Kontakt), và team list nếu có.

## 7. Metadata & SEO
- Title tags: "Zahnarztpraxis Seitschenko‑Dinh — [PageName]"
- Meta description ngắn 140–160 ký tự.
- Open Graph image + Twitter card.

## 8. Tài sản (Assets)
- Các ảnh hero cho clinic, lab, team avatars.
- Icons (phone, email, location).
- Fonts: Inter hoặc system sans.

## 9. Forms & Integrations
- Simple contact form (name, email, phone, message, preferred location) gửi qua e-mail hoặc webhook.
- Appointment CTA: modal + tel: links.

## 10. Triển khai
- Static export: Vercel / Netlify (Next.js export).
- Nếu cần multi-language, đặt i18n (DE default).

---
Nội dung trang (chi tiết được xuất ra file Word kèm theo).
