import React from 'react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Features', href: '#' },
  { label: 'Implementation', href: '#' },
  { label: 'Contact', href: '#' },
];

const Landing = () => (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#3a1c71] via-[#5f2c82] to-[#b06ab3] flex flex-col">
    {/* Top Nav */}
    <nav className="flex items-center justify-between px-10 py-6">
      <div className="flex items-center gap-2">
        <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-8 w-auto" />
      </div>
      <div className="hidden md:flex gap-8 text-lg text-white/80">
        {navLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            className={`hover:text-white transition-colors ${link.label === 'About' ? 'text-white underline underline-offset-8' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <a href="/login" className="text-white/80 hover:text-white text-lg hidden md:block">Sign In</a>
        <button className="text-white/80 hover:text-white focus:outline-none">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
      </div>
    </nav>

    {/* Main Hero Section */}
    <div className="flex-1 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full px-6 md:px-12 py-10 md:py-0">
      {/* Left: Text */}
      <div className="flex-1 flex flex-col justify-center items-start max-w-xl">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">Home Cinema</h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-md">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="flex gap-6">
          <a href="#" className="px-8 py-3 rounded-full font-semibold bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-colors text-base">More details</a>
          <a href="#" className="px-8 py-3 rounded-full font-semibold border-2 border-pink-400 text-pink-200 hover:bg-pink-500 hover:text-white transition-colors text-base">View demo</a>
        </div>
      </div>
      {/* Right: Illustration Placeholder */}
      <div className="flex-1 flex items-center justify-center mt-12 md:mt-0">
        {/* Replace this with an SVG or illustration as needed */}
        <div className="w-[400px] h-[340px] md:w-[480px] md:h-[400px] bg-gradient-to-tr from-[#b06ab3]/80 via-[#5f2c82]/80 to-[#3a1c71]/80 rounded-3xl shadow-2xl flex items-center justify-center relative">
          {/* Example: SVG or image can go here */}
          <span className="text-6xl text-white/30">🎬</span>
        </div>
      </div>
    </div>
  </div>
);

export default Landing; 