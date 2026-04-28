export const tasksItems = [
  { icon: 'inbox', text: 'Заявки теряются в чатах и таблицах' },
  { icon: 'repeat', text: 'Менеджеры делают одно и то же вручную каждый день' },
  { icon: 'clock', text: 'Ответ клиентам занимает слишком много времени' },
  { icon: 'users', text: 'Процессы завязаны на конкретных людях' },
  { icon: 'plug', text: 'Сервисы не связаны между собой' },
  { icon: 'trending-up', text: 'Бизнес растёт, а внутри хаос' },
] as const;

export const tasksData = {
  title: 'С какими задачами ко мне приходят',
  subtitle: 'Знакомые ситуации для бизнеса:',
} as const;
