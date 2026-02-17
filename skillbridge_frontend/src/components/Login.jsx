import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: data.email,
            username: data.username,
            role: data.role,
            token: data.access_token
          })
        );

        if (data.role === "Volunteer") {
          navigate("/profile-volunteer");
        } else if (data.role === "NGO / Organization") {
          navigate("/profile-ngo");
        }
      } else {
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 font-sans animate-fade-in">
      <div className="white-card w-full max-w-sm p-8">
        <div className="mb-8 flex flex-col items-center">
          <Link to="/">
            <img src="/logo.svg" alt="SkillBridge Logo" className="h-10 w-auto mb-4" />
          </Link>
          <p className="text-gray-500 font-medium text-center">Welcome back! Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="premium-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="premium-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Role</label>
            <select
              className="premium-input appearance-none bg-white cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`premium-button ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in text-center font-medium">
            {error}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
