<template>
  <div class="game-container">

    <div class="game-header">
      <h2>线性规划问题</h2>
      <button @click="$router.push('/')" class="exit-btn">退出游戏</button>
    </div>

    <div class="problem-info">
      <h3>问题说明</h3>
      <p>工厂使用3种原料  &nbsp;&nbsp; 生产2种产品</p>
      <p>产品1售价 12元&nbsp;&nbsp;&nbsp;&nbsp;产品2售价 15元</p>
      <p>原料限制</p>
      <ul>
        <li>原料1&nbsp;&nbsp;&nbsp;&nbsp;0.25X₁ + 0.5X₂ &nbsp;&nbsp; ≤ &nbsp;&nbsp;120</li>
        <li>原料2&nbsp;&nbsp;&nbsp;&nbsp;0.5X₁ + 0.5X₂ &nbsp;&nbsp; ≤ &nbsp;&nbsp;150</li>
        <li>原料3&nbsp;&nbsp;&nbsp;&nbsp;0.25X₁ + 0X₂ &nbsp;&nbsp; ≤ &nbsp;&nbsp;50</li>
      </ul>

      <button @click="showOptimalSolution" class="calc-btn">计算最优解</button>
    </div>

    <!-- 产片输入卡片 -->
    <div class="input-section">

      <!-- 单独生产某个产品的最大值的卡片 -->
      <div class="max-info">
        <p>单独生产产品1最大数量&nbsp;&nbsp;&nbsp; {{ maxSingleProduct1 }}</p>
        <p>单独生产产品2最大数量&nbsp;&nbsp;&nbsp; {{ maxSingleProduct2 }}</p>
      </div>

      <!-- 产品1数量的输入框 -->
      <div class="input-group">
        <label>产品1数量</label>
        <input 
          type="number" 
          v-model.number="userInput.product1" 
          min="0" 
          :max="maxSingleProduct1"
          @input="updateProduct2">
      </div>

      <!-- 产品2数量的显示框 -->
      <div class="input-group">
        <label>产品2数量</label>
        <div class="readonly-input">{{ userInput.product2 }}</div>
      </div>

    </div>


    <!-- 显示结果卡片 -->
      <div class="result-section">
        <div class="value-bar optimal" v-if="showOptimal">
        
          <p>最优解</p>
          <div class="bar">
            <div class="bar-content">
              <span>收入——¥{{ optimalResult.value.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <br><br>

        <div class="value-bar user"> 
          <p>当前输入方案</p>
          <div class="bar">
            <div class="bar-fill" :style="{ width: getUserBarWidth() + '%' }"></div>
            <div class="bar-content">
              <template v-if="userValue > 0">
                <span>产品1——{{ userInput.product1 }}&nbsp;&nbsp;&nbsp;产品2——{{ userInput.product2 }}</span>
                <span>收入——¥{{ userValue.toFixed(2) }}</span>
              </template>
            </div>
          </div>
        </div>

     
      </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const EPS = 1e-7
const INF = 1e20
// 单纯形法求解器
class Simplex {
constructor() {
this.a = [],this.b = [],this.c = [],this.z = 0,this.m = 0,this.n = 0
}
  init(m, n) {
    this.m = m, this.n = n, this.z = 0
    this.a = Array(m + 10).fill().map(() => Array(n + 10).fill(0))
    this.b = Array(m + 10).fill(0), 
    this.c = Array(n + 10).fill(0)
  }

  pivot(l, e) {
    this.b[l] /= this.a[l][e]
    for(let j = 0; j < this.n; j++) {
      if(j !== e) this.a[l][j] /= this.a[l][e]
    }
    this.a[l][e] = 1 / this.a[l][e]

    for(let i = 0; i < this.m; i++) {
      if(i === l || Math.abs(this.a[i][e]) < EPS) continue
      this.b[i] -= this.a[i][e] * this.b[l]
      for(let j = 0; j < this.n; j++) {
        if(j !== e) this.a[i][j] -= this.a[i][e] * this.a[l][j]
      }
      this.a[i][e] = -this.a[i][e] * this.a[l][e]
    }

    this.z += this.c[e] * this.b[l]
    for(let j = 0; j < this.n; j++) {
      if(j !== e) this.c[j] -= this.c[e] * this.a[l][j]
    }
    this.c[e] *= -this.a[l][e]
  }

  solve() {
    while(true) {
      let e = -1, l = -1
      let maxc = EPS

      for(let j = 0; j < this.n; j++) {
        if(this.c[j] > maxc) {
          maxc = this.c[j]
          e = j
        }
      }

      if(e === -1) return { value: this.z }

      let minba = INF
      for(let i = 0; i < this.m; i++) {
        if(this.a[i][e] > EPS && minba > this.b[i] / this.a[i][e]) {
          minba = this.b[i] / this.a[i][e]
          l = i
        }
      }

      if(l === -1) return { value: INF }
      this.pivot(l, e)
    }
  }
}

// 状态和计算逻辑
const userInput = ref({ product1: 0, product2: 0 })
const optimalResult = ref({ value: 0, x1: 0, x2: 0 })
const showOptimal = ref(false)
const optimalCalculated = ref(false)

const userValue = computed(() => {
  return userInput.value.product1 * 12 + userInput.value.product2 * 15
})

// 计算单独生产每种产品的最大数量
const maxSingleProduct1 = computed(() => {
  return Math.min(
    Math.floor(120 / 0.25),  // 原料1限制
    Math.floor(150 / 0.5),   // 原料2限制
    Math.floor(50 / 0.25)    // 原料3限制
  )
})

const maxSingleProduct2 = computed(() => {
  return Math.min(
    Math.floor(120 / 0.5),   // 原料1限制
    Math.floor(150 / 0.5)    // 原料2限制
  )
})

// 根据产品1的输入计算产品2的最大可能数量
const calculateMaxProduct2 = (product1Amount) => {
  const remainingMaterial1 = 120 - 0.25 * product1Amount
  const remainingMaterial2 = 150 - 0.5 * product1Amount
  
  return Math.min(
    Math.floor(remainingMaterial1 / 0.5),  // 原料1限制
    Math.floor(remainingMaterial2 / 0.5)   // 原料2限制
  )
}

// 更新产品2的数量
const updateProduct2 = () => {
  let x1 = Math.max(0, userInput.value.product1 || 0)
  // 限制产品1的输入不超过最大值
  x1 = Math.min(x1, maxSingleProduct1.value)
  userInput.value.product1 = x1
  
  // 计算并更新产品2的数量
  userInput.value.product2 = Math.max(0, calculateMaxProduct2(x1))
}

// 计算用户方案显示条的宽度比例
const getUserBarWidth = () => {
  if (!optimalCalculated.value || optimalResult.value.value === 0) return 0
  return Math.min(100, (userValue.value / optimalResult.value.value) * 100)
}

// 计算最优解
const calculateOptimal = () => {
  
  const simplex = new Simplex()
  simplex.init(3, 2)
  simplex.c[0] = 12
  simplex.c[1] = 15
  simplex.a[0][0] = 0.25; simplex.a[0][1] = 0.5;  simplex.b[0] = 120
  simplex.a[1][0] = 0.5;  simplex.a[1][1] = 0.5;  simplex.b[1] = 150
  simplex.a[2][0] = 0.25; simplex.a[2][1] = 0;    simplex.b[2] = 50
  const result = simplex.solve()
  
  if (result.value !== INF) {
    optimalResult.value = {
      value: result.value,
      x1: 0,
      x2: 0
    }
    optimalCalculated.value = true
  }
}

// 显示最优解
const showOptimalSolution = () => {
  if (!optimalCalculated.value) {
    calculateOptimal()
  }
  showOptimal.value = true
}

// 在组件挂载时计算最优解，但不显示,这个值在成比例地动态填充用户显示条中使用
onMounted(() => {
  calculateOptimal()
  updateProduct2()
})
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

.problem-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.max-info {
  margin-bottom: 10px;
}

.max-info p {
  margin: 5px 0;
  color: #666;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.readonly-input {
  width: 80px;
  padding: 5px;
  background-color: #e9ecef;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.exit-btn, .calc-btn {
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.exit-btn {
  background-color: green;
}

.exit-btn:hover {
  background-color: #45a049;
}

.calc-btn {
  background-color: #4CAF50;
  margin-bottom: 20px;
}

.calc-btn:hover {
  background-color: #27ae60;
}

.result-section{
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}



.bar {
  position: relative;
  background-color: #f5f5f5;
  border-radius: 4px;
  height: 40px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #0aab5f;
  transition: width 0.3s ease;
  z-index: 1;
}

.bar-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 100%;
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.optimal .bar {
  background-color: #45B7D1;
}



.value-bars {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.bar-fill.empty {
  background-color: #e9ecef;
}
</style>