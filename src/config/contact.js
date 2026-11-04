// Contact section copy, details and form settings. Edit text here; components
// only render it.

// Web3Forms says this key is public by design: it only routes submissions to
// your inbox and cannot read them. Spam is filtered by the hidden botcheck
// honeypot in the form.
export const formConfig = {
  endpoint: "https://api.web3forms.com/submit",
  accessKey: "ee599dac-abb0-44f2-8b99-c6dfb132ff64",
  fromName: "Aswin Portfolio",
  timeoutMs: 15000,
  maxLength: { name: 100, email: 254, message: 4000 },
};

export const contactCopy = {
  eyebrow: "Contact",
  headline: "Have something worth automating?",
  summary: "Hiring for a role, scoping a project or stuck on a manual process? Tell me about it and I'll reply by email.",
  formTitle: "Write to me",
  formIntro: "It goes straight to my inbox. A few lines on what you're working on is plenty.",
  labels: { name: "Your name", email: "Email address", message: "What are you working on?" },
  socialsLabel: "Or find me on",
  send: "Send message",
  sending: "Sending",
  // {name} and {email} are filled in from the form.
  successTitle: "Message on its way",
  successBody: "Thanks, {name}. I'll reply to {email}.",
  sendAnother: "Send another message",
};

// Paper plane polygons on a 120x120 grid: the flat sheet, then the folded plane.
export const planeFacets = [
  { sheet: "60,10 60,110 10,110 10,10", plane: "112,14 58,70 8,50 8,50", fill: "#ffffff" },
  { sheet: "60,10 110,10 110,110 60,110", plane: "112,14 72,104 58,70 58,70", fill: "#dbe9f3" },
  { sheet: "60,10 60,110 60,110 60,10", plane: "112,14 58,70 50,92 50,92", fill: "#0f68a6" },
];

// Shown beside the form. Fill in the values: anything left empty is not rendered.
export const contactDetails = {
  email: "",
  phone: "", // digits with country code, e.g. "+91 00000 00000"
};

// Icon row under the details. `icon` names a mark in components/ui/BrandIcons.
// An empty href hides that tile.
export const socialLinks = [
  { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/in/aswin-kumar-2004-" },
  { label: "GitHub", icon: "github", href: "https://github.com/aswinkumar-analyst" },
  { label: "Hugging Face", icon: "huggingface", href: "https://huggingface.co/aswin-kumar21" },
  { label: "Gmail", icon: "gmail", href: "mailto:s.aswinkumar2025@gmail.com" },
  { label: "Kaggle", icon: "kaggle", href: "https://www.kaggle.com/aswinkumar2025" },
  { label: "X", icon: "x", href: "https://x.com/Aswin55224894" },
];
