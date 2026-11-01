// Contact section copy, details and form settings. Edit text here; components
// only render it.

// Web3Forms says this key is public by design: it only routes submissions to
// your inbox and cannot read them. The real gate is hCaptcha, which Web3Forms
// enforces on its servers once it is enabled in the dashboard.
export const formConfig = {
  endpoint: "https://api.web3forms.com/submit",
  accessKey: "ee599dac-abb0-44f2-8b99-c6dfb132ff64",
  // Shared sitekey Web3Forms documents for free plans.
  captchaSitekey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2",
  fromName: "Aswin Portfolio",
  timeoutMs: 15000,
  maxLength: { name: 100, email: 254, message: 4000 },
};

export const contactCopy = {
  eyebrow: "Contact",
  headline: "Have something worth automating?",
  summary: "Tell me about the role, project or problem, and I'll reply by email.",
  topicLegend: "What's this about?",
  topics: ["Job opportunity", "Freelance project", "Collaboration", "Something else"],
  labels: { name: "Name", email: "Email", message: "Message" },
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

// Shown below the form. Fill in the values: anything left empty is not rendered.
export const contactDetails = {
  email: "",
  phone: "", // digits with country code, e.g. "+91 00000 00000"
  location: "",
  linkedin: "", // full URL
  github: "", // full URL
};
