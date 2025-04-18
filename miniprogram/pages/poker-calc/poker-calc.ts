import { isEmpty, cloneDeep } from '../../utils/lodash2';

// 定义扑克牌花色和点数
const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

// 牌型定义
const HAND_TYPES = {
  ROYAL_FLUSH: '皇家同花顺',
  STRAIGHT_FLUSH: '同花顺',
  FOUR_OF_A_KIND: '四条',
  FULL_HOUSE: '葫芦',
  FLUSH: '同花',
  STRAIGHT: '顺子',
  THREE_OF_A_KIND: '三条',
  TWO_PAIR: '两对',
  ONE_PAIR: '一对',
  HIGH_CARD: '高牌'
};

// 牌型权重
const HAND_RANKS = {
  [HAND_TYPES.ROYAL_FLUSH]: 9,
  [HAND_TYPES.STRAIGHT_FLUSH]: 8,
  [HAND_TYPES.FOUR_OF_A_KIND]: 7,
  [HAND_TYPES.FULL_HOUSE]: 6,
  [HAND_TYPES.FLUSH]: 5,
  [HAND_TYPES.STRAIGHT]: 4,
  [HAND_TYPES.THREE_OF_A_KIND]: 3,
  [HAND_TYPES.TWO_PAIR]: 2,
  [HAND_TYPES.ONE_PAIR]: 1,
  [HAND_TYPES.HIGH_CARD]: 0
};

// 卡牌值映射
const CARD_VALUES: Record<string, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 可以从外部传入的属性
    initialPlayerCount: {
      type: Number,
      value: 2
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    suits: SUITS,
    ranks: RANKS,
    selectedHandCards: ['', ''],
    selectedCommunityCards: ['', '', '', '', ''],
    playerCount: 2,
    showCardPicker: false,
    currentPickPosition: 'hand',
    currentPickIndex: 0,
    canCalculate: false,
    hasResult: false,
    winRate: 0,
    tieRate: 0,
    loseRate: 0,
    handStrength: ''
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached() {
      // 组件被附加到页面时执行
      this.setData({
        playerCount: this.properties.initialPlayerCount
      });
      this.updateCalculateButtonState();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 显示卡牌选择器
    showCardPicker(e: WechatMiniprogram.TouchEvent) {
      const { position, index } = e.currentTarget.dataset;
      this.setData({
        showCardPicker: true,
        currentPickPosition: position,
        currentPickIndex: index
      });
    },

    // 隐藏卡牌选择器
    hideCardPicker() {
      this.setData({
        showCardPicker: false
      });
    },

    // 选择卡牌
    selectCard(e: WechatMiniprogram.TouchEvent) {
      const { card } = e.currentTarget.dataset;
      
      // 检查卡牌是否已被选择
      if (this.isCardSelected(card)) {
        wx.showToast({
          title: '该卡牌已被选择',
          icon: 'none'
        });
        return;
      }
      
      if (this.data.currentPickPosition === 'hand') {
        const newHandCards = [...this.data.selectedHandCards];
        newHandCards[this.data.currentPickIndex] = card;
        this.setData({
          selectedHandCards: newHandCards,
          showCardPicker: false
        });
      } else {
        const newCommunityCards = [...this.data.selectedCommunityCards];
        newCommunityCards[this.data.currentPickIndex] = card;
        this.setData({
          selectedCommunityCards: newCommunityCards,
          showCardPicker: false
        });
      }
      
      this.updateCalculateButtonState();
    },

    // 检查卡牌是否已被选择
    isCardSelected(card: string): boolean {
      const res = this.data.selectedHandCards.includes(card) || 
      this.data.selectedCommunityCards.includes(card);
      return res;
    },

    // 更新玩家人数
    onPlayerCountChange(e: WechatMiniprogram.SliderChange) {
      this.setData({
        playerCount: e.detail.value
      });
    },

    // 更新计算按钮状态
    updateCalculateButtonState() {
      // 至少需要两张手牌才能计算
      const canCalculate = !isEmpty(this.data.selectedHandCards[0]) && 
                           !isEmpty(this.data.selectedHandCards[1]);
      
      this.setData({ canCalculate });
    },

    // 计算胜率
    calculateOdds() {
      // 收集所有已选择的卡牌
      const selectedCards = [
        ...this.data.selectedHandCards.filter(card => !isEmpty(card)),
        ...this.data.selectedCommunityCards.filter(card => !isEmpty(card))
      ];
      
      // 检查是否有足够的手牌
      if (selectedCards.length < 2) {
        wx.showToast({
          title: '请至少选择两张手牌',
          icon: 'none'
        });
        return;
      }
      
      // 显示加载提示
      wx.showLoading({
        title: '计算中...',
        mask: true
      });
      
      // 模拟计算过程（实际应用中应该使用更复杂的算法）
      setTimeout(() => {
        // 计算当前最佳牌型
        const handStrength = this.evaluateCurrentHand();
        
        // 模拟计算结果
        const winRate = this.simulateWinRate();
        const tieRate = Math.min(5, Math.random() * 10);
        const loseRate = 100 - winRate - tieRate;
        
        const result = {
          winRate: parseFloat(winRate.toFixed(2)),
          tieRate: parseFloat(tieRate.toFixed(2)),
          loseRate: parseFloat(loseRate.toFixed(2)),
          handStrength
        };
        
        this.setData({
          hasResult: true,
          ...result
        });
        
        wx.hideLoading();
      }, 1500);
    },

    // 评估当前手牌
    evaluateCurrentHand(): string {
      const handCards = this.data.selectedHandCards.filter(card => !isEmpty(card));
      const communityCards = this.data.selectedCommunityCards.filter(card => !isEmpty(card));
      
      // 如果只有手牌，返回预估强度
      if (communityCards.length === 0) {
        return this.evaluatePreFlopHand(handCards);
      }
      
      // 组合所有可用的牌
      const allCards = [...handCards, ...communityCards];
      
      // 评估牌型
      return this.evaluatePokerHand(allCards);
    },

    // 评估翻牌前手牌强度
    evaluatePreFlopHand(handCards: string[]): string {
      if (handCards.length !== 2) return '';
      
      const card1 = handCards[0];
      const card2 = handCards[1];
      
      const rank1 = card1.charAt(0);
      const rank2 = card2.charAt(0);
      const suit1 = card1.charAt(1);
      const suit2 = card2.charAt(1);
      
      const isPair = rank1 === rank2;
      const isSuited = suit1 === suit2;
      const value1 = CARD_VALUES[rank1];
      const value2 = CARD_VALUES[rank2];
      
      // 评估手牌强度
      if (isPair) {
        if (value1 >= 10) return '高对';
        if (value1 >= 7) return '中对';
        return '低对';
      }
      
      if (value1 >= 12 && value2 >= 12) return '高牌组合';
      
      if (isSuited) {
        if ((value1 >= 12 && value2 >= 10) || (value2 >= 12 && value1 >= 10)) return '高同花连接';
        if (Math.abs(value1 - value2) === 1 && value1 >= 9 && value2 >= 9) return '同花连接';
      }
      
      if (Math.abs(value1 - value2) === 1 && value1 >= 9 && value2 >= 9) return '连接牌';
      
      if (value1 >= 12 || value2 >= 12) return '高牌';
      
      return '普通牌';
    },

    // 评估完整的扑克牌型
    evaluatePokerHand(cards: string[]): string {
      if (cards.length < 5) return '需要至少5张牌来评估牌型';
      
      // 提取牌的花色和点数
      const suits = cards.map(card => card.charAt(1));
      const ranks = cards.map(card => card.charAt(0));
      const values = ranks.map(rank => CARD_VALUES[rank]);
      
      // 检查是否同花
      const isFlush = suits.every(suit => suit === suits[0]);
      
      // 检查是否顺子
      const sortedValues = [...values].sort((a, b) => a - b);
      let isStraight = true;
      
      // 特殊情况：A-5-4-3-2 顺子
      if (sortedValues.includes(14) && sortedValues.includes(2) && sortedValues.includes(3) && 
          sortedValues.includes(4) && sortedValues.includes(5) && !sortedValues.includes(6)) {
        isStraight = true;
      } else {
        // 常规顺子检查
        for (let i = 1; i < sortedValues.length; i++) {
          if (sortedValues[i] !== sortedValues[i - 1] + 1) {
            isStraight = false;
            break;
          }
        }
      }
      
      // 计算每个点数的出现次数
      const rankCounts: Record<string, number> = {};
      ranks.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
      });
      
      const counts = Object.values(rankCounts);
      const hasFour = counts.includes(4);
      const hasThree = counts.includes(3);
      const pairCount = counts.filter(count => count === 2).length;
      
      // 判断牌型
      if (isFlush && isStraight) {
        // 检查是否皇家同花顺
        if (sortedValues.includes(10) && sortedValues.includes(11) && 
            sortedValues.includes(12) && sortedValues.includes(13) && 
            sortedValues.includes(14)) {
          return HAND_TYPES.ROYAL_FLUSH;
        }
        return HAND_TYPES.STRAIGHT_FLUSH;
      }
      
      if (hasFour) return HAND_TYPES.FOUR_OF_A_KIND;
      if (hasThree && pairCount > 0) return HAND_TYPES.FULL_HOUSE;
      if (isFlush) return HAND_TYPES.FLUSH;
      if (isStraight) return HAND_TYPES.STRAIGHT;
      if (hasThree) return HAND_TYPES.THREE_OF_A_KIND;
      if (pairCount >= 2) return HAND_TYPES.TWO_PAIR;
      if (pairCount === 1) return HAND_TYPES.ONE_PAIR;
      
      return HAND_TYPES.HIGH_CARD;
    },

    // 模拟胜率计算
    simulateWinRate(): number {
      const handCards = this.data.selectedHandCards.filter(card => !isEmpty(card));
      const communityCards = this.data.selectedCommunityCards.filter(card => !isEmpty(card));
      const playerCount = this.data.playerCount;
      
      // 基于手牌和公共牌的数量调整基础胜率
      let baseWinRate = 100 / playerCount; // 平均胜率
      
      // 手牌评估
      if (handCards.length === 2) {
        const rank1 = handCards[0].charAt(0);
        const rank2 = handCards[1].charAt(0);
        const suit1 = handCards[0].charAt(1);
        const suit2 = handCards[1].charAt(1);
        
        const isPair = rank1 === rank2;
        const isSuited = suit1 === suit2;
        const value1 = CARD_VALUES[rank1];
        const value2 = CARD_VALUES[rank2];
        
        // 调整基础胜率
        if (isPair) {
          // 对子的胜率调整
          if (value1 >= 10) baseWinRate *= 1.5;
          else if (value1 >= 7) baseWinRate *= 1.3;
          else baseWinRate *= 1.1;
        } else if (isSuited) {
          // 同花的胜率调整
          if (Math.abs(value1 - value2) === 1 && Math.min(value1, value2) >= 10) {
            baseWinRate *= 1.4; // 高同花连牌
          } else if (Math.abs(value1 - value2) === 1) {
            baseWinRate *= 1.2; // 同花连牌
          } else if (value1 >= 12 || value2 >= 12) {
            baseWinRate *= 1.1; // 高同花
          } else {
            baseWinRate *= 1.05; // 普通同花
          }
        } else if (Math.abs(value1 - value2) === 1 && Math.min(value1, value2) >= 10) {
          baseWinRate *= 1.2; // 高连牌
        } else if (Math.abs(value1 - value2) === 1) {
          baseWinRate *= 1.1; // 连牌
        } else if (value1 >= 12 && value2 >= 10) {
          baseWinRate *= 1.15; // 高牌组合
        } else if (value1 >= 12 || value2 >= 12) {
          baseWinRate *= 1.05; // 有高牌
        }
      }
      
      // 根据已知的公共牌调整胜率
      if (communityCards.length > 0) {
        // 这里可以添加更复杂的逻辑来评估公共牌对胜率的影响
        // 简化版：根据当前牌型调整胜率
        const allCards = [...handCards, ...communityCards];
        const handType = this.evaluatePokerHand(allCards);
        
        if (handType) {
          const handRank = HAND_RANKS[handType];
          // 根据牌型强度调整胜率
          baseWinRate = Math.min(95, baseWinRate * (1 + handRank * 0.2));
        }
      }
      
      // 确保胜率在合理范围内
      return Math.min(95, Math.max(5, baseWinRate));
    },

    // 重置组件状态
    reset() {
      this.setData({
        selectedHandCards: ['', ''],
        selectedCommunityCards: ['', '', '', '', ''],
        hasResult: false,
        winRate: 0,
        tieRate: 0,
        loseRate: 0,
        handStrength: '',
        canCalculate: false
      });
    },

    // 重置所有（包括玩家人数）
    resetAll() {
      // 显示确认对话框
      wx.showModal({
        title: '确认重置',
        content: '确定要重置所有数据吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              selectedHandCards: ['', ''],
              selectedCommunityCards: ['', '', '', '', ''],
              playerCount: this.properties.initialPlayerCount,
              hasResult: false,
              winRate: 0,
              tieRate: 0,
              loseRate: 0,
              handStrength: '',
              canCalculate: false
            });
            
            // 显示重置成功提示
            wx.showToast({
              title: '已重置',
              icon: 'success',
              duration: 1500
            });
          }
        }
      });
    },

    // 导出当前状态
    exportState() {
      return {
        handCards: this.data.selectedHandCards,
        communityCards: this.data.selectedCommunityCards,
        playerCount: this.data.playerCount,
        result: this.data.hasResult ? {
          winRate: this.data.winRate,
          tieRate: this.data.tieRate,
          loseRate: this.data.loseRate,
          handStrength: this.data.handStrength
        } : null
      };
    }
  }
});