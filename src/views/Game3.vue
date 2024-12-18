<template>
  <div class="game-container">
    <div class="game-header">
      <h2>01背包问题</h2>
      <button @click="$router.push('/')" class="exit-btn">退出游戏</button>
    </div>
    <!-- 游戏说明卡片 -->
    <div class="game-description">
      <h3>游戏说明</h3>
      <p>这是一个01背包问题游戏。背包容量为 {{ cap }} kg，请选择物品使总价值最大。</p>
      <div class="metrics">
        <p>剩余容量: {{ remainingCapacity }} kg</p>
        <p>当前总价值: {{ currentValue }} 元</p>
        <br>
        <hr>
        <br>
        <p v-if="showOptimal">最优解价值: {{ optimalValue }} 元</p>
        <p v-if="showOptimal">最优解物品: {{ optimalItems.join(', ') }}</p>
      </div>
      <button @click="calculateOptimal" class="optimal-btn">计算最优解</button>
    </div>

    <!-- 背包卡片 -->
    <div class="items-container">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="item-box"
        :class="{ 'selected': selectedItems.includes(index) }"
        @click="toggleItem(index)"
        :style="{ backgroundColor: item.color }"
      >
        <div class="item-info">
          <span>重量: {{ item.w }}kg</span>
          <span>价值: {{ item.v }}元</span>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 背包容量
const cap = 20

// 物品数据 设定为7个
const items = [
  { w: 2, v: 3, color: '#FF6B6B' },
  { w: 3, v: 4, color: '#4ECDC4' },
  { w: 4, v: 5, color: '#45B7D1' },
  { w: 5, v: 8, color: '#96CEB4' },
  { w: 6, v: 9, color: '#FFEEAD' },
  { w: 7, v: 10, color: '#FFD93D' },
  { w: 8, v: 11, color: '#6C5B7B' }
]

// 选中的物品索引
const selectedItems = ref([])
const showOptimal = ref(false)
const optimalValue = ref(0)
const optimalItems = ref([])

// 计算当前选择的总重量
// selectedItems.value 是一个数组，包含了所有被选中物品的索引
// reduce 方法遍历这个数组，将每个选中物品的重量累加
// sum 是累加器，初始值为0
// index 是当前物品的索引
// items[index].w 获取当前物品的重量
const currentWeight = computed(() => {
  return selectedItems.value.reduce((sum, index) => sum + items[index].w, 0)
})

// 计算当前选中物品的总价值
// selectedItems.value 是一个数组，包含了所有被选中物品的索引
// reduce 方法遍历这个数组，将每个选中物品的价值累加
// sum 是累加器，初始值为0
// index 是当前物品的索引
// items[index].v 获取当前物品的价值
const currentValue = computed(() => {
  return selectedItems.value.reduce((sum, index) => sum + items[index].v, 0)
})

// 计算背包的剩余容量
// cap 是背包的总容量
// currentWeight.value 是当前已选物品的总重量
const remainingCapacity = computed(() => {
  return cap - currentWeight.value
})

// 选择/取消选择物品
const toggleItem = (index) => {
  const itemWeight = items[index].w
  const isSelected = selectedItems.value.includes(index)
  
  if (isSelected) {
    // 取消选择
    selectedItems.value = selectedItems.value.filter(i => i !== index)
  } else {
    // 检查是否超过容量
    if (currentWeight.value + itemWeight <= cap) {
      selectedItems.value.push(index)
    }
  }
}

// 01背包动态规划算法
const dp = () => {
  const n = items.length  //items物品数据   cap背包容量 
  const dp = Array(n + 1).fill(0).map(() => Array(cap + 1).fill(0))
  const selected = Array(n + 1).fill(0).map(() => Array(cap + 1).fill(false))
  for (let i = 1; i <= n; i++) {  //物品从1开始
    const item = items[i - 1]  //items从0开始,所以要减1
    for (let j = 0; j <= cap; j++) {  //背包容量从0开始
      if (item.w <= j && dp[i-1][j-item.w] + item.v > dp[i-1][j]) {
        dp[i][j] = dp[i-1][j-item.w] + item.v
        selected[i][j] = true
      } else {
        dp[i][j] = dp[i-1][j]
      }
    }
  } 
  // 回溯找出选中的物品
  let w = cap
  const arr = []  //选中的物品索引
  for (let i = n; i >= 1; i--) {
    if (selected[i][w]) {
//从第一个物品开始选
//unshift()在数组的起始位置插入元素。
      arr.unshift(i - 1) 
      w -= items[i - 1].w //items从0开始,所以i要减1
    }
  }  //返回最大总价值和选中的物品索引。
  return {
    maxValue: dp[n][cap],
    selected: arr
  }
}

// 计算最优解
const calculateOptimal = () => {
  const result = dp()
  optimalValue.value = result.maxValue
  optimalItems.value = result.selected.map(index => 
    `物品${index + 1}(${items[index].w}kg, ${items[index].v}元)`
  )
  showOptimal.value = true
}
</script>

<style scoped>
.game-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.exit-btn, .optimal-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.exit-btn:hover, .optimal-btn:hover {
  background-color: #45a049;
}

.game-description {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.metrics {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metrics p {
  margin: 5px 0;
  color: #333;
}

.items-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.item-box {
  /* 背包的长宽信息 */
  width: 90px;  
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.item-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-box.selected {
  border: 3px solid #4CAF50;
  transform: translateY(-2px);
}

.item-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>