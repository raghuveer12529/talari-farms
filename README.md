# Talari Farms — Official Website

B2B landing page for **Talari Farms**, India's premium Gac fruit (*Momordica cochinchinensis*) supplier based in Bukkapur, Telangana. The site showcases products, tells the farm's story, and captures bulk-order inquiries via a contact form that delivers directly to email.

**Live site:** [talarifarms.co.in](https://www.talarifarms.co.in)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Fonts | Inter + Poppins (Google Fonts) |
| Email | Resend |
| Deployment | Vercel |

---

## Features

- Responsive landing page with glassmorphism design system
- Sections: Hero · Our Story · Products · Why Gac · Testimonials · Contact · Footer
- Contact form with server-side validation → email delivery via Resend
- SEO: meta tags, Open Graph, Twitter card, JSON-LD structured data (LocalBusiness + Products)
- Auto-generated `sitemap.xml` and `robots.txt`
- Scroll-reveal animations and floating image effects
- Mobile-responsive pill navbar with active section detection

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main landing page (all sections)
│   ├── layout.tsx        # Root layout + SEO metadata
│   ├── globals.css       # Tailwind v4 theme, design tokens, utility classes
│   ├── sitemap.ts        # Auto-generated sitemap
│   ├── robots.ts         # Robots.txt
│   └── favicon.ico       # Site favicon
├── actions/
│   └── contact.ts        # Server action — form validation + Resend email
└── components/
    ├── PremiumNavbar.tsx  # Pill-shaped sticky navbar
    ├── GacProductCard.tsx # Product card with glass design
    └── SectionHeading.tsx # Reusable section heading component

public/
├── logo-lovable.png       # Brand logo
├── hero-gac-lovable.jpg   # Hero section image
├── farm.jpg               # Our Story section image
├── product-fruit.jpg      # Gac Fruit product card
├── product-juice.jpg      # Gac Juice product card
└── product-powder.jpg     # Gac Powder product card
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
RESEND_API_KEY=your_resend_api_key_here
```

Get a free API key at [resend.com](https://resend.com).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variable: `RESEND_API_KEY`
4. Connect domain `talarifarms.co.in` via Vercel → Settings → Domains
5. Submit sitemap at [Google Search Console](https://search.google.com/search-console): `https://www.talarifarms.co.in/sitemap.xml`

---

## Contact

**Talari Farms** · Bukkapur, Telangana, India
- Email: raghu.veer12529@gmail.com
- WhatsApp: +91 92996 59344 · +91 96033 69074
