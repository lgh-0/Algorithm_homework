<template>
  <div class="game-container">
    <div class="game-header">
      <h2>最小延迟调度问题</h2>
      <button @click="$router.push('/')" class="exit-btn">退出游戏</button>
    </div>
    
    <div class="game-description">
      <h3>游戏说明</h3>
      <p>这是一个模拟银行窗口排队的游戏。每个矩形代表一个人，显示了他的办理时间(t)和截止时间(d)。简化处理只有5个人。时间从0分钟开始。</p>
      <div class="metrics">
        <p>当前排列的最大延迟时间: {{ currentMetrics.maxLateness }} 分钟</p>
        <p v-if="currentMetrics.maxLatenessTask">最大延迟任务: 任务{{ currentMetrics.maxLatenessTask.id }} (完成时间: {{ currentMetrics.maxLatenessTask.completionTime }}分钟, 截止时间: {{ currentMetrics.maxLatenessTask.deadline }}分钟)</p>
        <p>当前排列的总延迟时间: {{ currentMetrics.totalLateness }} 分钟</p>
        <p>最优排列的最大延迟时间: {{ optimalMetrics.maxLateness }} 分钟</p>
        <p v-if="optimalMetrics.maxLatenessTask">最优排列中的最大延迟任务: 任务{{ optimalMetrics.maxLatenessTask.id }} (完成时间: {{ optimalMetrics.maxLatenessTask.completionTime }}分钟, 截止时间: {{ optimalMetrics.maxLatenessTask.deadline }}分钟)</p>
        <p>最优排列的总延迟时间: {{ optimalMetrics.totalLateness }} 分钟</p>
      </div>
      <button @click="autoSchedule" class="auto-btn">自动优化队列</button>
    </div>

    <div class="tasks-container">
      <TransitionGroup
        tag="div"
        name="tasks-transition"
        class="tasks-list"
      >
        <div
          v-for="(task, index) in tasks"
          :key="task.id"
          class="task-item"
          :class="{ 'task-item-dragging': isDragging === index }"
          :style="{ backgroundColor: task.color }"
          draggable="true"
          @dragstart="startDrag($event, index)"
          @dragend="endDrag"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop($event, index)"
        >
          <div class="task-info">
            <span>时间: {{ task.duration }}分钟</span>
            <span>截止: {{ task.deadline }}分钟</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDragging = ref(null)

// 初始任务数据 设定为5个任务
const initialTasks = [
  { id: 1, duration: 20, deadline: 50, color: '#FF6B6B' },
  { id: 2, duration: 15, deadline: 30, color: '#4ECDC4' },
  { id: 3, duration: 10, deadline: 25, color: '#45B7D1' },
  { id: 4, duration: 8, deadline: 15, color: '#96CEB4' },
  { id: 5, duration: 12, deadline: 35, color: '#FFEEAD' }
]
//创建一个响应式任务列表，确保在任务更新时能动态响应界面变化
const tasks = ref([])
// 使用for循环初始化tasks
for (let i = 0; i < initialTasks.length; i++) {
  tasks.value.push(initialTasks[i])
}

// 计算任务的延迟指标
function calculate(taskList) {
  let currentTime = 0
  let maxLateness = 0
  let totalLateness = 0
  let maxLatenessTask = null

  // 按照当前顺序计算每个任务的延迟
  taskList.forEach(task => {
    // 当前任务的完成时间
    currentTime += task.duration
    // 计算延迟（完成时间 - 截止时间）
    const lateness = Math.max(0, currentTime - task.deadline)
    // 更新最大延迟和总延迟
    if (lateness > maxLateness) {
      maxLateness = lateness
      maxLatenessTask = {
        id: task.id,
        completionTime: currentTime,
        deadline: task.deadline
      }
    }
    totalLateness += lateness
  })

  return {
    maxLateness,
    totalLateness,
    maxLatenessTask
  }
}

// 计算最优调度顺序（贪心算法：按截止时间排序）
function find(taskList) {
  // 创建新数组并复制元素
  const result = []
  for (let i = 0; i < taskList.length; i++) {
    result.push(taskList[i])
  }
//   比较函数的返回值决定排序顺序：
// 如果返回值 < 0，则 a 排在 b 前面
// 如果返回值 = 0，则 a 和 b 的相对位置不变
// 如果返回值 > 0，则 b 排在 a 前面
  result.sort((a, b) => a.deadline - b.deadline)
  return result
}

// 计算当前排列的延迟指标
const currentMetrics = computed(() => {
  return calculate(tasks.value)
})

// 计算最优排列的延迟指标
const optimalMetrics = computed(() => {
  const optimalOrder = find(tasks.value)
  return calculate(optimalOrder)
})

// 拖拽相关函数
const startDrag = (evt, index) => {
  isDragging.value = index
  evt.dataTransfer.effectAllowed = 'move'
  evt.dataTransfer.setData('text/plain', index.toString())
}

const endDrag = () => {
  isDragging.value = null
}

const onDrop = (evt, dropIndex) => {
  const dragIndex = parseInt(evt.dataTransfer.getData('text/plain'))
  if (dragIndex === dropIndex) return
  
  const tasksCopy = [...tasks.value]
  const [removed] = tasksCopy.splice(dragIndex, 1)
  tasksCopy.splice(dropIndex, 0, removed)
  tasks.value = tasksCopy
}

// 自动优化队列
const autoSchedule = () => {
  tasks.value = find(tasks.value)
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

.exit-btn, .auto-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.exit-btn:hover, .auto-btn:hover {
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

.tasks-container {
  margin-top: 20px;
}

.tasks-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.task-item {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-item-dragging {
  opacity: 0.5;
}

.task-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.tasks-transition-move {
  transition: transform 0.5s;
}
</style>