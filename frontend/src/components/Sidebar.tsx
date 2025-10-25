import React from 'react';
import BSCUserInfo from './BSCUserInfo';
import UserPixels from './UserPixels';
import UserColors from './UserColors';
import { useLanguage } from '../context/LanguageContext';
import { useModal } from '../context/ModalContext';
import toast from 'react-hot-toast'; // Ensure toast is imported
import { Link } from 'react-router-dom';

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with your BSC token contract address

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isWalletModalOpen } = useModal();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast.success(t('contract.copied')); // This will use the custom toast
    } catch (err) {
      toast.error(t('contract.failed_copy')); // This will also use the custom toast
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };



  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isWalletModalOpen}
        style={{ zIndex: 45 }}
        className={`fixed top-4 left-4 p-2 rounded-lg transition-all duration-300 text-gray-900 ${
          isWalletModalOpen
            ? 'cursor-not-allowed'
            : ''
        } ${
          !isOpen 
            ? `bg-white shadow-lg ${!isWalletModalOpen ? 'hover:bg-gray-100' : ''}` 
            : `${!isWalletModalOpen ? 'hover:bg-gray-900/10' : ''}`
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
            <img
              src="/logo/binancepixel.png"
              alt="Binance Pixel Logo"
              className="h-10 w-10"
            />
            <h1 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">{t('app.title')}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <div
              onClick={handleCopy}
              title={t('contract.click_copy')}
              className="flex items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <img
                src="https://unpkg.com/pixelarticons@1.8.1/svg/copy.svg"
                alt={t('contract.address')}
                className="h-5 w-5 mr-3"
              />
              <span className="text-sm font-medium text-gray-900 truncate font-['Pixelify_Sans']">
                {CONTRACT_ADDRESS}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <BSCUserInfo />

            <UserPixels />

            <UserColors />

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Pixelify_Sans']">{t('social.social')}</h3>
              <div className="grid grid-cols-2 gap-3 font-['Pixelify_Sans'] text-base">
                <a
                  href="https://github.com/PixelDeveloperAccount/pixel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/github.svg"
                      alt={t('social.github')}
                      className="h-6 w-6"
                    />
                  <span>{t('social.github')}</span>
                </a>
                <a
                  href="https://x.com/bnb_pixel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/user.svg"
                      alt="X"
                      className="h-6 w-6"
                    />
                  <span>X</span>
                </a>
                <Link
                  to="/docs"
                  className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
                >
                  <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/book-open.svg"
                      alt={t('social.docs')}
                      className="h-6 w-6"
                    />
                  <span>{t('social.docs')}</span>
                </Link>
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 font-['Pixelify_Sans']">
                {t('social.language')}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-['Pixelify_Sans']"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/script-text.svg"
                      alt={t('social.language')}
                      className="h-5 w-5"
                    />
                    <span className="text-gray-900">{t('social.language')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {language === 'en' ? t('social.english') : t('social.chinese')}
                    </span>
                    <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/chevron-right.svg"
                      alt="Toggle"
                      className="h-4 w-4 text-gray-400"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
