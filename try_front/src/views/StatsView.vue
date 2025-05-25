<template>
  <div>
    <h1>Статистика</h1>

    <div v-if="loadError">
      <p style="color: red;">{{ loadError }}</p>
    </div>

    <div v-else-if="stats">
      <p>Изучено слов: {{ stats.learnedCount }}</p>
      <p>В повторении: {{ stats.repeatCount }}</p>
    </div>

    <div v-else>
      <p>Загрузка...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tg_id: null,
      stats: null,
      loadError: ''
    }
  },
  async mounted() {
    this.tg_id = localStorage.getItem('tg_id')
    if (!this.tg_id) {
      this.loadError = 'Ошибка: tg_id не найден.'
      return
    }
    try {
      const res = await axios.get(`/api/stats/${this.tg_id}`)
      this.stats = res.data
    } catch (e) {
      this.loadError = 'Не удалось получить статистику.'
      console.error(e)
    }
  }
}
</script>

<style scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 16px;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

h1 {
  font-size: 24px;
  color: #2d3436;
  margin-bottom: 24px;
}

p {
  font-size: 16px;
  color: #2d3436;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

p:last-child {
  border-bottom: none;
}
</style>