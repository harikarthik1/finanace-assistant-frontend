import '../index.css';
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name) newErrors.name = "Name is required";
    if (!emailRegex.test(form.email)) newErrors.email = "Invalid email format";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post("https://finanace-assistant-backend.onrender.com/api/auth/register", form);
      alert("Registered successfully! Please login.");
      navigate("/");
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Signup failed" });
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>
        {errors.password && <p className="error-text">{errors.password}</p>}

        <button type="submit">Register</button>
        {errors.general && <p className="error-text">{errors.general}</p>}
      </form>

      <p>
        Already have an account? <Link to="/" className="auth-link">Login here</Link>
      </p>
    </div>
  );
}
