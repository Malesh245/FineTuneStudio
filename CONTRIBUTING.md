# Contributing to FineTuneStudio 🤝

First off, **thank you** for considering contributing to FineTuneStudio! It's people like you who make this the best open-source AI fine-tuning platform. Whether you're fixing a typo, adding a feature, or sharing an idea — every contribution matters.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Coding Guidelines](#-coding-guidelines)
- [Commit Convention](#-commit-convention)
- [Pull Request Process](#-pull-request-process)
- [Good First Issues](#-good-first-issues)

---

## 📜 Code of Conduct

Please be **respectful, inclusive, and professional** in all interactions. We are building a welcoming community for developers of all experience levels. Harassment, discrimination, or disrespectful behavior will not be tolerated.

---

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs

1. **Search existing issues** first to avoid duplicates.
2. Use the **Bug Report** issue template.
3. Include: steps to reproduce, expected vs actual behavior, OS, browser, and Python/Node versions.

### 💡 Suggesting Features

1. Open an issue with the **Feature Request** template.
2. Describe the use case and why this feature would be valuable.
3. If possible, include mockups or references to similar implementations.

### 🔧 Code Contributions

1. Look for issues labeled `good first issue` or `help wanted`.
2. Comment on the issue to let us know you're working on it.
3. Follow the [Development Setup](#-development-setup) and [Pull Request Process](#-pull-request-process) below.

### 📖 Documentation

- Fix typos, improve explanations, add examples.
- No issue needed — just open a PR!

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| MongoDB | 6.0+ (local or Atlas) |
| Git | 2.30+ |

### Quick Start

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/FineTuneStudio.git
cd FineTuneStudio

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### Verify Setup

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
FineTuneStudio/
├── frontend/src/
│   ├── pages/            # One file per feature page (17 pages)
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers (Auth, etc.)
│   ├── App.jsx           # Router configuration
│   └── index.css         # Global design system
│
├── backend/app/
│   ├── routers/          # FastAPI route handlers (12 routers)
│   ├── services/         # Business logic (keep routers lean!)
│   ├── models/           # Pydantic schemas
│   ├── auth.py           # JWT authentication
│   ├── database.py       # MongoDB connection
│   └── main.py           # App entry point
```

---

## 📝 Coding Guidelines

### Backend (Python)

- **Style**: Follow PEP 8. Use `black` for formatting.
- **Architecture**: Keep routers thin. Move all business logic to `services/`.
- **Types**: Use Pydantic schemas for request/response bodies.
- **Docs**: Include docstrings for all public functions.
- **Async**: Use `async/await` for all database operations.

```python
# ✅ Good
@router.post("/train")
async def start_training(config: TrainingConfig, user=Depends(get_optional_user)):
    """Start a new fine-tuning job."""
    result = await TrainingService.run(config, user)
    return result

# ❌ Bad
@router.post("/train")
def train(req: dict):
    # 200 lines of inline logic...
```

### Frontend (React)

- **Components**: Functional components + hooks only. No class components.
- **Design**: Maintain the premium glassmorphism aesthetic. Use `var(--*)` CSS variables.
- **Icons**: Use Lucide React exclusively. No mixing icon libraries.
- **State**: Use local state for page-level state. Use Context for global state (auth).

```jsx
// ✅ Good — uses design system variables
<div className="card" style={{ background: 'var(--bg-elevated)' }}>

// ❌ Bad — hardcoded colors break dark mode
<div style={{ background: '#1a1a2e' }}>
```

---

## 💬 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semi-colons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(fusion): add SLERP merge method to Fusion Lab
fix(training): resolve progress bar stalling at 99%
docs(readme): add architecture diagram
```

---

## 🔄 Pull Request Process

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/my-awesome-feature
   ```

2. **Make your changes** following the coding guidelines above.

3. **Test** your changes:
   - Backend: Verify API endpoints work via Swagger (`/docs`).
   - Frontend: Check that the UI renders correctly and is responsive.

4. **Commit** using the conventional commit format.

5. **Push** and open a Pull Request:
   - Fill in the PR template.
   - Link any related issues.
   - Add screenshots for UI changes.

6. **Review**: A maintainer will review your PR. Please respond to feedback promptly.

---

## 🏷️ Good First Issues

Looking for where to start? These areas always need help:

| Area | Examples |
|------|---------|
| **UI Polish** | Responsive fixes, animations, accessibility (a11y) |
| **Documentation** | API docs, JSDoc comments, tutorial guides |
| **Testing** | Unit tests for services, integration tests for routers |
| **Translations** | i18n support for the UI |
| **New Templates** | Agent training templates, dataset format converters |

---

## 🙏 Recognition

All contributors are recognized in our [README](README.md). Your GitHub avatar will appear in the contributors section once your first PR is merged.

---

<div align="center">

**Thank you for making FineTuneStudio better! 🚀**

</div>
