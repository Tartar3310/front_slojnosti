import { createRouter, createWebHistory } from 'vue-router'
import QuizView from '../views/QuizView.vue'
import StatsView from '../views/StatsView.vue'
import ModesView from '../views/ModesView.vue'
import ModeQuizView from '../views/ModeQuizView.vue'

const routes = [
  { path: '/', component: QuizView },
  { path: '/stats', component: StatsView },
  { path: '/modes', component: ModesView },
  { path: '/quiz/:mode', component: ModeQuizView, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router