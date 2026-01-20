export const ROUTES = {
  home: { path: '/', module: 'home', title: '首页' },
  daily: { path: '/daily', module: 'daily', title: '每日一卦' },
  bazi: { path: '/bazi', module: 'bazi', title: '八字测算' },
  dream: { path: '/dream', module: 'dream', title: '梦境符号' },
  chat: { path: '/chat', module: 'chat', title: '大师解惑' },
  login: { path: '/login', module: 'login', title: '登录' }
};

export const HOME_CARDS = [
  {
    key: 'daily',
    title: '每日一卦',
    subtitle: '晨起抽一卦，洞悉当下气运，趋吉避凶',
    path: ROUTES.daily.path
  },
  {
    key: 'bazi',
    title: '八字测算',
    subtitle: '根据生辰八字剖析命格，寻觅人生节奏',
    path: ROUTES.bazi.path
  },
  {
    key: 'dream',
    title: '梦境符号',
    subtitle: '解读潜意识的象征，找到与现实的暗合',
    path: ROUTES.dream.path
  },
  {
    key: 'chat',
    title: '大师解惑',
    subtitle: '困于情感抉择或事业迷雾，获得即时灵感',
    path: ROUTES.chat.path
  }
];

export const getRouteModule = (pathname) => {
  const route = Object.values(ROUTES).find((item) => item.path === pathname);
  return route?.module || ROUTES.home.module;
};
