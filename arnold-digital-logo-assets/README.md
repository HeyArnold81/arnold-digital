# Arnold Digital logo assets

## Recommended website version
Use `arnold-digital-logo-site-colours.png` on the current Arnold Digital site.

It keeps the approved logo design but aligns it with the site's existing palette:
- Site navy: `#0F172A`
- Site green: `#0F766E`
- Warm off-white page background: `#FFFDF8`

## Approved master brand palette
- Navy: `#0F2D4A`
- Teal: `#14B8A6`
- Light grey: `#E5E7EB`

## Files
- `arnold-digital-logo.png` — approved master logo, transparent
- `arnold-digital-logo-tagline.png` — approved logo + tagline, transparent
- `arnold-digital-icon.png` — approved icon only, transparent
- `arnold-digital-logo-dark.png` — dark-background lockup
- `arnold-digital-logo-site-colours.png` — website-integrated transparent logo
- `arnold-digital-logo-tagline-site-colours.png` — website-integrated logo + tagline
- `arnold-digital-icon-site-colours.png` — website-integrated icon
- `.webp` equivalents — web-ready lossless versions
- `favicon-32.png`, `favicon-48.png`, `favicon-180.png`, `favicon-192.png`, `favicon-512.png`

## Suggested HTML
```html
<a class="brand" href="/" aria-label="Arnold Digital home">
  <img
    src="/assets/brand/arnold-digital-logo-site-colours.webp"
    alt="Arnold Digital"
    width="420"
    height="auto"
  >
</a>
```

For compact/mobile use:
```html
<img
  src="/assets/brand/arnold-digital-icon-site-colours.webp"
  alt=""
  width="48"
  height="48"
>
```

## Suggested CSS variables
```css
:root {
  --brand-navy: #0F172A;
  --brand-green: #0F766E;
  --brand-green-dark: #115E59;
  --brand-warm: #FFFDF8;
}
```
