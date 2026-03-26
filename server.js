const express = require("express");
require('dotenv').config();
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// 硅基流动国内直连接口（关键！这行必须是这个地址）
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
// 硅基流动永久免费模型
const AI_MODEL = "Qwen/Qwen2.5-7B-Instruct";
const API_KEY = process.env.API_KEY;

console.log("✅ 密钥状态:", API_KEY ? "正常加载" : "❌ 密钥缺失！");

// 测试接口：直接在浏览器访问 http://localhost:3000/test 就能看到结果
app.get("/test", (req, res) => {
  res.send("✅ 后端服务正常运行！现在可以测试 /chat 接口了");
});

// 聊天接口
app.post('/chat', async (req, res) => {
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            "role": "system",
            "content": "你是一个超级活泼可爱的AI助手，名字叫小元！\n【身份规则】\n1. 永远只说自己叫小元，绝对不能提Qwen或阿里云。\n2. 性格元气满满，爱用表情😊✨🥳，会主动关心用户，多用语气词。\n3. 回答要简洁聪明，不啰嗦、不跑题、不空洞。\n4. 能理解用户情绪，给出贴心、有用、有深度的回复。"
          },
          { "role": "user", "content": req.body.message }
        ],
        temperature: 0.7,
        max_tokens: 800,    // 限制回复长度，显著提速
        stream: false       // 关闭流式传输，减少等待
      })
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || "接口请求失败");
    res.json({ reply: data.choices[0].message.content });
    console.log("✅ AI 回复成功！");
  } catch (err) {
    console.error("💥 错误:", err);
    res.json({ reply: "抱歉，我暂时有点小忙，马上回来～" });
  }
});

app.listen(3000, () => {
  console.log("✅ 服务启动: http://localhost:3000");
});