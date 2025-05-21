# MultiMax Project Hosting Panel

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> Powerful self-hosted project management panel for **Node.js**, **Python**, and **Java** applications.  
> Create, upload, start, monitor, and manage your projects — all from a simple web interface!

---

## ✨ Features

- ✅ Create project with **drag & drop** file/folder upload
- ✅ GitHub repo auto-import
- ✅ Choose main file, project type (Node, Python, Java)
- ✅ Realtime **disk usage** and **internet speed**
- ✅ Project lifecycle: **start / stop / delete**
- ✅ **File manager** with open / delete / upload
- ✅ **Online editor** with CodeMirror integration
- ✅ **Live console logs** and input stream
- ✅ **Admin panel** to manage users (promote to admin, delete, view total projects)
- ✅ Email support with **Brevo SMTP**

---

## ⚙️ Installation

```bash
git clone https://github.com/EthrealcraftX/DevPlatform.git
cd multimax-panel
npm install
```

Start the server:

node server.js


🔐 Login

Default login available via registration

```login
username: admin
password: 1234
```
Admins can manage other users via /admin/users

```admin
/admin
/admin/users
/admin/stats
```

users management 

```users
/home
/login
/register
```


📁 How to Use

1. Login or register a new user
(when user register account admin must give permission for login when they registered new account)

2. Go to + Create Project


3.import from GitHub


4. Choose main file, project type(Nodejs/Python/Java)


5. Click “Create Project”


6. Start/Stop, view logs, and edit files online




✅ Test Coverage


⚠️ Warnings

This panel is still in development. Expect bugs or edge case failures.

.jar support is basic. Please report issues if encountered.

Email system is tested only with Brevo SMTP (recommended) you can enter your Brevo gmail and edit in services/emailService.js.

All uploads are stored in the uploads/ directory. Handle with care!

Admin features are basic but extendable.



🛡 License

MIT License — feel free to use and modify.



👨‍💻 Author

Developed by EthrealCraftX
Telegram: @ethrealcraft
GitHub: https://github.com/EthrealcraftX


⭐ Contribute / Feedback

If you found this project useful, please star the repo and feel free to open issues or PRs!1
