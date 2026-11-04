// sonner loads in its own chunk, after first paint (see the lazy Toaster in App).
const load = () => import("sonner");

export const toast = {
  success: (...args) => load().then(({ toast }) => toast.success(...args)),
  error: (...args) => load().then(({ toast }) => toast.error(...args)),
};
