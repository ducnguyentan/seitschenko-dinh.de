# CLAUDE.md - Zahnarztpraxen Seitschenko-Dinh Website

## Project Overview
Professional dental practice website for Zahnarztpraxen Seitschenko-Dinh based in Wuppertal, Germany. Modern responsive design with comprehensive multilingual support (German, English, Vietnamese, Russian, Arabic) and advanced features including AI chatbot, appointment booking, cookie consent management, and Google Calendar integration.

## Directory Structure
```
Web/
├── index.html                          # Homepage with service overview
├── pages/                              # All subpages
│   ├── about-us.html                  # Team and practice philosophy
│   ├── services.html                  # Services overview page
│   ├── labor.html                     # Laboratory page
│   ├── karriere.html                  # Career opportunities
│   ├── contact.html                   # Contact information & locations
│   ├── appointment.html               # Appointment booking (DISABLED)
│   ├── datenschutz.html              # Privacy policy
│   ├── review.html                    # Patient reviews
│   ├── kinderzahnheilkunde.html      # Pediatric dentistry
│   ├── angstpatienten.html           # Anxiety patients
│   ├── prophylaxe.html               # Prophylaxis
│   ├── zahnerhaltung.html            # Tooth preservation
│   ├── aesthetische-zahnheilkunde.html  # Aesthetic dentistry
│   ├── zahnersatz.html               # Dentures
│   ├── oralchirurgie.html            # Oral surgery
│   └── implantologie.html            # Implantology
├── css/
│   ├── tailwind.min.css              # Tailwind framework (minified)
│   ├── style.css                     # Custom styles (1800+ lines)
│   └── cookie-consent.css            # Cookie consent modal styles
├── js/
│   ├── multilang.js                  # Core multilingual system
│   ├── service-translations.js       # Service pages translations
│   ├── karriere-translations.js      # Career page translations
│   ├── labor-translations.js         # Laboratory page translations
│   ├── chatbot.js                    # AI chatbot integration
│   ├── cookie-consent.js             # Cookie consent functionality
│   ├── slideshow.js                  # Image carousel
│   ├── calendar-integration.js       # Google Calendar integration
│   ├── disable-appointment.js        # Appointment booking disable script
│   └── ai-agent-launcher.js          # AI agent launcher
├── assets/
│   ├── img/                          # Images and photos
│   │   ├── logo.svg                 # Practice logo
│   │   ├── [team-photos].jpg        # Team member photos
│   │   ├── [service-photos].jpg     # Service images
│   │   └── seitschenko_dinh_guide.md # Image management guide
│   └── document/                     # Documentation files
│       ├── motaphongnha.docx        # Practice description (Vietnamese)
│       └── Bericht_AnalyseWebsite_Seitschenko-Dinh_Deutsch.docx
├── components/
│   └── cookie-consent.html          # Cookie consent modal component
└── google-apps-script/              # Google Apps Script integration
    ├── appointmentSheet.gs           # Appointment sheet script
    ├── appointmentSheet_NEW.gs       # New appointment script
    └── [documentation].md            # Setup and deployment guides
```

## Key Features

### 1. Multilingual System (5 Languages)
**Core System**: `js/multilang.js`
- **Supported Languages**: German (de), English (en), Vietnamese (vi), Russian (ru), Arabic (ar)
- **Default Language**: German (de)
- **Storage**: LocalStorage (`selectedLanguage` key)
- **Flag Icons**: FlagCDN service (24x18 resolution)

**Translation Architecture**:
- Common translations in `multilang.js` for global elements (nav, footer, cookie consent)
- Page-specific translations in separate files:
  - `service-translations.js` - Service pages and homepage
  - `karriere-translations.js` - Career page
  - `labor-translations.js` - Laboratory page
- Each page has embedded translations in `<script>` tag with full content for all 5 languages

**Translation System Workflow**:
1. User selects language from dropdown menu
2. Language preference saved to LocalStorage
3. `translatePage()` function runs on page load
4. All elements with `data-translate` attribute get updated
5. URL language parameter `?lang=xx` supported
6. `lang` attribute updates on `<html>` element
7. Meta description and title update dynamically

### 2. Responsive Design System
**Framework**: Tailwind CSS + Custom CSS
**Breakpoints**:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

**Key Components**:
- Fixed header with sticky navigation
- Mobile hamburger menu with slide-out animation
- Responsive service cards with hover effects
- Team member grid (adjusts columns by screen size)
- Responsive footer with multi-column layout

### 3. Cookie Consent Management
**Files**:
- `cookie-consent.css` - Modal styling
- `cookie-consent.js` - Functionality
- `components/cookie-consent.html` - Modal structure

**Features**:
- GDPR compliant cookie consent modal
- Two-tier consent system:
  - Essential cookies (always enabled)
  - External media cookies (optional)
- Multilingual consent text (5 languages)
- Individual privacy settings modal
- LocalStorage persistence (`cookieConsent` key)
- Links to privacy policy and impressum

### 4. AI Chatbot Integration
**File**: `js/chatbot.js`
**Features**:
- Floating chatbot button (bottom-right corner)
- Expandable chat interface
- Quick reply buttons
- Multilingual support
- Responsive design for mobile
- Integration with practice information

### 5. Appointment Booking System (Currently DISABLED)
**Status**: Disabled via `js/disable-appointment.js`
**Original Features**:
- Google Calendar integration
- Multi-dentist scheduling
- Patient data collection
- Email notifications
- Doctor-specific filtering

**Google Apps Script Integration**:
- Located in `google-apps-script/` directory
- `appointmentSheet.gs` - Main appointment handling script
- Calendar sync functionality
- Patient data management in Google Sheets
- Extensive documentation in markdown files

### 6. Team Management
**Structure**:
- Two practice locations: Schwarzbach and Am Loh
- Leadership team section
- Dentist profiles with photos
- Dental assistant profiles
- Laboratory team section

**Current Team Members** (as of latest update):
- **Schwarzbach Location**:
  - Vera Seitschenko-Dinh (Leitende Zahnärztin)
  - Zahnärztin Schapiro
  - Zahnärztin Dr. Kukadiya
  - Dentist Mr. TAIFOUR
  - FRAU YURCHENKO, FRAU SIRAK

- **Am Loh Location**:
  - Zahnärztin Schapiro
  - Zahnärztin Dr. Kukadiya
  - STOMATOLOGIST MR. DIMITRIOS NIKOLAU
  - FRAU VAROQUIER-FETT (formerly FRAU MANUELA VAROQUIER-FETT)
  - Frau Kaschel (photo: lozhnikova_sua.jpg)
  - FRAU JOCHIM, FRAU LEA PACHMANN
  - Vietnamese team members: FRAU NGUYEN THI MY HANH, FRAU NGUYEN NGOC DIEM QUYEN, FRAU PHAM THI VAN, FRAU VU THI KIEU ANH, FRAU NGUYEN THI NUONG

- **Laboratory Team**:
  - HERR YURCHENKO
  - FRAU THIEMANN

- **Management**:
  - Herr Brandon Dinh (Praxisleitung)
  - Frau Sofia Dinh (Praxisleitung)

### 7. Service Pages Architecture
**8 Main Services** with dedicated pages:
1. **Kinderzahnheilkunde** (Pediatric Dentistry)
2. **Angstpatienten** (Anxiety Patients)
3. **Prophylaxe** (Prophylaxis)
4. **Zahnerhaltung** (Tooth Preservation)
5. **Aesthetische Zahnheilkunde** (Aesthetic Dentistry)
6. **Zahnersatz** (Dentures)
7. **Oralchirurgie** (Oral Surgery)
8. **Implantologie** (Implantology)

**Each Service Page Includes**:
- Hero section with gradient background
- Detailed service description
- Benefits section with icons
- FAQ accordion (4 questions per page)
- Call-to-action for appointments
- Full multilingual support (5 languages)
- Service-specific images

### 8. Contact Information
**Two Practice Locations**:

**Location 1: Schwarzbach**
- Address: Schwarzbach 2, 42277 Wuppertal
- Phone: 0202 660828
- Email: schwarzbach@seitschenko-dinh.de
- Hours: Mo. - Do. 08:00-13:00 / 14:00-18:00, Fr. 08:00-13:00

**Location 2: Am Loh** (formerly Wall)
- Address: Loher Str. 40, 42283 Wuppertal
- Phone: 0202 451642
- Email: info@seitschenko-dinh.de
- Hours: Mo. - Do. 08:00-13:00 / 14:00-18:00, Fr. 08:00-13:00

## CSS Architecture

### Custom Styles (`css/style.css`)
**Major Style Sections** (1800+ lines):
1. **Base Styles** (lines 1-18): Body, HTML, box-sizing
2. **Language Switcher** (lines 20-83): Dropdown menu, flags, responsive
3. **Navigation** (lines 85-400): Header, nav links, mobile menu, hamburger animation
4. **Hero Sections** (lines 401-550): Homepage hero, service page heroes
5. **Service Cards** (lines 551-750): Grid layout, hover effects, gradients
6. **Team Sections** (lines 751-1150): Team grids, image handling, labor team cards
7. **Contact Forms** (lines 1151-1300): Form styling, input fields, buttons
8. **Footer** (lines 1301-1450): Multi-column layout, quick links, responsive
9. **Chatbot** (lines 1451-1600): Floating button, chat interface, animations
10. **Scroll Animations** (lines 1601-1700): Scroll reveal effects
11. **Utility Classes** (lines 1701-1800): Margins, paddings, colors, gradients

**Key CSS Features**:
- CSS Grid and Flexbox extensively used
- CSS Variables for colors and spacing
- Smooth transitions and animations
- Gradient backgrounds (linear and radial)
- Custom hover effects
- Responsive images with `object-fit: cover`
- Mobile-first responsive design

### Image Handling System
**Team Member Photos**:
- Container: `.labor-team-image-wrapper`
- Image class: `.labor-team-image`
- Default positioning: `object-position: center 20%`
- Default fit: `object-fit: cover`
- Dimensions: 100% width/height within wrapper
- Transition: `all 0.4s ease`

**Special Cases**:
- Frau Kaschel: Uses `lozhnikova_sua.jpg` (edited version for proper positioning)
- Team photos should maintain consistent vertical alignment
- Use inline `object-position` with `!important` flag to override defaults when needed

## JavaScript Functionality

### Core Scripts
1. **multilang.js** (Main language system)
   - Language detection and switching
   - Translation application
   - LocalStorage management
   - URL parameter handling

2. **service-translations.js** (Service pages)
   - Homepage translations
   - All service page content
   - FAQ translations
   - CTA button text

3. **cookie-consent.js** (Cookie management)
   - Modal display logic
   - Consent preference storage
   - Category management
   - Privacy settings

4. **chatbot.js** (AI Assistant)
   - Chat interface rendering
   - Message handling
   - Quick replies
   - Practice info integration

5. **calendar-integration.js** (Appointment system)
   - Google Calendar API integration
   - Available slot fetching
   - Appointment submission
   - Email notification triggers

### Page-Specific JavaScript
Each HTML page includes inline JavaScript for:
- Mobile menu toggle
- Language switcher dropdown
- Scroll reveal animations
- Service card interactions
- Form validation
- FAQ accordion functionality

## Design Guidelines for Claude Code

### 1. Coding Standards
**HTML**:
- Use semantic HTML5 elements
- Include proper meta tags (charset, viewport, description)
- Add `data-translate` attributes for all translatable text
- Use relative paths for all internal links
- Include proper alt text for images
- Use `id` attributes sparingly, prefer classes

**CSS**:
- Follow BEM-like naming conventions
- Use CSS custom properties for repeated values
- Mobile-first responsive design
- Avoid `!important` except for inline style overrides
- Group related styles together
- Add comments for major sections

**JavaScript**:
- Use strict mode: `"use strict"`
- Wrap in IIFE to avoid global scope pollution
- Use const/let, avoid var
- Add JSDoc comments for functions
- Handle errors gracefully
- Use meaningful variable names

### 2. Content Management Rules
**Team Member Updates**:
- Update photo: Place new image in `assets/img/`
- Update HTML: Change `src` attribute in relevant page
- Update translations: Update name in all 5 languages
- Test: Verify photo displays correctly at all screen sizes

**Service Content Updates**:
- Update in translation files (`service-translations.js`)
- Update for ALL 5 languages (de, en, vi, ru, ar)
- Maintain consistent structure across languages
- Test language switcher after updates

**Contact Information Updates**:
- Update in `contact.html` HTML display
- Update in all translation objects (5 languages)
- Update in footer translations
- Verify on all pages (footer appears everywhere)

### 3. Image Management
**Team Photos**:
- Format: JPG or JPEG preferred
- Naming: Use descriptive names (e.g., `firstname-lastname.jpg`)
- Dimensions: Minimum 800x800px for quality
- Optimization: Compress to < 500KB
- Positioning: Test with default CSS, adjust if needed

**Service Images**:
- Format: JPG for photos, SVG for icons
- Naming: Service name or descriptive (e.g., `implantologie.jpg`)
- Dimensions: Minimum 1200x800px for hero images
- Aspect ratio: 3:2 or 16:9 preferred

**Logo**:
- Format: SVG for scalability
- Location: `assets/img/logo.svg`
- Don't modify without approval

### 4. Translation Workflow
**Adding New Content**:
1. Write German (de) version first (primary language)
2. Translate to English (en)
3. Translate to Vietnamese (vi)
4. Translate to Russian (ru)
5. Translate to Arabic (ar)
6. Test all languages in browser
7. Verify special characters render correctly

**Translation Keys Structure**:
```javascript
{
  section: {
    subsection: {
      element: "Translated text"
    }
  }
}
```

**Common Translation Sections**:
- `nav` - Navigation menu
- `header` - Practice name
- `hero` - Hero section
- `aboutus` - About us content
- `services` - Service descriptions
- `team` - Team member info
- `contact` - Contact information
- `footer` - Footer content
- `cookie` - Cookie consent

### 5. Responsive Design Patterns
**Mobile Menu**:
- Hidden on desktop (>768px)
- Hamburger icon visible on mobile
- Slide-in animation from right
- Overlay background with blur
- Close button in top-right

**Service Cards**:
- Desktop: 3 columns grid
- Tablet: 2 columns grid
- Mobile: 1 column stack

**Team Grid**:
- Desktop: 4 columns
- Tablet: 3 columns
- Mobile: 2 columns

**Footer**:
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column stack

### 6. Performance Optimization
**Images**:
- Compress all images before upload
- Use appropriate image formats
- Implement lazy loading for below-fold images
- Provide appropriate alt text

**CSS**:
- Use Tailwind's purge in production
- Minimize custom CSS
- Avoid duplicate styles
- Use CSS custom properties

**JavaScript**:
- Minimize inline JavaScript
- Defer non-critical scripts
- Use event delegation where possible
- Avoid memory leaks

### 7. SEO Best Practices
**Meta Tags**:
- Unique title for each page (50-60 characters)
- Unique description for each page (150-160 characters)
- Proper lang attribute on `<html>` element
- Canonical URLs if needed

**Content Structure**:
- One H1 per page
- Logical heading hierarchy (H1 → H2 → H3)
- Descriptive link text
- Alt text for all images

**URLs**:
- Use descriptive file names
- Lowercase with hyphens
- Avoid special characters
- Keep URLs short and readable

### 8. Accessibility Guidelines
**Keyboard Navigation**:
- All interactive elements focusable
- Visible focus indicators
- Logical tab order
- Skip links for main content

**Screen Readers**:
- Proper ARIA labels where needed
- Alt text for images
- Form labels properly associated
- Meaningful link text

**Color Contrast**:
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Don't rely on color alone for information

### 9. Browser Compatibility
**Supported Browsers**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

**Graceful Degradation**:
- Provide fallbacks for modern CSS features
- Test without JavaScript enabled
- Ensure core content accessible to all

### 10. Maintenance Procedures
**Regular Updates**:
- Review and update team photos annually
- Update contact information as needed
- Review service descriptions quarterly
- Update copyright year annually

**Testing Checklist**:
- [ ] All languages display correctly
- [ ] Mobile menu functions properly
- [ ] Language switcher works on all pages
- [ ] All links work (internal and external)
- [ ] Images load correctly
- [ ] Forms validate properly
- [ ] Cookie consent saves preferences
- [ ] Chatbot appears on all pages
- [ ] Contact information accurate
- [ ] Footer displays correctly

## Special Notes & Recent Changes

### Recent Updates (2026-03-25):
1. **Opening Hours Updated**: Changed to show lunch break
   - New format: "Mo. - Do. 08:00-13:00 / 14:00-18:00, Fr. 08:00-13:00"
   - Updated in `contact.html` for all 5 languages

2. **Team Member Name Changed**:
   - "FRAU MANUELA VAROQUIER-FETT" → "FRAU VAROQUIER-FETT"
   - Updated in `about-us.html` for all 5 languages
   - Translations updated: MS./BÀ/ГОСПОЖА VAROQUIER-FETT

3. **Team Photo Updated**:
   - Frau Kaschel photo changed from `lozhnikova.jpg` to `lozhnikova_sua.jpg`
   - New photo has better vertical alignment with other team members

### Important Working Configurations:

#### WhisperLiveKit Setup (Speech-to-Text):
**DO NOT CHANGE - CONFIRMED WORKING**

**English Configuration**:
```bash
PATH=".:$PATH" CUDA_VISIBLE_DEVICES="" python -m whisperlivekit.basic_server \
  --model tiny.en \
  --lan en \
  --backend simulstreaming \
  --port 8005
```
- Version: whisperlivekit==0.2.7 (DO NOT upgrade to 0.2.9)
- Backend: simulstreaming (whisper_timestamped is BROKEN)
- Requires: ffmpeg.exe in current directory
- Status: WORKING (confirmed 2025-09-15)

**Vietnamese Optimization** (Best Configuration):
```bash
PATH=".:$PATH" CUDA_VISIBLE_DEVICES="" python -m whisperlivekit.basic_server \
  --model tiny \
  --lan vi \
  --backend simulstreaming \
  --port 8010 \
  --min-chunk-size 1 \
  --frame-threshold 6 \
  --decoder greedy \
  --buffer_trimming_sec 5
```
- Model: tiny (best speed/accuracy balance)
- VAD enabled for better segmentation
- Lag reduction: 6.25s→5.25s, 11.35s→9.46s
- Stability: ~54s before timeout
- Status: BEST PERFORMANCE (tested 2025-09-16)

**Alternative Vietnamese Configs**:
- No-VAD ultra-aggressive: frame-threshold 8, buffer-trim 6s (Good performance)
- Base model: Better accuracy but faster lag accumulation (Moderate)
- Medium model: NOT SUITABLE for real-time (use for batch processing only)

**Failed Configurations** (DO NOT USE):
- ❌ small model: Too slow (120s+ lag)
- ❌ beam search decoder: 3x slower than greedy
- ❌ faster-whisper backend: CUDA dependency issues
- ❌ whisper_timestamped backend: Errors with Vietnamese

### Appointment Booking Status:
- **Currently DISABLED** via `disable-appointment.js`
- Reason: System requires maintenance and testing
- Google Apps Script files preserved in `google-apps-script/` directory
- Extensive documentation available for future re-enablement

### Known Issues:
- Appointment booking temporarily disabled pending system review
- Some older browser versions may have issues with CSS Grid (provide flexbox fallback)

## Contact & Support
For technical questions or issues with this website:
- Review documentation in `google-apps-script/` directory
- Check `assets/img/seitschenko_dinh_guide.md` for image guidelines
- Refer to `README.md` for general project information

## File Paths Reference
**Main Pages**:
- Homepage: `/index.html`
- About Us: `/pages/about-us.html`
- Services: `/pages/services.html`
- Contact: `/pages/contact.html`
- Privacy: `/pages/datenschutz.html`

**Assets**:
- Logo: `/assets/img/logo.svg`
- Team Photos: `/assets/img/[name].jpg`
- Service Images: `/assets/img/[service-name].jpg`

**Scripts**:
- Multilingual: `/js/multilang.js`
- Chatbot: `/js/chatbot.js`
- Cookie Consent: `/js/cookie-consent.js`

**Styles**:
- Tailwind: `/css/tailwind.min.css`
- Custom: `/css/style.css`
- Cookie Consent: `/css/cookie-consent.css`

---

**Last Updated**: 2026-03-25
**Version**: 2.0
**Maintained By**: Claude Code Agent
