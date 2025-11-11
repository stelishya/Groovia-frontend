import type React from "react";
import { useState } from "react";
// import { Link } from "react-router-dom"

import type { SignupForm } from "../../types/auth.type";

import {
  Eye,
  EyeOff,
  //     Mail,
  //     User,
  //     Phone,
  //     MapPin,
  AlertCircle,
  // Lock
} from "lucide-react";
import { Link } from "react-router-dom";

export interface AuthSignupProps {
  loginRoute: string
  onSubmit: (data: SignupForm) => Promise<void>
  // title: string
  // subtitle?: string
}

export default function AuthSignup({
  loginRoute,
  onSubmit
  // title,
  // subtitle,
}: AuthSignupProps) {
  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    phone: "",
    role: "dancer", // default
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // console.log(name, value)
    setForm((prevForm) => ({ ...prevForm, [name]: value }))

    // Clear error when user starts typing
    if (error[name]) {
      setError((prevErrors) => ({ ...prevErrors, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const nameField = "username"
    const nameValue = form[nameField as keyof SignupForm] as string
    console.log("name", nameValue)
    // Username
    if (!nameValue) {
      newErrors[nameField] = "Username is required"
    } else if (nameValue.length < 2) {
      newErrors[nameField] = "Username must be at least 2 characters"
    } else if (nameValue.length > 100) {
      newErrors[nameField] = "Username must be less than 100 characters"
    }

    // Email
    if (!form.email) {
      newErrors.email = "Email is required"
    } else if (form.email.length < 5) {
      newErrors.email = "Email must be at least 5 characters"
    } else if (form.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters"
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone
    // if (!form.phone) {
    //   newErrors.phone = "Phone number is required"
    // } else if (!validatePhone(form.phone)) {
    //   newErrors.phone = "Please enter a valid phone number"
    // } else if (!/^\d{10}$/.test(form.phone)) {
    //   newErrors.phone = "Phone number must be exactly 10 digits"
    // }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required"
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (form.password.length > 100) {
      newErrors.password = "Password must be less than 100 characters"
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    return newErrors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Submitting form:", form)
    e.preventDefault()
    let validationErrors: { [key: string]: string } = {}
    validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors)
      return
    }

    setIsLoading(true)
    setError({})

    try {
      console.log("onSubmit in handleSubmit!")
      await onSubmit(form)
    } catch (error) {
      console.error("Signup error:", error)
      setError({ submit: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative w-full min-h-[100px] max-w-8xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600"
      data-oid="2gjyxsh">

      {/* Background image placeholder - you can add your own image */}
      <div
        className="absolute inset-0 bg-[url('/signup-bg.jpg')] bg-cover bg-center opacity-40"
        data-oid="ac05ge9" />


      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-pink-600/80"
        data-oid="7oexzr:" />


      {/* Back button */}
      {/* {onBack &&
      <button
        onClick={onBack}
        className="absolute top-8 left-8 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-200 z-10"
        data-oid="wkzg_kr">

          <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-oid="sp5zmay">

            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
            data-oid="jpjginu" />

          </svg>
        </button> 
      }*/}

      {/* Main content container */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        data-oid="0z8o_w_">

        {/* Left side - Image placeholder */}
        <div className="hidden lg:block" data-oid="x_mrgai">
          <h1
            className="text-5xl md:text-6xl font-bold text-white text-center tracking-wide"
            data-oid="43k7izp">
            Groovia
            {/* {title} */}
          </h1>
          <h3 className="text-white/50 text-center mb-5">Join Groovia Today!</h3>
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/30 to-pink-500/30 backdrop-blur-md border border-white/10"
            data-oid="qrmlkw:">

            {/* You can replace this with an actual image */}
            <img
              src="/src/assets/SignupImage.png"
              alt="Groovia signup"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* <div
              className="absolute inset-0 flex items-center justify-center"
              data-oid="dc:vehc">

              <div className="text-white/50 text-center" data-oid="4j6y_bx">
                <p className="text-sm" data-oid="jusa_f4">
                  Image placeholder
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full" data-oid="fpmj:hd">
          {/* Logo/Title */}

          {/* Form card */}
          <div
            className="bg-purple-300/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl"
            data-oid="5u01pwx">

            <h2
              className="text-3xl font-bold text-purple-900 text-center mb-1"
              data-oid="bm5j7l7">

              Create Account
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
              data-oid="sf3d:yc">

              {/* Name */}
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="username"
                placeholder="Name"
                value={form.username}
                onChange={handleInputChange}
                // required
                className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 placeholder-purple-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                data-oid="xcb2pm:" />
              {error.username && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />&nbsp;
                  {error.username}
                </p>
              )}

              {/* Email */}
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                // type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleInputChange}
                // required
                className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 placeholder-purple-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                data-oid="c7y3cux" />
              {error.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />&nbsp;
                  {error.email}
                </p>
              )}


              {/* Phone */}
              {/* <label className="block text-sm font-medium text-gray-700 mb-0.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleInputChange}
                // required
                className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 placeholder-purple-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                data-oid="rxtfb3r" />
              {error.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />&nbsp;
                  {error.phone}
                </p>
              )} */}

              {/* Role Selector */}
              <label className="block text-sm font-medium text-gray-700 mb-0.5 ">Select Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleInputChange}
                // required
                className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b21a8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1.5rem"
                }}
                data-oid="_f1tb-k">

                {/* <option value="" disabled data-oid="5w0nv30">
                  Select Role
                </option> */}
                <option value="dancer" data-oid="aqnstg3">
                  Dancer
                </option>
                <option value="client" data-oid="us84i64">
                  Client
                </option>
              </select>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Password</label>
                {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-700" /> */}
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                  // required
                  className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 placeholder-purple-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  data-oid=":uyws:_" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors mt-4"
                >
                  {showPassword ? <Eye className="w-5 h-5 text-purple-700" /> : <EyeOff className="w-5 h-5 text-purple-700" />}
                </button>
              </div>
              {error.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />&nbsp;
                  {error.password}
                </p>
              )}


              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  // required
                  className="w-full px-3 py-2 bg-purple-200/80 border-none rounded-xl text-purple-900 placeholder-purple-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  data-oid="5kzxcwk" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors  mt-4"
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5 text-purple-700" /> : <EyeOff className="w-5 h-5 text-purple-700" />}
                </button>
              </div>
              {error.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />&nbsp;
                  {error.confirmPassword}
                </p>
              )}



              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl mt-8"
                data-oid="jr1cs1y">
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-7 text-center" data-oid=".cr:q5-">
              <span className="text-white font-medium" data-oid="t0u2pt-">
                Already have an account?{" "}
              </span>
              <Link to={loginRoute} className="text-purple-900 font-semibold hover:text-purple-800 transition-colors bg-transparent border-none cursor-pointer" data-oid="ys.2j7v">
                Sign In
              </Link>
              {/* <button
                // onClick={onSignInClick}
                className="text-purple-900 font-semibold hover:text-purple-800 transition-colors bg-transparent border-none cursor-pointer"
                data-oid="ys.2j7v">

                Sign In
              </button> */}
            </div>

            {/* Admin Login */}
            {
              // showAdminLogin &&
              // <div className="mt-4 text-center" data-oid="g0xa3.g">
              //     <span className="text-white/100 text-sm" data-oid="se1y44x">
              //       Is Admin?{" "}
              //     </span>
              //     <button
              //     // onClick={onAdminLoginClick}
              //     className="text-purple-700 text-sm font-medium hover:text-pink-100 transition-colors bg-transparent border-none cursor-pointer"
              //     data-oid="jvbs-fe">

              //       Admin Login
              //     </button>
              // </div>
            }
          </div>
        </div>
      </div>
    </div>);


}