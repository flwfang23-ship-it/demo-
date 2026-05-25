/**
 * 全局Mock数据
 * 所有数据均为静态演示数据，模拟客户管理后台（商户自助端）的实际数据
 */
window.MockData = {

  // ===== 当前登录商户信息 =====
  currentMerchant: {
    id: 'M001',
    name: '阳光咖啡连锁',
    avatar: '阳',
    role: '商户管理员',
    phone: '138****8888',
    company: '阳光咖啡连锁管理有限公司',
    contact: '张经理',
    contactPhone: '13800008888',
    createdAt: '2025-06-15'
  },

  // ===== 统计概览 =====
  dashboardStats: {
    miniprogramCount: 5,
    promotionCount: 5,
    todayLinkCount: 127,
    lastReportDate: '2026-05-20'
  },

  // ===== 最新日报摘要（含环比，供 C01 模块②昨日数据使用） =====
  latestReport: {
    date: '2026-05-20',
    income: 15820.50,
    orders: 342,
    promotionCount: 5,
    incomeChange: 12.5,
    ordersChange: 8.9
  },

  // ===== 财务数据（供 C01 模块③资金提现区使用） =====
  financeData: {
    balance: 125680.50,
    pendingWithdraw: 5000.00,
    totalWithdrawn: 89200.00,
    accountBound: true
  },

  // ===== 小程序列表 =====
  miniPrograms: [
    { id: 'MP001', name: '阳光咖啡·旗舰店', appId: 'wxabc123def456ghi', type: '微信小程序', status: 'normal', deployStatus: 'online', subscribeOn: true, registerTime: '2026-01-15 10:30', desc: '品牌旗舰店小程序' },
    { id: 'MP002', name: '阳光咖啡·城西店', appId: 'wxdef456ghi789jkl', type: '微信小程序', status: 'normal', deployStatus: 'online', subscribeOn: true, registerTime: '2026-02-20 14:20', desc: '城西分店小程序' },
    { id: 'MP003', name: '阳光咖啡外卖站', appId: 'alipay001abc002def', type: '支付宝小程序', status: 'normal', deployStatus: 'reviewing', subscribeOn: false, registerTime: '2026-03-08 09:15', desc: '外卖专用小程序' },
    { id: 'MP004', name: '阳光咖啡·抖音店', appId: 'dy003ghi004jkl', type: '抖音小程序', status: 'auditing', deployStatus: 'deploying', subscribeOn: true, registerTime: '2026-04-12 16:45', desc: '抖音渠道小程序' },
    { id: 'MP005', name: '阳光咖啡·城东店', appId: 'wx005mno006pqr', type: '微信小程序', status: 'normal', deployStatus: 'online', subscribeOn: true, registerTime: '2026-04-25 11:00', desc: '城东分店小程序' },
    { id: 'MP006', name: '阳光咖啡会员店', appId: 'wx007stu008vwx', type: '微信小程序', status: 'stopped', deployStatus: 'online', subscribeOn: false, registerTime: '2025-10-08 08:30', desc: '已停用' },
    { id: 'MP007', name: '阳光咖啡·万达店', appId: 'wx009yza010bcd', type: '微信小程序', status: 'normal', deployStatus: 'online', subscribeOn: true, registerTime: '2026-05-01 13:00', desc: '万达广场店' },
    { id: 'MP008', name: '阳光咖啡快闪店', appId: 'alipay011efg012hij', type: '支付宝小程序', status: 'auditing', deployStatus: 'deploying', subscribeOn: true, registerTime: '2026-05-10 10:00', desc: '限时快闪活动' }
  ],

  // ===== 新人引导进度 =====
  onboardingSteps: [
    { id: 1, title: '注册账号', desc: '恭喜您注册成功，系统已自动生成默认推广位。', status: 'done' },
    { id: 2, title: '上传营业执照', desc: '财务结算与微信小程序注册，均需上传营业执照。', status: 'current' },
    { id: 3, title: '注册微信小程序', desc: '法人扫脸即可快速完成微信小程序注册。', status: 'todo' },
    { id: 4, title: '开始推广变现', desc: '完成全部配置后，即可生成推广链接。', status: 'todo' }
  ],

  // ===== 推广位分组 =====
  promotionGroups: [
    { id: 'GROUP_DEFAULT', name: '默认分组', isDefault: true,
      promotions: [
        { id: 'PROMO_001', name: '默认推广位', isDefault: true, activityCount: 6, createTime: '2025-06-15 10:00', miniPath: 'pages/benefit/index?promoId=p_default', h5Path: 'https://tbk.sunnycoffee.com/h5/benefit?promoId=p_default' },
        { id: 'PROMO_006', name: '首页推广位', isDefault: false, activityCount: 3, createTime: '2026-03-10 08:00', miniPath: '', h5Path: '' }
      ]
    },
    { id: 'GROUP_A', name: '日常推广', isDefault: false,
      promotions: [
        { id: 'PROMO_002', name: '新店开业推广', isDefault: false, activityCount: 4, createTime: '2026-01-20 14:30', miniPath: 'pages/shop/new?promoId=p_002', h5Path: '' },
        { id: 'PROMO_003', name: '会员日特惠', isDefault: false, activityCount: 3, createTime: '2026-02-14 09:00', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/member?promoId=p_003' },
        { id: 'PROMO_007', name: '周末专享', isDefault: false, activityCount: 2, createTime: '2026-04-05 10:00', miniPath: '', h5Path: '' }
      ]
    },
    { id: 'GROUP_B', name: '活动推广', isDefault: false,
      promotions: [
        { id: 'PROMO_004', name: '新品上市', isDefault: false, activityCount: 5, createTime: '2026-03-01 16:00', miniPath: 'pages/new/product?promoId=p_004', h5Path: 'https://tbk.sunnycoffee.com/h5/new-product?promoId=p_004' },
        { id: 'PROMO_005', name: '夏日冰饮节', isDefault: false, activityCount: 6, createTime: '2026-05-01 11:00', miniPath: '', h5Path: '' },
        { id: 'PROMO_008', name: '周年庆大促', isDefault: false, activityCount: 4, createTime: '2026-05-10 09:00', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/anniversary?promoId=p_008' },
        { id: 'PROMO_009', name: '外卖专属推广', isDefault: false, activityCount: 3, createTime: '2026-05-20 15:00', miniPath: 'pages/takeout/index?promoId=p_009', h5Path: '' }
      ]
    }
  ],

  // 向下兼容：读取 promotions 时自动返回扁平列表
  get promotions() { return this.getAllPromotions(); },

  /**
   * 获取所有推广位的扁平列表（含所属分组信息），用于向下兼容
   */
  getAllPromotions: function () {
    var all = [];
    (this.promotionGroups || []).forEach(function (g) {
      (g.promotions || []).forEach(function (p) {
        all.push({ id: p.id, name: p.name, isDefault: p.isDefault, activityCount: p.activityCount, createTime: p.createTime, groupId: g.id, groupName: g.name, miniPath: p.miniPath || '', h5Path: p.h5Path || '' });
      });
    });
    return all;
  },

  // ===== 权益页配置 - 推广位数据 =====
  promotionSlots: [
    { id: 'PS_DEFAULT', name: '亚联-小票-0920', slotId: 'slot_default', enabled: true, isDefault: true, promoParam: '?promoId=p_yalian_0920', miniPath: 'pages/benefit/index?promoId=p_yalian_0920', h5Path: 'https://tbk.sunnycoffee.com/h5/benefit?promoId=p_yalian_0920' },
    { id: 'PS_001', name: '言成-通用-1', slotId: 'slot_001', enabled: true, isDefault: false, promoParam: '?promoId=p_yancheng_1', miniPath: 'pages/benefit/index?promoId=p_yancheng_1', h5Path: 'https://tbk.sunnycoffee.com/h5/benefit?promoId=p_yancheng_1' },
    { id: 'PS_002', name: '言成-通用-2', slotId: 'slot_002', enabled: true, isDefault: false, promoParam: '?promoId=p_yancheng_2', miniPath: 'pages/benefit/index?promoId=p_yancheng_2', h5Path: 'https://tbk.sunnycoffee.com/h5/benefit?promoId=p_yancheng_2' },
    { id: 'PS_003', name: '言成-通用-3', slotId: 'slot_003', enabled: false, isDefault: false, promoParam: '?promoId=p_yancheng_3', miniPath: '', h5Path: '' }
  ],

  // ===== 可选活动池（活动选择器用） =====
  availableActivities: [
    { id: 'ACT001', name: '新店开业·全场8折', subtitle: '全场咖啡饮品8折优惠', image: '', commission: '8%', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'eleme', platformLabel: '饿了么', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/act001?from=eleme', password: 'KouLing888', category: '促销活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-06-30', startDate: '2026-05-01', venueId: 'VENUE_001' },
    { id: 'ACT002', name: '会员日·买一赠一', subtitle: '每周三会员专享', image: '', commission: '6%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'meituan', platformLabel: '美团', miniPath: 'pages/member/index', h5Path: 'https://tbk.sunnycoffee.com/h5/member-day', password: '', category: '会员活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-07-15', startDate: '2026-04-01', venueId: 'VENUE_002' },
    { id: 'ACT003', name: '夏日冰饮·第二杯半价', subtitle: '冰饮系列清凉一夏', image: '', commission: '5%', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'eleme', platformLabel: '饿了么', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/summer-ice', password: 'SummerIce666', category: '促销活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-08-31', startDate: '2026-05-15', venueId: 'VENUE_003' },
    { id: 'ACT004', name: '咖啡豆·限时特惠', subtitle: '精选阿拉比卡咖啡豆', image: '', commission: '10%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'meituan', platformLabel: '美团', miniPath: 'pages/goods/detail?id=456', h5Path: 'https://tbk.sunnycoffee.com/h5/coffee-bean-sale', password: '', category: '商品活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-06-15', startDate: '2026-05-01', venueId: 'VENUE_004' },
    { id: 'ACT005', name: '新品·抹茶拿铁上市', subtitle: '日式抹茶遇见醇香咖啡', image: '', commission: '7%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'jd', platformLabel: '京东', miniPath: 'pages/new/product', h5Path: 'https://tbk.sunnycoffee.com/h5/matcha-latte', password: '', category: '新品活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-07-01', startDate: '2026-05-10', venueId: 'VENUE_005' },
    { id: 'ACT006', name: '储值卡·充200送30', subtitle: '储值更优惠，多充多送', image: '', commission: '3%', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/recharge-card', password: 'VIP2024CZ', category: '会员活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-09-30', startDate: '2026-03-01', venueId: 'VENUE_006' },
    { id: 'ACT007', name: '外卖免配送费', subtitle: '订单满29元免配送费', image: '', commission: '4%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'eleme', platformLabel: '饿了么', miniPath: 'pages/order/free', h5Path: 'https://tbk.sunnycoffee.com/h5/free-delivery', password: '', category: '配送活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-06-30', startDate: '2026-05-01', venueId: 'VENUE_007' },
    { id: 'ACT008', name: '积分享好礼', subtitle: '消费积分兑换精美礼品', image: '', commission: '2%', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/points-gift', password: 'PointsGift88', category: '会员活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-12-31', startDate: '2026-01-01', venueId: 'VENUE_008' },
    { id: 'ACT009', name: '周末早鸟特惠', subtitle: '周末早晨7-9点专属折扣', image: '', commission: '6%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'jd', platformLabel: '京东', miniPath: 'pages/weekend/earlybird', h5Path: 'https://tbk.sunnycoffee.com/h5/weekend-earlybird', password: '', category: '促销活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-07-31', startDate: '2026-05-01', venueId: 'VENUE_009' },
    { id: 'ACT010', name: '联名款·限定杯', subtitle: '艺术家联名限定款杯套', image: '', commission: '8%', jumpType: 'missing', jumpTypeLabel: '⚠ 缺属性', platform: 'eleme', platformLabel: '饿了么', miniPath: '', h5Path: '', password: '', category: '品牌活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-08-15', startDate: '2026-05-20', venueId: 'VENUE_010' },
    { id: 'ACT011', name: '毕业季·学生特惠', subtitle: '凭学生证享专属折扣', image: '', commission: '5%', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团', miniPath: '', h5Path: 'https://tbk.sunnycoffee.com/h5/graduation-sale', password: 'Graduation2024', category: '促销活动', supplier: 'meituan', supplierLabel: '美团联盟', endDate: '2026-07-15', startDate: '2026-05-20', venueId: 'VENUE_011' },
    { id: 'ACT012', name: '冰激凌咖啡·尝鲜价', subtitle: '阿芙佳朵系列全新上线', image: '', commission: '7%', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'jd', platformLabel: '京东', miniPath: 'pages/icecream/new', h5Path: 'https://tbk.sunnycoffee.com/h5/icecream-coffee', password: '', category: '新品活动', supplier: 'eleme', supplierLabel: '饿了么联盟', endDate: '2026-06-30', startDate: '2026-05-15', venueId: 'VENUE_012' }
  ],

  // ===== 第三方活动（需求3：「其他」Tab） =====
  thirdPartyActivities: [
    {
      id: 'TPA_001',
      platform: '花小猪',
      name: '花小猪打车',
      appId: 'wx_hxz_2024_001',
      isPreset: true,
      promoPaths: {
        'PROMO_001': 'pages/huaxiaozhu/index?promoId=p_default',
        'PROMO_002': 'pages/huaxiaozhu/index?promoId=p_002',
        'PROMO_003': '',
        'PROMO_004': '',
        'PROMO_005': '',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    },
    {
      id: 'TPA_002',
      platform: '滴滴',
      name: '滴滴出行',
      appId: 'wx_didi_2024_002',
      isPreset: true,
      promoPaths: {
        'PROMO_001': 'pages/didi/index?promoId=p_default',
        'PROMO_002': '',
        'PROMO_003': '',
        'PROMO_004': '',
        'PROMO_005': '',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    },
    {
      id: 'TPA_003',
      platform: '电影票',
      name: '电影票',
      appId: 'wx_movie_2026_001',
      isPreset: true,
      promoPaths: {
        'PROMO_001': 'pages/movie/index?promoId=p_default',
        'PROMO_002': '',
        'PROMO_003': '',
        'PROMO_004': '',
        'PROMO_005': '',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    },
    {
      id: 'TPA_004',
      platform: '美团外卖',
      name: '美团外卖红包',
      appId: 'wx_mtwm_2025_001',
      isPreset: false,
      promoPaths: {
        'PROMO_001': 'pages/mtwm/index?promoId=p_default',
        'PROMO_002': 'pages/mtwm/coupon?promoId=p_002',
        'PROMO_003': 'pages/mtwm/member?promoId=p_003',
        'PROMO_004': 'pages/mtwm/new?promoId=p_004',
        'PROMO_005': 'pages/mtwm/summer?promoId=p_005',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    },
    {
      id: 'TPA_005',
      platform: '饿了么',
      name: '饿了么外卖',
      appId: 'wx_eleme_2025_002',
      isPreset: false,
      promoPaths: {
        'PROMO_001': '',
        'PROMO_002': '',
        'PROMO_003': '',
        'PROMO_004': '',
        'PROMO_005': '',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    },
    {
      id: 'TPA_006',
      platform: '京东',
      name: '京东秒杀',
      appId: 'wx_jd_2025_003',
      isPreset: false,
      promoPaths: {
        'PROMO_001': 'pages/jd/index?promoId=p_default',
        'PROMO_002': 'pages/jd/seckill?promoId=p_002',
        'PROMO_003': '',
        'PROMO_004': '',
        'PROMO_005': '',
        'PROMO_006': '',
        'PROMO_007': '',
        'PROMO_008': '',
        'PROMO_009': ''
      }
    }
  ],

  // ===== 各推广位坑位配置（图片、主标题、副标题、关联活动） =====
  slotActivities: {
    'slot_default': [
      { slotIndex: 0, image: '', mainTitle: '新店开业·全场8折', subtitle: '全场咖啡饮品8折优惠', activity: { id: 'ACT001', name: '新店开业·全场8折', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'eleme', platformLabel: '饿了么' } },
      { slotIndex: 1, image: '', mainTitle: '夏日冰饮·第二杯半价', subtitle: '冰饮系列清凉一夏', activity: { id: 'ACT003', name: '夏日冰饮·第二杯半价', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'eleme', platformLabel: '饿了么' } },
      { slotIndex: 2, image: '', mainTitle: '新品·抹茶拿铁上市', subtitle: '日式抹茶遇见醇香咖啡', activity: { id: 'ACT005', name: '新品·抹茶拿铁上市', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'jd', platformLabel: '京东' } },
      { slotIndex: 3, image: '', mainTitle: '储值卡·充200送30', subtitle: '储值更优惠，多充多送', activity: { id: 'ACT006', name: '储值卡·充200送30', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 4, image: '', mainTitle: '周末早鸟特惠', subtitle: '周末早晨7-9点专属折扣', activity: { id: 'ACT009', name: '周末早鸟特惠', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'jd', platformLabel: '京东' } },
      { slotIndex: 5, image: '', mainTitle: '', subtitle: '', activity: null }
    ],
    'slot_001': [
      { slotIndex: 0, image: '', mainTitle: '新店开业·全场8折', subtitle: '全场咖啡饮品8折优惠', activity: { id: 'ACT001', name: '新店开业·全场8折', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'eleme', platformLabel: '饿了么' } },
      { slotIndex: 1, image: '', mainTitle: '会员日·买一赠一', subtitle: '每周三会员专享', activity: { id: 'ACT002', name: '会员日·买一赠一', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 2, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 3, image: '', mainTitle: '外卖免配送费', subtitle: '订单满29元免配送费', activity: { id: 'ACT007', name: '外卖免配送费', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'eleme', platformLabel: '饿了么' } },
      { slotIndex: 4, image: '', mainTitle: '毕业季·学生特惠', subtitle: '凭学生证享专属折扣', activity: { id: 'ACT011', name: '毕业季·学生特惠', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 5, image: '', mainTitle: '', subtitle: '', activity: null }
    ],
    'slot_002': [
      { slotIndex: 0, image: '', mainTitle: '会员日·买一赠一', subtitle: '每周三会员专享', activity: { id: 'ACT002', name: '会员日·买一赠一', jumpType: 'miniprogram', jumpTypeLabel: '📱 小程序路径', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 1, image: '', mainTitle: '储值卡·充200送30', subtitle: '储值更优惠，多充多送', activity: { id: 'ACT006', name: '储值卡·充200送30', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 2, image: '', mainTitle: '积分享好礼', subtitle: '消费积分兑换精美礼品', activity: { id: 'ACT008', name: '积分享好礼', jumpType: 'password', jumpTypeLabel: '📋 需口令', platform: 'meituan', platformLabel: '美团' } },
      { slotIndex: 3, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 4, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 5, image: '', mainTitle: '下午茶套餐·立减10元', subtitle: '咖啡+甜点套餐特惠', activity: null }
    ],
    'slot_003': [
      { slotIndex: 0, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 1, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 2, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 3, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 4, image: '', mainTitle: '', subtitle: '', activity: null },
      { slotIndex: 5, image: '', mainTitle: '', subtitle: '', activity: null }
    ]
  },

  // ===== 权益页配置 - 小程序导航菜单数据 =====
  slotNavMenus: {
    'slot_default': [
      { id: 'nav_waimai', icon: '🥡', name: '外卖红包', isDefault: true },
      { id: 'nav_dache', icon: '🚗', name: '打车红包', isDefault: false },
      { id: 'nav_jiudian', icon: '🏨', name: '特惠酒店', isDefault: false }
    ],
    'slot_001': [
      { id: 'nav_coupon', icon: '🎫', name: '优惠券', isDefault: true },
      { id: 'nav_flash', icon: '⚡', name: '限时秒杀', isDefault: false }
    ],
    'slot_002': [
      { id: 'nav_new', icon: '🆕', name: '新品首发', isDefault: true },
      { id: 'nav_hot', icon: '🔥', name: '热门推荐', isDefault: false },
      { id: 'nav_brand', icon: '🏷️', name: '品牌专区', isDefault: false }
    ],
    'slot_003': [
      { id: 'nav_default', icon: '🏠', name: '推荐', isDefault: true }
    ]
  },

  // ===== 向后兼容别名 =====
  get benefitPages() { return this.promotionSlots; },
  get pageSlotActivities() { return this.slotActivities; },

  // ===== 日报数据 =====
  reports: [
    { date: '2026-05-20', income: 15820.50, orders: 342, details: [
      { promotion: '默认推广位', income: 6520.00, orders: 142 },
      { promotion: '新店开业推广', income: 4830.50, orders: 105 },
      { promotion: '夏日冰饮节', income: 4470.00, orders: 95 }
    ]},
    { date: '2026-05-19', income: 12340.00, orders: 278, details: [
      { promotion: '默认推广位', income: 5120.00, orders: 115 },
      { promotion: '新店开业推广', income: 3890.00, orders: 88 },
      { promotion: '夏日冰饮节', income: 3330.00, orders: 75 }
    ]},
    { date: '2026-05-18', income: 18950.00, orders: 401, details: [
      { promotion: '默认推广位', income: 7800.00, orders: 168 },
      { promotion: '新店开业推广', income: 5600.00, orders: 121 },
      { promotion: '夏日冰饮节', income: 5550.00, orders: 112 }
    ]},
    { date: '2026-05-17', income: 9870.00, orders: 215, details: [
      { promotion: '默认推广位', income: 4200.00, orders: 92 },
      { promotion: '新店开业推广', income: 3100.00, orders: 68 },
      { promotion: '夏日冰饮节', income: 2570.00, orders: 55 }
    ]},
    { date: '2026-05-16', income: 21300.00, orders: 456, details: [
      { promotion: '默认推广位', income: 8800.00, orders: 189 },
      { promotion: '新店开业推广', income: 6500.00, orders: 140 },
      { promotion: '夏日冰饮节', income: 6000.00, orders: 127 }
    ]},
    { date: '2026-05-15', income: 7650.00, orders: 168, details: [
      { promotion: '默认推广位', income: 3200.00, orders: 72 },
      { promotion: '新店开业推广', income: 2450.00, orders: 51 },
      { promotion: '夏日冰饮节', income: 2000.00, orders: 45 }
    ]},
    { date: '2026-05-14', income: 14200.00, orders: 310, details: [
      { promotion: '默认推广位', income: 5900.00, orders: 132 },
      { promotion: '新店开业推广', income: 4500.00, orders: 95 },
      { promotion: '夏日冰饮节', income: 3800.00, orders: 83 }
    ]},
    { date: '2026-05-13', income: 11200.00, orders: 245, details: [
      { promotion: '默认推广位', income: 4600.00, orders: 103 },
      { promotion: '新店开业推广', income: 3500.00, orders: 76 },
      { promotion: '夏日冰饮节', income: 3100.00, orders: 66 }
    ]},
    { date: '2026-05-12', income: 16780.00, orders: 368, details: [
      { promotion: '默认推广位', income: 6900.00, orders: 155 },
      { promotion: '新店开业推广', income: 5100.00, orders: 112 },
      { promotion: '夏日冰饮节', income: 4780.00, orders: 101 }
    ]},
    { date: '2026-05-11', income: 13560.00, orders: 298, details: [
      { promotion: '默认推广位', income: 5600.00, orders: 125 },
      { promotion: '新店开业推广', income: 4200.00, orders: 92 },
      { promotion: '夏日冰饮节', income: 3760.00, orders: 81 }
    ]},
    { date: '2026-05-10', income: 20100.00, orders: 432, details: [
      { promotion: '默认推广位', income: 8300.00, orders: 180 },
      { promotion: '新店开业推广', income: 6100.00, orders: 132 },
      { promotion: '夏日冰饮节', income: 5700.00, orders: 120 }
    ]},
    { date: '2026-05-09', income: 8900.00, orders: 192, details: [
      { promotion: '默认推广位', income: 3700.00, orders: 82 },
      { promotion: '新店开业推广', income: 2800.00, orders: 60 },
      { promotion: '夏日冰饮节', income: 2400.00, orders: 50 }
    ]},
    { date: '2026-05-08', income: 15400.00, orders: 335, details: [
      { promotion: '默认推广位', income: 6300.00, orders: 140 },
      { promotion: '新店开业推广', income: 4800.00, orders: 102 },
      { promotion: '夏日冰饮节', income: 4300.00, orders: 93 }
    ]},
    { date: '2026-05-07', income: 12700.00, orders: 278, details: [
      { promotion: '默认推广位', income: 5200.00, orders: 115 },
      { promotion: '新店开业推广', income: 4000.00, orders: 85 },
      { promotion: '夏日冰饮节', income: 3500.00, orders: 78 }
    ]},
    { date: '2026-05-06', income: 17800.00, orders: 388, details: [
      { promotion: '默认推广位', income: 7300.00, orders: 163 },
      { promotion: '新店开业推广', income: 5500.00, orders: 120 },
      { promotion: '夏日冰饮节', income: 5000.00, orders: 105 }
    ]}
  ],

  // ===== 操作日志 =====
  operationLogs: [
    { time: '2026-05-21 09:15:32', action: '登录', ip: '192.168.1.100', detail: '商户管理员登录' },
    { time: '2026-05-20 17:30:10', action: '修改权益页', ip: '192.168.1.100', detail: '替换默认主页坑位1活动为"夏日冰饮·第二杯半价"' },
    { time: '2026-05-20 16:45:00', action: '开启订阅', ip: '192.168.1.100', detail: '开启小程序"阳光咖啡·城东店"订阅开关' },
    { time: '2026-05-20 14:20:00', action: '新增推广位', ip: '192.168.1.100', detail: '创建推广位"夏日冰饮节"' },
    { time: '2026-05-20 11:00:00', action: '编辑小程序', ip: '192.168.1.100', detail: '修改"阳光咖啡外卖站"描述信息' },
    { time: '2026-05-19 15:10:00', action: '修改密码', ip: '192.168.1.100', detail: '修改登录密码' },
    { time: '2026-05-19 10:30:00', action: '注册小程序', ip: '192.168.1.100', detail: '注册小程序"阳光咖啡·城东店"' },
    { time: '2026-05-18 16:00:00', action: '设为默认', ip: '192.168.1.100', detail: '将推广位"默认推广位"设为默认' },
    { time: '2026-05-18 09:00:00', action: '查看日报', ip: '192.168.1.100', detail: '查看2026-05-17日报详情' },
    { time: '2026-05-17 14:30:00', action: '关闭订阅', ip: '192.168.1.100', detail: '关闭小程序"阳光咖啡外卖站"订阅开关' },
    { time: '2026-05-17 11:00:00', action: '编辑企业信息', ip: '192.168.1.100', detail: '更新联系电话' },
    { time: '2026-05-16 15:45:00', action: '删除推广位', ip: '192.168.1.100', detail: '删除推广位"旧活动推广"' },
    { time: '2026-05-16 10:00:00', action: '登录', ip: '192.168.1.100', detail: '商户管理员登录' },
    { time: '2026-05-15 16:30:00', action: '替换活动', ip: '192.168.1.100', detail: '替换默认主页坑位3活动' },
    { time: '2026-05-15 09:00:00', action: '登录', ip: '192.168.1.100', detail: '商户管理员登录' },
    { time: '2026-05-14 14:00:00', action: '新增推广位', ip: '192.168.1.100', detail: '创建推广位"会员日特惠"' },
    { time: '2026-05-14 10:00:00', action: '注册小程序', ip: '192.168.1.100', detail: '注册小程序"阳光咖啡·万达店"' },
    { time: '2026-05-13 11:00:00', action: '开启订阅', ip: '192.168.1.100', detail: '批量开启所有小程序订阅开关' },
    { time: '2026-05-12 16:00:00', action: '查看日报', ip: '192.168.1.100', detail: '查看2026-05-11日报详情' },
    { time: '2026-05-12 09:00:00', action: '登录', ip: '192.168.1.100', detail: '商户管理员登录' }
  ],

  // ===== 部署进度时间线 =====
  deployTimeline: [
    { step: '提交授权', status: 'done', time: '2026-04-12 16:45', desc: '已提交小程序授权申请' },
    { step: '名称审核', status: 'done', time: '2026-04-13 10:30', desc: '小程序名称审核通过' },
    { step: '备案审核', status: 'done', time: '2026-04-18 14:00', desc: 'ICP备案审核通过' },
    { step: '部署上线', status: 'pending', time: '预计 2026-05-25', desc: '等待平台部署上线' }
  ],

  // ===== 快捷入口 =====
  quickActions: [
    { label: '注册小程序', icon: '📱', page: 'miniprogram-form' },
    { label: '管理推广位', icon: '📌', page: 'promotion-list' },
    { label: '配置权益页', icon: '⚙️', page: 'benefit-config' },
    { label: '查看日报', icon: '📋', page: 'reports-list' }
  ]
};
