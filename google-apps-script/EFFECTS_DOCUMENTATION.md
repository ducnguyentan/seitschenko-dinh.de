# Button Effects & Animations Documentation

## Tài liệu hiệu ứng nút "Gửi đi" và các hoạt động tiếp theo

---

## 🎨 Tổng quan các hiệu ứng

Hệ thống hiệu ứng cho nút "Gửi đi" bao gồm **7 trạng thái** với animations phong phú và **đa ngôn ngữ hoàn chỉnh** (5 ngôn ngữ).

---

## 📊 Các trạng thái của nút

### 1. **Trạng thái ban đầu (Initial State)**
```css
background: linear-gradient(to right, #0d9488 via #0891b2 to #0d9488)
```
- Gradient 3 màu teal → cyan → teal
- Animation: `gradient-shift` (di chuyển gradient qua lại)
- Hover: Pulse effect + scale 1.05 + shadow-2xl

**Tính năng:**
- ✅ Icon gửi (paper plane)
- ✅ Text đa ngôn ngữ: "Absenden" / "Send" / "Gửi đi" / "Отправить" / "إرسال"
- ✅ Disabled khi chưa điền đủ thông tin

---

### 2. **Trạng thái gửi (Sending State)**
**Trigger:** User click nút

**Animation sequence:**
1. **Icon fly away** (0-300ms):
   ```css
   @keyframes send-icon-fly {
     0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
     100% { transform: translate(100px, -100px) rotate(45deg); opacity: 0; }
   }
   ```
   - Icon bay lên góc phải và mất dần

2. **Loading spinner** (300ms+):
   - Icon gửi ẩn → Loading spinner xuất hiện
   - Spinner quay liên tục (animate-spin)

3. **Background wave** (animated):
   ```css
   background: linear-gradient(90deg, #0891b2, #06b6d4, #0891b2, #06b6d4)
   animation: gradient-wave 1.5s linear infinite
   ```
   - Gradient màu cyan chuyển động như sóng biển

4. **Status box xuất hiện** (blue theme):
   - Icon: ℹ️ Info circle
   - Title: "📤 Wird gesendet..." (đa ngôn ngữ)
   - Description: "Ihre Buchungsanfrage wird gerade übermittelt..."
   - Background: `bg-blue-50` + `border-blue-200`
   - Animation: Fade in + scale up + auto-scroll

**Duration:** ~1.5 giây (có thể lâu hơn tùy network)

---

### 3. **Trạng thái thành công (Success State)**
**Trigger:** Fetch request thành công

**Animation sequence:**
1. **Success checkmark** (600ms):
   ```css
   @keyframes success-checkmark {
     0% { transform: scale(0) rotate(0deg); opacity: 0; }
     50% { transform: scale(1.2) rotate(180deg); }
     100% { transform: scale(1) rotate(360deg); opacity: 1; }
   }
   ```
   - Checkmark xuất hiện từ nhỏ → to → quay 360°

2. **Button bounce** (600ms):
   ```css
   @keyframes success-bounce {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.05); }
   }
   ```
   - Nút nhảy lên nhẹ nhàng

3. **Background change** (instant):
   ```css
   background: linear-gradient(135deg, #10b981, #059669)
   ```
   - Đổi sang gradient xanh lá (green)

4. **Shimmer effect** (1 giây):
   ```css
   shimmer.style.opacity = '0.3'
   shimmer.style.transform = 'translateX(200%)'
   ```
   - Ánh sáng quét ngang qua nút

5. **Status box update** (green theme):
   - Icon: ✅ Circle checkmark
   - Title: "✅ Erfolgreich gesendet!"
   - Description: "Vielen Dank! Ihr Termin wurde erfolgreich an uns gesendet."
   - Background: `bg-green-50` + `border-green-200`

**Duration:** 3 giây → Redirect về home

---

### 4. **Trạng thái lỗi (Error State)**
**Trigger:** Fetch request thất bại

**Animation sequence:**
1. **Error shake** (500ms):
   ```css
   @keyframes error-shake {
     0%, 100% { transform: translateX(0); }
     25% { transform: translateX(-10px); }
     75% { transform: translateX(10px); }
   }
   ```
   - Nút rung trái/phải (như lắc đầu "không")

2. **Background change** (instant):
   ```css
   background: linear-gradient(135deg, #ef4444, #dc2626)
   ```
   - Đổi sang gradient đỏ (red)

3. **Error icon** (instant):
   - Loading spinner ẩn → X icon xuất hiện
   - Text: "Fehler beim Senden"

4. **Status box update** (red theme):
   - Icon: ❌ Circle X
   - Title: "❌ Fehler beim Senden"
   - Description: "Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut..."
   - Background: `bg-red-50` + `border-red-200`

5. **Auto-reset** (3 giây):
   - Button re-enabled
   - Icon về paper plane
   - Text về "Absenden"
   - Background về teal gradient
   - User có thể thử lại

---

## 🌈 Bảng màu sắc theo ngữ cảnh

| Trạng thái | Button Gradient | Status Box | Icon Color |
|------------|----------------|------------|------------|
| **Initial** | Teal → Cyan → Teal | - | White |
| **Sending** | Cyan wave (animated) | Blue (`#dbeafe`) | Blue (`#1e40af`) |
| **Success** | Green (`#10b981 → #059669`) | Green (`#d1fae5`) | Green (`#065f46`) |
| **Error** | Red (`#ef4444 → #dc2626`) | Red (`#fee2e2`) | Red (`#991b1b`) |

---

## 🌍 Đa ngôn ngữ hoàn chỉnh

### German (de):
- Initial: "Absenden"
- Sending: "Wird gesendet..."
- Success: "Erfolgreich gesendet!"
- Error: "Fehler beim Senden"

### English (en):
- Initial: "Send"
- Sending: "Sending..."
- Success: "Successfully Sent!"
- Error: "Sending Error"

### Vietnamese (vi):
- Initial: "Gửi đi"
- Sending: "Đang gửi..."
- Success: "Gửi thành công!"
- Error: "Lỗi khi gửi"

### Russian (ru):
- Initial: "Отправить"
- Sending: "Отправка..."
- Success: "Успешно отправлено!"
- Error: "Ошибка отправки"

### Arabic (ar):
- Initial: "إرسال"
- Sending: "جار الإرسال..."
- Success: "تم الإرسال بنجاح!"
- Error: "خطأ في الإرسال"

---

## 🎭 Danh sách animations CSS

### 1. `gradient-shift` (3s infinite)
- Di chuyển background gradient qua lại
- Tạo hiệu ứng sống động cho nút

### 2. `button-pulse` (1.5s infinite, on hover)
- Box-shadow mở rộng từ 0 → 10px
- Tạo hiệu ứng "đập" như nhịp tim

### 3. `send-icon-fly` (600ms)
- Icon bay lên góc phải
- Quay 45° và mờ dần

### 4. `gradient-wave` (1.5s infinite, sending state)
- Background gradient di chuyển ngang
- Giống sóng nước chảy

### 5. `success-checkmark` (600ms)
- Checkmark xuất hiện từ 0 → scale 1.2 → 1
- Quay 360° trong quá trình

### 6. `success-bounce` (600ms)
- Button scale từ 1 → 1.05 → 1
- Hiệu ứng nảy nhẹ

### 7. `error-shake` (500ms)
- Button di chuyển trái/phải
- -10px ← 0 → +10px → 0

---

## 📦 Status Message Box

### Cấu trúc HTML:
```html
<div id="status-message" class="hidden">
  <div class="flex items-center gap-3">
    <svg class="status-icon">...</svg>
    <div>
      <p class="status-title">Title here</p>
      <p class="status-description">Description here</p>
    </div>
  </div>
</div>
```

### JavaScript control:
```javascript
showStatusMessage(type, title, description)
// type: 'sending' | 'success' | 'error'
```

### Tính năng:
- ✅ Auto-scroll vào view
- ✅ Fade in/out animation
- ✅ Scale transform (0.95 → 1)
- ✅ Icon tự động đổi theo type
- ✅ Color theme tự động theo type
- ✅ Đa ngôn ngữ hoàn chỉnh

---

## 🔧 Technical Implementation

### CSS Classes:
- `.sending` - Applied during sending
- `.success` - Applied on success
- `.error` - Applied on error
- `.icon-fly` - Trigger fly animation
- `.icon-success` - Trigger checkmark animation

### Icons used:
1. **Paper plane** (send-icon) - Default
2. **Spinner** (loading-icon) - Sending
3. **Checkmark** (success-icon) - Success
4. **X** (error-icon) - Error

### Transitions:
- Button: `500ms cubic-bezier`
- Icons: `300ms ease`
- Status box: `500ms ease`

---

## 🎯 User Experience Flow

```
1. User điền form
   ↓
2. Click "Gửi đi"
   ↓
3. Icon bay đi (300ms)
   ↓
4. Loading + cyan wave + blue status box
   ↓
5a. SUCCESS:                    5b. ERROR:
    → Green checkmark              → Red X
    → Button bounce                → Button shake
    → Shimmer effect               → Red button
    → Green status box             → Red status box
    → Wait 3s                      → Wait 3s
    → Redirect home                → Re-enable button
```

---

## 🚀 Performance

- **CSS animations** (GPU accelerated): transform, opacity
- **No layout reflow**: Chỉ dùng transform, không đổi width/height
- **Minimal JavaScript**: Animation chủ yếu bằng CSS
- **Smooth 60fps**: Tất cả animations được optimize

---

## 💡 Tips cho developer

### Thay đổi màu sắc:
```css
/* Success color */
#confirm-button.success {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Thay đổi timing:
```javascript
await new Promise(resolve => setTimeout(resolve, 1500)); // Sending delay
setTimeout(() => { window.location.href = '...'; }, 3000); // Redirect delay
```

### Thêm animation mới:
```css
@keyframes your-animation {
  0% { /* start state */ }
  100% { /* end state */ }
}

#confirm-button.your-state {
  animation: your-animation 1s ease-out;
}
```

---

**Ngày tạo:** 2025-11-20
**Version:** 1.0
**Tác giả:** Claude Code - Digitized Brains Project
**File liên quan:**
- [appointment.html](../pages/appointment.html)
- [service-translations.js](../js/service-translations.js)
