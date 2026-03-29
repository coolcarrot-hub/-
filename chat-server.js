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

// 存储在线用户
const onlineUsers = new Map(); // socket.id -> user info

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 系统管理员信息
const systemAdmin = {
    id: 'system',
    name: '系统管理员',
    ip: null
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
        password: password,
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
    
    // 验证密码
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

app.get('/chat.html', (req, res) => {
    res.redirect('/chat');
});

// 用户注册API
app.post('/api/register', express.json(), async (req, res) => {
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
            res.json({ success: true, message: '注册成功' });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 用户登录API
app.post('/api/login', express.json(), async (req, res) => {
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

// 更新用户列表
function updateUserList() {
    const users = Array.from(onlineUsers.values())
        .filter(user => user.isAuthenticated)
        .map(user => ({
            id: user.id,
            username: user.username,
            ip: user.ip,
            joinTime: user.joinTime
        }));
    
    io.emit('userList', {
        users: users,
        onlineCount: users.length
    });
}

// 处理私聊命令
function handlePrivateChatCommand(socket, user, message) {
    const parts = message.split(' ');
    if (parts.length < 3) {
        socket.emit('newMessage', {
            id: generateId(),
            sender: systemAdmin.name,
            senderId: systemAdmin.id,
            message: `私聊命令格式: /私聊 [用户名] [消息内容]`,
            timestamp: new Date(),
            ip: systemAdmin.ip,
            isSystem: true
        });
        return;
    }
    
    const targetUsername = parts[1];
    const privateMessage = parts.slice(2).join(' ');
    
    // 查找目标用户
    let targetUser = null;
    for (const [userId, userInfo] of onlineUsers.entries()) {
        if (userInfo.username === targetUsername && userId !== socket.id && userInfo.isAuthenticated) {
            targetUser = { id: userId, ...userInfo };
            break;
        }
    }
    
    if (!targetUser) {
        socket.emit('newMessage', {
            id: generateId(),
            sender: systemAdmin.name,
            senderId: systemAdmin.id,
            message: `未找到在线用户: ${targetUsername}`,
            timestamp: new Date(),
            ip: systemAdmin.ip,
            isSystem: true
        });
        return;
    }
    
    // 发送私聊消息
    const messageData = {
        id: generateId(),
        sender: user.username,
        senderId: socket.id,
        message: `[私聊] ${privateMessage}`,
        timestamp: new Date(),
        ip: user.ip,
        isPrivate: true,
        targetUsername: targetUsername
    };
    
    // 发送给双方
    socket.emit('newMessage', messageData);
    socket.to(targetUser.id).emit('newMessage', {
        ...messageData,
        message: `[私聊] ${privateMessage}`
    });
    
    console.log(`私聊消息从 ${user.username} 到 ${targetUsername}: ${privateMessage}`);
}

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
            const response = await fetch(`http://localhost:3000/api/login`, {
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
                    message: `欢迎 ${username} 来到工具交流聊天室！`,
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
            const response = await fetch(`http://localhost:3000/api/register`, {
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
    
    // 处理断开连接
    socket.on('disconnect', () => {
        const user = onlineUsers.get(socket.id);
        if (user) {
            if (user.isAuthenticated) {
                // 通知其他用户有用户离开
                io.emit('newMessage', {
                    id: generateId(),
                    sender: systemAdmin.name,
                    senderId: systemAdmin.id,
                    message: `${user.username} 离开了聊天室`,
                    timestamp: new Date(),
                    ip: systemAdmin.ip,
                    isSystem: true
                });
                
                console.log(`用户断开连接: ${user.username} (${socket.id})`);
            }
            
            onlineUsers.delete(socket.id);
            
            // 更新用户列表
            updateUserList();
        }
    });
    
    // 心跳检测
    socket.on('heartbeat', () => {
        socket.emit('heartbeat', { timestamp: Date.now() });
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`聊天室地址: http://localhost:${PORT}/chat`);
    console.log(`工具导航地址: http://localhost:${PORT}/`);
    console.log(`系统管理员: ${systemAdmin.name} (无IP地址)`);
    console.log('功能说明:');
    console.log('1. 用户需要注册和登录才能使用');
    console.log('2. 支持公共聊天和私聊功能');
    console.log('3. 系统管理员消息不显示IP地址');
    console.log('4. 支持私聊命令: /私聊 [用户名] [消息]');
});