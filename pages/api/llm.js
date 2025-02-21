// pages/api/llm.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    
    const { prompt } = req.body;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 150,
        }),
      });
    
      const data = await response.json();
      console.log("OpenAI API response:", data);
    
      if (!data.choices || data.choices.length === 0) {
        console.error("OpenAI API returned no choices:", data);
        return res.status(500).json({ error: "No response from API", data });
      }
      
      const text = data.choices[0].message.content;
      res.status(200).json({ response: text.trim() });
    } catch (error) {
      console.error("Error in OpenAI API call:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  
  
  
  