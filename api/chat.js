const AGNES_API_KEY = 'sk-qINSW4CYkLbq2MGwU8GBHqXpG7Lfo9Hu2lGEuB40jIYo0ARz';
const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  try {
    const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGNES_API_KEY}`
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          {
            role: 'system',
            content: '你是 PawLang，一个专业的 AI 宠物行为解读助手。你的回答风格：专业、简洁、有科学依据，带一点温暖但不卖萌。回复控制在 150 字以内，直接给结论和建议。不要用 emoji。'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法解读，请稍后再试。';
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: '服务暂时不可用，请稍后重试。' });
  }
}
