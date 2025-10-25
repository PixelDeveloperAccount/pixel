import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, placeholders?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // App
    'app.title': 'PIXEL',
    'app.pixelchain': 'PixelChain',
    
    // Wallet
    'wallet.connect': 'Connect Wallet',
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
    'canvas.pixel_coordinates': 'Pixel: {x}, {y}',
    'canvas.not_painted_yet': 'Not painted yet',
    
    // User Info
    'user.your_info': 'Your Info',
    'user.your_pixels': 'Your Pixels',
    'user.your_colors': 'Your colors',
    'user.session_start': 'Session start:',
    'user.total_pixels': 'Total pixels:',
    'user.colors_used': '{count} colors used',
    'user.connect_wallet_pixels': 'Connect your wallet to see your placed pixels',
    'user.pixels': 'Your pixels',
    'user.colors_loading': 'Loading…',
    
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
    'leaderboard.title': 'Leaderboard',
    'leaderboard.today': 'Today',
    'leaderboard.week': 'Week',
    'leaderboard.month': 'Month',
    'leaderboard.alltime': 'All time',
    'leaderboard.total_pixels_per_user': 'Total pixels per user',
    'leaderboard.most_used_colors': 'Overall most used colours on canvas',
    'leaderboard.most_pixels_linked': 'Most pixels linked together per user',
    'leaderboard.longest_time_spent': 'Longest time spent on canvas',
    'leaderboard.time_played_label': 'Time played',
    'leaderboard.territory_size': 'Territory size',
    'leaderboard.times_used': 'Times used',
    'leaderboard.pixels_painted': 'Pixels painted',
    'leaderboard.updates_every_10_minutes': 'Updates every 10 minutes',
    'leaderboard.last_updated': 'Last updated',
    'leaderboard.seconds_ago': 'seconds ago',
    'leaderboard.minute_ago': 'minute ago',
    'leaderboard.minutes_ago': 'minutes ago',
    'leaderboard.second_ago': 'second ago',
    'leaderboard.seconds_ago_plural': 'seconds ago',
    
    // Social
    'social.github': 'GitHub',
    'social.twitter': 'Twitter',
    'social.telegram': 'Telegram',
    'social.docs': 'Docs',
    'social.language': 'Language',
    'social.english': 'English',
    'social.chinese': '中文',
    'social.social': 'Social',
    
    // Help
    'help.title': 'Help',
    'help.close': 'Close',
    'help.welcome': 'Welcome to PIXEL',
    'help.controls': 'Controls',
    'help.click_to_place': 'Click to place a pixel',
    'help.right_click_drag': 'Right-click + drag to pan the canvas',
    'help.scroll_zoom': 'Scroll to zoom in/out',
    'help.token_system': 'Token System',
    'help.pixel_tokens_determine': 'PIXEL tokens determine your pixel placement abilities',
    'help.zero_tokens': '0 Tokens: 1 minute cooldown, 5 Pixels',
    'help.one_to_fifty_thousand': '1 - 50,000 Tokens: 30 second cooldown, 30 Pixels',
    'help.fifty_to_three_hundred': '50,001 - 300,000 Tokens: 25 second cooldown, 45 Pixels',
    'help.three_hundred_to_million': '300,001 - 1,000,000 Tokens: 15 second cooldown, 70 Pixels',
    'help.million_plus': '1,000,000+ Tokens: No cooldown, Infinite Pixels',
    'help.cooldown_system': 'Cooldown System',
    'help.no_cooldown_between': 'No cooldown between individual pixel placements',
    'help.cooldown_starts_when_out': 'Cooldown only starts when you run out of pixels. Higher token holders get faster cooldowns and more pixels!',
    'help.lets_start': 'Let\'s Start!',
    
    // Status
    'status.loading': 'Loading…',
    'status.error': 'Error',
    'status.success': 'Success',
    
    // Time
    'time.seconds': 's',
    'time.minutes': 'm',
    'time.hours': 'h',
    'time.days': 'd',
    'time.seconds_short': 's',
    'time.minutes_short': 'm',
    
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
    
    // Wallet Modal
    'wallet.installed': 'Installed',
    'wallet.not_installed': 'Not installed',
    'wallet.install_prompt': '💡 Don\'t have a wallet? Install MetaMask or Trust Wallet to get started!',
    'wallet.dont_have_wallet': 'Don\'t have a wallet?',
    'wallet.install_wallets': 'Install MetaMask or TrustWallet and create a wallet to continue',
    
    // Documentation
    'docs.title': 'PIXEL Documentation',
    'docs.back_to_app': 'Back to App',
    'docs.introduction': 'Introduction',
    'docs.getting_started': 'Getting Started',
    'docs.token_system': 'Token System',
    'docs.cooldown_system': 'Cooldown System',
    'docs.controls': 'Controls',
    'docs.faq': 'FAQ',
    'docs.intro_text_1': 'Welcome to PIXEL - a collaborative pixel art canvas built on the Binance Smart Chain. Place pixels, create art, and be part of a decentralized creative community.',
    'docs.intro_text_2': 'PIXEL uses blockchain technology to give you true ownership and control over your creative contributions. Your pixel placements are permanent and immutable, becoming part of the canvas history forever.',
    'docs.intro_tip': 'Tip: The more PIXEL tokens you hold, the more pixels you can place and the faster your cooldowns!',
    'docs.step': 'Step',
    'docs.step_1_title': 'Connect Your Wallet',
    'docs.step_1_text': 'Click the "Connect Wallet" button in the top-right corner and choose from one of our supported wallets:',
    'docs.step_2_title': 'Switch to BSC Mainnet',
    'docs.step_2_text': 'Make sure your wallet is connected to the Binance Smart Chain (BSC) Mainnet. The app will prompt you to switch networks if needed.',
    'docs.step_3_title': 'Choose Your Color',
    'docs.step_3_text': 'Select a color from the palette at the bottom of the screen or use the color picker tool to sample colors from the canvas.',
    'docs.step_4_title': 'Place Your Pixels',
    'docs.step_4_text': 'Click anywhere on the canvas to place a pixel. A confirmation dialog will appear - click "Confirm" to place your pixel on the blockchain!',
    'docs.token_system_intro': 'Your PIXEL token balance determines your capabilities on the canvas. Here are the different tiers:',
    'docs.tier_beginner': 'Perfect for trying out the platform',
    'docs.tier_bronze': 'Great for casual artists',
    'docs.tier_silver': 'For dedicated creators',
    'docs.tier_gold': 'Advanced tier with fast cooldowns',
    'docs.tier_diamond': 'Ultimate creative freedom',
    'docs.cooldown_intro': 'Understanding the cooldown system is key to maximizing your pixel placement efficiency.',
    'docs.cooldown_key_point': 'Key Point',
    'docs.example': 'Example',
    'docs.example_1': 'You have 30 pixels available (1-50K tokens tier)',
    'docs.example_2': 'You place all 30 pixels immediately with no delays',
    'docs.example_3': 'After placing the 30th pixel, you wait 30 seconds for all pixels to refill',
    'docs.mouse_controls': 'Mouse Controls',
    'docs.color_controls': 'Color Controls',
    'docs.left_click': 'Left Click',
    'docs.right_click': 'Right Click + Drag',
    'docs.scroll': 'Scroll Wheel',
    'docs.select_color_palette': 'Select a color from the palette',
    'docs.use_color_picker': 'Use the color picker to sample from canvas',
    'docs.confirm_placement': 'Confirm your pixel placement',
    'docs.faq_q1': 'Do I need PIXEL tokens to place pixels?',
    'docs.faq_a1': 'No! You can place pixels even with 0 tokens, though you\'ll have a 1-minute cooldown and only 5 pixels per cooldown. Holding tokens gives you more pixels and faster cooldowns.',
    'docs.faq_q2': 'Can I change or remove a pixel after placing it?',
    'docs.faq_a2': 'Once placed, pixels are permanent and stored on the blockchain. However, you or anyone else can place a new pixel over an existing one to change it.',
    'docs.faq_q3': 'How much does it cost to place a pixel?',
    'docs.faq_a3': 'Each pixel placement costs a small amount of BNB for the blockchain transaction fee (gas). The exact cost varies based on network congestion but is typically very minimal.',
    'docs.faq_q4': 'What happens if I lose my wallet?',
    'docs.faq_a4': 'Your pixel history is tied to your wallet address. If you lose access to your wallet, you lose access to that history. Always keep your wallet seed phrase safe and backed up!',
    'docs.faq_q5': 'Can I see who placed each pixel?',
    'docs.faq_a5': 'Yes! The canvas is transparent and public. You can view the wallet address of who placed each pixel and when it was placed.',
    'docs.need_help': 'Need more help? Join our community!',
  },
  zh: {
    // App
    'app.title': '像素',
    'app.pixelchain': '像素链',
    
    // Wallet
    'wallet.connect': '连接钱包',
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
    'canvas.pixel_coordinates': '像素: {x}, {y}',
    'canvas.not_painted_yet': '尚未绘制',
    
    // User Info
    'user.your_info': '您的信息',
    'user.your_pixels': '您的像素',
    'user.your_colors': '您的颜色',
    'user.session_start': '会话开始:',
    'user.total_pixels': '总像素:',
    'user.colors_used': '使用了 {count} 种颜色',
    'user.connect_wallet_pixels': '连接您的钱包查看已放置的像素',
    'user.pixels': '你的像素',
    'user.colors_loading': '加载中…',
    
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
    'leaderboard.title': '排行榜',
    'leaderboard.today': '今天',
    'leaderboard.week': '本周',
    'leaderboard.month': '本月',
    'leaderboard.alltime': '全部时间',
    'leaderboard.total_pixels_per_user': '每个用户的总像素',
    'leaderboard.most_used_colors': '画布上最常用的颜色',
    'leaderboard.most_pixels_linked': '每个用户连接最多的像素',
    'leaderboard.longest_time_spent': '在画布上花费的最长时间',
    'leaderboard.time_played_label': '游戏时间',
    'leaderboard.territory_size': '领土大小',
    'leaderboard.times_used': '使用次数',
    'leaderboard.pixels_painted': '绘制的像素',
    'leaderboard.updates_every_10_minutes': '每10分钟更新一次',
    'leaderboard.last_updated': '最后更新',
    'leaderboard.seconds_ago': '秒前',
    'leaderboard.minute_ago': '分钟前',
    'leaderboard.minutes_ago': '分钟前',
    'leaderboard.second_ago': '秒前',
    'leaderboard.seconds_ago_plural': '秒前',
    
    // Social
    'social.github': 'GitHub',
    'social.twitter': '推特',
    'social.telegram': '电报',
    'social.docs': '文档',
    'social.language': '语言',
    'social.english': 'English',
    'social.chinese': '中文',
    'social.social': '社会',
    
    // Help
    'help.title': '帮助',
    'help.close': '关闭',
    'help.welcome': '欢迎来到 PIXEL',
    'help.controls': '控制',
    'help.click_to_place': '点击放置像素',
    'help.right_click_drag': '右键点击 + 拖拽平移画布',
    'help.scroll_zoom': '滚轮缩放',
    'help.token_system': '代币系统',
    'help.pixel_tokens_determine': 'PIXEL 代币决定您的像素放置能力',
    'help.zero_tokens': '0 代币: 1分钟冷却，5个像素',
    'help.one_to_fifty_thousand': '1 - 50,000 代币: 30秒冷却，30个像素',
    'help.fifty_to_three_hundred': '50,001 - 300,000 代币: 25秒冷却，45个像素',
    'help.three_hundred_to_million': '300,001 - 1,000,000 代币: 15秒冷却，70个像素',
    'help.million_plus': '1,000,000+ 代币: 无冷却，无限像素',
    'help.cooldown_system': '冷却系统',
    'help.no_cooldown_between': '单个像素放置之间无冷却',
    'help.cooldown_starts_when_out': '只有在像素用完时才开始冷却。代币持有者越多，冷却越快，像素越多！',
    'help.lets_start': '开始吧！',
    
    // Status
    'status.loading': '加载中…',
    'status.error': '错误',
    'status.success': '成功',
    
    // Time
    'time.seconds': '秒',
    'time.minutes': '分',
    'time.hours': '时',
    'time.days': '天',
    'time.seconds_short': '秒',
    'time.minutes_short': '分',
    
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
    
    // Wallet Modal
    'wallet.installed': '已安装',
    'wallet.not_installed': '未安装',
    'wallet.install_prompt': '💡 没有钱包？安装 MetaMask 或 Trust Wallet 开始使用！',
    'wallet.dont_have_wallet': '没有钱包？',
    'wallet.install_wallets': '安装 MetaMask 或 TrustWallet 并创建钱包以继续',
    
    // Documentation
    'docs.title': 'PIXEL 文档',
    'docs.back_to_app': '返回应用',
    'docs.introduction': '介绍',
    'docs.getting_started': '开始使用',
    'docs.token_system': '代币系统',
    'docs.cooldown_system': '冷却系统',
    'docs.controls': '控制',
    'docs.faq': '常见问题',
    'docs.intro_text_1': '欢迎来到 PIXEL - 一个基于币安智能链构建的协作像素艺术画布。放置像素，创作艺术，成为去中心化创意社区的一部分。',
    'docs.intro_text_2': 'PIXEL 使用区块链技术为您提供对创意贡献的真正所有权和控制权。您的像素放置是永久且不可变的，永远成为画布历史的一部分。',
    'docs.intro_tip': '提示：您持有的 PIXEL 代币越多，您可以放置的像素越多，冷却时间越快！',
    'docs.step': '步骤',
    'docs.step_1_title': '连接您的钱包',
    'docs.step_1_text': '点击右上角的"连接钱包"按钮，然后从我们支持的钱包中选择一个：',
    'docs.step_2_title': '切换到 BSC 主网',
    'docs.step_2_text': '确保您的钱包连接到币安智能链（BSC）主网。如果需要，应用程序会提示您切换网络。',
    'docs.step_3_title': '选择您的颜色',
    'docs.step_3_text': '从屏幕底部的调色板中选择一种颜色，或使用颜色选择器工具从画布中采样颜色。',
    'docs.step_4_title': '放置您的像素',
    'docs.step_4_text': '点击画布上的任意位置放置像素。将出现确认对话框 - 点击"确认"将您的像素放置在区块链上！',
    'docs.token_system_intro': '您的 PIXEL 代币余额决定了您在画布上的能力。以下是不同的等级：',
    'docs.tier_beginner': '非常适合试用平台',
    'docs.tier_bronze': '适合休闲艺术家',
    'docs.tier_silver': '适合专注的创作者',
    'docs.tier_gold': '具有快速冷却的高级等级',
    'docs.tier_diamond': '终极创作自由',
    'docs.cooldown_intro': '了解冷却系统是最大化像素放置效率的关键。',
    'docs.cooldown_key_point': '关键点',
    'docs.example': '示例',
    'docs.example_1': '您有 30 个可用像素（1-50K 代币等级）',
    'docs.example_2': '您可以立即放置所有 30 个像素，无需延迟',
    'docs.example_3': '放置第 30 个像素后，您等待 30 秒以补充所有像素',
    'docs.mouse_controls': '鼠标控制',
    'docs.color_controls': '颜色控制',
    'docs.left_click': '左键点击',
    'docs.right_click': '右键 + 拖拽',
    'docs.scroll': '滚轮',
    'docs.select_color_palette': '从调色板中选择颜色',
    'docs.use_color_picker': '使用颜色选择器从画布采样',
    'docs.confirm_placement': '确认像素放置',
    'docs.faq_q1': '我需要 PIXEL 代币才能放置像素吗？',
    'docs.faq_a1': '不需要！即使拥有 0 个代币，您也可以放置像素，但您将有 1 分钟的冷却时间，每次冷却只能放置 5 个像素。持有代币可以让您获得更多像素和更快的冷却时间。',
    'docs.faq_q2': '放置像素后我可以更改或删除它吗？',
    'docs.faq_a2': '一旦放置，像素就是永久的并存储在区块链上。但是，您或其他任何人都可以在现有像素上放置新像素来更改它。',
    'docs.faq_q3': '放置像素需要花费多少钱？',
    'docs.faq_a3': '每次像素放置都需要支付少量 BNB 作为区块链交易费用（gas）。确切成本取决于网络拥塞情况，但通常非常少。',
    'docs.faq_q4': '如果我丢失了钱包会发生什么？',
    'docs.faq_a4': '您的像素历史记录与您的钱包地址相关联。如果您失去对钱包的访问权限，您就会失去对该历史记录的访问权限。始终保持钱包助记词安全并备份！',
    'docs.faq_q5': '我可以看到谁放置了每个像素吗？',
    'docs.faq_a5': '可以！画布是透明且公开的。您可以查看放置每个像素的钱包地址以及放置时间。',
    'docs.need_help': '需要更多帮助？加入我们的社区！',
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
