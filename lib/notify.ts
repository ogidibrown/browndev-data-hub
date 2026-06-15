import { log } from "./logger";

const ROUTE = "notify";

/**
 * Sends an admin alert to ADMIN_ALERT_WEBHOOK_URL (Slack / Discord / any HTTP webhook).
 * If the env var is not set, falls back to a WARN log only.
 *
 * Slack / Discord both accept: POST { text: "..." }
 * To configure: set ADMIN_ALERT_WEBHOOK_URL in Vercel environment variables.
 */
export async function sendAdminAlert(message: string, ctx?: Record<string, unknown>): Promise<void> {
  log.warn(ROUTE, `ADMIN ALERT: ${message}`, ctx);

  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `🚨 *BrownDev Data Hub Alert*\n${message}${ctx ? `\n\`\`\`${JSON.stringify(ctx, null, 2)}\`\`\`` : ""}` }),
    });
  } catch (err) {
    log.error(ROUTE, "Failed to send admin alert webhook", { err: String(err) });
  }
}
