const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({error:'Only POST'});

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if(!prompt) return res.status(400).json({error:'Missing prompt'});

  try {
    const body = {
      contents: [{ parts:[{ text: prompt }] }]
    };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const j = await r.json();
    const summary = j.candidates?.[0]?.content?.parts?.[0]?.text;
    if(!summary) return res.status(500).json({ error:'No content', raw:j });
    return res.status(200).json({ summary });
  } catch(e){
    res.status(500).json({ error: e.message });
  }
};
