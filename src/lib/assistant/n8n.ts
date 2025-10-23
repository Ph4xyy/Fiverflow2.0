/**
 * Webhooks n8n signés pour l'Assistant AI
 */

// Configuration n8n
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL;
const N8N_WEBHOOK_SECRET = import.meta.env.VITE_N8N_WEBHOOK_SECRET;

/**
 * Génère une signature HMAC SHA256
 */
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Envoie un webhook signé à n8n
 */
export async function postWebhook(
  event: string,
  payload: any,
  retryCount: number = 0
): Promise<boolean> {
  // Vérifier si n8n est configuré
  if (!N8N_BASE_URL || !N8N_WEBHOOK_SECRET) {
    console.log('n8n webhooks non configurés, skip');
    return true; // Pas d'erreur si non configuré
  }

  try {
    const payloadString = JSON.stringify(payload);
    const signature = await generateSignature(payloadString, N8N_WEBHOOK_SECRET);

    const response = await fetch(`${N8N_BASE_URL}/webhook/${event}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': `sha256=${signature}`,
        'User-Agent': 'FiverFlow-Assistant/1.0',
      },
      body: payloadString,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Webhook n8n envoyé: ${event}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur webhook n8n ${event}:`, error);

    // Retry avec backoff exponentiel
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`🔄 Retry webhook ${event} dans ${delay}ms (tentative ${retryCount + 1}/3)`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return postWebhook(event, payload, retryCount + 1);
    }

    return false;
  }
}

/**
 * Envoie un webhook pour une tâche
 */
export async function sendTaskWebhook(
  action: 'created' | 'updated' | 'deleted',
  task: any,
  userId: string
): Promise<boolean> {
  const event = `task.${action}`;
  const payload = {
    action,
    task,
    userId,
    timestamp: new Date().toISOString(),
  };

  return postWebhook(event, payload);
}

/**
 * Envoie un webhook pour une commande
 */
export async function sendOrderWebhook(
  action: 'created' | 'updated' | 'deleted',
  order: any,
  userId: string,
  statusChanged?: boolean
): Promise<boolean> {
  const event = `order.${action}`;
  const payload = {
    action,
    order,
    userId,
    statusChanged,
    timestamp: new Date().toISOString(),
  };

  return postWebhook(event, payload);
}

/**
 * Envoie un webhook pour un client
 */
export async function sendClientWebhook(
  action: 'created' | 'updated' | 'deleted',
  client: any,
  userId: string
): Promise<boolean> {
  const event = `client.${action}`;
  const payload = {
    action,
    client,
    userId,
    timestamp: new Date().toISOString(),
  };

  return postWebhook(event, payload);
}

/**
 * Envoie un webhook pour un événement
 */
export async function sendEventWebhook(
  action: 'created' | 'updated' | 'deleted',
  event: any,
  userId: string
): Promise<boolean> {
  const eventName = `event.${action}`;
  const payload = {
    action,
    event,
    userId,
    timestamp: new Date().toISOString(),
  };

  return postWebhook(eventName, payload);
}

/**
 * Vérifie si n8n est configuré
 */
export function isN8NConfigured(): boolean {
  return !!(N8N_BASE_URL && N8N_WEBHOOK_SECRET);
}
