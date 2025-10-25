import { Layout } from './components/Layout';
import { CanvasProvider } from './context/CanvasContext';
import { BSCWalletProvider } from './context/BSCWalletContext';
import { SoundProvider } from './context/SoundContext';
import { LeaderboardProvider } from './context/LeaderboardContext';
import { LanguageProvider } from './context/LanguageContext';
import { ModalProvider } from './context/ModalContext';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import { Toaster, ToastBar } from 'react-hot-toast'; // Import Toaster and ToastBar
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <BSCWalletProvider>
          <CanvasProvider>
            <SoundProvider>
              <LeaderboardProvider>
                <ModalProvider>
                  {/* Custom Toaster Implementation with Tailwind CSS - Compact Version */}
                  <Toaster position="top-center">
                    {(t) => {
                      let iconSrc = '';
                      // Determine icon based on toast type
                      if (t.type === 'success') {
                        iconSrc = 'https://unpkg.com/pixelarticons@1.8.1/svg/mood-happy.svg';
                      } else if (t.type === 'error') {
                        iconSrc = 'https://unpkg.com/pixelarticons@1.8.1/svg/mood-sad.svg';
                      }
                      // You could add more icons for other types like 'loading' or a default
                      // else {
                      //   iconSrc = 'https://unpkg.com/pixelarticons@1.8.1/svg/info.svg'; // Example default
                      // }

                      // Base classes for the toast - updated for compactness
                      const baseToastClasses = "bg-white text-gray-800 p-2.5 rounded-md shadow-md flex items-center border border-gray-200 font-['Pixelify_Sans'] text-l min-w-[220px] max-w-xs";
                      // Animation classes based on visibility
                      const animationClasses = t.visible
                        ? 'animate-enter' // react-hot-toast provides these classes for transitions
                        : 'animate-leave';

                      return (
                        // Using ToastBar for built-in animation handling
                        <ToastBar toast={t} style={{padding: 0, background: 'transparent', boxShadow: 'none'}}>
                          {({ message }) => ( // Only use message from ToastBar, ignore the default icon
                            <div
                             className={`${baseToastClasses} ${animationClasses}`}
                            >
                              {iconSrc && (
                                <img
                                  src={iconSrc}
                                  alt={t.type} // Alt text for accessibility
                                  className=" ml-1 h-8 w-8 flex-shrink-0" // Tailwind classes for icon - updated
                                />
                              )}
                              {/* Render the toast message */}
                              <span className="flex-grow">{message}</span>
                            </div>
                          )}
                        </ToastBar>
                      );
                    }}
                  </Toaster>
                  <Routes>
                    <Route path="/" element={
                      <Layout>
                        <HomePage />
                      </Layout>
                    } />
                    <Route path="/docs" element={<DocsPage />} />
                  </Routes>
                </ModalProvider>
              </LeaderboardProvider>
            </SoundProvider>
          </CanvasProvider>
        </BSCWalletProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
