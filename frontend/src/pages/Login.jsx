import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // If already logged in, jump to dashboard
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Empty field validation
    if (!email.trim()) {
      toast.error("Email address is required", { autoClose: 3000 });
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required", { autoClose: 3000 });
      return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.", { autoClose: 3000 });
      return;
    }
    const loadId = toast.loading("Authenticating...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        toast.update(loadId, {
          render: `Welcome back!`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        navigate("/dashboard");
      } else {
        toast.update(loadId, {
          render: "Incorrect email or password",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(loadId, {
        render: "Network error",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleEnterNavigation = (e) => {
    if (e.key === "Enter") {
      const target = e.target;
      if (target.tagName === "BUTTON" && target.type === "submit") return;

      e.preventDefault();
      const form = e.currentTarget;
      const focusableElements = Array.from(form.querySelectorAll('input:not([disabled]), button[type="submit"]'));
      const index = focusableElements.indexOf(target);

      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="w-full max-w-md card-modern p-10! space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/20 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-theme-teal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-theme-primary tracking-tight">
              System <span className="text-theme-teal">Login</span>
            </h1>
            <p className="text-theme-secondary text-sm mt-1">
              Access your invoicing dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} onKeyDown={handleEnterNavigation} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-theme-muted ml-1 uppercase tracking-widest">
              Email Address
            </label>
            <input
              className="input-field"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-theme-muted ml-1 uppercase tracking-widest">
              Security Pin
            </label>
            <input
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full btn-primary">
            <LogIn className="w-4 h-4" /> Authenticate
          </button>
        </form>

        <p className="text-center text-[10px] text-theme-muted font-bold uppercase tracking-[0.2em] opacity-80">
          AARAMBH JEWELS SYSTEM v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
