import React from 'react';
import { Play, Film, Users, Award, Zap, Heart, Star, Sparkles } from 'lucide-react';

const About = () => (
  <div className="min-h-screen bg-black text-white overflow-hidden">
    {/* Hero Section */}
    <div className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-16 md:h-20 w-auto mx-auto drop-shadow-2xl" />
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            We Are Film Distribution
          </span>
          <br />
          <span className="text-white">& Creator Empowerment Platform</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          One Ticket. One Story. Directly from the Creator.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              LEARN MORE
            </span>
          </button>
          <button className="group border-2 border-purple-500 hover:bg-purple-500 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
            <span className="flex items-center gap-2">
              <Film className="w-5 h-5" />
              Watch Demo
            </span>
          </button>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>

    {/* About Section */}
    <div className="py-20 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-6">
              <span className="text-pink-500 font-bold text-sm tracking-wider uppercase">ABOUT US</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              We Are Since 10 Years<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Business Experience On<br />
                Film & Creator Platform
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Not every film gets the red carpet treatment. Not every filmmaker has the luxury of a theatrical release. 
              TiketX is changing that narrative by creating a dedicated space for independent creators.
            </p>
            
            {/* Progress Bars */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-pink-500 font-bold">CREATOR SATISFACTION</span>
                  <span className="text-white font-bold">98%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-500 font-bold">AUDIENCE ENGAGEMENT</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Feature Cards */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="mb-4">
                <span className="text-pink-500 text-sm font-bold tracking-wider uppercase">OUR MISSION</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                We're building a new economy for independent cinema. Giving power back to creators and audiences 
                a chance to discover authentic stories that matter.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
              <div className="mb-4">
                <span className="text-purple-500 text-sm font-bold tracking-wider uppercase">WHY TIKETX</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                TiketX combines "Ticket" – your access pass to a film – with "X", symbolizing the unknown, 
                the experience, and the intersection where creators and audiences meet.
              </p>
            </div>
            
            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                <span className="text-sm font-medium">Direct Creator Support</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                <span className="text-sm font-medium">Premium Content</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                <span className="text-sm font-medium">Transparent Revenue</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                <span className="text-sm font-medium">Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* What We Stand For Section */}
    <div className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-pink-500 font-bold text-sm tracking-wider uppercase">OUR VALUES</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">What We Stand For</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              For Creators
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We believe creators shouldn't wait for studios or OTT giants to validate their work. 
              TiketX gives them the space to launch, promote, sell, and stream films — on their own terms.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              For Viewers
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Tired of the same recycled content on every platform? 
              TiketX gives you access to original, daring, and authentic cinema — all just a ticket away.
            </p>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Transparent Revenue
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Creators earn directly from every ticket sold. 
              You're not just watching a film — you're funding the next one.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Detailed Story Section */}
    <div className="py-20 bg-gradient-to-br from-gray-900/30 via-black to-gray-800/30">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-pink-500 font-bold text-sm tracking-wider uppercase">OUR STORY</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">Why We Built TiketX?</h2>
        </div>
        
        <div className="space-y-8 text-lg leading-relaxed">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-8 rounded-2xl border border-purple-500/10">
            <p className="text-gray-300 mb-4">
              Not every film gets the red carpet treatment. Not every filmmaker has the luxury of a theatrical release. 
              And no, not every film is flashy enough to make it to OTT giants like Netflix or Prime.
            </p>
            <p className="text-gray-300 mb-6">
              But does that mean these films don't deserve to be seen? <span className="font-bold text-white">Hell no.</span>
            </p>
            
            <p className="text-gray-300 mb-6">
              We're in an age where fridge tours, cat reels, and five-minute crafts rake in millions of views, 
              while raw, honest, beautifully crafted indie films struggle—buried under the noise of algorithms, 
              ad budgets, and influencer hype.
            </p>
            <p className="text-gray-300 mb-6">
              <span className="font-bold text-white">That's where TiketX comes in.</span>
            </p>
            
            <p className="text-gray-300 mb-4">
              TiketX is a dedicated online box office and theater platform—built for filmmakers who are stuck in the middle. The ones who:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
              <li>Can't get a theatrical release</li>
              <li>Aren't picked up by OTT platforms</li>
              <li>Don't want to give away their art on YouTube for free</li>
            </ul>
            
            <div className="text-center mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-xl text-gray-200 font-medium">
                We're not just streaming movies. We're building a new economy for independent cinema. 
                We're giving power back to the creators. We're giving audiences a chance to discover, 
                support, and shape the stories they want more of.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="py-20 bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-blue-900/30">
      <div className="max-w-4xl mx-auto text-center px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
          Ready to Join the
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {" "}Film Revolution?
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Whether you're here to watch, support, or launch your own film — welcome to TiketX.
          The future of film distribution for independent creators.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
            Start Watching Films
          </button>
          <button className="border-2 border-purple-500 hover:bg-purple-500 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
            Submit Your Film
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default About;