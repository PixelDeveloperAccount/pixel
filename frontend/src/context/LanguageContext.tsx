import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // App
    'app.title': 'PIXEL',
    'app.pixelchain': 'PixelChain',
    
    // Wallet
    'wallet.connect': 'Connect MetaMask',
    'wallet.connected': 'Connected',
    'wallet.disconnect': 'Disconnect',
    'wallet.connect_wallet': 'Connect wallet to see your info',
    'wallet.bnb_balance': 'BNB Balance:',
    'wallet.token_balance': 'Token Balance:',
    'wallet.available_pixels': 'Available Pixels:',
    'wallet.pixels_available': 'Pixels: {count} available',
    'wallet.tokens': 'Tokens: {count}',
    'wallet.bnb': 'BNB: {count}',
    
    // Canvas
    'canvas.place_pixel': 'Place Pixel',
    'canvas.pixel_placed': 'Pixel placed successfully!',
    'canvas.failed_place': 'Failed to place pixel',
    'canvas.error_place': 'Error placing pixel',
    'canvas.connect_first': 'Please connect your wallet first',
    
    // User Info
    'user.your_info': 'Your Info',
    'user.your_pixels': 'Your Pixels',
    'user.your_colors': 'Your colors',
    'user.session_start': 'Session start:',
    'user.total_pixels': 'Total pixels:',
    'user.colors_used': '{count} colors used',
    'user.connect_wallet_pixels': 'Connect your wallet to see your placed pixels',
    
    // Color Palette
    'color.confirm': 'Confirm',
    'color.cancel': 'Cancel',
    'color.select_color': 'Select color {color}',
    'color.picker_tool': 'Color picker tool - click to sample colors from canvas',
    
    // Leaderboard
    'leaderboard.pixels': 'Pixels',
    'leaderboard.colors': 'Colors',
    'leaderboard.territory': 'Territory',
    'leaderboard.time_played': 'Time Played',
    'leaderboard.loading': 'Loading…',
    
    // Social
    'social.github': 'GitHub',
    'social.twitter': 'Twitter',
    'social.telegram': 'Telegram',
    'social.docs': 'Docs',
    'social.language': 'Language',
    'social.english': 'English',
    'social.chinese': '中文',
    
    // Help
    'help.title': 'Help',
    'help.close': 'Close',
    
    // Status
    'status.loading': 'Loading…',
    'status.error': 'Error',
    'status.success': 'Success',
    
    // Time
    'time.seconds': 's',
    'time.minutes': 'm',
    'time.hours': 'h',
    'time.days': 'd',
    
    // Cooldown
    'cooldown.wait': 'Wait {time}s',
    'cooldown.on_cooldown': 'On cooldown',
    
    // Contract
    'contract.address': 'Contract Address',
    'contract.copied': 'Contract address copied!',
    'contract.failed_copy': 'Failed to copy address.',
    'contract.click_copy': 'Click to copy contract address',
    
    // Network
    'network.switch_bsc': 'Please switch to BSC Mainnet',
    'network.metamask_required': 'MetaMask is not installed!',
    'network.connection_rejected': 'User rejected the connection request',
    'network.connection_failed': 'Failed to connect wallet',
    'network.wallet_connected': 'Wallet connected successfully!',
    'network.wallet_disconnected': 'Wallet disconnected!',
  },
  zh: {
    // App
    'app.title': '像素',
    'app.pixelchain': '像素链',
    
    // Wallet
    'wallet.connect': '连接 MetaMask',
    'wallet.connected': '已连接',
    'wallet.disconnect': '断开连接',
    'wallet.connect_wallet': '连接钱包查看您的信息',
    'wallet.bnb_balance': 'BNB 余额:',
    'wallet.token_balance': '代币余额:',
    'wallet.available_pixels': '可用像素:',
    'wallet.pixels_available': '像素: {count} 可用',
    'wallet.tokens': '代币: {count}',
    'wallet.bnb': 'BNB: {count}',
    
    // Canvas
    'canvas.place_pixel': '放置像素',
    'canvas.pixel_placed': '像素放置成功！',
    'canvas.failed_place': '放置像素失败',
    'canvas.error_place': '放置像素时出错',
    'canvas.connect_first': '请先连接您的钱包',
    
    // User Info
    'user.your_info': '您的信息',
    'user.your_pixels': '您的像素',
    'user.your_colors': '您的颜色',
    'user.session_start': '会话开始:',
    'user.total_pixels': '总像素:',
    'user.colors_used': '使用了 {count} 种颜色',
    'user.connect_wallet_pixels': '连接您的钱包查看已放置的像素',
    
    // Color Palette
    'color.confirm': '确认',
    'color.cancel': '取消',
    'color.select_color': '选择颜色 {color}',
    'color.picker_tool': '颜色选择工具 - 点击从画布采样颜色',
    
    // Leaderboard
    'leaderboard.pixels': '像素',
    'leaderboard.colors': '颜色',
    'leaderboard.territory': '领土',
    'leaderboard.time_played': '游戏时间',
    'leaderboard.loading': '加载中…',
    
    // Social
    'social.github': 'GitHub',
    'social.twitter': '推特',
    'social.telegram': '电报',
    'social.docs': '文档',
    'social.language': '语言',
    'social.english': 'English',
    'social.chinese': '中文',
    
    // Help
    'help.title': '帮助',
    'help.close': '关闭',
    
    // Status
    'status.loading': '加载中…',
    'status.error': '错误',
    'status.success': '成功',
    
    // Time
    'time.seconds': '秒',
    'time.minutes': '分',
    'time.hours': '时',
    'time.days': '天',
    
    // Cooldown
    'cooldown.wait': '等待 {time}秒',
    'cooldown.on_cooldown': '冷却中',
    
    // Contract
    'contract.address': '合约地址',
    'contract.copied': '合约地址已复制！',
    'contract.failed_copy': '复制地址失败。',
    'contract.click_copy': '点击复制合约地址',
    
    // Network
    'network.switch_bsc': '请切换到 BSC 主网',
    'network.metamask_required': '未安装 MetaMask！',
    'network.connection_rejected': '用户拒绝了连接请求',
    'network.connection_failed': '连接钱包失败',
    'network.wallet_connected': '钱包连接成功！',
    'network.wallet_disconnected': '钱包已断开连接！',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('pixel-app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('pixel-app-language', language);
  }, [language]);

  // Translation function with placeholder support
  const t = (key: string, placeholders?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    // Replace placeholders
    if (placeholders) {
      Object.entries(placeholders).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, String(value));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
