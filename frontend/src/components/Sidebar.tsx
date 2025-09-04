import React from 'react';
import { Palette } from 'lucide-react';
import UserInfo from './UserInfo';
import ConnectButton from './ConnectButton';
import UserPixels from './UserPixels';
import UserColors from './UserColors';
import toast from 'react-hot-toast'; // Ensure toast is imported

const CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast.success('Contract address copied!'); // This will use the custom toast
    } catch (err) {
      toast.error('Failed to copy address.'); // This will also use the custom toast
    }
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
          <div className="p-4 border-b border-gray-100">
            <div
              onClick={handleCopy}
              title="Click to copy contract address"
              className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors font-['Pixelify_Sans']"
            >
              <div className="flex items-center space-x-2 text-gray-700">
                <img
                  src="https://unpkg.com/pixelarticons@1.8.1/svg/copy.svg"
                  alt="Contract Address"
                  className="h-4 w-4"
                />
                <span className="text-sm">CA:</span>
              </div>
              <code className="text-sm font-medium text-gray-900 truncate">
                {CONTRACT_ADDRESS}
              </code>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <UserInfo />

            <UserPixels />

            <UserColors />

            <div className="bg-white rounded-lg shadow-lg p-4">
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
