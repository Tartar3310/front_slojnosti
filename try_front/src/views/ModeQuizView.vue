<template>
  <div class="mode-quiz-container">
    <h1>Режим: {{ modeLabel }}</h1>
    
    <div v-if="!quizStarted" class="start-quiz-wrapper">
      <button @click="startQuiz">Начать квиз</button>
    </div>

    <div v-if="loading" class="centered-content">
      <p>Загрузка...</p>
    </div>
    
    <div v-if="currentQuiz && !currentQuiz.error" class="centered-content">
      <div class="quiz-content">
        <div v-if="currentQuiz.stage !== undefined" class="stage-indicator">
          Этап повторения: {{ currentQuiz.stage }}
        </div>
        
        <p><strong>Слово:</strong> {{ currentQuiz.word_eng }}</p>
        
        <div class="options">
          <button
            v-for="(option, index) in currentQuiz.options"
            :key="index"
            @click="submitAnswer(option)"
            :disabled="answered"
            :class="{
              'correct-answer': answered && option === correctAnswer,
              'wrong-answer': answered && option !== correctAnswer
            }"
          >
            {{ option }}
            <span v-if="answered && option === correctAnswer">✅</span>
            <span v-if="answered && option !== correctAnswer">❌</span>
          </button>
        </div>
        
        <transition name="feedback">
          <div v-if="feedback" class="feedback-container">
            <p>{{ feedback }}</p>
            <p v-if="nextStage" class="stage-update">
              Новый этап: {{ nextStage }}
            </p>
          </div>
        </transition>
      </div>
    </div>

    <div v-if="currentQuiz?.error" class="error-message">
      {{ currentQuiz.error }}
      <button @click="quizStarted = false">Назад</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tg_id: null,
      mode: null,
      currentQuiz: null,
      quizStarted: false,
      loading: false,
      answered: false,
      feedback: '',
      correctAnswer: null,
      nextStage: null
    }
  },
  computed: {
    modeLabel() {
      const labels = {
        easy: 'Легкий',
        medium: 'Средний',
        hard: 'Сложный',
        interval: 'Интервальное повторение'
      }
      return labels[this.mode] || ''
    }
  },
  mounted() {
    this.tg_id = localStorage.getItem('tg_id')
    this.mode = this.$route.params.mode
  },
  methods: {
    async startQuiz() {
      this.quizStarted = true
      this.loading = true
      this.currentQuiz = null
      this.feedback = ''
      this.nextStage = null
      this.correctAnswer = null
      
      try {
        const endpoint = this.mode === 'interval' 
          ? `/api/quiz/interval/${this.tg_id}`
          : `/api/quiz/${this.mode}/${this.tg_id}`
        
        const response = await axios.get(endpoint)
        
        if (!response.data?.word_eng || !response.data?.options) {
          throw new Error('Некорректный ответ сервера')
        }
        
        this.currentQuiz = response.data
        this.correctAnswer = this.currentQuiz.word_rus
        
        if (this.currentQuiz.options.length < 2) {
          throw new Error('Недостаточно вариантов ответа')
        }
        
      } catch (error) {
        console.error('Ошибка загрузки квиза:', error)
        this.currentQuiz = { error: 'Не удалось загрузить вопрос' }
        this.quizStarted = false
      } finally {
        this.loading = false
      }
    },

    async submitAnswer(selectedOption) {
      this.answered = true
      this.nextStage = null
      const isCorrect = selectedOption === this.correctAnswer
      
      try {
        const endpoint = this.mode === 'interval'
          ? '/api/quiz/interval/answer'
          : `/api/quiz/${this.mode}/answer`
        
        await axios.post(endpoint, {
          tg_id: this.tg_id,
          word_id: this.currentQuiz.word_id,
          selected_option: selectedOption
        })
        
        this.feedback = isCorrect ? '✅ Правильно!' : '❌ Неправильно'

        // Задержка перед загрузкой нового вопроса
        setTimeout(async () => {
          try {
            await this.startQuiz() // Перезагружаем новый вопрос
            this.answered = false
            this.feedback = ''
          } catch (error) {
            this.quizStarted = false
          }
        }, 2000)
        
      } catch (error) {
        console.error('Ошибка отправки ответа:', error)
        this.feedback = 'Ошибка обработки ответа'
        this.quizStarted = false
      }
    }
  }
}
</script>

<style scoped>
.mode-quiz-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  width: 100%;
  padding-bottom: 32px;
}

.centered-content {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.start-quiz-wrapper {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

h1 {
  font-size: 24px;
  color: #2d3436;
  margin-bottom: 24px;
  width: 100%;
  text-align: center;
}

.quiz-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  width: 100%;
  max-width: 500px;
}

.options {
  display: grid;
  gap: 12px;
  width: 100%;
  margin: 24px 0;
}

.options button {
  padding: 16px;
  text-align: left;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  position: relative;
  transition: all 0.2s ease;
}

.options button.correct-answer {
  border-color: #00b894 !important;
  background: #f0fff4 !important;
  color: #005a40 !important;
}

.options button.wrong-answer {
  border-color: #d63031 !important;
  background: #fff5f5 !important;
  color: #cc0000 !important;
}

.feedback-container {
  margin-top: 20px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stage-indicator {
  margin: 10px 0;
  padding: 8px 16px;
  background: #e3f2fd;
  border-radius: 8px;
  font-size: 0.9em;
  color: #1976d2;
}

.error-message {
  color: #d63031;
  padding: 16px;
  text-align: center;
}

.stage-update {
  margin-top: 8px;
  font-size: 0.9em;
  color: #2e7d32;
}

.feedback-enter-active {
  transition: all 0.3s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.feedback-leave-active {
  transition: all 0.2s ease;
}

.feedback-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>