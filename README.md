
# ☯️ 信我么

"信我么"是一个基于 AI 的智能算命聊天平台，结合了传统命理学（如八字、卜卦、解梦）与现代大语言模型技术，为用户提供沉浸式的算命咨询体验。

## ✨ 核心功能

- **🤖 AI 智能算命**: 基于大模型的自然语言对话，提供生辰八字分析、运势预测等服务。
- **🌊 流式交互**: 支持 SSE (Server-Sent Events) 和 WebSocket，实现打字机效果的流畅对话体验。
- **🗣️ 语音合成 (TTS)**: 算命师回复支持语音播报，增强神秘感与沉浸感。
- **📅 传统历法集成**: 内置 `lunar-javascript`，精准处理农历、干支、节气等传统历法数据。
- **📚 知识库增强**: 支持 RAG (检索增强生成)，基于特定文档提供更专业的解答。
- **🔐 用户系统**: 完整的注册、登录、个人信息管理及会话历史保存。
- **💾 会话管理**: 多会话支持，自动保存聊天记录。

## 🛠️ 技术栈

### 前端 (H5)
- **核心框架**: [React 18](https://react.dev/)
- **构建工具**: [Vite 5](https://vitejs.dev/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **路由管理**: [React Router 6](https://reactrouter.com/)
- **样式预处理**: Less
- **工具库**: lunar-javascript (农历/八字库)

## 🚀 快速开始

### 1. 环境准备
确保你的本地环境已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

### 2. 安装依赖

```bash
npm install
# 或者
yarn install
```

### 3. 开发模式运行

```bash
npm run dev
```

访问 `http://localhost:5173` 即可查看项目。

### 4. 构建生产版本

```bash
npm run build
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目。

---
Created with ❤️ by Mystical Oracle Team
