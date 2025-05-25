import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

axios.defaults.baseURL = 'http://127.0.0.1:8000'

const tg = window.Telegram.WebApp
tg.ready()  // даём Телеграму инициализироваться

// Сохраняем tg_id в localStorage при старте
if (tg.initDataUnsafe?.user?.id) {
  localStorage.setItem('tg_id', tg.initDataUnsafe.user.id)
} else {
  console.warn('Telegram WebApp initDataUnsafe.user.id отсутствует')
}

app.use(router)
app.mount('#app')
