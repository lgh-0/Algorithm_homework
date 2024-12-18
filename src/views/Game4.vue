<template>
  <div class="game-container">
    <div class="game-header">
      <h2>汉诺塔游戏</h2>
      <button @click="$router.push('/')" class="exit-btn">退出游戏</button>
    </div>
  
    <div class="problem-info">
      <h3>问题说明</h3>
      <p>1、A B C 三根柱子 &nbsp;&nbsp;&nbsp;&nbsp;将所有的盘子从A 移动到 C</p>
      <p>2、大盘子不能放在小盘子上</p>
      <p>3、用鼠标拖动盘子放到A B  C三个柱子上</p>
      <p>4、为简化问题盘子设为4个</p>
      <button @click="autoSolve" :disabled="isAutoSolving" class="solve-btn">自动求解</button>
      
      <div v-if="isSuccess" class="success-message">
        恭喜！你已经成功完成了汉诺塔游戏！
      </div>

    </div>

    <div class="towers-container">
      <div 
        v-for="(tower, towerIndex) in towers" 
        :key="towerIndex" 
        class="tower"
        @dragover.prevent
        @drop="dropDisk($event, towerIndex)"
      >
        <div class="tower-rod"></div>
        <div class="tower-base"></div>
        <div 
          v-for="(disk, diskIndex) in tower" 
          :key="disk.id"
          class="disk"
          :style="{ 
            width: `${disk.width}px`,
            backgroundColor: disk.color,
            bottom: `${diskIndex * 30 + 10}px`
          }"
          draggable="true"
          @dragstart="dragStart($event, towerIndex, diskIndex)"
          :data-disk-id="disk.id"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAutoSolving = ref(false)
const isSuccess = ref(false)


///盘子从底部往上
// 初始化盘子数据
const diskColors = ['red', 'orange', 'yellow', 'green']
const initialDisks = Array.from({ length: 4 }, (_, i) => ({
  id: 4 - i,
  width: 180 - i * 30,
  color: diskColors[i]
}))

// 三个塔的数据
const towers = ref([
  [], // A塔
  [], // B塔
  [] // C塔
])

// 初始化第一个塔的数据
for (let i = 0; i < initialDisks.length; i++) {
  towers.value[0].push(initialDisks[i])
}

// 检查移动是否合法
const isValidMove = (fromTower, toTower) => {
  const disk = towers.value[fromTower][towers.value[fromTower].length - 1]
  const topDisk = towers.value[toTower][towers.value[toTower].length - 1]
  return !topDisk || disk.id < topDisk.id
}

// 通过检查柱子C(即towers.value[2] == 4)检查是否完成游戏
const check = () => {
  if (towers.value[2].length === 4) {
    isSuccess.value = true
  }
}

// 拖拽开始
const dragStart = (event, towerIndex, diskIndex) => {
  if (diskIndex !== towers.value[towerIndex].length - 1) {
    event.preventDefault()
    return
  }
  event.dataTransfer.setData('text/plain', JSON.stringify({ towerIndex, diskIndex }))
}

// 放下盘子
const dropDisk = (event, toTower) => {
  const data = JSON.parse(event.dataTransfer.getData('text/plain'))
  const fromTower = data.towerIndex

  if (fromTower === toTower) return
  if (!isValidMove(fromTower, toTower)) return

  const disk = towers.value[fromTower].pop()
  towers.value[toTower].push(disk)
  check()
}


// 汉诺塔递归解法
const hanoi = (n, from, to, aux, moves = []) => {
  if (n === 1) {
    moves.push({ from, to })
    return moves
  }
  hanoi(n - 1, from, aux, to, moves)
  moves.push({ from, to })
  hanoi(n - 1, aux, to, from, moves)
  return moves  // 返回移动的步骤
}


// 自动求解动画
const autoSolve = async () => {
  if (isAutoSolving.value) return
  isAutoSolving.value = true
  
// 重置塔的状态
  towers.value[0] = []
  towers.value[1] = []
  towers.value[2] = []
  
  // 重新初始化第一个塔
  for (let i = 0; i < initialDisks.length; i++) {
    towers.value[0].push(initialDisks[i])
  }
  
  const moves = hanoi(4, 0, 2, 1)
    // 打印 moves 数组的长度和内容
  console.log(`Total moves: ${moves.length}`)
  console.log('Moves:', moves)

  
  for (const move of moves) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (!isValidMove(move.from, move.to)) continue
    
    const disk = towers.value[move.from].pop()
    towers.value[move.to].push(disk)
  }
  
  isAutoSolving.value = false
  check()
}
</script>

<style scoped>

.problem-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}


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


.exit-btn, .solve-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.exit-btn:hover, .solve-btn:hover {
  background-color: #45a049;
}

.solve-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message {
  margin-top: 10px;
  color: #4CAF50;
  font-weight: bold;
}

.towers-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 400px;
  margin-top: 50px;
}

.tower {
  position: relative;
  width: 200px;
  height: 300px;
  display: flex;
  justify-content: center;
}

.tower-rod {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 250px;
  background-color: white;
  border: 2px solid #666;
}

.tower-base {
  position: absolute;
  bottom: 0;
  width: 180px;
  height: 10px;
  background-color: white;
  border: 2px solid #666;
}

.disk {
  position: absolute;
  height: 25px;
  border-radius: 12px;
  cursor: move;
  transition: transform 0.2s;
}

.disk:hover {
  transform: translateY(-2px);
}
</style>