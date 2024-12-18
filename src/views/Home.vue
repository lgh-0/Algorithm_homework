<template>
  <div class="home-container">
    <h1 class="title">游戏中心</h1>
    <div class="games-grid">
      <el-card
        v-for="game in games"
        :key="game.id"
        class="game-card"
        :body-style="{ padding: '0px' }"
        @click="goToGame(game.route)"
      >
        <div class="card-content" :style="{ backgroundColor: game.color + '15' }">
          <el-icon :size="70" :color="game.color">  
            <component :is="game.icon" />
          </el-icon>
          <h2>{{ game.name }}</h2>
          <p>{{ game.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  TrendCharts,
  Timer,
  Goods,
  Histogram,
} from '@element-plus/icons-vue'

const router = useRouter()

const games = [
  { 
    id: 1, 
    name: '最优生产线性规划游戏', 
    description: '安排不同的生产规划使得利润最大', 
    icon: TrendCharts,
    route: '/game1',
    color: '#67C23A'
  },
  { 
    id: 2, 
    name: '银行排队的贪心游戏', 
    description: '给不同的人排队使得总延迟时间最小', 
    icon: Timer,
    route: '/game2',
    color: '#409EFF'
  },
  { 
    id: 3, 
    name: '01背包的动态规划游戏', 
    description: '选择使得背包价值最大的物品', 
    icon: Goods,
    route: '/game3',
    color: '#E6A23C'
  },
  { 
    id: 4, 
    name: '汉诺塔分治游戏', 
    description: '汉诺塔盘子移动', 
    icon: Histogram,
    route: '/game4',
    color: '#F56C6C'
  }
]

const goToGame = (route) => {
  router.push(route)
}
</script>

<style scoped>
.home-container {
  padding: 2rem;
  min-height: 100vh;
  background: #f5f7fa;
}

.title {
  text-align: center;
  color: #303133;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.game-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 200px;
}

.card-content h2 {
  margin: 0;
  color: #303133;
  font-size: 1.5rem;
}

.card-content p {
  margin: 0;
  color: #606266;
  text-align: center;
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>