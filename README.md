
# ☯️ 信我么 (Mystical Oracle)

> 连接古老智慧与人工智能的 AI 卜卦 H5 应用。

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

### 后端 (API 服务)
- **框架**: FastAPI
- **数据库**: SQLAlchemy
- **认证**: JWT Bearer Token
- **实时通信**: WebSocket / SSE

## 📂 项目结构

```text
mystical-oracle-h5/
├── public/             # 静态资源
├── src/
│   ├── assets/         # 图片、图标等资源
│   ├── components/     # 公共组件
│   ├── pages/          # 页面组件
│   ├── store/          # Zustand 状态管理
│   ├── utils/          # 工具函数
│   ├── services/       # API 请求封装 (推测)
│   ├── App.jsx         # 应用入口
│   └── main.jsx        # 渲染入口
├── API_DOCUMENTATION.md # 后端接口文档
├── TASK.md             # 开发任务清单
├── index.html          # HTML 模板
├── package.json        # 项目依赖
└── vite.config.js      # Vite 配置
```

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

## 📖 接口文档

本项目后端接口详细说明请参阅 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)。

主要包含：
- 系统状态与健康检查
- 用户认证 (JWT)
- 聊天对话 (标准/流式)
- 会话与历史记录管理
- 知识库管理
- 音频服务

## 🗺️ 开发路线图 (Roadmap)

根据 [TASK.md](./TASK.md)，当前开发重点：

- [ ] 修改用户头像压缩
- [ ] 卜卦，解梦，八字动画效果实现
- [ ] 优化历史消息查询性能
- [ ] 卜卦/解梦/八字动画跳转聊天界面交互
- [ ] 完善支付流程
- [x] 编写 README.md

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目。

---
Created with ❤️ by Mystical Oracle Team
