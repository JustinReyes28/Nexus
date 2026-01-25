// Component to inject CSRF token as meta tag
import { useEffect, useState } from "react";
import { getCsrfTokenForClient } from "@/lib/csrf";

export function CsrfMetaTag() {
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(getCsrfTokenForClient());
  }, []);

  if (!token) return null;

  return <meta name="csrf-token" content={token} />;
}
