<div align="center">

# ⚡ FineTuneStudio

### The Most Complete Open-Source AI Fine-Tuning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

**Fine-tune • Merge • Distill • Deploy — all from one beautiful UI.**

[🚀 Quick Start](#-quick-start) •
[✨ Features](#-features) •
[📸 Screenshots](#-screenshots) •
[🏗️ Architecture](#️-architecture) •
[🗺️ Roadmap](#️-roadmap) •
[🤝 Contributing](#-contributing)

</div>

---

## 🌟 Why FineTuneStudio?

> **"What if fine-tuning an AI model was as easy as editing a Google Doc?"**

Most AI fine-tuning tools are either **CLI-only** (intimidating for beginners) or **cloud-locked** (expensive + privacy concerns). FineTuneStudio bridges this gap with a **stunning local-first UI** that covers the entire lifecycle:

```
📦 Data → 🧹 Clean → 🏋️ Train → 📊 Evaluate → 🔀 Merge → 🗜️ Distill → 🚀 Deploy
```

| Problem | Our Solution |
|---------|-------------|
| "I don't have enough training data" | **Dataset Multiplier** — AI generates synthetic samples from just 10 examples |
| "I don't know what hyperparameters to use" | **AI Training Copilot** — auto-recommends optimal config with explanations |
| "I want to combine two models" | **Model Fusion Lab** — no-code SLERP/TIES/DARE merging |
| "My model is too big to deploy" | **Quantization Studio** + **Knowledge Distillation** — shrink 70B → 1B |
| "I need to keep data private" | **Privacy Mode** — air-gapped offline training with HIPAA/GDPR compliance |

---

## ✨ Features

### 🔧 Core Pipeline
| Feature | Description |
|---------|-------------|
| **📊 Intelligent Data Studio** | Upload CSV, JSON, Audio, or Video. AI-powered cleaning with quality scoring. |
| **✏️ Visual Dataset Builder** | Create instruction-tuning datasets visually with Alpaca/ShareGPT/ChatML export. |
| **🤖 Dataset Multiplier** | Turn 10 rows into 5,000+ using AI synthetic data generation. |
| **🏋️ Multi-Model Training** | Fine-tune Llama 3.2, Mistral 7B, Phi-2, Gemma 2B, GPT-2, BERT, and more. |
| **⚡ Hardware Orchestrator** | Train locally, on Google Colab, or Kaggle. One-click notebook export. |
| **🧙 AI Training Copilot** | Auto-recommends optimal hyperparameters with confidence scores. |

### 📊 Analysis & Evaluation
| Feature | Description |
|---------|-------------|
| **⚖️ Side-by-Side Comparison** | "Before vs After" with Knowledge Transfer Radar charts + live chat mode. |
| **💬 Inference Playground** | Chat with your fine-tuned model. Adjustable temperature, tokens, system prompt. |
| **🧪 Experiment Tracker** | Compare multiple training runs. Auto-detect best model. |
| **👍 RLHF Voting** | Human feedback collection (Chosen vs Rejected) for DPO optimization. |

### 🧬 Advanced AI Engineering
| Feature | Description |
|---------|-------------|
| **🔀 Model Fusion Lab** | Merge 2+ models using SLERP, TIES, DARE, or Linear methods — no GPU needed. |
| **🗜️ Quantization Studio** | Shrink models to 4-bit or 8-bit for laptops, phones, and edge devices. |
| **🧠 Knowledge Distillation** | Compress a 70B teacher into a 1B student with ~90% accuracy retention. |
| **🤖 Agent Training Mode** | Train ReAct, Tool-Use, Planner, and Multi-Agent architectures with sandbox testing. |
| **🌐 Multi-Modal Training** | Fine-tune Vision-Language, Audio-Language, and 100+ language models. |

### 🌍 Ecosystem & Deployment
| Feature | Description |
|---------|-------------|
| **📚 Community Recipe Hub** | Discover and clone battle-tested training configurations. |
| **🏪 Model Marketplace** | Browse, share, and monetize fine-tuned models across 6+ categories. |
| **🛡️ Privacy-First Mode** | Air-gapped offline training. HIPAA/GDPR/SOC 2 compliance badges. |
| **🚀 1-Click Deploy** | Push models to Hugging Face Hub with secure credential validation. |
| **📓 Colab Bridge** | Auto-generate prepared Jupyter notebooks for cloud GPU training. |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19 • Vite • Recharts • Lucide React • CSS Glassmorphism |
| **Backend** | FastAPI • Python 3.10+ • Pydantic • Motor (Async MongoDB) |
| **AI/ML** | HuggingFace Transformers • PEFT/LoRA • BitsAndBytes • MergeKit |
| **Database** | MongoDB (metadata) • Local filesystem (models & datasets) |
| **Auth** | JWT • bcrypt • Secure token management |

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **MongoDB** (local or [Atlas free tier](https://www.mongodb.com/atlas))

### 1. Clone & Setup

```bash
git clone https://github.com/Malesh245/FineTuneStudio.git
cd FineTuneStudio
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in Browser

```
🌐 Frontend:  http://localhost:5173
🔌 Backend:   http://localhost:8000
📖 API Docs:  http://localhost:8000/docs
```

---

## 📸 Screenshots

<div align="center">

> Screenshots coming soon! Run the project locally to explore the full UI.

</div>

---

## 🏗️ Architecture

```
FineTuneStudio/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── pages/             # 17 feature pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DatasetPage.jsx
│   │   │   ├── DatasetBuilderPage.jsx
│   │   │   ├── TrainingPage.jsx
│   │   │   ├── ExperimentsPage.jsx
│   │   │   ├── ComparisonPage.jsx
│   │   │   ├── PlaygroundPage.jsx
│   │   │   ├── FusionLabPage.jsx
│   │   │   ├── DistillationPage.jsx
│   │   │   ├── AgentTrainingPage.jsx
│   │   │   ├── MultiModalPage.jsx
│   │   │   ├── RecipeHubPage.jsx
│   │   │   ├── MarketplacePage.jsx
│   │   │   ├── LocalModePage.jsx
│   │   │   ├── DeployPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── components/        # Reusable UI components
│   │   └── context/           # Auth context & state management
│   └── package.json
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── routers/           # 12 API routers
│   │   │   ├── auth.py        # JWT authentication
│   │   │   ├── dataset.py     # Dataset CRUD + multiply
│   │   │   ├── training.py    # Training + quantize + copilot + export
│   │   │   ├── comparison.py  # A/B testing + chat + RLHF feedback
│   │   │   ├── fusion.py      # Model merging (SLERP/TIES/DARE)
│   │   │   ├── distillation.py # Teacher → Student compression
│   │   │   ├── agents.py      # Agent training templates + sandbox
│   │   │   ├── marketplace.py # Model marketplace
│   │   │   ├── builder.py     # Visual dataset builder
│   │   │   ├── playground.py  # Inference playground
│   │   │   ├── recipe.py      # Community recipe hub
│   │   │   └── deployment.py  # HuggingFace deployment
│   │   ├── services/          # Business logic
│   │   │   ├── copilot.py     # AI hyperparameter recommendation
│   │   │   ├── fusion.py      # Model merge engine
│   │   │   ├── distillation.py # Knowledge distillation
│   │   │   ├── quantizer.py   # 4-bit/8-bit quantization
│   │   │   ├── multiplier.py  # Synthetic data generation
│   │   │   ├── notebook_gen.py # Jupyter notebook generator
│   │   │   └── trainer.py     # Fine-tuning orchestrator
│   │   └── main.py            # FastAPI app entry point
│   └── requirements.txt
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE                    # MIT License
└── .gitignore
```

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Full fine-tuning pipeline (data → train → evaluate → deploy)
- [x] AI Training Copilot with auto-config
- [x] Model Fusion Lab (SLERP/TIES/DARE/Linear)
- [x] Visual Dataset Builder (Alpaca/ShareGPT/ChatML)
- [x] Knowledge Distillation Studio
- [x] Agent Training Mode (ReAct/Tool-Use/Planner/Multi-Agent)
- [x] Model Marketplace with categories
- [x] Privacy-First Offline Mode
- [x] Multi-Modal Training (Vision/Audio/Multilingual)
- [x] RLHF/DPO human feedback system

### 🔜 Coming Soon
- [ ] WebSocket real-time training logs
- [ ] Multi-GPU distributed training
- [ ] RunPod & AWS cloud integration
- [ ] ONNX / TensorRT export for edge deployment
- [ ] Model versioning & rollback
- [ ] Team collaboration & shared workspaces
- [ ] Plugin system for custom training loops
- [ ] Automated evaluation benchmarks (MMLU, HumanEval)

---

## 🤝 Contributing

We love contributions! Whether it's a bug fix, new feature, or documentation improvement — all PRs are welcome.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 💖 Support the Project

If FineTuneStudio helps your workflow, consider giving it a ⭐ on GitHub!

<div align="center">

[![Star on GitHub](https://img.shields.io/github/stars/Malesh245/FineTuneStudio?style=for-the-badge&logo=github&color=yellow)](https://github.com/Malesh245/FineTuneStudio)
[![Follow](https://img.shields.io/github/followers/Malesh245?style=for-the-badge&logo=github&color=blue)](https://github.com/Malesh245)

**Built with ❤️ by [Malesh Kumar](https://github.com/Malesh245) and contributors.**

</div>
