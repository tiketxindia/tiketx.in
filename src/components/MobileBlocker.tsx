import { useEffect, useState } from "react";

function isMobile() {
  return window.innerWidth < 900;
}

export function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    function handleResize() {
      setMobile(isMobile());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white text-center px-6" style={{minHeight: "100vh"}}>
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-14 w-auto mb-8" />
          <div className="text-xl font-semibold mb-2">This app is currently available for desktop use only.</div>
          <div className="text-lg text-gray-400">Please access it from a desktop or laptop device.</div>
        </div>
        <div className="w-full flex justify-center items-end pb-8">
          <div className="text-base font-medium text-gray-400 bg-black/70 rounded-xl px-6 py-4 shadow-lg flex flex-col items-center">
            <div className="mb-2">Coming soon on</div>
            <div className="flex flex-row gap-4 items-center">
              <div className="bg-white rounded-xl p-2 shadow flex items-center">
                <img src="/playstore.png" alt="Playstore" className="h-7 w-auto" />
              </div>
              <div className="bg-white rounded-xl p-2 shadow flex items-center">
                <img src="/appstore.png" alt="App Store" className="h-7 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 