// Sistema de notificações push para celular
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const scheduleNotification = async (
  title: string,
  body: string,
  delay: number = 0
): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.log('Permissão de notificação negada');
    return;
  }

  const showNotification = () => {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'studyflow-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'study',
          title: 'Estudar Agora'
        },
        {
          action: 'later',
          title: 'Lembrar Mais Tarde'
        }
      ]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  };

  if (delay > 0) {
    setTimeout(showNotification, delay);
  } else {
    showNotification();
  }
};

export const scheduleTaskReminder = async (
  taskTitle: string,
  dueDate: string
): Promise<void> => {
  const due = new Date(dueDate);
  const now = new Date();
  const timeDiff = due.getTime() - now.getTime();
  
  // Notificar 1 dia antes
  const oneDayBefore = timeDiff - (24 * 60 * 60 * 1000);
  if (oneDayBefore > 0) {
    setTimeout(() => {
      scheduleNotification(
        '📋 Tarefa se aproximando!',
        `"${taskTitle}" vence amanhã. Não esqueça!`
      );
    }, oneDayBefore);
  }

  // Notificar no dia
  if (timeDiff > 0) {
    setTimeout(() => {
      scheduleNotification(
        '⚠️ Tarefa vence hoje!',
        `"${taskTitle}" precisa ser concluída hoje.`
      );
    }, timeDiff);
  }
};

export const scheduleStudyReminder = async (): Promise<void> => {
  // Notificações diárias de estudo
  const scheduleDaily = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 19:00 todos os dias
    
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      scheduleNotification(
        '🎯 Hora do foco, João Pedro!',
        'Que tal uma sessão de estudos para manter o ritmo?'
      );
      
      // Reagendar para o próximo dia
      scheduleDaily();
    }, timeUntilTomorrow);
  };

  scheduleDaily();
};

// Notificações motivacionais baseadas no progresso
export const sendMotivationalNotification = async (
  level: number,
  streak: number,
  xp: number
): Promise<void> => {
  let title = '';
  let body = '';

  if (streak >= 7) {
    title = '🔥 Sequência incrível!';
    body = `${streak} dias consecutivos! Você está no caminho certo, João Pedro!`;
  } else if (level > 1 && xp % 500 === 0) {
    title = '🏆 Nível conquistado!';
    body = `Parabéns! Você alcançou o nível ${level}. Continue evoluindo!`;
  } else if (xp > 0 && xp % 200 === 0) {
    title = '⭐ Progresso constante!';
    body = `${xp} XP acumulados! Sua dedicação está dando frutos.`;
  }

  if (title && body) {
    await scheduleNotification(title, body);
  }
};

// Inicializar sistema de notificações
export const initializeNotifications = async (): Promise<void> => {
  await requestNotificationPermission();
  await scheduleStudyReminder();
  
  // Registrar service worker para notificações em background
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.log('Erro ao registrar Service Worker:', error);
    }
  }
};