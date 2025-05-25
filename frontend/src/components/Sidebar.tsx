import React from 'react';
import { Palette } from 'lucide-react';
import UserInfo from './UserInfo';
import ConnectButton from './ConnectButton';
import { useCanvas } from '../context/CanvasContext';
import toast from 'react-hot-toast'; // Ensure toast is imported

const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { totalPixelsPlaced, startTime, favoriteColor } = useCanvas();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast.success('Contract address copied!'); // This will use the custom toast
    } catch (err) {
      toast.error('Failed to copy address.'); // This will also use the custom toast
    }
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
            <h1 className="text-2xl font-bold text-gray-900 font-['Jersey_15']">PIXEL</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <code
              onClick={handleCopy}
              title="Click to copy contract address"
              className="text-base text-gray-700 w-full block text-center font-mono truncate font-['Jersey_15'] cursor-pointer hover:text-indigo-600 transition-colors py-2"
            >
              {CONTRACT_ADDRESS}
            </code>
          </div>

          <div className="p-4 space-y-6">
            <UserInfo />

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Jersey_15']">Stats</h3>
              <div className="space-y-3 font-['Jersey_15'] text-base">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900">
                    <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/drag-and-drop.svg"
                      alt="Pixels Placed"
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
                      alt="Session Start"
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
                      alt="Favorite Color"
                      className="h-6 w-6"
                    />
                    <span>Favorite Color:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {favoriteColor ? (
                      <>
                        <div
                          className="w-5 h-5 rounded-full border border-gray-300"
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
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Jersey_15']">Social</h3>
              <div className="grid grid-cols-2 gap-3 font-['Jersey_15'] text-base">
                <a
                  href="https://github.com/PixelDeveloperAccount/pixel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/github.svg"
                      alt="GitHub"
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
                      alt="Twitter"
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
                      alt="Telegram"
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
                      alt="Docs"
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
