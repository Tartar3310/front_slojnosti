<template>
  <div class="quiz-view">
    <h1>Вопрос дня</h1>

    <!-- Кнопка запуска -->
    <div v-if="!quizStarted" class="start-button-container">
      <button @click="startQuiz">Начать</button>
    </div>

    <!-- Ошибка -->
    <div v-if="loadError">
      <p class="error-message">{{ loadError }}</p>
    </div>

    <!-- Контент вопроса -->
    <div class="quiz-content">
      <div v-if="currentWord" class="question-container">
        <p><strong>Английское слово:</strong> {{ currentWord.word_eng }}</p>
        <p><strong>Повторение:</strong> {{ currentWord.was_in_repeat ? 'Да' : 'Нет' }}</p>

        <div class="options-wrapper">
          <div class="options">
            <button
              v-for="(option, index) in options"
              :key="index"
              @click="submitAnswer(option)"
              :disabled="answered"
              :class="{ 
                'correct-answer': answered && option === currentWord.word_rus,
                'wrong-answer': answered && option !== currentWord.word_rus 
              }"
            >
              {{ option }}
              <span v-if="answered && option === currentWord.word_rus">✅</span>
              <span v-if="answered && option !== currentWord.word_rus">❌</span>
            </button>
          </div>
          
          <transition name="feedback">
            <div v-if="feedback" class="feedback-container">
              <p>{{ feedback }}</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-else-if="loading" class="loading">
        <p>Загрузка...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tg_id: null,
      currentWord: null,
      options: [],
      answered: false,
      feedback: '',
      loadError: '',
      loading: false,
      quizStarted: false
    }
  },
  mounted() {
    this.tg_id = localStorage.getItem('tg_id')
    if (!this.tg_id) {
      this.loadError = 'Ошибка: tg_id не найден.'
    }
  },
  methods: {
    async startQuiz() {
      this.quizStarted = true
      this.loading = true
      this.answered = false
      this.feedback = ''
      this.currentWord = null
      this.options = []

      try {
        const wordResponse = await axios.get(`/api/quiz/${this.tg_id}`)
        if (wordResponse.data.error) {
          this.loadError = wordResponse.data.error
          return
        }

        const randomWordsResponse = await axios.get(`/api/random-words/3`)
        const randomOptions = randomWordsResponse.data

        this.currentWord = {
          word_id: wordResponse.data.word_id,
          word_eng: wordResponse.data.word_eng,
          word_rus: wordResponse.data.word_rus,
          was_in_repeat: wordResponse.data.was_in_repeat
        }

        this.options = [this.currentWord.word_rus, ...randomOptions]
        this.shuffleOptions()

      } catch (e) {
        this.loadError = 'Не удалось загрузить вопрос.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    shuffleOptions() {
      for (let i = this.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.options[i], this.options[j]] = [this.options[j], this.options[i]]
      }
    },

    submitAnswer(selectedOption) {
      this.answered = true
      const isCorrect = selectedOption === this.currentWord.word_rus
      
      this.feedback = isCorrect
        ? 'Правильно! 🎉'
        : `Неправильно 😕. Правильный ответ: ${this.currentWord.word_rus}`

      this.sendAnswerToServer(isCorrect)
      this.prepareNextQuestion()
    },

    async sendAnswerToServer(isCorrect) {
      try {
        await axios.post('/api/answer', {
          tg_id: this.tg_id,
          word_id: this.currentWord.word_id,
          was_in_repeat: this.currentWord.was_in_repeat,
          is_correct: isCorrect
        })
      } catch (e) {
        console.error('Ошибка при отправке ответа:', e)
      }
    },

    prepareNextQuestion() {
      setTimeout(() => {
        this.currentWord = null
        this.feedback = ''
        this.answered = false
        this.$nextTick(() => {
          this.startQuiz()
        })
      }, 2000)
    }
  }
}
</script>

<style scoped>
.quiz-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  height: 100%;
  width: 100%;
  padding-bottom: 32px;
}

.start-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 2rem;
}

h1 {
  font-size: 24px;
  color: #2d3436;
  margin-bottom: 24px;
  text-align: center;
}

.quiz-content {
  width: 100%;
  max-width: 600px;
}

.question-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.options-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.options {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 24px;
}

.options button {
  padding: 16px;
  text-align: center;
  background: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  width: 100%;
  min-width: 200px;
  transition: all 0.2s ease;
  position: relative;
}

.feedback-container {
  width: 100%;
  max-width: 500px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: 16px;
  text-align: center;
}

.feedback-container p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #2d3436;
}

.loading {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: #d63031;
  font-weight: bold;
  text-align: center;
}

.correct-answer {
  border-color: #00b894 !important;
  background: #f0fff4 !important;
}

.wrong-answer {
  border-color: #d63031 !important;
  background: #fff5f5 !important;
}

/* Анимация фидбека */
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