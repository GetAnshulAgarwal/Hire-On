"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function Register() {
  const [userType, setUserType] = useState("candidate");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
    resume: null,
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const router = useRouter();

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return "";
    if (password.length < 8) return "weak";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return "medium";
    if (!/(?=.*[!@#$%^&*])/.test(password)) return "good";
    return "strong";
  };

  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    if (e.target.name === "password") {
      setPasswordStrength(checkPasswordStrength(e.target.value));
    }
  };
  const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error("Password must contain uppercase, lowercase, and number");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // File size validation
    if (formData.profilePic && formData.profilePic.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be less than 5MB");
      return;
    }
    
    if (formData.resume && formData.resume.size > 10 * 1024 * 1024) {
      toast.error("Resume must be less than 10MB");
      return;
    }

    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("userType", userType);
    if (formData.profilePic) form.append("profilePic", formData.profilePic);
    if (userType === "candidate" && formData.resume) form.append("resume", formData.resume);

    console.log("FormData contents:");
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Registration failed");
      if (data.token) {
        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token); // Decode token to get user ID
        localStorage.setItem("userId", decoded.user.id); // Store userId
        localStorage.setItem("userType", decoded.user.userType); // Store userType
        const redirectPath = userType === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
        console.log("Redirecting to:", redirectPath);
        toast.success("Registration successful!"); // Added toast
        router.push(redirectPath);
      } else {
        toast.error(data.msg);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Registration failed: " + err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background"> {/* Use bg-background */}
      <div className="w-full max-w-md p-8 form-card rounded-lg shadow-lg"> {/* Use form-card and rounded-lg */}
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Register</h1> {/* Use text-foreground */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block uppercase text-sm text-foreground">Username</label> {/* Use text-foreground */}
            <input
              type="text"
              id="username"
              name="username"
              onChange={handleChange}
              className="input-field" // Use input-field
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block uppercase text-sm text-foreground">Email</label> {/* Use text-foreground */}
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              className="input-field" // Use input-field
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block uppercase text-sm text-foreground">Password</label> {/* Use text-foreground */}
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              className="input-field" // Use input-field
              required
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === 'weak' ? 'w-1/4 bg-danger' :
                        passwordStrength === 'medium' ? 'w-2/4 bg-warning' :
                        passwordStrength === 'good' ? 'w-3/4 bg-info' :
                        'w-full bg-success'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-danger' :
                    passwordStrength === 'medium' ? 'text-warning' :
                    passwordStrength === 'good' ? 'text-info' :
                    'text-success'
                  }`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Use 8+ characters with uppercase, lowercase, numbers & symbols
                </p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block uppercase text-sm text-foreground">Confirm Password</label> {/* Use text-foreground */}
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              onChange={handleChange}
              className="input-field" // Use input-field
              required
            />
          </div>
          <div>
            <label htmlFor="profilePic" className="block uppercase text-sm text-foreground">Profile Picture</label> {/* Use text-foreground */}
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              onChange={handleFileChange}
              className="text-foreground" // Use text-foreground
            />
          </div>
          {userType === "candidate" && (
            <div>
              <label htmlFor="resume" className="block uppercase text-sm text-foreground">Resume (PDF)</label> {/* Use text-foreground */}
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf"
                onChange={handleFileChange}
                className="text-foreground" // Use text-foreground
              />
            </div>
          )}
          <div className="mt-4">
            <p className="uppercase text-sm text-foreground mb-2">Register As</p> {/* Use text-foreground */}
            <div className="flex justify-center space-x-6">
              <label className="flex items-center text-foreground"> {/* Use text-foreground */}
                <input
                  type="radio"
                  name="userType"
                  value="candidate"
                  checked={userType === "candidate"}
                  onChange={() => setUserType("candidate")}
                  className="mr-2 accent-primary" // Use accent-primary
                />
                Candidate
              </label>
              <label className="flex items-center text-foreground"> {/* Use text-foreground */}
                <input
                  type="radio"
                  name="userType"
                  value="recruiter"
                  checked={userType === "recruiter"}
                  onChange={() => setUserType("recruiter")}
                  className="mr-2 accent-primary" // Use accent-primary
                />
                Recruiter
              </label>
            </div>
          </div>
          <div className="text-center text-sm mt-4">
            <Link href="/" className="text-primary hover:underline">Already a user? Login</Link> {/* Use text-primary */}
          </div>
          <div className="flex justify-center mt-8">
            <button type="submit" className="submit-button">Register</button>
          </div>
        </form>
      </div>
    </main>
  );
}
