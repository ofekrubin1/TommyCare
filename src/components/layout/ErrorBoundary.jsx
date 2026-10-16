import { Component } from 'react';
import { reportError } from '@/lib/errors';

// A screen that crashes shows this (with a way back) instead of a blank page. Nothing saved is lost.
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    reportError(error, 'screen crashed');
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center" dir="rtl">
        <p className="text-4xl">🐣</p>
        <p className="text-lg font-semibold">משהו השתבש במסך הזה</p>
        <p className="text-sm text-mute">הנתונים שמורים. אפשר לטעון מחדש ולנסות שוב.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-white">טעינה מחדש</button>
      </div>
    );
  }
}
