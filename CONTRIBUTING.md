# Contributing to VaultHarbor

Thank you for your interest in VaultHarbor. This project is open source — you are welcome to report issues, suggest improvements, and submit pull requests.

**Repository:** [github.com/Manojhankare/VaultSync](https://github.com/Manojhankare/VaultSync)  
**Author:** [Manoj Hankare](https://manojhankare.in)

## Ways to contribute

### Report a bug or request a feature

Open a [GitHub Issue](https://github.com/Manojhankare/VaultSync/issues/new). Include:

- What you expected vs what happened (bugs)
- Steps to reproduce, if applicable
- Browser/OS or backend environment for extension/API issues
- Screenshots or logs when helpful (never paste passwords, master passwords, recovery keys, or tokens)

### Submit a pull request

1. Fork the repository and create a branch from `main`.
2. Make focused changes — one logical fix or feature per PR when possible.
3. Run relevant tests:
   - Backend: `cd backend && pytest`
   - Extension: `cd extension && npm test`
4. Update documentation in `docs/` if your change affects behavior, APIs, deployment, or setup.
5. Open a PR against `main` with a clear description of the change and how you tested it.

We review PRs as time allows. Smaller, well-tested changes are easier to merge.

## Support development

VaultHarbor is free to use and [MIT licensed](LICENSE). If you find it useful, you can help fund:

- Chrome Web Store and Microsoft Edge Add-ons listing fees
- Production hosting (API, database)
- Ongoing extension and backend work

**Ways to support:**

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Manojhankare)

GitHub also shows a **Sponsor** button on the repo via [`.github/FUNDING.yml`](.github/FUNDING.yml). Support is entirely optional — you can always self-host or use the extension without donating.

## Self-hosting and reuse

VaultHarbor is released under the [MIT License](LICENSE). You may:

- Use, modify, and deploy the backend and extension for personal or commercial use
- Self-host the API and point the extension at your own server
- Fork the project and build on top of it

**Please give credit** when you ship a derivative or public deployment:

- Retain the [LICENSE](LICENSE) copyright notice in source and documentation
- Mention **VaultHarbor** and link to [https://github.com/Manojhankare/VaultSync](https://github.com/Manojhankare/VaultSync) (e.g. in your README, about page, or app credits)
- Optional but appreciated: link to [manojhankare.in](https://manojhankare.in)

You do **not** need permission to self-host. The MIT license already grants these rights; credit keeps the community aware of the upstream project.

## Security issues

Do **not** open public issues for vulnerabilities that could expose users. Email **manojhankare2@gmail.com** with details instead. We will respond as soon as we can.

## Project docs

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture/OVERVIEW.md)
- [Backend deployment](docs/backend/DEPLOYMENT.md)
- [Extension](docs/extension/README.md)

## Code of conduct

Be respectful and constructive. We are all here to build useful, trustworthy software.
