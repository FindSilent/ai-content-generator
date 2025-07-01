export default async function handler(req, res) {
  // Thiết lập các header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Xử lý yêu cầu preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  // Chỉ xử lý yêu cầu POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.status === 503) {
        attempt++;
        if (attempt >= maxRetries) {
          return res.status(503).json({ error: 'Gemini API is overloaded, please try again later' });
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: 'Gemini API error', details: errorData });
      }

      const data = await response.json();
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!summary) {
        return res.status(500).json({ error: 'Gemini không trả về nội dung', raw: data });
      }

      return res.status(200).json({ summary });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
