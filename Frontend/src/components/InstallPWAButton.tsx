// import { useEffect, useState } from 'react';

// const InstallPWAButton = () => {
//   const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
//   const [showButton, setShowButton] = useState(false);

//   useEffect(() => {
//     const handler = (e: any) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       setShowButton(true);
//     };

//     window.addEventListener('beforeinstallprompt', handler);

//     return () => window.removeEventListener('beforeinstallprompt', handler);
//   }, []);

//   const handleInstallClick = () => {
//     if (!deferredPrompt) return;

//     deferredPrompt.prompt();

//     deferredPrompt.userChoice.then((choiceResult: any) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the install prompt');
//       } else {
//         console.log('User dismissed the install prompt');
//       }
//       setDeferredPrompt(null);
//       setShowButton(false);
//     });
//   };

//   if (!showButton) return null;

//   return (
//     <button
//       onClick={handleInstallClick}
//       className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600"
//     >
//       Download App
//     </button>
//   );
// };

// export default InstallPWAButton;




import { useEffect, useState } from 'react';

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobileDevice = isIOSDevice || isAndroidDevice;

    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    );

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Android PWA install
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
        } else {
          console.log('❌ User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else if (isIOS) {
      // iOS fallback
      alert(
        '📱 To install this app:\n\n1. Tap the Share icon in Safari\n2. Then select "Add to Home Screen".'
      );
    } else {
      alert('⚠️ Installation not supported on this device or browser.');
    }
  };

  // ✅ Hide if not on mobile or already installed
  if (!isMobile || isStandalone) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 left-4 right-4 mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg z-50 w-fit text-sm sm:text-base"
    >
      📥 Download App
    </button>
  );
};

export default InstallPWAButton;
