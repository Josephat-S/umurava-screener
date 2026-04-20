"use client";

import React, { useState } from "react";
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
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#523bf4]">
              <path d="M10 8H7C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16H10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 16H17C19.21 16 21 14.21 21 12C21 9.79 19.21 8 17 8H14" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-base font-bold tracking-tight text-gray-900">Umurava</span>
          </div>
        </div>

        {/* Form — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-10 sm:px-16 lg:px-20 py-10">
          <div className="w-full max-w-[340px]">

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sign in to your recruiter dashboard to start screening candidates.
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

            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
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
