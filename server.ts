import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from 'body-parser';
import fs from 'fs';
import axios from 'axios';
import { Server } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(bodyParser.json());

  // Socket.io Signaling for WebRTC
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Store userId on socket for signaling
    socket.on("join-room", (roomId, userId, userName) => {
      socket.join(roomId);
      socket.join(userId); // Join a room with their own User ID
      (socket as any).userId = userId; // Store for later use
      socket.to(roomId).emit("user-connected", userId, userName);

      socket.on("disconnect", () => {
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    socket.on("offer", (offer, targetUserId) => {
      const senderId = (socket as any).userId;
      socket.to(targetUserId).emit("offer", offer, senderId);
    });

    socket.on("answer", (answer, targetUserId) => {
      const senderId = (socket as any).userId;
      socket.to(targetUserId).emit("answer", answer, senderId);
    });

    socket.on("ice-candidate", (candidate, targetUserId) => {
      const senderId = (socket as any).userId;
      socket.to(targetUserId).emit("ice-candidate", candidate, senderId);
    });
  });

  const dbPath = path.join(__dirname, 'db.json');

  const readDb = () => {
    if (!fs.existsSync(dbPath)) {
      const initialDb = { 
        servers: [], 
        users: [], 
        admins: [], 
        appRequests: [], 
        agents: [], 
        meetings: [], 
        streamingApps: [], 
        tools: [] 
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const dbData = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbData);
    // Ensure all collections exist
    const collections = [
      'servers', 'users', 'admins', 'appRequests', 'agents', 'meetings', 
      'streamingApps', 'tools', 'agentRequests', 'systemConfig', 'transactions',
      'loanRequests', 'chatMessages', 'notifications', 'adminNotifications', 'recurringPayments'
    ];
    let updated = false;
    collections.forEach(c => {
      if (!db[c]) {
        db[c] = c === 'systemConfig' ? {} : [];
        updated = true;
      }
    });
    if (updated) writeDb(db);
    return db;
  };

  const writeDb = (data: any) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AI Server Control Panel Server is running" });
  });

  // System Config Routes
  app.get('/api/system-config', (req, res) => {
    const db = readDb();
    res.json(db.systemConfig);
  });

  app.post('/api/system-config', (req, res) => {
    const db = readDb();
    db.systemConfig = { ...db.systemConfig, ...req.body };
    writeDb(db);
    res.json(db.systemConfig);
  });

  // Agent Request Routes
  app.get('/api/agent-requests', (req, res) => {
    const db = readDb();
    res.json(db.agentRequests);
  });

  app.post('/api/agent-requests', (req, res) => {
    const db = readDb();
    const newRequest = { ...req.body };
    if (!newRequest.id) newRequest.id = Date.now().toString();
    if (!newRequest.createdAt) newRequest.createdAt = new Date().toISOString();
    db.agentRequests.push(newRequest);
    writeDb(db);
    res.status(201).json(newRequest);
  });

  app.put('/api/agent-requests/:id', (req, res) => {
    const db = readDb();
    const requestId = req.params.id;
    const index = db.agentRequests.findIndex((r: any) => r.id === requestId || r.id.toString() === requestId);
    if (index !== -1) {
      db.agentRequests[index] = { ...db.agentRequests[index], ...req.body };
      writeDb(db);
      res.json(db.agentRequests[index]);
    } else {
      res.status(404).json({ message: 'Agent request not found' });
    }
  });

  app.delete('/api/agent-requests/:id', (req, res) => {
    const db = readDb();
    const requestId = req.params.id;
    db.agentRequests = db.agentRequests.filter((r: any) => r.id !== requestId && r.id.toString() !== requestId);
    writeDb(db);
    res.status(204).send();
  });

  // Admin routes
  app.get('/api/admins', (req, res) => {
    const db = readDb();
    res.json(db.admins);
  });

  app.get('/api/admins/:id', (req, res) => {
    const db = readDb();
    const adminId = req.params.id;
    const admin = db.admins.find((a: any) => a.id === adminId || a.id.toString() === adminId);
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  });

  app.post('/api/admins', (req, res) => {
    const db = readDb();
    const newAdmin = { ...req.body };
    if (!newAdmin.id) newAdmin.id = Date.now().toString();
    if (!newAdmin.createdAt) newAdmin.createdAt = new Date().toISOString();
    db.admins.push(newAdmin);
    writeDb(db);
    res.status(201).json(newAdmin);
  });

  app.put('/api/admins/:id', (req, res) => {
    const db = readDb();
    const adminId = req.params.id;
    const index = db.admins.findIndex((a: any) => a.id === adminId || a.id.toString() === adminId);
    if (index !== -1) {
      db.admins[index] = { ...db.admins[index], ...req.body };
      writeDb(db);
      res.json(db.admins[index]);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  });

  app.delete('/api/admins/:id', (req, res) => {
    const db = readDb();
    const adminId = req.params.id;
    db.admins = db.admins.filter((a: any) => a.id !== adminId && a.id.toString() !== adminId);
    writeDb(db);
    res.status(204).send();
  });

  // Transaction routes
  app.get('/api/transactions', (req, res) => {
    const db = readDb();
    const { userId } = req.query;
    if (userId) {
      return res.json(db.transactions.filter((t: any) => t.userId === userId));
    }
    res.json(db.transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const db = readDb();
    const newTransaction = { ...req.body };
    if (!newTransaction.id) newTransaction.id = Date.now().toString();
    if (!newTransaction.date) newTransaction.date = new Date().toISOString();
    db.transactions.push(newTransaction);
    writeDb(db);
    res.status(201).json(newTransaction);
  });

  // App Request routes
  app.get('/api/app-requests', (req, res) => {
    const db = readDb();
    res.json(db.appRequests);
  });

  app.post('/api/app-requests', (req, res) => {
    const db = readDb();
    const newRequest = { ...req.body };
    if (!newRequest.id) newRequest.id = Date.now().toString();
    if (!newRequest.createdAt) newRequest.createdAt = new Date().toISOString();
    db.appRequests.push(newRequest);
    writeDb(db);
    res.status(201).json(newRequest);
  });

  app.put('/api/app-requests/:id', (req, res) => {
    const db = readDb();
    const requestId = req.params.id;
    const index = db.appRequests.findIndex((r: any) => r.id === requestId || r.id.toString() === requestId);
    if (index !== -1) {
      db.appRequests[index] = { ...db.appRequests[index], ...req.body };
      writeDb(db);
      res.json(db.appRequests[index]);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  });

  // Agent routes
  app.get('/api/agents', (req, res) => {
    const db = readDb();
    const { adminId } = req.query;
    if (adminId) {
      return res.json(db.agents.filter((a: any) => a.adminId === adminId));
    }
    res.json(db.agents);
  });

  app.post('/api/agents', (req, res) => {
    const db = readDb();
    const newAgent = { ...req.body };
    if (!newAgent.id) newAgent.id = Date.now().toString();
    db.agents.push(newAgent);
    writeDb(db);
    res.status(201).json(newAgent);
  });

  app.put('/api/agents/:id', (req, res) => {
    const db = readDb();
    const agentId = req.params.id;
    const index = db.agents.findIndex((a: any) => a.id === agentId || a.id.toString() === agentId);
    if (index !== -1) {
      db.agents[index] = { ...db.agents[index], ...req.body };
      writeDb(db);
      res.json(db.agents[index]);
    } else {
      res.status(404).json({ message: 'Agent not found' });
    }
  });

  app.delete('/api/agents/:id', (req, res) => {
    const db = readDb();
    const agentId = req.params.id;
    db.agents = db.agents.filter((a: any) => a.id !== agentId && a.id.toString() !== agentId);
    writeDb(db);
    res.status(204).send();
  });

  // Meeting routes
  app.get('/api/meetings', (req, res) => {
    const db = readDb();
    res.json(db.meetings);
  });

  app.post('/api/meetings', (req, res) => {
    const db = readDb();
    const newMeeting = { ...req.body };
    if (!newMeeting.id) newMeeting.id = Date.now().toString();
    db.meetings.push(newMeeting);
    writeDb(db);
    res.status(201).json(newMeeting);
  });

  app.put('/api/meetings/:id', (req, res) => {
    const db = readDb();
    const meetingId = req.params.id;
    const index = db.meetings.findIndex((m: any) => m.id === meetingId || m.id.toString() === meetingId);
    if (index !== -1) {
      db.meetings[index] = { ...db.meetings[index], ...req.body };
      writeDb(db);
      res.json(db.meetings[index]);
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  });

  // Streaming App routes
  app.get('/api/streaming-apps', (req, res) => {
    const db = readDb();
    const { category } = req.query;
    if (category) {
      return res.json(db.streamingApps.filter((a: any) => a.category === category));
    }
    res.json(db.streamingApps);
  });

  app.post('/api/streaming-apps', (req, res) => {
    const db = readDb();
    const newApp = { ...req.body };
    if (!newApp.id) newApp.id = Date.now().toString();
    db.streamingApps.push(newApp);
    writeDb(db);
    res.status(201).json(newApp);
  });

  // Tool routes
  app.get('/api/tools', (req, res) => {
    const db = readDb();
    res.json(db.tools);
  });

  app.post('/api/tools', (req, res) => {
    const db = readDb();
    const newTool = { ...req.body };
    if (!newTool.id) newTool.id = Date.now().toString();
    db.tools.push(newTool);
    writeDb(db);
    res.status(201).json(newTool);
  });

  // Server routes
  app.get('/api/servers', (req, res) => {
    const db = readDb();
    res.json(db.servers);
  });

  app.post('/api/servers', (req, res) => {
    const db = readDb();
    const newServer = { ...req.body };
    if (!newServer.id) newServer.id = Date.now().toString();
    db.servers.push(newServer);
    writeDb(db);
    res.status(201).json(newServer);
  });

  app.delete('/api/servers/:id', (req, res) => {
    const db = readDb();
    const serverId = req.params.id;
    db.servers = db.servers.filter((server: any) => server.id !== serverId && server.id.toString() !== serverId);
    writeDb(db);
    res.status(204).send();
  });

  app.put('/api/servers/:id', (req, res) => {
    const db = readDb();
    const serverId = req.params.id;
    const index = db.servers.findIndex((s: any) => s.id === serverId || s.id.toString() === serverId);
    if (index !== -1) {
      db.servers[index] = { ...db.servers[index], ...req.body };
      writeDb(db);
      res.json(db.servers[index]);
    } else {
      res.status(404).json({ message: 'Server not found' });
    }
  });

  // User routes
  app.get('/api/users', (req, res) => {
    const db = readDb();
    const { adminId } = req.query;
    if (adminId) {
      return res.json(db.users.filter((u: any) => u.adminId === adminId));
    }
    res.json(db.users);
  });

  app.post('/api/users', (req, res) => {
    const db = readDb();
    const newUser = { ...req.body };
    if (!newUser.id) newUser.id = Date.now().toString();
    db.users.push(newUser);
    writeDb(db);
    res.status(201).json(newUser);
  });

  app.post('/api/admin-login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    
    // Check for default admin
    if (username === '709580' && password === '709580') {
       return res.json({ 
         success: true, 
         admin: { 
           id: 'default', 
           username: '709580', 
           companyName: 'General Panel', 
           isApproved: true, 
           isMainAdmin: true 
         } 
       });
    }

    const admin = db.admins.find((a: any) => a.username === username && a.password === password);

    if (admin) {
      if (admin.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Account suspended' });
      }
      if (!admin.isApproved) {
        return res.status(403).json({ success: false, message: 'Account pending approval' });
      }
      res.json({ success: true, admin });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    const db = readDb();
    const userId = req.params.id;
    const index = db.users.findIndex((u: any) => u.id === userId || u.id.toString() === userId);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...req.body };
      writeDb(db);
      res.json(db.users[index]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = readDb();
    const userId = req.params.id;
    db.users = db.users.filter((user: any) => user.id !== userId && user.id.toString() !== userId);
    writeDb(db);
    res.status(204).send();
  });

  // Loan Request routes
  app.get('/api/loan-requests', (req, res) => {
    const db = readDb();
    const { userId, adminId } = req.query;
    let requests = db.loanRequests;
    if (userId) {
      requests = requests.filter((r: any) => r.userId === userId);
    }
    if (adminId) {
      requests = requests.filter((r: any) => r.adminId === adminId);
    }
    res.json(requests);
  });

  app.post('/api/loan-requests', (req, res) => {
    const db = readDb();
    const newRequest = { ...req.body };
    if (!newRequest.id) newRequest.id = Date.now().toString();
    if (!newRequest.date) newRequest.date = new Date().toISOString();
    db.loanRequests.push(newRequest);
    writeDb(db);
    res.status(201).json(newRequest);
  });

  app.put('/api/loan-requests/:id', (req, res) => {
    const db = readDb();
    const requestId = req.params.id;
    const index = db.loanRequests.findIndex((r: any) => r.id === requestId || r.id.toString() === requestId);
    if (index !== -1) {
      db.loanRequests[index] = { ...db.loanRequests[index], ...req.body };
      writeDb(db);
      res.json(db.loanRequests[index]);
    } else {
      res.status(404).json({ message: 'Loan request not found' });
    }
  });

  // Chat Messages routes
  app.get('/api/chat-messages', (req, res) => {
    const db = readDb();
    const { userId, adminId, chatId } = req.query;
    let messages = db.chatMessages;
    if (chatId) {
      messages = messages.filter((m: any) => m.senderId === chatId || m.receiverId === chatId || m.chatId === chatId);
    } else if (userId) {
      messages = messages.filter((m: any) => m.senderId === userId || m.receiverId === userId);
    }
    if (adminId) {
      messages = messages.filter((m: any) => m.senderId === adminId || m.receiverId === adminId);
    }
    res.json(messages);
  });

  app.post('/api/chat-messages', (req, res) => {
    const db = readDb();
    const newMessage = { ...req.body };
    if (!newMessage.id) newMessage.id = Date.now().toString();
    if (!newMessage.timestamp) newMessage.timestamp = new Date().toISOString();
    db.chatMessages.push(newMessage);
    writeDb(db);
    res.status(201).json(newMessage);
  });

  // Notifications routes
  app.get('/api/notifications', (req, res) => {
    const db = readDb();
    const { userId } = req.query;
    let notifications = db.notifications;
    if (userId) {
      notifications = notifications.filter((n: any) => n.userId === userId);
    }
    res.json(notifications);
  });

  app.post('/api/notifications', (req, res) => {
    const db = readDb();
    const newNotification = { ...req.body };
    if (!newNotification.id) newNotification.id = Date.now().toString();
    if (!newNotification.date) newNotification.date = new Date().toISOString();
    db.notifications.push(newNotification);
    writeDb(db);
    res.status(201).json(newNotification);
  });

  app.put('/api/notifications/:id', (req, res) => {
    const db = readDb();
    const notificationId = req.params.id;
    const index = db.notifications.findIndex((n: any) => n.id === notificationId || n.id.toString() === notificationId);
    if (index !== -1) {
      db.notifications[index] = { ...db.notifications[index], ...req.body };
      writeDb(db);
      res.json(db.notifications[index]);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  });

  // Admin Notifications routes
  app.get('/api/admin-notifications', (req, res) => {
    const db = readDb();
    res.json(db.adminNotifications);
  });

  app.post('/api/admin-notifications', (req, res) => {
    const db = readDb();
    const newNotification = { ...req.body };
    if (!newNotification.id) newNotification.id = Date.now().toString();
    if (!newNotification.time) newNotification.time = new Date().toLocaleString();
    db.adminNotifications.push(newNotification);
    writeDb(db);
    res.status(201).json(newNotification);
  });

  app.put('/api/admin-notifications/:id', (req, res) => {
    const db = readDb();
    const notificationId = req.params.id;
    const index = db.adminNotifications.findIndex((n: any) => n.id === notificationId || n.id.toString() === notificationId);
    if (index !== -1) {
      db.adminNotifications[index] = { ...db.adminNotifications[index], ...req.body };
      writeDb(db);
      res.json(db.adminNotifications[index]);
    } else {
      res.status(404).json({ message: 'Admin notification not found' });
    }
  });

  // Recurring Payments routes
  app.get('/api/recurring-payments', (req, res) => {
    const db = readDb();
    const { userId } = req.query;
    let payments = db.recurringPayments;
    if (userId) {
      payments = payments.filter((p: any) => p.userId === userId);
    }
    res.json(payments);
  });

  app.post('/api/recurring-payments', (req, res) => {
    const db = readDb();
    const newPayment = { ...req.body };
    if (!newPayment.id) newPayment.id = Date.now().toString();
    db.recurringPayments.push(newPayment);
    writeDb(db);
    res.status(201).json(newPayment);
  });

  app.put('/api/recurring-payments/:id', (req, res) => {
    const db = readDb();
    const paymentId = req.params.id;
    const index = db.recurringPayments.findIndex((p: any) => p.id === paymentId || p.id.toString() === paymentId);
    if (index !== -1) {
      db.recurringPayments[index] = { ...db.recurringPayments[index], ...req.body };
      writeDb(db);
      res.json(db.recurringPayments[index]);
    } else {
      res.status(404).json({ message: 'Recurring payment not found' });
    }
  });

  app.delete('/api/recurring-payments/:id', (req, res) => {
    const db = readDb();
    const paymentId = req.params.id;
    db.recurringPayments = db.recurringPayments.filter((p: any) => p.id !== paymentId && p.id.toString() !== paymentId);
    writeDb(db);
    res.status(204).send();
  });

  app.post('/api/health-check', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      await axios.get(url, { timeout: 5000 });
      res.json({ status: 'online' });
    } catch (error) {
      res.json({ status: 'offline' });
    }
  });

  // Mock API for developer panel data if needed
  app.get("/api/system/status", (req, res) => {
    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode");
    const distPath = path.join(__dirname, "dist");
    console.log(`Serving static files from: ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.error("CRITICAL ERROR: dist folder not found!");
    } else {
      console.log("dist folder exists.");
      if (fs.existsSync(path.join(distPath, "index.html"))) {
        console.log("index.html found in dist.");
      } else {
        console.error("CRITICAL ERROR: index.html not found in dist!");
      }
    }

    // Serve static files in production
    app.use(express.static(distPath));
    
    // Explicit root route
    app.get("/", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log(`Serving root index.html from: ${indexPath}`);
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(500).send("Server Error: index.html not found");
      }
    });

    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log(`Serving catch-all index.html from: ${indexPath} for path: ${req.path}`);
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Page not found");
      }
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
