import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, Coins, Clock, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const DocsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: t('docs.introduction'), icon: BookOpen },
    { id: 'getting-started', title: t('docs.getting_started'), icon: Gamepad2 },
    { id: 'token-system', title: t('docs.token_system'), icon: Coins },
    { id: 'cooldown', title: t('docs.cooldown_system'), icon: Clock },
    { id: 'controls', title: t('docs.controls'), icon: HelpCircle },
    { id: 'faq', title: t('docs.faq'), icon: FileText },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="font-['Pixelify_Sans'] text-sm">{t('docs.back_to_app')}</span>
              </Link>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-2">
                <img
                  src="/logo/binancepixel.png"
                  alt="Logo"
                  className="h-8 w-8"
                />
                <h1 className="text-2xl font-bold text-gray-900 font-['Pixelify_Sans']">
                  {t('docs.title')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all font-['Pixelify_Sans'] text-sm ${
                        activeSection === section.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            {/* Introduction */}
            <section id="introduction" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.introduction')}
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                  {t('docs.intro_text_1')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                  {t('docs.intro_text_2')}
                </p>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4 my-6 rounded-r-lg">
                  <p className="text-gray-800 font-semibold font-['Pixelify_Sans']">
                    💡 {t('docs.intro_tip')}
                  </p>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <Gamepad2 className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.getting_started')}
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.step')} 1: {t('docs.step_1_title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {t('docs.step_1_text')}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>MetaMask</li>
                    <li>Trust Wallet</li>
                    <li>Binance Chain Wallet</li>
                    <li>WalletConnect</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.step')} 2: {t('docs.step_2_title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('docs.step_2_text')}
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.step')} 3: {t('docs.step_3_title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('docs.step_3_text')}
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.step')} 4: {t('docs.step_4_title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('docs.step_4_text')}
                  </p>
                </div>
              </div>
            </section>

            {/* Token System */}
            <section id="token-system" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <Coins className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.token_system')}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  {t('docs.token_system_intro')}
                </p>
                
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🔰</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 font-['Pixelify_Sans']">
                          {t('help.zero_tokens')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('docs.tier_beginner')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🥉</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 font-['Pixelify_Sans']">
                          {t('help.one_to_fifty_thousand')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('docs.tier_bronze')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🥈</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 font-['Pixelify_Sans']">
                          {t('help.fifty_to_three_hundred')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('docs.tier_silver')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg border border-yellow-300">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">🥇</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 font-['Pixelify_Sans']">
                          {t('help.three_hundred_to_million')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('docs.tier_gold')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg border border-purple-300">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">💎</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 font-['Pixelify_Sans']">
                          {t('help.million_plus')}
                        </h4>
                        <p className="text-sm text-gray-600">{t('docs.tier_diamond')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Cooldown System */}
            <section id="cooldown" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <Clock className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.cooldown_system')}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {t('docs.cooldown_intro')}
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                  <p className="text-gray-800 font-semibold mb-2 font-['Pixelify_Sans']">
                    ⚡ {t('docs.cooldown_key_point')}
                  </p>
                  <p className="text-gray-700">{t('help.no_cooldown_between')}</p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t('help.cooldown_starts_when_out')}
                </p>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 font-['Pixelify_Sans']">
                    {t('docs.example')}:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.example_1')}</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.example_2')}</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.example_3')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Controls */}
            <section id="controls" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <HelpCircle className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.controls')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans'] flex items-center">
                    <span className="text-2xl mr-2">🖱️</span>
                    {t('docs.mouse_controls')}
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-gray-900">{t('docs.left_click')}:</span>
                      <span>{t('help.click_to_place')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-gray-900">{t('docs.right_click')}:</span>
                      <span>{t('help.right_click_drag')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-gray-900">{t('docs.scroll')}:</span>
                      <span>{t('help.scroll_zoom')}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans'] flex items-center">
                    <span className="text-2xl mr-2">🎨</span>
                    {t('docs.color_controls')}
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.select_color_palette')}</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.use_color_picker')}</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t('docs.confirm_placement')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-8 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Pixelify_Sans'] flex items-center">
                <FileText className="h-8 w-8 mr-3 text-gray-700" />
                {t('docs.faq')}
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.faq_q1')}
                  </h4>
                  <p className="text-gray-700">{t('docs.faq_a1')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.faq_q2')}
                  </h4>
                  <p className="text-gray-700">{t('docs.faq_a2')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.faq_q3')}
                  </h4>
                  <p className="text-gray-700">{t('docs.faq_a3')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.faq_q4')}
                  </h4>
                  <p className="text-gray-700">{t('docs.faq_a4')}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2 font-['Pixelify_Sans']">
                    {t('docs.faq_q5')}
                  </h4>
                  <p className="text-gray-700">{t('docs.faq_a5')}</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4 font-['Pixelify_Sans']">
                  {t('docs.need_help')}
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://github.com/PixelDeveloperAccount/pixel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 transition-colors font-['Pixelify_Sans']"
                  >
                    GitHub
                  </a>
                  <span className="text-gray-300">|</span>
                  <a
                    href="https://x.com/bnb_pixel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 transition-colors font-['Pixelify_Sans']"
                  >
                    X (Twitter)
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;

