import { formConfig } from "../config/contact";

// Each failure carries the message the visitor sees in the toast.
const MESSAGES = {
  network: "Couldn't reach the mail service. Check your connection and try again.",
  timeout: "That took too long, so nothing was sent. Please try again.",
  rate: "Too many messages just now. Please wait a minute and try again.",
  rejected: "The message was rejected. Please try again.",
  server: "The mail service is having trouble. Please try again shortly.",
};

// Posts the message to Web3Forms. Resolves on success, throws Error(message)
// otherwise. Only named fields are sent, never the raw form.
export async function submitContact({ name, email, message }) {
  const fields = {
    access_key: formConfig.accessKey,
    from_name: formConfig.fromName,
    // Newlines are flattened so a crafted name can't reshape the subject line.
    subject: `Portfolio message from ${name}`.replace(/\s+/g, " "),
    name,
    email, // Web3Forms uses this as the reply-to address.
    message,
  };

  let response;
  try {
    response = await fetch(formConfig.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(fields),
      signal: AbortSignal.timeout(formConfig.timeoutMs),
    });
  } catch (error) {
    throw new Error(error.name === "TimeoutError" ? MESSAGES.timeout : MESSAGES.network, { cause: error });
  }

  if (response.status === 429) throw new Error(MESSAGES.rate);
  if (response.status >= 500) throw new Error(MESSAGES.server);

  const data = await response.json().catch(() => null);
  if (!data?.success) throw new Error(MESSAGES.rejected);
}
