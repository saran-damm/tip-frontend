import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8000;
const BACKEND_HTTP = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

type Stage = "enterDetails" | "otpSent" | "verified";

export default function Register(): JSX.Element {
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("enterDetails");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function validEmail(e: string) {
    return /^\S+@\S+\.\S+$/.test(e);
  }

  // password constraints: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
  function validPassword(p: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(p);
  }

  async function startRegister() {
    setMessage(null);
    if (!name.trim()) {
      setMessage("Enter your name.");
      return;
    }
    if (!validEmail(email)) {
      setMessage("Enter a valid email.");
      return;
    }
    if (!validPassword(password)) {
      setMessage(
        "Password must be ≥8 chars, include upper & lower case letters, a number and a special character."
      );
      return;
    }

    setLoading(true);
    try {
      // Request backend to create pending user and send OTP
      const res = await fetch(`${BACKEND_HTTP}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // if backend is not running, res will throw or be non-ok
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStage("otpSent");
        setResendCooldown(60);
        setMessage("OTP sent to your email. It expires in a few minutes.");
      } else {
        setMessage(json?.error || "Failed to start registration.");
      }
    } catch (err) {
      // fallback for local testing: mark OTP sent and let user continue
      setStage("otpSent");
      setResendCooldown(60);
      setMessage("Backend unreachable — running in test mode. (OTP simulated)");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setMessage(null);
    if (!/^\d{4,8}$/.test(otp)) {
      setMessage("Enter the numeric OTP you received.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        if (json.token) localStorage.setItem("token", json.token);
        setStage("verified");
        toast.success("Signup successful! Please login.");
        setTimeout(() => navigate("/login"), 700);
      } else {
        setMessage(json?.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      // fallback: success in test mode
      setStage("verified");
      toast.success("Signup successful (test mode) — please login.");
      setTimeout(() => navigate("/login"), 700);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (resendCooldown > 0) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendCooldown(60);
        setMessage("OTP resent. Check your inbox.");
      } else {
        setMessage(json?.error || "Could not resend OTP.");
      }
    } catch {
      // fallback
      setResendCooldown(60);
      setMessage("OTP resend simulated (backend unreachable).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {stage === "enterDetails" && (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Create account</h2>
            <p className="text-sm text-gray-500 mb-6">Sign up with name, email and secure password.</p>

            <label className="block text-sm mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded mb-3"
              placeholder="Your full name"
              type="text"
              autoComplete="name"
            />

            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="w-full p-3 border rounded mb-3"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />

            <label className="block text-sm mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded mb-2"
              placeholder="Create a strong password"
              type="password"
              autoComplete="new-password"
            />
            <div className="text-xs text-gray-500 mb-4">
              Password must be at least 8 characters, include uppercase, lowercase, a number and a special character.
            </div>

            {message && <div className="text-sm text-red-600 mb-3">{message}</div>}

            <button
              onClick={startRegister}
              disabled={loading}
              className="w-full py-2 rounded-xl font-medium hover:opacity-95 transition mb-3 btn-primary"
            >
              {loading ? "Sending OTP..." : "Send OTP & Register"}
            </button>

            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="font-medium text-blue-600 hover:underline">
                Sign in
              </button>
            </div>
          </>
        )}

        {stage === "otpSent" && (
          <>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verify email</h2>
            <p className="text-sm text-gray-500 mb-4">
              We sent an OTP to <strong>{email || "(no email provided)"}</strong>.
            </p>

            <label className="block text-sm mb-1">Enter OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="w-full p-3 border rounded mb-3"
              placeholder="123456"
              inputMode="numeric"
            />

            {message && <div className="text-sm text-red-600 mb-3">{message}</div>}

            <div className="flex gap-2 mb-3">
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full py-2 rounded-xl font-medium hover:opacity-95 transition mb-3 btn-primary"
              >
                {loading ? "Verifying..." : "Verify & Finish"}
              </button>

              <button
                onClick={resend}
                disabled={loading || resendCooldown > 0}
                className="py-2 px-4 rounded border disabled:opacity-60"
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
              </button>
            </div>

            <div className="text-sm text-center text-gray-600">
              Wrong email?{" "}
              <button
                onClick={() => {
                  setStage("enterDetails");
                  setOtp("");
                  setMessage(null);
                }}
                className="font-medium text-blue-600 hover:underline"
              >
                Edit details
              </button>
            </div>
          </>
        )}

        {stage === "verified" && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">You're verified</h3>
            <p className="text-sm text-gray-600 mb-4">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
