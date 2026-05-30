import { SignupForm } from './components/SignupForm';

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Decorative gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_top,_theme(colors.indigo.100),_transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"
      />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <SignupForm />
          <footer className="mt-6 text-center text-xs text-slate-400">
            React 18 · TypeScript · Tailwind CSS — 데모용 회원가입 폼
          </footer>
        </div>
      </main>
    </div>
  );
}
