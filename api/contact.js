function parseBody(req) {
  if (!req || req.body === undefined || req.body === null) return {};

  if (typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body !== "string") {
    return {};
  }

  const text = req.body.trim();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (_) {
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }
}

function normalize(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function validate(payload) {
  const required = ["name", "company", "email", "phone", "message"];
  const missing = required.filter((field) => !normalize(payload[field]));
  if (missing.length) {
    return `缺少必填字段: ${missing.join(", ")}`;
  }

  const email = normalize(payload.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "邮箱格式不正确";
  }

  return "";
}

async function forwardWebhook(submission) {
  const url = process.env.FORM_WEBHOOK_URL;
  if (!url) return;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission)
  });

  if (!response.ok) {
    throw new Error(`Webhook 转发失败: ${response.status}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    const payload = parseBody(req);

    if (normalize(payload.website)) {
      res.status(200).json({ ok: true, message: "ignored" });
      return;
    }

    const error = validate(payload);
    if (error) {
      res.status(400).json({ ok: false, error });
      return;
    }

    const submission = {
      id: `lead_${Date.now()}`,
      received_at: new Date().toISOString(),
      name: normalize(payload.name),
      company: normalize(payload.company),
      email: normalize(payload.email),
      phone: normalize(payload.phone),
      application: normalize(payload.application),
      interest: normalize(payload.interest),
      message: normalize(payload.message),
      source: normalize(payload.source),
      page: normalize(payload.page),
      submitted_at: normalize(payload.submitted_at)
    };

    await forwardWebhook(submission);

    console.log("[contact]", JSON.stringify(submission));

    res.status(200).json({
      ok: true,
      id: submission.id,
      received_at: submission.received_at
    });
  } catch (error) {
    console.error("[contact:error]", error);
    res.status(500).json({ ok: false, error: "服务器处理失败，请稍后重试" });
  }
};
