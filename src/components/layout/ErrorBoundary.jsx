import { Component } from "react";

// Last resort for a render crash: the page shows a way forward, not a blank
// screen. Plain markup, so it depends on nothing that may have been what failed.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    window.__boot?.finish(); // don't leave the message behind the boot screen
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold text-ink">This page didn't load properly</h1>
        <a href="/" className="font-medium text-sky underline outline-sky">
          Reload the page
        </a>
      </main>
    );
  }
}
