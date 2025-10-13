import React from 'react';
import { Timer, MousePointer, Coins } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans']">{t('help.welcome')}</h2>
        
        <div className="space-y-4 text-gray-600 font-['Pixelify_Sans'] text-lg">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">{t('help.controls')}</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('help.click_to_place')}</li>
              <li>{t('help.right_click_drag')}</li>
              <li>{t('help.scroll_zoom')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">{t('help.token_system')}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-6 h-6 text-indigo-600" />
              <span>{t('help.pixel_tokens_determine')}</span>
            </div>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('help.zero_tokens')}</li>
              <li>{t('help.one_to_fifty_thousand')}</li>
              <li>{t('help.fifty_to_three_hundred')}</li>
              <li>{t('help.three_hundred_to_million')}</li>
              <li>{t('help.million_plus')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-xl">{t('help.cooldown_system')}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-6 h-6 text-orange-600" />
              <span>{t('help.no_cooldown_between')}</span>
            </div>
            <p>{t('help.cooldown_starts_when_out')}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-['Pixelify_Sans'] text-lg"
        >
{t('help.lets_start')}
        </button>
      </div>
    </div>
  );
};

export default HelpModal;