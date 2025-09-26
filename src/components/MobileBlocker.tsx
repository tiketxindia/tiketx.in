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
        <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-14 w-auto mb-8" />
        <div className="text-xl font-semibold mb-2">Tiny screen? Nah… Our films need a stage!</div>
        <div className="text-lg text-gray-400">Open us on a laptop/desktop for the full experience.</div>
        <div className="flex flex-col items-center justify-center mt-28">
          <div className="text-base font-medium text-gray-400 mb-2">Coming soon on</div>
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
    );
  }

  return <>{children}</>;
} 