# Contributing to FineTuneStudio 🤝

Thank you for your interest in contributing to FineTuneStudio! We want to make this the best no-code fine-tuning tool in the world, and we need your help.

## How Can I Contribute?

### Reporting Bugs
- Use the GitHub Issue Tracker.
- Describe the bug and include steps to reproduce.
- Mention your OS and browser version.

### Suggesting Enhancements
- Open an issue with the "enhancement" label.
- Explain why this feature would be useful.

### Pull Requests
1. Fork the repo.
2. Create a new branch (`git checkout -b feature/awesome-feature`).
3. Make your changes.
4. Ensure your code follows the project's style (PEP8 for Python, Prettier for JS).
5. Commit your changes (`git commit -m 'Add some awesome feature'`).
6. Push to the branch (`git push origin feature/awesome-feature`).
7. Open a Pull Request.

## Code of Conduct
Please be respectful and professional in all interactions. We are building a community here.

## Development Setup
Refer to the [README.md](README.md) for local installation instructions.

### Backend Guidelines
- Keep routers lean; move logic to `services/`.
- Use Pydantic schemas for all request/response bodies.
- Always include docstrings for new functions.

### Frontend Guidelines
- Use functional components and hooks.
- Maintain the "premium glassmorphism" design system.
- Ensure all new components are responsive.

---
Happy coding! 🚀
