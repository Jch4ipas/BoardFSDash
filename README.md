# Dashboard Next.js

A modern, **customizable** and **modular** dashboard built with [Next.js](https://nextjs.org/), deployable in one click using **Docker** or **Ansible**.

---

## Features

- **Modular interface** — Add, move, resize and configure your "boxes" (widgets) directly from the backoffice.  
- **Drag & Drop & Resize** — Reorganize your dashboard with your mouse.  
- **Dynamic props** — Add custom properties to each box for tailored displays.  
- **React components & HTML support** — Use your own React components or HTML tags as box content.  
- **NASA APOD integration** — Show NASA's Astronomy Picture of the Day.  
- **Iframe & video support** — Embed external or multimedia content easily.  
- **Real-time synchronization** — Backoffice updates are immediately visible on the front via Server-Sent Events (SSE).  
- **Automated deployment** — Docker & Ansible for simple setup and updates.  
- **Microsoft Entra ID authentication** — Integrated authentication using Microsoft Entra ID (formerly Azure AD).

---

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose  
- [Node.js](https://nodejs.org/) (v16.x or newer)  
- [Ansible](https://www.ansible.com/) (for automated deployment)

---

## Installation & Usage

### 1. Run with Docker

```
docker run -d yourdockerhubusername/yourimagename:latest
```

Then open: [http://localhost:3000](http://localhost:3000)

---

### 2. Run in development (Node.js)

```
git clone https://github.com/Jch4ipas/DashboardNextjsDockerAnsible.git
cd DashboardNextjsDockerAnsible/nextjs
npm install
npm run dev
```

App will be available at [http://localhost:3000](http://localhost:3000)

---

### 3. Deploy with Ansible

1. Edit [`inventory/prod.yml`](Ansible/inventory/prod.yml) to add your server address.  
2. Run the playbook:

```
./dashboardsible
```

---

## Docker image build (from project root)

> Replace `yourdockerhubusername/yourimagename` with the image name/tag you want.

### Build locally (single platform, load to local Docker)

```
docker buildx build --no-cache --platform linux/amd64 -f Docker/Dockerfile -t yourdockerhubusername/yourimagename:latest --load nextjs/
```

### Build & push multi-platform image

```
docker buildx build --no-cache --platform linux/amd64,linux/arm64,linux/arm/v7 -f Docker/Dockerfile -t yourdockerhubusername/yourimagename:latest --push nextjs/
```

- These commands must be run from the **root** of the repository.  
- The Dockerfile used is `Docker/Dockerfile` and the build context is the `nextjs/` directory.  
- Change the image tag to whatever you prefer (Docker Hub, GitHub Container Registry, etc.).

---

## Environment variables

Create a `.env` file in the <b>[`nextjs/`](nextjs)</b> directory and set the following variables:

```
# NASA API
NASA_API_KEY=                # Your NASA API Key

# EWS (Exchange Web Services) credentials
AUTH_EWS_CREDENTIALS_USERNAME=  # EWS credentials username
AUTH_EWS_CREDENTIALS_PASSWORD=  # EWS credentials password
AUTH_EWS_SERVICE_ENDPOINT=      # EWS service endpoint

# General auth
AUTH_SECRET=                    # Application auth secret (random string)

# Microsoft Entra ID (Azure AD)
AUTH_MICROSOFT_ENTRA_ID_ID=     # Entra (Client) ID
AUTH_MICROSOFT_ENTRA_ID_SECRET= # Entra (Client) Secret
AUTH_MICROSOFT_ENTRA_ID_ISSUER= # Issuer / Tenant ID or issuer URL
```

These variables are required for API integrations and authentication. Ensure the `.env` file is never committed to public repositories.

---

## Authentication (Microsoft Entra ID) — Quick setup

1. Go to the **Azure Portal** → **Azure Active Directory** (Entra) → **App registrations** → **New registration**.  
2. Set a **name**, and add a **Redirect URI** pointing to your app callback, for example:
   ```
   https://your-domain.example.com/api/auth/callback
   ```
   (or `http://localhost:3000/api/auth/callback` for local dev)
3. Note your **Client (Application) ID** and **Directory (Tenant) ID**. Create a **Client secret** and copy it.  
4. Configure the required scopes (typically `openid`, `profile`, `email`) and any additional API permissions you need.  
5. Populate your `.env` with `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and `AUTH_MICROSOFT_ENTRA_ID_ISSUER` (tenant or issuer URL).  
6. Ensure your Next.js auth handler (or library) is configured to use the OAuth2 Authorization Code flow with PKCE for secure production use.

---

## Project structure

[/nextjs](nextjs)      → Dashboard source code (Front & Backoffice)<br>
[/Ansible](Ansible)     → Configs for automated deployment<br>
[/Docker](Docker)      → Dockerfiles & compose (note: Dockerfile referenced at Docker/Dockerfile)<br>

---

## Usage

### Backoffice
Visit `/admin` to:
- Create / delete / edit containers (dashboards)  
- Add, move, resize and configure boxes  
- Choose content type (React component, HTML, iframe, etc.)  
- Add custom props for each box

### Frontoffice
- The dashboard updates in real-time based on the backoffice configuration  
- Dashboards can auto-rotate according to the `durationDisplay` setting

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)  
- [DaisyUI](https://daisyui.com/)

---

## Author & Projects

Find other projects on [GitHub](https://github.com/Jch4ipas?tab=repositories).

---

## Contributing

Pull requests and suggestions are welcome! Open an issue for questions or improvements.

---

## License

This project is released under the **BoardFSDash Internal Non-Commercial License v1.0** — see [license.md](license.md) for details.