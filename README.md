# Aswin Kumar · Gen AI & Automation Engineer

**Live site:** [aswinkumar-4portfolio.vercel.app](https://aswins-portfil0.vercel.app) ·
**Résumé:** [public/resume.pdf](public/resume.pdf)

## About me

I design and ship AI systems that think, act and automate the work around them, from
generative models and agents to the pipelines that keep them reliable in production.

I'm an AI engineer based in Coimbatore, India (open to relocation). I build RAG agents,
computer-vision models and LLM automations for real business problems, with a focus
on answers you can audit, evaluation you can trust, and LLM costs that stay sensible.

**Selected work** (full case studies on the site):

| Project | What it does | Stack |
| --- | --- | --- |
| **AI HR Assistant** | Answers employee questions from a 57-page handbook. A router-first LangGraph agent (6 nodes, 3 routes) sends every calculation and eligibility check to 7 deterministic tools instead of the model. | LangGraph, RAG, Groq, LangSmith |
| **Hazardous Waste Detection** | Finds gas cylinders and shock absorbers in scrap-yard images before they are crushed. Fine-tuned YOLOv8n to 0.92 mAP@50–95, trained on CPU only, served behind a FastAPI REST API. | YOLOv8, PyTorch, FastAPI, Docker |
| **Amazon SEO Automation** | Reads each listing, rewrites its title, description and bullet points for SEO, and publishes the update in Seller Central: 700+ listings, none edited by hand. | Claude, Playwright |
| **Shopify AI Tagging** | Turns an Excel sheet of SKUs into Shopify tag updates, uses an LLM only where tagging needs judgment, and reports each row as Updated / Failed / Unmatched. | n8n, Shopify, LLM |

## Skills

- **Generative AI & LLMs:** RAG, embeddings, vector and semantic search, chunking, prompt engineering, structured outputs, LLM cost optimisation, Claude, OpenAI, Groq
- **Agents & orchestration:** LangChain, LangGraph, LangSmith, tool calling, agentic workflows, state management, guardrails, evals
- **Machine learning & computer vision:** PyTorch, TensorFlow, Keras, scikit-learn, YOLOv8, OpenCV, Roboflow, Albumentations, transfer learning, model evaluation (mAP, precision, recall)
- **Backend & deployment:** Python, FastAPI, REST APIs, Pydantic, Docker, Docker Compose, PostgreSQL, SQL, Git
- **Automation:** n8n, Playwright, browser automation, Shopify, Amazon Seller Central
- **Data:** Pandas, NumPy, Matplotlib, Seaborn
- **Frontend (this site):** React, Vite, Tailwind CSS, GSAP

## Hire me

Available for full-time roles and freelance projects: AI agents, RAG systems, computer
vision, and automating the manual processes that eat your team's week.

- **Email:** [s.aswinkumar2025@gmail.com](mailto:s.aswinkumar2025@gmail.com)
- **LinkedIn:** [aswin-kumar-2004-](https://www.linkedin.com/in/aswin-kumar-2004-)
- **GitHub:** [aswinkumar-analyst](https://github.com/aswinkumar-analyst)
- **Hugging Face:** [aswin-kumar21](https://huggingface.co/aswin-kumar21) · **Kaggle:** [aswinkumar2025](https://www.kaggle.com/aswinkumar2025) · **X:** [@Aswin55224894](https://x.com/Aswin55224894)

Or use the contact form on the site; it goes straight to my inbox.

---

## About this project

The source of my portfolio: a single-page site built with React 19, Vite 8, Tailwind CSS v4 and
GSAP (ScrollTrigger), with Lenis for smooth scrolling.

- An ASCII-hands boot screen that hands off to a sky hero with CSS-animated birds and a banner plane
- A scroll-pinned About section with a word-by-word reveal and skill marquees
- A draggable, infinite Work carousel. Each card opens a case-study dialog that morphs out of
  the card, with chapter tabs, video, and animated diagrams. The open case lives in `?case=<id>`,
  so links to it can be shared.
- A Contact form (Web3Forms) with a paper-plane send animation, and a halftone-sky outro
- Every animation respects `prefers-reduced-motion`

## Usage

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serve the production build
npm run lint      # ESLint
npm run analyze   # build + bundle treemap at dist/stats.html
```

### Editing content

All copy and data live in `src/config/`, and components only render it:

| File | Controls |
| --- | --- |
| `site.js` | Nav, hero headline and banner, résumé link, outro, footer links |
| `about.js` | About statement and the two skill marquee rows |
| `projects.js` | Work cards and their case studies (schema documented at the top of the file) |
| `contact.js` | Contact copy, form settings, email/phone, social links |
| `heroAssets.js` | Hero sky and plane images |

## Structure

```text
public/                 loader.js (boot screen), resume.pdf, og.jpg, favicon.svg
design-assets/hero/     cessna.webp, the plane in the sky banner
src/
  main.jsx, App.jsx     Entry point and page composition
  assets/               Hero sky images; Work covers, stills and videos (works/web/)
  config/               All site content (see above)
  components/           Shared UI: nav, icons, glass surfaces, buttons, MaskedWords
  hooks/                Scroll and animation hooks (hero reveal, carousel, section reveal...)
  lib/                  gsap.js (import GSAP from here), scroll, toast, contact submit, utils
  sections/             One folder per section: hero, about, work, contact, footer
  styles/               Design tokens (index.css) and per-section CSS
```

## Important notes

- **Résumé:** the download button serves `public/resume.pdf`. To update it, replace that file and keep the name.
- **Contact form:** the Web3Forms access key in `src/config/contact.js` is public by design: it only routes messages to the inbox and cannot read them. Spam is filtered by a hidden honeypot field.
- **Empty values are hidden:** an empty `email`/`phone` in `contactDetails`, or a social link with an empty `href` (including `footer.socials` in `site.js`), is not rendered.
- **Hero images:** the AVIF preload links in `index.html` repeat the lists in `heroAssets.js`. Change them together.
- **Deploying:** `vercel.json` and `netlify.toml` set the same security and cache headers, so change both together or delete the one you don't use. Link-preview URLs use the production address the host provides at build time; set `SITE_URL` to override it (`SITE_URL=https://example.com npm run build`).
- **Bundle:** React, GSAP and Lenis build into a separate long-cached `vendor` chunk. The case-study dialog and the toast library are lazy-loaded.
- **Custom cursor:** `src/components/ui/CustomCursor.jsx` is built but switched off. Render `<CustomCursor />` in `App.jsx` to turn it on.
