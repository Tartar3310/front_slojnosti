<template>
  <div class="modes-view">
    <h1>Выберите режим</h1>
    <div class="mode-buttons">
      <button 
        v-for="mode in modes" 
        :key="mode.id"
        @click="selectMode(mode.id)"
      >
        {{ mode.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      modes: [
        { id: 'easy', label: 'Легкий' },
        { id: 'medium', label: 'Средний' },
        { id: 'hard', label: 'Сложный' },
        { id: 'interval', label: 'Интервальное повторение' }
      ]
    }
  },
  methods: {
    selectMode(mode) {
      this.$router.push(`/quiz/${mode}`)
    }
  }
}
</script>

<style scoped>
.modes-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  width: 100%;
  padding-bottom: 32px;
}

h1 {
  font-size: 24px;
  color: #2d3436;
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.mode-buttons {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 20px;
  max-width: 500px;
  width: 100%;
}

.mode-buttons button {
  padding: 20px;
  font-size: 16px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: none;
  width: 100%;
  transition: all 0.2s ease;
  min-width: 200px;
}

.mode-buttons button:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}
</style>