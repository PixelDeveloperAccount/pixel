import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import UserInfo from './UserInfo';
import ConnectButton from './ConnectButton';
import { useCanvas } from '../context/CanvasContext';

const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { totalPixelsPlaced, startTime, favoriteColor } = useCanvas();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-300 text-gray-900 ${
          !isOpen ? 'bg-white shadow-lg hover:bg-gray-100' : 'hover:bg-gray-900/10'
        }`}
      >
        <img 
          src="https://unpkg.com/pixelarticons@1.8.1/svg/menu.svg" 
          alt="Menu" 
          className="h-7 w-7" 
        />
      </button>

      <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-center p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Palette className="text-indigo-600 h-7 w-7" />
            <h1 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">PIXEL</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <code className="text-base text-gray-600 flex-1 font-mono truncate font-['Pixelify_Sans']">
              {CONTRACT_ADDRESS}
            </code>
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <img 
                  src="https://unpkg.com/pixelarticons@1.8.1/svg/copy.svg" 
                  alt="Copy" 
                  className="h-5 w-5" 
                />
              )}
            </button>
          </div>

          <div className="p-4 space-y-6">
            <UserInfo />
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Pixelify_Sans']">Stats</h3>
              <div className="space-y-3 font-['Pixelify_Sans'] text-base">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900">
                    <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/drag-and-drop.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                    <span>Total Pixels Placed:</span>
                  </div>
                  <span className="font-medium text-gray-900">{totalPixelsPlaced}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900">
                    <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/clock.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                    <span>Session start:</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatTimeSince(startTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900">
                    <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/paint-bucket.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                    <span>Favorite Color:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {favoriteColor ? (
                      <>
                        <div 
                          className="w-5 h-5 rounded-full" 
                          style={{ backgroundColor: favoriteColor }}
                        />
                        <span className="font-medium text-gray-900">{favoriteColor}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">NONE</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Pixelify_Sans']">Social</h3>
              <div className="grid grid-cols-2 gap-3 font-['Pixelify_Sans'] text-base">
                <a 
                  href="https://github.com/PixelDeveloperAccount/pixel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/github.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                  <span>GitHub</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/user.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                  <span>Twitter</span>
                </a>
                <a 
                  href="https://t.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/chat.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                  <span>Telegram</span>
                </a>
                <a 
                  href="/docs" 
                  target="_blank"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img 
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/book-open.svg" 
                      alt="Place" 
                      className="h-6 w-6" 
                    />
                  <span>Docs</span>
                </a>
              </div>
            </div>
            <div className="mt-4">       
              <ConnectButton />
            </div>   
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;