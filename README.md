# LiftLog API Deployment (Hetzner)

This documentation exclusively covers how the backend Express API is deployed to a Hetzner Cloud Ubuntu VPS so that it can securely receive requests from the Vercel-hosted frontend.

## 1. Initial Server Setup
SSH into your Hetzner server as `root`. Clone the repository and install the Node.js production dependencies:
```bash
git clone https://github.com/your-repo/lift-log.git liftlog-backend
cd liftlog-backend
npm install
```

## 2. Environment Variables
Create a `.env` file in the root of the project folder:
```bash
nano .env
```
Populate it with your Hetzner local PostgreSQL credentials. Because the API and the Database are on the *exact same server*, they communicate securely through `localhost` with zero external latency.
```env
DATABASE_URL=postgresql://username:your_db_password@localhost:5432/liftlog
JWT_SECRET=super_secure_random_string_here
PORT=3001
```

## 3. Running the API Persistently
To prevent the Express server from shutting down when you close your SSH terminal, daemonize the process using **PM2**:
```bash
npm install -g pm2
pm2 start server/index.js --name "liftlog-api"
pm2 save
pm2 startup
```
Your backend is now permanently running internally on port `3001`.

## 4. Securing the API with HTTPS (Required for Vercel)
Vercel hosts the frontend purely over HTTPS. Browsers strictly block HTTP API requests coming from HTTPS websites (Mixed Content Error). Therefore, the API on Hetzner **must** have a valid SSL certificate.

### Step 4a. Get a Free Domain (DuckDNS)
If you do not own a custom domain, you can get a free subdomain (e.g. `liftlog.duckdns.org`) from [DuckDNS](https://www.duckdns.org) and point it to your Hetzner VPS IP address.

### Step 4b. Install Caddy
Caddy acts as a reverse proxy that automatically provisions and renews Let's Encrypt SSL certificates.
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### Step 4c. Configure Caddyfile
By default, the Caddy background daemon hogs port 80. You must tell it to proxy internet traffic to your local port 3001 API instead. Edit the global Caddyfile:
```bash
sudo nano /etc/caddy/Caddyfile
```
Erase everything inside, and put exactly this (replace the dummy URL with your actual DuckDNS URL):
```text
liftlog.duckdns.org {
    reverse_proxy localhost:3001
}
```

Restart Caddy to apply the changes:
```bash
sudo systemctl restart caddy
```

**Security is complete!** You can now safely point the `VITE_API_URL` environment variable inside Vercel to `https://liftlog.duckdns.org`.