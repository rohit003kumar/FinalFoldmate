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
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const standalone = 'standalone' in window.navigator && (window.navigator as any).standalone;

    setIsIOS(isIOSDevice);
    setIsInStandaloneMode(standalone);

    // Check for Android install prompt
    const handler = (e: any) => {
      console.log("📦 'beforeinstallprompt' fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowButton(false);
    });
  };

  // ✅ iOS fallback instructions
  if (isIOS && !isInStandaloneMode) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mt-4 text-sm max-w-sm">
        📱 To install this app, tap the <strong>Share</strong> button and then select <strong>Add to Home Screen</strong>.
      </div>
    );
  }

  // ✅ Android install button
  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow mt-4"
    >
      📥 Download App
    </button>
  );
};

export default InstallPWAButton;
