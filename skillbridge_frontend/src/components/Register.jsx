import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [role, setRole] = useState("Volunteer");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    location: "",
    skills: [],
    organizationName: "",
    organizationDescription: "",
    website: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);

  const navigate = useNavigate();

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username =
        "Username must contain only letters and numbers";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one number";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (role === "NGO") {
      if (!formData.organizationName.trim())
        newErrors.organizationName =
          "Organization Name is required";

      if (!formData.organizationDescription.trim())
        newErrors.organizationDescription =
          "Organization Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      role: role,
      location: formData.location || null,
      skills: formData.skills.join(", ") || null,
      organization_name: formData.organizationName || null,
      organization_description:
        formData.organizationDescription || null,
      website_url: formData.website || null
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Redirecting to login...");
        navigate("/login");
      } else {
        setErrors({
          server:
            data.detail ||
            "Registration failed. Please try again."
        });
      }
    } catch (error) {
      setErrors({
        server: "Failed to connect to the server."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillOptions = [
    "Web Development",
    "Graphic Design",
    "Content Writing",
    "Social Media Management",
    "Teaching / Tutoring",
    "Event Management",
    "Fundraising",
    "Marketing",
    "Photography",
    "Video Editing",
    "Data Analysis",
    "UI/UX Design",
    "Public Speaking",
    "Project Management",
    "Translation Services"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 font-sans animate-fade-in">
      <div className="white-card w-full max-w-md p-8">

        <div className="mb-8 flex flex-col items-center">
          <Link to="/">
            <img
              src="/logo.svg"
              alt="SkillBridge Logo"
              className="h-10 w-auto mb-4"
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-gray-500 text-sm">
            Join SkillBridge to connect with NGOs and volunteering opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              type="text"
              className={`premium-input ${errors.username ? 'border-red-500' : ''}`}
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              className={`premium-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              className={`premium-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              className={`premium-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="fullName"
              type="text"
              className={`premium-input ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              I am a <span className="text-red-500">*</span>
            </label>
            <select
              className="premium-input appearance-none bg-white font-medium cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Volunteer">Volunteer</option>
              <option value="NGO">NGO / Organization</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">
              Location (Optional)
            </label>
            <input
              name="location"
              type="text"
              className="premium-input"
              placeholder="E.g. London, UK"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Volunteer Skills */}
          {role === "Volunteer" && (
            <div className="space-y-1 relative">
              <label className="text-sm font-semibold text-gray-700 block">
                Skills (Optional)
              </label>

              <div
                onClick={() => setIsSkillOpen(!isSkillOpen)}
                className="premium-input cursor-pointer flex justify-between items-center"
              >
                {formData.skills.length > 0
                  ? formData.skills.join(", ")
                  : "Select skills"}
                <span>▼</span>
              </div>

              {isSkillOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto p-3">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              skills: [...formData.skills, skill]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              skills: formData.skills.filter(
                                (item) => item !== skill
                              )
                            });
                          }
                        }}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NGO Fields */}
          {role === "NGO" && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="organizationName"
                  type="text"
                  className={`premium-input ${errors.organizationName ? 'border-red-500' : ''}`}
                  placeholder="Green Earth Foundation"
                  value={formData.organizationName}
                  onChange={handleChange}
                />
                {errors.organizationName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.organizationName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">
                  Organization Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="organizationDescription"
                  className={`premium-input min-h-[100px] py-3 resize-none ${errors.organizationDescription ? 'border-red-500' : ''}`}
                  placeholder="Tell us about your mission..."
                  value={formData.organizationDescription}
                  onChange={handleChange}
                />
                {errors.organizationDescription && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.organizationDescription}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">
                  Website URL (Optional)
                </label>
                <input
                  name="website"
                  type="url"
                  className="premium-input"
                  placeholder="https://example.org"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {errors.server && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center font-medium">
              {errors.server}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`premium-button ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
