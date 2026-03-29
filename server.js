const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 中间件
app.use(express.static(__dirname));
app.use(express.json());

// 存储在线用户和私聊会话
const onlineUsers = new Map(); // socket.id -> user info
const privateChats = new Map(); // chatId -> { users: [socketId1, socketId2], messages: [] }

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.html'));
});

// 系统管理员信息
const systemAdmin = {
    id: 'system',
    name: '系统管理员',
    ip: null, // 系统管理员没有IP
    isAdmin: true
};

// Socket.io连接处理
io.on('connection', (socket) => {
    console.log('新连接:', socket.id);
    
    // 获取用户IP地址
    const userIP = socket.handshake.address || 
                   socket.request.headers['x-forwarded-for'] || 
                   socket.request.connection.remoteAddress;
    
    // 初始状态：等待用户输入用户名
    let userInfo = {
        id: socket.id,
        name: null, // 初始为null，等待用户输入
        ip: userIP,
        joinTime: new Date(),
        privateChats: new Set(),
        isAuthenticated: false // 标记用户是否已输入用户名
    };
    
    onlineUsers.set(socket.id, userInfo);
    
    // 请求用户输入用户名
    socket.emit('requireUsername', {
        message: '欢迎来到工具交流聊天室！请输入你的用户名：'
    });
    
    // 处理用户名设置
    socket.on('setUsername', (data) => {
        if (!data.username || data.username.trim() === '') {
            socket.emit('requireUsername', {
                message: '用户名不能为空，请重新输入：'
            });
            return;
        }
        
        const username = data.username.trim();
        
        // 检查用户名是否已存在
        let usernameExists = false;
        for (const [userId, user] of onlineUsers.entries()) {
            if (user.name === username && userId !== socket.id) {
                usernameExists = true;
                break;
            }
        }
        
        if (usernameExists) {
            socket.emit('requireUsername', {
                message: `用户名 "${username}" 已被使用，请选择其他用户名：`
            });
            return;
        }
        
        if (username.length < 2 || username.length > 20) {
            socket.emit('requireUsername', {
                message: '用户名长度必须在2-20个字符之间，请重新输入：'
            });
            return;
        }
        
        // 更新用户信息
        userInfo.name = username;
        userInfo.isAuthenticated = true;
        onlineUsers.set(socket.id, userInfo);
        
        // 发送欢迎消息（来自系统管理员）
        socket.emit('newMessage', {
            id: generateId(),
            sender: systemAdmin.name,
            senderId: systemAdmin.id,
            message: `欢迎 ${username} 来到工具交流聊天室！\n\n在这里你可以：\n1. 分享实用的开发工具\n2. 讨论工具使用技巧\n3. 寻求技术帮助\n4. 交流开发经验\n5. 使用私聊功能与其他用户单独交流\n\n聊天命令：\n/私聊 [用户名] [消息] - 发起私聊\n/改名 [新用户名] - 修改用户名\n\n请保持友好交流，遵守社区规则。`,
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
        
        console.log(`用户注册: ${username} (${socket.id})`);
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
            handleChangeNameCommand(socket, user, message);
            return;
        }
        
        // 普通公共消息
        const messageData = {
            id: generateId(),
            sender: user.name,
            senderId: socket.id,
            message: message,
            timestamp: new Date(),
            ip: user.ip,
            isPrivate: false
        };
        
        // 广播消息给所有用户
        io.emit('newMessage', messageData);
        console.log(`公共消息来自 ${user.name}: ${message}`);
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
            sender: user.name,
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
        
        console.log(`私聊消息从 ${user.name} 到 ${targetUser.name}: ${data.message}`);
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
                    name: targetUser.name,
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
                    name: targetUser.name,
                    ip: targetUser.ip
                }
            });
            
            socket.to(targetUserId).emit('privateChatStarted', {
                chatId: chatId,
                targetUser: {
                    id: user.id,
                    name: user.name,
                    ip: user.ip
                }
            });
            
            // 发送系统消息
            const systemMsg = {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `你与 ${targetUser.name} 的私聊会话已建立`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true,
                chatId: chatId
            };
            
            socket.emit('newMessage', systemMsg);
            socket.to(targetUserId).emit('newMessage', {
                ...systemMsg,
                message: `你与 ${user.name} 的私聊会话已建立`
            });
            
            console.log(`创建私聊会话: ${user.name} <-> ${targetUser.name} (${chatId})`);
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
                            if (otherUser && otherUser.isAuthenticated) {
                                socket.to(otherUserId).emit('privateChatClosed', {
                                    chatId: chatId,
                                    message: `对方已断开连接，私聊会话结束`
                                });
                                
                                // 从另一方用户的私聊列表中移除
                                otherUser.privateChats.delete(chatId);
                            }
                        }
                        
                        privateChats.delete(chatId);
                    }
                });
                
                // 通知其他用户有用户离开
                io.emit('newMessage', {
                    id: generateId(),
                    sender: systemAdmin.name,
                    senderId: systemAdmin.id,
                    message: `${user.name} 离开了聊天室`,
                    timestamp: new Date(),
                    ip: systemAdmin.ip,
                    isSystem: true
                });
                
                console.log(`用户断开连接: ${user.name} (${socket.id})`);
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
    
    // 辅助函数：处理私聊命令
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
        
        const targetUserName = parts[1];
        const privateMessage = parts.slice(2).join(' ');
        
        // 查找目标用户
        let targetUser = null;
        for (const [userId, userInfo] of onlineUsers.entries()) {
            if (userInfo.name === targetUserName && userId !== socket.id && userInfo.isAuthenticated) {
                targetUser = { id: userId, ...userInfo };
                break;
            }
        }
        
        if (!targetUser) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `未找到在线用户: ${targetUserName}`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        // 发起私聊
        socket.emit('startPrivateChat', targetUser.id);
        
        // 稍后发送消息
        setTimeout(() => {
            socket.emit('sendPrivateMessage', {
                chatId: getPrivateChatId(socket.id, targetUser.id),
                targetUserId: targetUser.id,
                message: privateMessage
            });
        }, 100);
    }
    
    // 辅助函数：处理改名命令
    function handleChangeNameCommand(socket, user, message) {
        const parts = message.split(' ');
        if (parts.length < 2) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `改名命令格式: /改名 [新用户名]`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        const newName = parts.slice(1).join(' ').trim();
        if (newName.length < 2 || newName.length > 20) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `用户名长度必须在2-20个字符之间`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        // 检查用户名是否已存在
        let usernameExists = false;
        for (const [userId, userInfo] of onlineUsers.entries()) {
            if (userInfo.name === newName && userId !== socket.id && userInfo.isAuthenticated) {
                usernameExists = true;
                break;
            }
        }
        
        if (usernameExists) {
            socket.emit('newMessage', {
                id: generateId(),
                sender: systemAdmin.name,
                senderId: systemAdmin.id,
                message: `用户名 "${newName}" 已被使用，请选择其他用户名`,
                timestamp: new Date(),
                ip: systemAdmin.ip,
                isSystem: true
            });
            return;
        }
        
        const oldName = user.name;
        user.name = newName;
        onlineUsers.set(socket.id, user);
        
        // 通知所有用户
        io.emit('newMessage', {
            id: generateId(),
            sender: systemAdmin.name,
            senderId: systemAdmin.id,
            message: `${oldName} 改名为 ${newName}`,
            timestamp: new Date(),
            ip: systemAdmin.ip,
            isSystem: true
        });
        
        // 更新用户列表
        updateUserList();
    }
    
    // 辅助函数：获取私聊会话ID
    function getPrivateChatId(userId1, userId2) {
        for (const [chatId, chat] of privateChats.entries()) {
            if (chat.users.includes(userId1) && chat.users.includes(userId2)) {
                return chatId;
            }
        }
        return null;
    }
});

// 更新用户列表
function updateUserList() {
    const users = Array.from(onlineUsers.values())
        .filter(user => user.isAuthenticated)
        .map(user => ({
            id: user.id,
            name: user.name,
            ip: user.ip,
            joinTime: user.joinTime
        }));
    
    io.emit('userList', {
        users: users,
        onlineCount: users.length
    });
}

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`聊天室地址: http://localhost:${PORT}/chat`);
    console.log(`工具导航地址: http://localhost:${PORT}/`);
    console.log(`系统管理员: ${systemAdmin.name} (无IP地址)`);
    console.log('功能说明:');
    console.log('1. 用户首次进入需要输入用户名');
    console.log('2. 支持公共聊天和私聊功能');
    console.log('3. 系统管理员消息不显示IP地址');
    console.log('4. 支持改名命令: /改名 [新用户名]');
    console.log('5. 支持私聊命令: /私聊 [用户名] [消息]');
});
   