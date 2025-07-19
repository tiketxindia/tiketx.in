import React from 'react';

const About = () => (
  <div className="min-h-screen bg-black text-white py-16 px-2 md:px-8 flex flex-col items-center justify-center w-full">
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-center mb-6 gap-4">
        <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-12 md:h-14 w-auto align-middle drop-shadow-lg" style={{marginBottom: 2}} />
      </div>
      <p className="text-2xl mb-10 text-gray-200 font-medium text-center">One Ticket. One Story. Directly from the Creator.</p>
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold mb-4 tracking-tight text-white drop-shadow text-left">Why We Built TiketX?</h2>
        <div className="rounded-2xl glass-card bg-gradient-to-br from-white/5 via-tiketx-blue/5 to-tiketx-pink/10 p-8 shadow-xl border border-white/10 w-full">
          <p className="text-lg text-gray-200 leading-relaxed mb-4 italic font-cursive">
            Not every film gets a big-budget release.<br/>
            Not every filmmaker has the luxury of Netflix or Prime.<br/>
            But every story — if it’s honest, raw, and powerful — deserves to be seen.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mb-4 italic font-cursive">
            TiketX is a platform built for indie films and the people who believe in them.<br/>
            We help filmmakers reach real audiences, and help audiences discover hidden gems from creators across the world.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed italic font-cursive">
            Whether it’s a powerful short film, a low-budget passion project, or a raw documentary — TiketX is where it belongs.
          </p>
        </div>
      </div>
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold mb-4 tracking-tight text-white drop-shadow text-left">Why We Chose the Name "TiketX"?</h2>
        <div className="rounded-2xl glass-card bg-gradient-to-br from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 p-7 shadow-lg border border-white/10 w-full">
          <p className="mb-4 text-gray-200 text-lg">The name TiketX combines <span className="font-semibold text-white">“Ticket”</span> – your access pass to a film – with <span className="font-semibold text-white">“X”</span>, symbolizing:</p>
          <ul className="mb-2 pl-6 list-disc text-gray-200 space-y-2 text-base">
            <li><span className="font-extrabold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">The unknown</span> — discover films that break the mold</li>
            <li><span className="font-extrabold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">The experience</span> — not just watching, but supporting creators directly</li>
            <li><span className="font-extrabold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">The intersection</span> — where creators and audiences meet</li>
          </ul>
        </div>
      </div>
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold mb-4 tracking-tight text-white drop-shadow text-left">What We Stand For</h2>
        <div className="space-y-7 w-full">
          <div className="rounded-2xl glass-card bg-gradient-to-br from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 p-7 shadow-lg border border-white/10 w-full">
            <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">For Creators</h3>
            <p className="text-gray-200 text-lg">
              We believe creators shouldn't wait for studios or OTT giants to validate their work.<br/>
              TiketX gives them the space to launch, promote, sell, and stream films — on their own terms.
            </p>
          </div>
          <div className="rounded-2xl glass-card bg-gradient-to-br from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 p-7 shadow-lg border border-white/10 w-full">
            <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">For Viewers</h3>
            <p className="text-gray-200 text-lg">
              Tired of the same recycled content on every platform?<br/>
              TiketX gives you access to original, daring, and authentic cinema — all just a ticket away.
            </p>
          </div>
          <div className="rounded-2xl glass-card bg-gradient-to-br from-tiketx-blue/10 via-tiketx-violet/10 to-tiketx-pink/10 p-7 shadow-lg border border-white/10 w-full">
            <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">Transparent Monetization</h3>
            <p className="text-gray-200 text-lg">
              Creators earn directly from every ticket sold.<br/>
              You’re not just watching a film — you’re funding the next one.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-2xl font-bold bg-gradient-to-r from-tiketx-pink via-tiketx-violet to-tiketx-blue bg-clip-text text-transparent text-center">
          Whether you're here to watch, support, or launch your own film — welcome to TiketX.
        </p>
      </div>
    </div>
  </div>
);

export default About; 