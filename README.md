# FineTuneStudio 🚀

**The No-Code AI Model Fine-Tuning, Comparison & Deployment Platform.**

FineTuneStudio is an all-in-one open-source studio designed to democratize AI fine-tuning. It allows developers and researchers to upload datasets, clean them with AI-powered suggestions, fine-tune state-of-the-art models (Llama, Mistral, Gemma, Phi) using LoRA/PEFT, and deploy them directly to Hugging Face—all through a beautiful, premium glassmorphism interface.

![FineTuneStudio Dashboard](https://raw.githubusercontent.com/maleshkumar/FineTuneStudio/main/screenshots/dashboard_preview.png)

## ✨ Features

- **📊 Intelligent Data Studio**: Upload CSV, JSON, Audio, or Video. Get AI-powered cleaning suggestions (duplicates, missing values, etc.).
- **⚡ Hardware Orchestrator**: Run training on your local machine, Google Colab, or Kaggle. (RunPod & AWS support coming soon).
- **🧠 Multi-Model Support**: Fine-tune Llama 3.2, Mistral 7B, Phi-2, Gemma 2B, and Liquid Foundation Models (LFM).
- **⚖️ Side-by-Side Comparison**: Evaluate "Before vs After" performance with real-time metrics and Knowledge Transfer Radar charts.
- **🚢 1-Click Deployment**: Push your optimized models directly to Hugging Face Hub.
- **🛡️ Secure Credential Management**: Store HF and Kaggle keys securely with integration for Colab Secrets.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Recharts (Visualizations), Lucide React (Icons).
- **Backend**: FastAPI (Python), MongoDB (Metadata storage), Pandas (Data processing).
- **AI/ML**: Hugging Face Transformers, PEFT/LoRA, BitsAndBytes (4-bit quantization).

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (Running locally or on Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Malesh245/FineTuneStudio.git
cd FineTuneStudio
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start fine-tuning!

## 📖 Roadmap

- [ ] WebSocket migration for real-time training logs.
- [ ] Multi-Cloud provider integration (RunPod/AWS).
- [ ] Shared Community Library for datasets.
- [ ] Export to ONNX/TensorRT for edge deployment.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

FineTuneStudio is released under the [MIT License](LICENSE).

---

Built with ❤️ by [Malesh Kumar](https://github.com/maleshkumar)
