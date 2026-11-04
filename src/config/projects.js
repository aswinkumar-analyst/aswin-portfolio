// Work section copy and projects. Edit, add or remove entries here; components only render it.
// Card fields drive the carousel; `caseStudy` drives the dialog that opens from a card.
// Media lives in src/assets/works/web/, built from the originals by
// `python scripts/optimize-work-assets.py`. Every caseStudy block except
// `summary` is optional: leave one out and its section (and rail entry) is skipped.
//
// Fewer than 6 projects is fine: the carousel repeats the list so the loop never
// shows a gap on wide screens.

import hazardCoverAvif960 from "../assets/works/web/hazard-cover-960.avif";
import hazardCoverAvif1920 from "../assets/works/web/hazard-cover-1920.avif";
import hazardCoverWebp960 from "../assets/works/web/hazard-cover-960.webp";
import hazardCoverWebp1920 from "../assets/works/web/hazard-cover-1920.webp";
import hazardPosterAvif from "../assets/works/web/hazard-poster-4x5.avif";
import hazardPosterWebp from "../assets/works/web/hazard-poster-4x5.webp";
import hazardPredAvif from "../assets/works/web/hazard-predictions.avif";
import hazardPredWebp from "../assets/works/web/hazard-predictions.webp";
import hazardLandscape from "../assets/works/web/hazard-16x9.mp4";
import hazardPortrait from "../assets/works/web/hazard-4x5.mp4";
import hrChatAvif from "../assets/works/web/hr-assistant-chat.avif";
import hrChatWebp from "../assets/works/web/hr-assistant-chat.webp";
import hrCoverAvif960 from "../assets/works/web/hr-assistant-cover-960.avif";
import hrCoverAvif1920 from "../assets/works/web/hr-assistant-cover-1920.avif";
import hrCoverWebp960 from "../assets/works/web/hr-assistant-cover-960.webp";
import hrCoverWebp1920 from "../assets/works/web/hr-assistant-cover-1920.webp";
import hrPosterAvif from "../assets/works/web/hr-assistant-poster-4x5.avif";
import hrPosterWebp from "../assets/works/web/hr-assistant-poster-4x5.webp";
import hrLandscape from "../assets/works/web/hr-assistant-16x9.mp4";
import hrPortrait from "../assets/works/web/hr-assistant-4x5.mp4";

/**
 * @typedef {{ avif: string, webp: string, fallback: string, width: number, height: number, alt: string }} Picture
 *   avif / webp are srcset strings ("url 960w, url 1920w" or a single url)
 *
 * @typedef {object} Project
 * @property {string} id            also the ?case= value in shared links
 * @property {string} title
 * @property {string} client        subtitle line above the title (category)
 * @property {string} description   ~2 lines, the card clamps it
 * @property {string[]} tags        short chips (stack / discipline)
 * @property {Picture | null} cover 16:9 art. Null uses `art`, a generated cover
 * @property {{ shape: string, from: string, to: string, accent: string }} [art]
 *   shape = rings | grid | waves | nodes | bars | orbit, from / to = gradient corners
 * @property {{ duration: string, landscape: string, portrait: string, portraitPoster: Picture }} [video]
 *   one cut in two framings: 16:9 for wide screens, 4:5 for phones held upright
 * @property {CaseStudy} caseStudy
 *
 * @typedef {object} CaseStudy
 * @property {string} summary
 * @property {{ label: string, value: string }[]} [meta]       role, type, focus...
 * @property {{ value: string, label: string }[]} [metrics]    big numbers under the video
 * @property {string} [metricsNote]                           caveat printed under them
 * @property {string[]} [overview]                            paragraphs
 * @property {{ lead: string, points: { title: string, body: string }[] }} [problem]
 * @property {{ lead: string, points: { label?: string, title: string, body: string }[], callout?: string }} [solution]
 * @property {{ lead?: string, lanes: { label?: string, steps: { kind: string, title: string, body: string }[] }[] }} [architecture]
 * @property {{ tag: string, title: string, body: string }[]} [features]
 * @property {{ layer: string, technology: string, reason: string }[]} [stack]
 * @property {{ title: string, problem: string, fix: string }[]} [challenges]
 * @property {(Picture & { caption: string })[]} [gallery]
 * @property {{ title: string, items: { title: string, body: string }[] }} [outcomes]
 * @property {string} [note]                                   closing remark (confidentiality etc.)
 * @property {{ label: string, url: string }[]} [links]
 */

const cover16x9 = (avif960, avif1920, webp960, webp1920, alt) => ({
  avif: `${avif960} 960w, ${avif1920} 1920w`,
  webp: `${webp960} 960w, ${webp1920} 1920w`,
  fallback: webp960,
  width: 1920,
  height: 1080,
  alt,
});

const still = (avif, webp, width, height, alt) => ({ avif, webp, fallback: webp, width, height, alt });

export const workCopy = {
  eyebrow: "Selected work",
  headline: "Selected work & case studies",
  summary:
    "Agents, retrieval systems and automations I have taken from first prototype to production, with the evals and plumbing that keep them reliable.",
  cta: { label: "Start a project", href: "#contact" },
};

/** @type {Project[]} */
export const projects = [
  {
    id: "hr-assistant",
    title: "AI HR Assistant",
    client: "Agentic AI · RAG",
    description:
      "Answers employee questions from a 57-page handbook, and hands every calculation and eligibility check to deterministic code instead of the model.",
    tags: ["LangGraph", "RAG", "Groq", "LangSmith"],
    cover: cover16x9(
      hrCoverAvif960,
      hrCoverAvif1920,
      hrCoverWebp960,
      hrCoverWebp1920,
      "Paper-craft robot speech bubble beside the title AI HR Policy Assistant",
    ),
    video: {
      duration: "0:45",
      landscape: hrLandscape,
      portrait: hrPortrait,
      portraitPoster: still(hrPosterAvif, hrPosterWebp, 720, 900, ""),
    },
    caseStudy: {
      summary:
        "An agentic assistant that answers employee questions from the company handbook, and knows when not to let the language model answer.",
      meta: [
        { label: "Role", value: "System design, graph orchestration, RAG pipeline, tool logic, observability" },
        { label: "Type", value: "Company project, internal HR assistant" },
        { label: "Focus", value: "Auditable answers in a domain where a wrong one has real consequences" },
      ],
      metrics: [
        { value: "3", label: "Routed question types" },
        { value: "7", label: "Deterministic HR tools" },
        { value: "6", label: "Graph nodes" },
        { value: "57", label: "Handbook pages indexed" },
      ],
      overview: [
        "Employees ask about leave, probation, payroll, travel and reimbursements in plain English and get answers that cite the relevant handbook chapter.",
        "The interesting part is not that it chats. Policy explanations come from retrieved handbook text; anything involving arithmetic, dates or a yes/no eligibility decision runs through plain Python functions that encode the handbook's rules.",
      ],
      problem: {
        lead: "HR answers the same questions all day. The answers are in the handbook, but nobody reads 57 pages, and a plain chatbot is the wrong fix.",
        points: [
          {
            title: "LLMs are unreliable at rules and math",
            body: "“1.5 days per month for 7 months” or “90 days from 1 January” is exactly what a model gets wrong, with total confidence.",
          },
          {
            title: "Hallucinated policy is worse than none",
            body: "An invented notice period or claim window can push an employee into a bad decision.",
          },
          {
            title: "Questions come in different shapes",
            body: "“What is the CL policy?” needs retrieval, “Can I take 4 days?” needs a decision, “What’s the weather?” needs a refusal.",
          },
          {
            title: "Handbooks have gaps",
            body: "A good assistant says “the handbook doesn’t define this” instead of guessing.",
          },
        ],
      },
      solution: {
        lead: "A router-first LangGraph state machine. Every question is classified, then sent down the path built for it.",
        points: [
          { label: "policy_question", title: "Retrieve, then answer", body: "Handbook chunks are retrieved and the model answers from that context only." },
          { label: "hr_action", title: "Call tools, never guess", body: "The agent must call one of seven deterministic tools and answer from the result." },
          { label: "out_of_scope", title: "Refuse cleanly", body: "A fixed reply with no LLM call: nothing to jailbreak, no tokens spent." },
        ],
        callout:
          "When a tool rejects a request, the graph detours through retrieval to fetch the rule behind the rejection, then asks the model to explain why and what the employee can do instead. The decision is deterministic; the explanation is grounded in real policy text.",
      },
      architecture: {
        lead: "Six nodes and three conditional branch points. One small typed state travels through every node.",
        lanes: [
          {
            steps: [
              { kind: "LLM", title: "Route", body: "The router returns a validated RouteDecision through structured output, and per-question state is reset." },
              { kind: "Code", title: "Branch", body: "A conditional edge sends the question to retrieval, the tool-using agent, or the out-of-scope reply." },
              { kind: "LLM + tools", title: "Act", body: "Policy questions get a grounded answer. Action questions loop between hr_agent and tools until the model has what it needs." },
              { kind: "Detour", title: "Explain rejections", body: "If a tool returns valid: false, the graph fetches the relevant section once and the agent explains with tool calling disabled." },
              { kind: "Observability", title: "Trace", body: "Each run is tagged and traced in LangSmith with a session id and model metadata." },
            ],
          },
        ],
      },
      features: [
        { tag: "Routing", title: "Intent-aware paths", body: "The router prompt teaches the difference between asking for a rule and asking about a specific request." },
        { tag: "Grounding", title: "Handbook-only answers", body: "The policy prompt forbids invented rules and requires saying so when the context has no answer." },
        { tag: "Accuracy", title: "Deterministic calculations", body: "Leave accrual, probation end dates, payroll deadlines and allowances are computed by code." },
        { tag: "Validation", title: "Rule-based eligibility", body: "Requests are checked against notice periods, probation status, day limits and documents." },
        { tag: "Explainability", title: "Cited rejections", body: "Every tool result carries a policy reference such as “Chapter 7.2”." },
        { tag: "Honesty", title: "Admits policy gaps", body: "When the handbook is silent, the tool returns “undefined” and defers to HR." },
      ],
      stack: [
        { layer: "Orchestration", technology: "LangGraph (StateGraph, ToolNode)", reason: "Explicit, inspectable control flow with conditional edges and loops" },
        { layer: "LLM", technology: "gpt-oss-120b on Groq, temperature 0", reason: "Fast inference; zero temperature for consistent, factual answers" },
        { layer: "Embeddings", technology: "sentence-transformers all-MiniLM-L6-v2", reason: "Runs locally, no embedding API cost, enough for one handbook" },
        { layer: "Vector store", technology: "LangChain InMemoryVectorStore", reason: "Zero infrastructure for a ~57-page corpus" },
        { layer: "Documents", technology: "PyPDF, RecursiveCharacterTextSplitter", reason: "1,000-character chunks, 150 overlap, paragraph structure kept" },
        { layer: "Structured output", technology: "Pydantic", reason: "Forces the router to return a valid route" },
        { layer: "Observability", technology: "LangSmith, LangGraph Studio", reason: "Trace every node and debug the graph visually" },
        { layer: "Tooling", technology: "Python 3.11+, uv, python-dotenv", reason: "Fast, reproducible environments" },
      ],
      challenges: [
        {
          title: "Telling “the rule” apart from “my request”",
          problem: "“How many consecutive CL days are allowed?” and “Can I take 4 days of CL in a row?” look alike but need different handling.",
          fix: "A router prompt built on paired examples, plus structured output so it can only return one of three routes.",
        },
        {
          title: "Explaining a rejection without looping",
          problem: "An agent that can call tools may keep retrying them instead of explaining.",
          fix: "A rejection_explained flag allows the detour exactly once; on the second visit the agent is bound with tool_choice=“none”.",
        },
        {
          title: "Retrieving the right rule after a rejection",
          problem: "“Can I take 5 days of EL?” is a poor query for finding the probation rule.",
          fix: "The retrieval node appends the tool’s rejection reason, so the query carries the language of the rule itself.",
        },
        {
          title: "Gaps in the policy",
          problem: "Claims within 15 days are fine and over 45 need approval, but days 16–45 are undefined.",
          fix: "The tool returns valid: None with an explicit “confirm with HR” message, handled separately from a rejection.",
        },
      ],
      gallery: [
        {
          ...still(hrChatAvif, hrChatWebp, 1338, 560, "HR Assistant chat screen with popular topics such as leave policy and payroll queries"),
          caption: "Demo environment: the assistant greets the employee and suggests common HR topics.",
        },
      ],
      outcomes: {
        title: "What I learned",
        items: [
          { title: "Use the LLM for language, not logic", body: "The reliable way to get correct numbers is to never ask the model to produce them." },
          { title: "Routing is a product decision", body: "Splitting question types up front simplified every downstream prompt." },
          { title: "Explicit state beats clever prompts", body: "One boolean flag solved a loop that prompt wording could not guarantee." },
          { title: "“I don’t know” is a feature", body: "Modelling an undefined outcome separately keeps the assistant trustworthy." },
        ],
      },
      note: "Confidential company project. Source code, demo and traces are private, but I am happy to walk through the routing, tools and RAG pipeline in a call.",
    },
  },
  {
    id: "hazard-detection",
    title: "Hazardous Waste Detection",
    client: "Computer vision",
    description:
      "A YOLOv8 detector that finds gas cylinders and shock absorbers in cluttered scrap-yard images, served through FastAPI and a webcam UI.",
    tags: ["YOLOv8", "PyTorch", "FastAPI", "Docker"],
    cover: cover16x9(
      hazardCoverAvif960,
      hazardCoverAvif1920,
      hazardCoverWebp960,
      hazardCoverWebp1920,
      "Collage of a scanning eye, a gas cylinder and a shock absorber under the title Hazardous Waste Detection",
    ),
    video: {
      duration: "0:45",
      landscape: hazardLandscape,
      portrait: hazardPortrait,
      portraitPoster: still(hazardPosterAvif, hazardPosterWebp, 720, 900, ""),
    },
    caseStudy: {
      summary:
        "An end-to-end computer vision system that spots the scrap-yard items that are dangerous to crush, from dataset validation to a containerised REST API.",
      meta: [
        { label: "Role", value: "Data, training, evaluation, API and deployment" },
        { label: "Data", value: "Roboflow Universe, CC BY 4.0" },
        { label: "Focus", value: "Small-data detection that runs on a CPU" },
      ],
      metrics: [
        { value: "0.922", label: "mAP@50–95, validation" },
        { value: "2", label: "Hazard classes" },
        { value: "1,161", label: "Labelled objects after balancing" },
        { value: "~84 min", label: "Training time, CPU only" },
      ],
      metricsNote:
        "The validation set is small (12 images) and shares source photos with some augmented training images, so these scores show the pipeline learns the task but overstate performance on a new yard.",
      overview: [
        "Scrap yards process thousands of mixed metal parts a day. A few are dangerous to crush, shred or cut: pressurised gas cylinders can explode, and shock absorbers carry hydraulic oil that must be drained first.",
        "This project covers the full lifecycle: dataset validation, class balancing, transfer-learning YOLOv8, evaluation, and deployment as a REST API with a web front end, all in Docker and driven from one command-line entry point.",
      ],
      problem: {
        lead: "Hazards are spotted by workers looking at piles of scrap: slow, inconsistent across shifts, and it puts people next to the very objects that are dangerous.",
        points: [
          { title: "Class 0 · Cylinders", body: "May hold LPG, CNG or refrigerant under pressure. Explosion risk if crushed or cut." },
          { title: "Class 1 · Shock absorbers", body: "Contain hydraulic oil that is toxic and must be drained before recycling." },
          { title: "A hard visual task", body: "Items are rusted, half buried, oddly lit and surrounded by look-alike metal parts." },
        ],
      },
      solution: {
        lead: "A single-stage detector looks at the whole image once and returns boxes, classes and scores fast enough for live camera feeds. YOLOv8 nano started from COCO weights, so it only had to learn two classes.",
        points: [
          { label: "Data", title: "Validated and rebalanced", body: "Polygon-annotated images, checked and balanced with targeted augmentation." },
          { label: "Model", title: "YOLOv8n with early stopping", body: "Evaluated with mAP, precision, recall and confusion matrices." },
          { label: "Serving", title: "FastAPI, model loaded once", body: "Answers image requests with JSON detections and an annotated image." },
          { label: "Interface", title: "Upload or webcam", body: "A lightweight page for drag-and-drop uploads and webcam capture." },
        ],
      },
      architecture: {
        lead: "A training pipeline produces best.pt; a deployment pipeline serves it. One config.yaml drives both, so nothing is hard-coded.",
        lanes: [
          {
            label: "Training",
            steps: [
              { kind: "Input", title: "Roboflow dataset", body: "Polygon labels for the two hazard classes." },
              { kind: "Prepare", title: "Validate and split", body: "Pairs images with labels, checks class IDs and ranges, splits 80/10/10, writes data.yaml." },
              { kind: "Balance", title: "Label-aware augmentation", body: "Polygons travel as keypoints, so flips, rotations and scaling keep labels aligned." },
              { kind: "Train", title: "YOLOv8n transfer learning", body: "640 px, up to 50 epochs, early stopping after 10 without improvement." },
              { kind: "Output", title: "best.pt and a report", body: "mAP, per-class precision and recall, curves and a text report." },
            ],
          },
          {
            label: "Deployment",
            steps: [
              { kind: "Client", title: "Upload or webcam", body: "HTML, CSS and vanilla JS using Fetch and MediaDevices." },
              { kind: "API", title: "POST /api/predict/image", body: "FastAPI with Pydantic schemas, CORS, health and model-info endpoints." },
              { kind: "Model", title: "Singleton loader", body: "Weights are read once on first use and shared by every request." },
              { kind: "Response", title: "Detections and annotated image", body: "JSON boxes and counts plus a base64 image with boxes drawn." },
            ],
          },
        ],
      },
      features: [
        { tag: "Detection", title: "Two-class hazard detection", body: "Boxes, labels and confidence scores with per-class counts." },
        { tag: "API", title: "REST API with live docs", body: "Predict, health and model-info endpoints plus Swagger UI at /docs." },
        { tag: "Interface", title: "Upload or webcam", body: "The annotated image and a count breakdown side by side." },
        { tag: "Inference", title: "Image, batch and video", body: "One detector class handles a photo, a folder, or a video frame by frame." },
        { tag: "Pipeline", title: "One command", body: "main.py --step full runs prepare, balance, visualise, train and evaluate." },
        { tag: "Ops", title: "Containerised", body: "Dockerfile with a health check; Compose mounts data and outputs as volumes." },
      ],
      stack: [
        { layer: "Model", technology: "Ultralytics YOLOv8, PyTorch, Torchvision", reason: "Fast single-stage detection with COCO-pretrained weights" },
        { layer: "Vision & data", technology: "OpenCV, Albumentations, Supervision, NumPy", reason: "Label-aware augmentation and drawing" },
        { layer: "Visualisation", technology: "Matplotlib, Seaborn", reason: "Training curves and confusion matrices" },
        { layer: "Backend", technology: "FastAPI, Uvicorn, Pydantic v2", reason: "Typed, documented inference API" },
        { layer: "Frontend", technology: "HTML, CSS, vanilla JavaScript", reason: "No build step for a single upload and webcam page" },
        { layer: "Ops", technology: "Docker, Docker Compose, Roboflow, Loguru", reason: "Reproducible runs and deployment" },
      ],
      challenges: [
        {
          title: "Class imbalance",
          problem: "Shock absorbers outnumbered cylinders, so the model risked favouring the majority class.",
          fix: "Oversampling the minority class, preferring cylinder-only images so augmentation would not also inflate the majority. Final split: 504 to 657.",
        },
        {
          title: "Keeping polygons aligned",
          problem: "Standard augmentation rotates the pixels but not the annotation, silently corrupting labels.",
          fix: "Every polygon vertex is a keypoint, so image and label transform together, then points are clipped and re-normalised.",
        },
        {
          title: "Cluttered, low-light scenes",
          problem: "Rust, shadows and overlapping metal blur the object boundaries.",
          fix: "Photometric augmentation plus mosaic, so the model sees objects at many scales and in many contexts.",
        },
        {
          title: "Training without a GPU",
          problem: "Every training run had to fit on a CPU.",
          fix: "The nano variant, COCO transfer learning and early stopping: about 84 minutes, and a 6 MB model.",
        },
      ],
      gallery: [
        {
          ...still(hazardPredAvif, hazardPredWebp, 1080, 720, "Six validation images with predicted boxes around shock absorbers and gas cylinders"),
          caption: "Predictions on validation images: shock absorbers in cyan, cylinders in blue, with confidence scores.",
        },
      ],
      outcomes: {
        title: "What I learned",
        items: [
          { title: "Data work beat model choice", body: "Fixing imbalance and keeping labels correct gave the biggest gains." },
          { title: "Split by source image", body: "When augmented copies exist, splitting by file leaks into evaluation." },
          { title: "Transfer learning makes small data work", body: "Even on a CPU, a COCO start made two-class detection practical." },
          { title: "Serving ML is software", body: "Validation, errors, model lifecycle and containers took as much care as training." },
        ],
      },
    },
  },
  {
    id: "amazon-seo",
    title: "Amazon SEO Automation",
    client: "GenAI · Browser automation",
    description:
      "Claude rewrites each listing's title, description and bullets; Playwright publishes them to Seller Central. 700+ listings, none edited by hand.",
    tags: ["Claude", "Playwright", "Seller Central", "E-commerce"],
    cover: null,
    art: { shape: "bars", from: "#e3c79c", to: "#a97f4f", accent: "#081f36" },
    caseStudy: {
      summary:
        "Turning a 700-listing manual editing backlog into an AI-driven content pipeline: Claude writes, Playwright publishes, the catalogue keeps one standard.",
      meta: [
        { label: "Role", value: "Designed, built and scaled the pipeline end to end" },
        { label: "Platform", value: "Amazon Seller Central" },
        { label: "Focus", value: "Consistent, search-friendly content at catalogue scale" },
      ],
      metrics: [
        { value: "700+", label: "Listings optimised" },
        { value: "3", label: "Content fields per listing" },
        { value: "60–70%", label: "Reported sales increase*" },
        { value: "0", label: "Listings edited by hand" },
      ],
      metricsNote:
        "*The business reported this increase after the rollout. Pricing, advertising, seasonality and inventory also move sales, so it is not an isolated measure of the automation.",
      overview: [
        "Product content drives discoverability on Amazon, but keeping it current does not scale. I built an end-to-end workflow that optimises listings at catalogue scale.",
        "Claude rewrites each product's title, description and key-feature bullets into clearer, SEO-focused copy. Playwright then publishes the changes directly in Seller Central.",
      ],
      problem: {
        lead: "Every listing needed three separate content updates. Across 700+ products that meant thousands of manual edits, and quality drifted with whoever made them.",
        points: [
          { title: "Product titles", body: "Rewritten listing by listing for clarity and search relevance." },
          { title: "Product descriptions", body: "Long-form copy that needed informative, consistent messaging." },
          { title: "Bullet points", body: "Key-feature highlights that needed structure and keyword awareness." },
          { title: "700+ products", body: "Repeating all of the above for each product created heavy operational overhead." },
        ],
      },
      solution: {
        lead: "Language-model generation paired with browser automation, covering the whole loop from reading a listing to publishing the improved version.",
        points: [
          { label: "Claude", title: "Handles judgment", body: "Writing good product copy takes language understanding and context." },
          { label: "Playwright", title: "Handles repetition", body: "Operating Seller Central is predictable and repetitive: a fit for reliable automation." },
        ],
        callout:
          "Split the work by what each tool is good at: the model only writes copy, and everything that clicks, fills or submits is deterministic automation.",
      },
      architecture: {
        lead: "An orchestrator works through the catalogue one listing at a time, running the same six steps for each.",
        lanes: [
          {
            steps: [
              { kind: "Orchestrator", title: "Queue the listing", body: "Take the next product from the catalogue and start its workflow." },
              { kind: "Playwright", title: "Access the listing", body: "Open the listing editor and read the current title, description and bullets." },
              { kind: "Claude", title: "Send to Claude", body: "The existing content is the starting point for optimisation." },
              { kind: "Claude", title: "Generate SEO content", body: "Clearer, more informative, search-friendly copy for all three fields." },
              { kind: "Playwright", title: "Publish the update", body: "Fill the optimised fields in the editor and submit the change." },
              { kind: "Orchestrator", title: "Move to the next", body: "Repeat until the whole catalogue meets the same standard." },
            ],
          },
        ],
      },
      features: [
        { tag: "Titles", title: "Keyword-rich, readable titles", body: "Clear for shoppers and better structured for search." },
        { tag: "Descriptions", title: "Consistent long-form copy", body: "One informative tone across every product." },
        { tag: "Bullets", title: "Feature-focused bullet points", body: "Scannable highlights with keyword awareness." },
        { tag: "Scale", title: "One standard everywhere", body: "Quality no longer depends on who edited a listing, or when." },
      ],
      stack: [
        { layer: "AI model", technology: "Claude", reason: "Generates optimised titles, descriptions and bullet points" },
        { layer: "Browser automation", technology: "Playwright", reason: "Drives the Seller Central UI the way a person would, at catalogue scale" },
        { layer: "Orchestration", technology: "Automation workflow", reason: "Iterates listing by listing and coordinates read, AI and write" },
        { layer: "Platform", technology: "Amazon Seller Central", reason: "Source of current content and destination for updates" },
      ],
      outcomes: {
        title: "Business impact",
        items: [
          { title: "Removed repetitive manual work", body: "Editing that happened one listing at a time now runs as a pipeline." },
          { title: "Consistent quality", body: "Every listing follows the same optimisation standard." },
          { title: "More search-friendly content", body: "Titles, descriptions and bullets that are clearer for shoppers and search." },
        ],
      },
    },
  },
  {
    id: "shopify-tagging",
    title: "Shopify AI Tagging",
    client: "Workflow automation · LLM",
    description:
      "An n8n workflow that turns an Excel sheet of SKUs into checked, AI-assisted tag updates across a Shopify catalog, with a report of every outcome.",
    tags: ["n8n", "Shopify", "LLM", "Excel"],
    cover: null,
    art: { shape: "nodes", from: "#f1ece1", to: "#cfc4ae", accent: "#0f68a6" },
    caseStudy: {
      summary:
        "Bulk product tag management, from thousands of manual edits to one file upload: deterministic where possible, AI where judgment counts.",
      meta: [
        { label: "Role", value: "AI / automation engineer" },
        { label: "Platform", value: "n8n · Shopify" },
        { label: "Focus", value: "Bulk catalog operations" },
      ],
      metrics: [
        { value: "1", label: "File upload per bulk update" },
        { value: "7", label: "Workflow stages" },
        { value: "3", label: "Outcomes tracked per row" },
        { value: "1", label: "AI step, only where needed" },
      ],
      overview: [
        "The operations team uploads an Excel file of SKUs and instructions. The workflow finds each product, uses an LLM to decide or generate tags where needed, writes the changes to Shopify, and returns a report of what succeeded, what failed and what could not be matched.",
      ],
      problem: {
        lead: "Updating tags across a large catalog meant handling every product by hand. Repetitive, rule-based, little room for error: a good fit for automation.",
        points: [
          { title: "One product at a time", body: "Each SKU was searched, opened, edited, saved and checked separately." },
          { title: "Work grows with the catalog", body: "Thousands of products meant thousands of repeated steps." },
          { title: "Inconsistent tags", body: "When people pick tags by hand, naming and coverage drift." },
          { title: "No audit trail", body: "Completed, failed and missing updates needed separate manual records." },
          { title: "Hard to catch errors", body: "A wrong or missing SKU could easily go unnoticed." },
        ],
      },
      solution: {
        lead: "One workflow replaces the manual loop. The team stays in a tool it already uses, and n8n handles orchestration, Shopify API calls and record-keeping.",
        points: [
          { label: "Rule-based", title: "Lookup, update, report", body: "These steps behave the same way on every run." },
          { label: "AI", title: "Tag decisions only", body: "The LLM runs at the one step that needs judgment: deciding or generating tags from product data." },
        ],
      },
      architecture: {
        lead: "Seven stages. A branch sends a row through the LLM only when its instructions call for it.",
        lanes: [
          {
            steps: [
              { kind: "Input", title: "Upload", body: "The team submits an Excel file with SKUs and update instructions." },
              { kind: "n8n", title: "Parse", body: "Rows are extracted and normalised into structured items." },
              { kind: "Shopify", title: "Identify", body: "Each SKU is matched to its Shopify product; misses go straight to Unmatched." },
              { kind: "LLM", title: "AI tagging", body: "Where instructions call for it, the LLM reads the product data and suggests tags." },
              { kind: "Shopify API", title: "Update", body: "Tags are written to the matched product through the Shopify integration." },
              { kind: "Shopify", title: "Persist", body: "Changes are saved directly to the live store." },
              { kind: "Output", title: "Report", body: "Every row lands in Updated, Failed or Unmatched in a final execution report." },
            ],
          },
        ],
      },
      features: [
        { tag: "Input", title: "Excel-in workflow", body: "The ops team needs no new tools or training." },
        { tag: "Matching", title: "SKU-based updates", body: "Every change is tied to the product’s unique identifier." },
        { tag: "AI", title: "AI where judgment is needed", body: "The LLM only handles tag decisions; the rest follows fixed rules." },
        { tag: "Shopify", title: "Direct updates", body: "Nobody edits products in the admin panel." },
        { tag: "Outcomes", title: "Three-way results", body: "Every row is accounted for: updated, failed or unmatched." },
        { tag: "Audit", title: "Execution report", body: "Replaces the manual tracking spreadsheets." },
      ],
      stack: [
        { layer: "Orchestration", technology: "n8n", reason: "Visual workflow with branching, retries and integrations" },
        { layer: "Input", technology: "Excel (.xlsx)", reason: "Parsed with n8n file extraction; the team already works in it" },
        { layer: "Commerce", technology: "Shopify Admin API", reason: "Product lookup by SKU and tag updates" },
        { layer: "AI", technology: "LLM, called from n8n", reason: "Tag decisions from product information" },
        { layer: "Output", technology: "Execution report", reason: "Updated, failed and unmatched rows in one place" },
      ],
      outcomes: {
        title: "Business impact",
        items: [
          { title: "Less repetitive work", body: "The find-edit-save-verify loop is no longer done by hand." },
          { title: "Faster bulk changes", body: "A catalog-wide update is one upload instead of thousands of edits." },
          { title: "More consistent tags", body: "The same logic runs on every product, every time." },
          { title: "Better visibility", body: "Each run records what changed and what needs attention." },
        ],
      },
    },
  },
];
