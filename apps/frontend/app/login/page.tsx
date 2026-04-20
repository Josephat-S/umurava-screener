"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { Eye, EyeOff, Mail, ArrowRight, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex w-full font-sans">

      {/* ─── LEFT — Login Form (50%) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">

        {/* Header */}
        <div className="px-12 pt-9">
          <div className="flex items-center gap-3">
            <NextImage
              src="/login_logo.png"
              alt="Umurava AI"
              width={90}
              height={80}
              className="w-[90px] h-[80px]"
            />
            <span className="text-2xl font-bold tracking-tight text-gray-900">Umurava AI</span>
          </div>
        </div>

        {/* Form — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-10 sm:px-16 lg:px-20 py-10">
          <div className="w-full max-w-[340px]">

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Login</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Welcome! Please fill in the details to get started.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#523bf4] focus:ring-2 focus:ring-[#523bf4]/10 transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-[#523bf4] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#523bf4] focus:ring-2 focus:ring-[#523bf4]/10 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#523bf4] hover:bg-[#432ddb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#523bf4] transition-all shadow-md shadow-[#523bf4]/25 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium shrink-0">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social sign-in buttons */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all shadow-sm"
                title="Sign in with Google"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700">Google</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-200 active:scale-[0.97] transition-all shadow-sm"
                title="Sign in with LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700">LinkedIn</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-400 active:scale-[0.97] transition-all shadow-sm"
                title="Sign in with GitHub"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#24292F">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700">GitHub</span>
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
              Access is restricted to authorized recruiters only.<br />
              Contact your administrator if you need access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-12 pb-8 flex justify-between items-center text-xs text-gray-400">
          <span>umurava.africa</span>
          <a href="mailto:team@umurava.africa" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <Mail className="w-3 h-3" />
            team@umurava.africa
          </a>
        </div>
      </div>

      {/* ─── RIGHT — Info Panel (50%) ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#523bf4] relative overflow-hidden flex-col">

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-white/8 blur-3xl" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-black/15 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-12 py-14 gap-10">

          {/* Headline */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 mb-6">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span className="text-xs font-semibold text-white tracking-wider uppercase">AI Screener Platform</span>
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
              Hire the right people,<br />
              <span className="text-white/60">faster than ever.</span>
            </h2>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Umurava AI Screener helps recruiters automatically evaluate CVs, rank candidates, and generate reports — all in one dashboard.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="w-full rounded-2xl bg-white/10 border border-white/15 p-3 shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Mock browser bar */}
              <div className="h-7 bg-gray-100 flex items-center gap-1.5 px-3 border-b border-gray-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="ml-3 flex-1 h-3.5 bg-gray-200 rounded-full max-w-[140px]" />
              </div>
              {/* Mock dashboard */}
              <div className="flex h-[170px]">
                {/* Sidebar — slim with small icon squares */}
                <div className="w-8 bg-[#523bf4] flex flex-col items-center py-3 gap-3 shrink-0">
                  {/* Active indicator bar */}
                  <div className="w-0.5 h-full absolute left-0 top-0 opacity-0" />
                  {[
                    /* grid icon */
                    <svg key="a" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
                    /* users icon */
                    <svg key="b" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white/50"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                    /* briefcase icon */
                    <svg key="c" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white/50"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
                    /* zap icon */
                    <svg key="d" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-white/50"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  ].map((icon, i) => (
                    <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center ${i === 0 ? "bg-white/20" : ""}`}>
                      {icon}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 p-2.5 flex flex-col gap-2 bg-gray-50">
                  {/* Stat row */}
                  <div className="flex gap-1.5">
                    {[
                      { color: "bg-[#523bf4]", label: "Candidates", val: "128" },
                      { color: "bg-blue-500",   label: "Screened",   val: "94"  },
                      { color: "bg-emerald-500", label: "Shortlisted", val: "32" },
                    ].map((card, i) => (
                      <div key={i} className={`flex-1 ${card.color} rounded-lg p-2 text-white`}>
                        <div className="text-[8px] font-semibold opacity-75">{card.label}</div>
                        <div className="text-sm font-extrabold leading-tight">{card.val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Candidate rows */}
                  {[
                    { initials: "JM", color: "bg-violet-200 text-violet-700", name: "Jean-Marie N.", badge: "Top",  badgeCls: "bg-emerald-100 text-emerald-700" },
                    { initials: "AK", color: "bg-blue-200 text-blue-700",    name: "Amina Kagabo", badge: "Good", badgeCls: "bg-blue-100 text-blue-700"     },
                    { initials: "SR", color: "bg-pink-200 text-pink-700",    name: "Samuel R.",    badge: "Fair", badgeCls: "bg-gray-100 text-gray-500"     },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                      <div className={`w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center shrink-0 ${row.color}`}>{row.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="h-1.5 w-20 bg-gray-200 rounded-full mb-1" />
                        <div className="h-1.5 w-12 bg-gray-100 rounded-full" />
                      </div>
                      <div className={`px-1.5 h-4 rounded-full text-[7px] font-bold flex items-center justify-center shrink-0 ${row.badgeCls}`}>{row.badge}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Key Benefits */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Key benefits</p>
            <div className="space-y-3">
              {[
                "Screen hundreds of CVs automatically — no manual reading",
                "Rank candidates by job fit with objective AI scoring",
                "Export ready-to-use shortlists and screening reports",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#523bf4]" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-white leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
