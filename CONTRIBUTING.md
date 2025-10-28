## Contributing to VibeChat

Thank you for your interest in contributing! This guide will help you set up your environment, find issues, and submit great pull requests.

### Hacktoberfest ✅
- This project welcomes Hacktoberfest contributions.
- Submit quality PRs that improve code, docs, tests, or developer experience.
- Avoid spam/AI-dumped PRs; low-effort PRs will be marked as invalid.

### Getting Started
1. Fork the repository to your account.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/VibeChat.git
   cd VibeChat
   ```
3. Set the upstream remote to keep your fork updated:
   ```bash
   git remote add upstream https://github.com/<upstream-owner>/VibeChat.git
   git fetch upstream
   ```
4. Create a new branch for your work:
   ```bash
   git checkout -b feat/short-description
   ```

### Project Structure (quick reference)
- `client/`: React app (Vite)
- `server/`: Node/Express API

### Running the Project Locally
Client:
```bash
cd client
npm install
npm run dev
```

Server:
```bash
cd server
npm install
npm run dev
```

Check the root `README.md` for environment variables and more details.

### Issue Types You Can Pick Up
- Good first issues: documentation, small UI fixes, minor refactors
- Bugs: reproducible issues with clear steps
- Enhancements: UX polish, accessibility, performance, developer tooling

If unsure, open an issue to discuss before starting.

### Coding Guidelines
- Write clear, readable code with descriptive names.
- Keep functions small with early returns.
- Match existing formatting and style.
- Prefer meaningful comments only when non-obvious context is required.
- For TypeScript files (if any), prefer explicit types on public APIs.

### Commit Messages
Use conventional commits when possible:
- `feat: add chat reactions`
- `fix: handle null avatar in sidebar`
- `docs: update installation steps`
- `refactor: simplify message formatting`
- `chore: bump eslint configs`

### Linting & Formatting
Run format/lint before committing (in each workspace as needed):
```bash
npm run lint || echo "No lint script defined"
```

### Tests
If you add functionality, add or update tests where applicable. If the project lacks tests for that area, explain how you manually tested your change.

### Pull Request Checklist
- The PR title follows conventional commits (preferably).
- Scope is focused; large changes are split into smaller PRs.
- Description includes: what, why, screenshots (if UI), and testing notes.
- No unrelated file changes.
- Lint/build passes locally.
- Linked related issue(s), e.g., `Closes #123`.

### How to Submit a PR
1. Ensure your branch is up to date with `upstream/main`:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. Push your branch:
   ```bash
   git push -u origin feat/short-description
   ```
3. Open a PR from your fork to `main` of this repo.

### Code of Conduct
Be respectful and constructive. We enforce respectful collaboration and a harassment-free experience. If you encounter issues, please open a confidential issue or contact a maintainer.

### Need Help?
- Open an issue with your question.
- Provide environment, steps to reproduce, and logs if relevant.

Happy contributing and have a great Hacktoberfest! 🎉


