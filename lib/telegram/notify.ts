type TelegramMessageInput = {
  chatId: string;
  text: string;
};

async function sendTelegramMessage({ chatId, text }: TelegramMessageInput) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !chatId) {
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function notifyTelegramAdmin(text: string, payload?: unknown) {
  void payload;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    return false;
  }

  const sent = await sendTelegramMessage({ chatId, text });
  return sent;
}

export async function notifyTelegramRecipient(chatId: string | null | undefined, text: string, payload?: unknown) {
  void payload;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    return false;
  }

  const sent = await sendTelegramMessage({ chatId, text });
  return sent;
}

export async function notifyNewBooking(payload: unknown) {
  void payload;
}

export async function notifyTripReady(payload: unknown) {
  void payload;
}

export async function notifyDriverAssigned(payload: unknown) {
  void payload;
}

export async function notifyDriverOnTheWay(payload: unknown) {
  void payload;
}

export async function notifyTripCompleted(payload: unknown) {
  void payload;
}

export async function notifyPaymentReminder(payload: unknown) {
  void payload;
}
