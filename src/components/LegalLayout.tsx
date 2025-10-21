import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export const LegalLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">QuotientOne</Link>
          <nav className="hidden sm:flex gap-4 text-sm text-slate-600">
            <Link to="/legal/terms" className="hover:text-slate-900">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link to="/legal/cookies" className="hover:text-slate-900">Cookies</Link>
            <Link to="/legal/refund" className="hover:text-slate-900">Refunds</Link>
            <Link to="/legal/disclaimer" className="hover:text-slate-900">Disclaimer</Link>
            <Link to="/legal/copyright" className="hover:text-slate-900">Copyright & IP</Link>
            <Link to="/legal/contact" className="hover:text-slate-900">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {children}
      </main>

      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} QuotientOne • <Link to="/legal/privacy" className="hover:text-slate-700">Privacy</Link> • <Link to="/legal/terms" className="hover:text-slate-700">Terms</Link>
        </div>
      </footer>
    </div>
  );
};
