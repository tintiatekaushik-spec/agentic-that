"use client";

import { useEffect, useRef, useState } from "react";

const EMPTY_FORM = {
  name: "",
  businessName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthModal({ open, initialMode = "login", onClose, onAuthenticated }) {
  const firstInputRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "login");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    setMode(initialMode === "signup" ? "signup" : "login");
    setError("");
    setBusy(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 80);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, initialMode]);

  if (!open) return null;

  const isSignup = mode === "signup";
  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const changeMode = (nextMode) => {
    if (busy) return;
    setMode(nextMode);
    setError("");
  };

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (isSignup && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const endpoint = isSignup ? "/api/platform-auth/signup" : "/api/platform-auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? form : { email: form.email, password: form.password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to continue. Please try again.");
      setForm(EMPTY_FORM);
      onAuthenticated?.(data.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose?.()}
    >
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" aria-label="Close" onClick={onClose} disabled={busy}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>

        <aside className="auth-story">
          <div className="auth-story-brand"><span>AT</span> AgenticThat</div>
          <div className="auth-story-copy">
            <p className="auth-eyebrow">One intelligent workspace</p>
            <h2>Move from idea to automated operation.</h2>
            <p>Access messaging, scraping, publishing, and engagement workflows from one secure account.</p>
          </div>
          <div className="auth-assurances" aria-label="Platform benefits">
            <span><i /> Private workspace</span>
            <span><i /> Connected services</span>
            <span><i /> Enterprise-ready access</span>
          </div>
        </aside>

        <div className="auth-form-panel">
          <div className="auth-mode-switch" aria-label="Authentication mode">
            <button type="button" className={!isSignup ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button>
            <button type="button" className={isSignup ? "active" : ""} onClick={() => changeMode("signup")}>Create account</button>
          </div>

          <header className="auth-heading">
            <p>{isSignup ? "Start your workspace" : "Welcome back"}</p>
            <h1 id="auth-title">{isSignup ? "Create your AgenticThat account" : "Sign in to continue"}</h1>
            <span>{isSignup ? "Set up your secure automation workspace in a minute." : "Use your account to open AgenticThat services."}</span>
          </header>

          <form className="auth-form" onSubmit={submit}>
            {isSignup && (
              <div className="auth-field-row">
                <label className="auth-field">
                  <span>Full name</span>
                  <input ref={firstInputRef} value={form.name} onChange={update("name")} autoComplete="name" placeholder="Your name" minLength={2} maxLength={80} required />
                </label>
                <label className="auth-field">
                  <span>Company</span>
                  <input value={form.businessName} onChange={update("businessName")} autoComplete="organization" placeholder="Workspace name" minLength={2} maxLength={120} required />
                </label>
              </div>
            )}

            <label className="auth-field">
              <span>Work email</span>
              <input ref={isSignup ? undefined : firstInputRef} type="email" value={form.email} onChange={update("email")} autoComplete="email" placeholder="name@company.com" maxLength={254} required />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password-field">
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} minLength={8} maxLength={128} required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </label>

            {isSignup && (
              <label className="auth-field">
                <span>Confirm password</span>
                <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={update("confirmPassword")} autoComplete="new-password" placeholder="Repeat your password" minLength={8} maxLength={128} required />
              </label>
            )}

            <div className={`auth-error${error ? " visible" : ""}`} role="alert">{error || " "}</div>

            <button className="auth-submit" type="submit" disabled={busy}>
              <span>{busy ? "Please wait..." : isSignup ? "Create secure account" : "Continue to AgenticThat"}</span>
              {!busy && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>}
            </button>
          </form>

          <p className="auth-legal">By continuing, you agree to the Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </div>
  );
}
