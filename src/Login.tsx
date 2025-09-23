import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8000;
const BACKEND_HTTP = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin() {
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    // ---------- FRONTEND-ONLY TEST MODE ----------
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); 
    localStorage.setItem("token", "fake-token");
    setLoading(false);
    navigate("/home");
    return;
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        
        <h1 className="text-xl font-bold mb-1">Welcome</h1>
        <p className="text-sm text-blue-600 mb-6">Please login to continue</p>

        <label className="block text-sm mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          className="w-full p-3 border rounded mb-3"
          placeholder="you@example.com"
          type="email"
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          placeholder="Your password"
          type="password"
        />

        {message && <div className="text-sm text-red-600 mb-3">{message}</div>}

        <button
  onClick={handleLogin}
  disabled={loading}
  className="w-full py-2 rounded-xl font-medium hover:opacity-95 transition mb-3 btn-primary"
>
  {loading ? "Signing in..." : "Sign in"}
</button>

        <div className="text-sm text-center text-gray-600">
          New here?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium text-blue-600 hover:underline"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
