# DevPlatform – Universal Web-based Project Manager

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview

**DevPlatform** is a modern, extensible web-based project management panel built with Node.js that supports multiple programming languages. This platform allows you to:

- Create and manage Node.js, Python, or Java projects
- Upload files (locally or via GitHub integration)
- Select main execution files
- Monitor live logs and terminal output
- Edit files with built-in file manager
- Track resource usage (CPU, network speed, storage)
- View statistics, configure settings, and securely delete files
- Work seamlessly across mobile and desktop interfaces

## Key Features

### 🚀 Project Management
- Multi-language project creation (Node.js, Python, Java)
- GitHub repository integration
- Project configuration and environment setup

### 📁 File Operations
- Advanced file manager with:
  - Upload/download functionality
  - File/folder creation, renaming, deletion
  - Code editor with syntax highlighting
  - Version control integration

### ⚙️ System Monitoring
- Real-time resource tracking:
  - CPU/RAM usage graphs
  - Network speed monitoring
  - Storage utilization
- Process management with start/stop controls

### 🌐 Web Interface
- Responsive design for all devices
- Dark/light mode support
- REST API for external integrations
- Modular architecture for easy extension

## Technology Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Backend     | Node.js, Express         |
| Frontend    | EJS, HTML5/CSS3/ES6      |
| Database    | SQLite/PostgreSQL        |
| Styling     | Tailwind CSS             |
| File Ops    | fs-extra, multer         |
| Process Mgr | PM2, child_process       |

## Installation

```bash
# Clone repository
git clone https://github.com/EthrealcraftX/DevPlatform.git
cd DevPlatform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Start application
npm start

# For production:
npm install -g pm2
pm2 start server.js --name "DevPlatform"
