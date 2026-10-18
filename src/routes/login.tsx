import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { signInTitle } from "../copy";
import { authClient } from "../lib/auth-client";
import { Icon } from "../icons";
import { Nameplate, OxfordRule } from "../mark";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [message, setMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  return (
    <main className="signin">
      <Nameplate />
      <OxfordRule />
      <h1>{signInTitle}</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (signingIn) return;
          const form = new FormData(event.currentTarget);
          const email = String(form.get("email") ?? "");
          const password = String(form.get("password") ?? "");
          setSigningIn(true);
          setMessage("");
          authClient.signIn
            .email({ email, password })
            .then((result) => {
              if (result.error) {
                setMessage(result.error.message ?? "Could not sign in. Check your email and password.");
                return;
              }
              window.location.assign("/");
            })
            .finally(() => setSigningIn(false));
        }}
      >
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-describedby={message ? "signin-error" : undefined}
            required
          />
        </div>
        {message ? (
          <p className="form-error" id="signin-error" role="alert">
            <Icon name="alert" />
            <span>{message}</span>
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={signingIn} aria-busy={signingIn}>
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
