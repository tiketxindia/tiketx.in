import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ className = '' }) => {
  return (
    <footer className={`w-full bg-black text-gray-300 py-8 px-4 border-t border-white/10 mt-7 ${className}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-7 text-center md:text-left">
        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold mb-3.5 text-white">Company</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
          </ul>
          <div className="mt-7 text-xs text-gray-400">© 2025 TiketX. All Rights Reserved.</div>
          <div className="mt-2 flex flex-wrap gap-3.5 text-xs text-gray-400">
            <a href="#" className="hover:underline">Terms Of Use</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">FAQ</a>
          </div>
        </div>
        {/* Need Help? */}
        <div>
          <h3 className="text-lg font-semibold mb-3.5 text-white">Need Help?</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Visit Help Center</a></li>
            <li><a href="#" className="hover:underline">Share Feedback</a></li>
          </ul>
        </div>
        {/* Connect with Us */}
        <div>
          <h3 className="text-lg font-semibold mb-3.5 text-white">Connect with Us</h3>
          <div className="flex items-center justify-center md:justify-start gap-5 mb-5">
            <a href="#" aria-label="Facebook"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg></a>
            <a href="#" aria-label="X"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 7L7 17M7 7l10 10"/></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 