# Image Assets Directory

This directory contains all images used in the Seitschenko-Dinh dental practice website.

## Required Images

### Main Page (index.html)
1. **practice.jpg** - Modern dental practice interior (800x600px)
   - Used in: About section
   - Suggested: Modern dental office with comfortable seating

2. **laboratory.jpg** - Dental laboratory equipment (800x600px)
   - Used in: Laboratory section
   - Suggested: Modern dental lab with equipment

### Service Pages (pages/*.html)
Each service page uses a hero banner image (1200x600px):

1. **kinderzahnheilkunde.jpg** - Children's dentistry
2. **angstpatienten.jpg** - Anxious patients care
3. **prophylaxe.jpg** - Preventive care
4. **zahnerhaltung.jpg** - Restorative dentistry
5. **aesthetische-zahnheilkunde.jpg** - Cosmetic dentistry
6. **zahnersatz.jpg** - Dentures
7. **oralchirurgie.jpg** - Oral surgery
8. **implantologie.jpg** - Implantology

### Logo
- **logo.png** - Practice logo (200x200px, transparent background)
  - Current: Using gradient "SD" initials

## Image Sources

You can download free dental images from:
- [Unsplash](https://unsplash.com/s/photos/dental)
- [Pexels](https://www.pexels.com/search/dentist/)
- Use your own professional photos

## Usage

Images are referenced in HTML files using relative paths:
```html
<img src="assets/img/practice.jpg" alt="Description">
```

For service pages:
```html
<img src="../assets/img/kinderzahnheilkunde.jpg" alt="Description">
```
