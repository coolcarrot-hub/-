const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 中间件
app.use(express.static(__dirname));
app.use(express.json());

// 用户数据文件路径
const USERS_FILE = path.join(__dirname, 'users.json');

// 存储在线用户和私聊会话
const onlineUsers = new Map(); // socket.id -> user info
const privateChats = new Map(); // chatId -> { users: [socketId1, socketId2], messages: [] }

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 系统管理员信息
const systemAdmin = {
    id: 'system',
    name: '系统管理员',
    ip: null, // 系统管理员没有IP
    isAdmin: true
};

// 加载用户数据
async function loadUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // 如果文件不存在，创建空用户列表
        return { users: [] };
    }
}

// 保存用户数据
async function saveUsers(usersData) {
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf8');
    } catch (error) {
        console.error('保存用户数据失败:', error);
    }
}

// 用户注册
async function registerUser(username, password, ip) {
    const usersData = await loadUsers();
    
    // 检查用户名是否已存在
    const existingUser = usersData.users.find(user => user.username === username);
    if (existingUser) {
        return { success: false, message: '用户名已存在' };
    }
    
    // 创建新用户
    const newUser = {
        id: generateId(),
        username: username,
        password: password, // 注意：实际应用中应该加密存储
        ip: ip,
        registerTime: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    usersData.users.push(newUser);
    await saveUsers(usersData);
    
    return { success: true, user: newUser };
}

// 用户登录
async function loginUser(username, password, ip) {
    const usersData = await loadUsers();
    
    // 查找用户
    const user = usersData.users.find(u => u.username === username);
    if (!user) {
        return { success: false, message: '用户不存在' };
    }
    
    // 验证密码（实际应用中应该使用加密比较）
    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }
    
    // 更新最后登录时间和IP
    user.lastLogin = new Date().toISOString();
    user.lastIp = ip;
    await saveUsers(usersData);
    
    return { success: true, user: user };
}

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat-real.html'));
});

// 用户注册API
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        
        if (username.length < 2 || username.length > 20) {
            return res.status(400).json({ success: false, message: '用户名长度必须在2-20个字符之间' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: '密码长度不能少于6个字符' });
        }
        
        const result = await registerUser(username, password, ip);
        
        if (result.success) {
            res.json({ success: true, message: '注册成功', user: result.user });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 用户登录API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }
        
        const result = await loginUser(username, password, ip);
        
        if (result.success) {
            res.json({ success: true, message: '登录成功', user: result.user });
        } else {
            res.status(401).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// Socket.io连接处理
io.on('connection', (socket) => {
    console.log('新连接:', socket.id);
    
    // 获取用户IP地址
    const userIP = socket.handshake.address || 
                   socket.request.headers['x-forwarded-for'] || 
                   socket.request.connection.remoteAddress;
    
    // 初始状态：用户未登录
    let userInfo = {
        id: socket.id,
        username: null,
        userId: null,
        ip: userIP,
        joinTime: new Date(),
        privateChats: new Set(),
        isAuthenticated: false
    };
    
    onlineUsers.set(socket.id, userInfo);
    
    // 请求用户登录
    socket.emit('requireLogin', {
        message: '请先登录或注册'
    });
    
    // 处理用户登录
    socket.on('login', async (data) => {
        try {
            const { username, password } = data;
            
            if (!username || !password) {
                socket.emit('loginResult', {
                    success: false,
                    message: '用户名和密码不能为空'
                });
                return;
            }
            
            // 调用登录API
            const response = await fetch(`http://localhost:${PORT}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 更新用户信息
                userInfo.username = username;
                userInfo.userId = result.user.id;
                userInfo.isAuthenticated = true;
                onlineUsers.set(socket.id, userInfo);
                
                // 发送欢迎消息
                socket.emit('newMessage', {
                    id: generateId(),
                    sender: systemAdmin.name,
                    senderId: systemAdmin.id,
                    message: `欢迎 ${username} 回到工具交流聊天室！`,
                    timestamp: new Date(),
                    ip: systemAdmin.ip,
                    isSystem: true
                });
                
                // 通知其他用户有新用户加入
                socket.broadcast.emit('newMessage', {
                    id: generateId(),
                    sender: systemAdmin.name,
                    senderId: systemAdmin.id,
                    message: `${username} 加入了聊天室`,
                    timestamp: new Date(),
                    ip: systemAdmin.ip,
                    isSystem: true
                });
                
                // 发送当前在线用户列表
                updateUserList();
                
                // 发送登录成功消息
                socket.emit('loginResult', {
                    success: true,
                    message: '登录成功',
                    username: username
                });
                
                console.log(`用户登录: ${username} (${socket.id})`);
            } else {
                socket.emit('loginResult', {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error('登录处理错误:', error);
            socket.emit('loginResult', {
                success: false,
                message: '登录失败，请稍后重试'
            });
        }
    });
    
    // 处理用户注册
    socket.on('register', async (data) => {
        try {
            const { username, password } = data;
            
            if (!username || !password) {
                socket.emit('registerResult', {
                    success: false,
                    message: '用户名和密码不能为空'
                });
                return;
            }
            
            if (username.length < 2 || username.length > 20) {
                socket.emit('registerResult', {
                    success: false,
                    message: '用户名长度必须在2-20个字符之间'
                });
                return;
            }
            
            if (password.length < 6) {
                socket.emit('registerResult', {
                    success: false,
                    message: '密码长度不能少于6个字符'
                });
                return;
            }
            
            // 调用注册API
            const response = await fetch(`http://localhost:${PORT}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                socket.emit('registerResult', {
                    success: true,
                    message: '注册成功，请登录',
                    username: username
                });
                
                console.log(`用户注册: ${username}`);
            } else {
                socket.emit('registerResult', {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error('注册处理错误:', error);
            socket.emit('registerResult', {
                success: false,
                message: '注册失败，请稍后重试'
            });
        }
    });
    
    // 处理消息发送
    socket.on('sendMessage', (data) => {
        const user = onlineUsers.get(socket.id);
        if (!user || !user.isAuthenticated || !data.message || data.message.trim() === '') return;
        
        const message = data.message.trim();
        
        // 检查是否是私聊命令
        if (message.startsWith('/私聊 ')) {
            handlePrivateChatCommand(socket, user, message);
            return;
        }
        
        // 检查是否是改名命令
        if (message.startsWith('/改名 ')) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: '用户名已与账号绑定，无法修改',
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        // 普通公共消息
        const messageData = {
            id: generateId(),
            sender: user.username,
            senderId: socket.id,
            message: message,
            timestamp: new Date(),
            ip: user.ip,
            isPrivate: false
        };
        
        // 广播消息给所有用户
        io.emit('newMessage', messageData);
        console.log(`公共消息来自 ${user.username}: ${message}`);
    });
    
    // 处理私聊消息
    socket.on('sendPrivateMessage', (data) => {
        const user = onlineUsers.get(socket.id);
        if (!user || !user.isAuthenticated || !data.message || !data.chatId || !data.targetUserId) return;
        
        const targetUser = onlineUsers.get(data.targetUserId);
        if (!targetUser || !targetUser.isAuthenticated) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `用户已离线，无法发送私聊消息`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        // 检查用户是否在同一个私聊会话中
        const chat = privateChats.get(data.chatId);
        if (!chat || !chat.users.includes(socket.id) || !chat.users.includes(data.targetUserId)) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `私聊会话不存在或已关闭`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        const messageData = {
            id: generateId(),
            sender: user.username,
            senderId: socket.id,
            message: data.message,
            timestamp: new Date(),
            ip: user.ip,
            isPrivate: true,
            chatId: data.chatId,
            targetUserId: data.targetUserId
        };
        
        // 存储私聊消息
        chat.messages.push(messageData);
        
        // 发送给私聊双方
        socket.emit('newPrivateMessage', messageData);
        socket.to(data.targetUserId).emit('newPrivateMessage', messageData);
        
        console.log(`私聊消息从 ${user.username} 到 ${targetUser.username}: ${data.message}`);
    });
    
    // 发起私聊
    socket.on('startPrivateChat', (targetUserId) => {
        const user = onlineUsers.get(socket.id);
        const targetUser = onlineUsers.get(targetUserId);
        
        if (!user || !user.isAuthenticated || !targetUser || !targetUser.isAuthenticated) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `用户不存在或未登录`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        // 检查是否已经存在私聊会话
        let existingChatId = null;
        for (const [chatId, chat] of privateChats.entries()) {
            if (chat.users.includes(socket.id) && chat.users.includes(targetUserId)) {
                existingChatId = chatId;
                break;
            }
        }
        
        if (existingChatId) {
            // 已经存在私聊会话，直接使用
            socket.emit('privateChatStarted', {
                chatId: existingChatId,
                targetUser: {
                    id: targetUser.id,
                    username: targetUser.username,
                    ip: targetUser.ip
                }
            });
        } else {
            // 创建新的私聊会话
            const chatId = generateId();
            const chat = {
                id: chatId,
                users: [socket.id, targetUserId],
                messages: [],
                created: new Date()
            };
            
            privateChats.set(chatId, chat);
            
            // 更新用户的私聊会话列表
            user.privateChats.add(chatId);
            targetUser.privateChats.add(chatId);
            
            // 通知双方
            socket.emit('privateChatStarted', {
                chatId: chatId,
                targetUser: {
                    id: targetUser.id,
                    username: targetUser.username,
                    ip: targetUser.ip
                }
            });
            
            socket.to(targetUserId).emit('privateChatStarted', {
                chatId: chatId,
                targetUser: {
                    id: user.id,
                    username: user.username,
                    ip: user.ip
                }
            });
            
            // 发送系统消息
            const systemMsg = {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `你与 ${targetUser.username} 的私聊会话已建立`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true,
                chatId: chatId
            };
            
            socket.emit('newMessage', systemMsg);
            socket.to(targetUserId).emit('newMessage', {
                ...systemMsg,
                message: `你与 ${user.username} 的私聊会话已建立`
            });
            
            console.log(`创建私聊会话: ${user.username} <-> ${targetUser.username} (${chatId})`);
        }
    });
    
    // 关闭私聊
    socket.on('closePrivateChat', (chatId) => {
        const chat = privateChats.get(chatId);
        if (!chat) return;
        
        // 通知另一方
        const otherUserId = chat.users.find(id => id !== socket.id);
        if (otherUserId && onlineUsers.has(otherUserId)) {
            const otherUser = onlineUsers.get(otherUserId);
            if (otherUser && otherUser.isAuthenticated) {
                socket.to(otherUserId).emit('privateChatClosed', {
                    chatId: chatId,
                    message: `对方关闭了私聊会话`
                });
            }
        }
        
        // 清理私聊会话
        privateChats.delete(chatId);
        
        // 从用户的私聊列表中移除
        chat.users.forEach(userId => {
            const user = onlineUsers.get(userId);
            if (user) {
                user.privateChats.delete(chatId);
            }
        });
        
        socket.emit('privateChatClosed', {
            chatId: chatId,
            message: `私聊会话已关闭`
        });
        
        console.log(`关闭私聊会话: ${chatId}`);
    });
    
    // 处理断开连接
    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            if (user.isAuthenticated) {
                // 清理用户的私聊会话
                user.privateChats.forEach(chatId => {
                    const chat = privateChats.get(chatId);
                    if (chat) {
                        // 通知另一方用户
                        const otherUserId = chat.users.find(id => id !== socket.id);
                        if (otherUserId && onlineUsers.has(otherUserId)) {
                            const otherUser = onlineUsers.get(otherUserId);
                            if (otherUser && other