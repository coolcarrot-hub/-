// 工具数据 - 包含所有提到的软件
const toolsData = [
    // 编程开发工具
    {
        id: 1,
        name: "CLion",
        description: "C/C++开发",
        category: "dev",
        icon: "fas fa-code",
        url: "https://www.jetbrains.com/clion/"
    },
    {
        id: 2,
        name: "PyCharm",
        description: "Python开发",
        category: "dev",
        icon: "fab fa-python",
        url: "https://www.jetbrains.com/pycharm/"
    },
    {
        id: 3,
        name: "Git",
        description: "版本控制",
        category: "dev",
        icon: "fab fa-git-alt",
        url: "https://git-scm.com/"
    },
    {
        id: 4,
        name: "Sublime Text",
        description: "轻量编辑器",
        category: "dev",
        icon: "fas fa-file-code",
        url: "https://www.sublimetext.com/"
    },
    {
        id: 5,
        name: "Visual Studio Code",
        description: "微软代码编辑器",
        category: "dev",
        icon: "fas fa-code",
        url: "https://code.visualstudio.com/"
    },
    {
        id: 6,
        name: "Eclipse",
        description: "Java开发",
        category: "dev",
        icon: "fab fa-java",
        url: "https://www.eclipse.org/"
    },
    {
        id: 7,
        name: "frp",
        description: "内网穿透工具",
        category: "dev",
        icon: "fas fa-network-wired",
        url: "https://github.com/fatedier/frp"
    },
    
    // 实用工具
    {
        id: 8,
        name: "7-Zip",
        description: "免费压缩",
        category: "utility",
        icon: "fas fa-file-archive",
        url: "https://www.7-zip.org/"
    },
    {
        id: 9,
        name: "Chrome",
        description: "谷歌浏览器",
        category: "utility",
        icon: "fab fa-chrome",
        url: "https://www.google.com/chrome/"
    },
    {
        id: 10,
        name: "Firefox",
        description: "火狐浏览器",
        category: "utility",
        icon: "fab fa-firefox-browser",
        url: "https://www.mozilla.org/firefox/"
    },
    {
        id: 11,
        name: "OBS Studio",
        description: "录屏直播",
        category: "utility",
        icon: "fas fa-video",
        url: "https://obsproject.com/"
    },
    {
        id: 12,
        name: "Bandizip",
        description: "解压缩软件",
        category: "utility",
        icon: "fas fa-file-zipper",
        url: "https://www.bandisoft.com/bandizip/"
    },
    {
        id: 13,
        name: "VLC播放器",
        description: "万能播放器",
        category: "utility",
        icon: "fas fa-play-circle",
        url: "https://www.videolan.org/vlc/"
    },
    {
        id: 30,
        name: "App Store",
        description: "苹果应用商店",
        category: "utility",
        icon: "fab fa-app-store",
        url: "https://apps.apple.com/"
    },
    {
        id: 34,
        name: "Everything",
        description: "文件搜索工具",
        category: "utility",
        icon: "fas fa-search",
        url: "https://www.voidtools.com/zh-cn/support/everything/"
    },
    
    // 游戏娱乐
    {
        id: 14,
        name: "Minecraft",
        description: "我的世界",
        category: "game",
        icon: "fas fa-cube",
        url: "https://www.minecraft.net/"
    },
    {
        id: 15,
        name: "Steam",
        description: "游戏平台",
        category: "game",
        icon: "fab fa-steam",
        url: "https://store.steampowered.com/"
    },
    {
        id: 16,
        name: "Epic Games",
        description: "免费游戏",
        category: "game",
        icon: "fas fa-gamepad",
        url: "https://store.epicgames.com/"
    },
    {
        id: 17,
        name: "BlueStacks",
        description: "安卓模拟器",
        category: "game",
        icon: "fas fa-mobile-alt",
        url: "https://www.bluestacks.com/"
    },
    {
        id: 31,
        name: "PCL CE",
        description: "我的世界启动器",
        category: "game",
        icon: "fas fa-gamepad",
        url: "https://pclce-web.demo.fis.ink/download"
    },
    {
        id: 32,
        name: "HMCL",
        description: "我的世界启动器",
        category: "game",
        icon: "fas fa-cube",
        url: "https://hmcl.huangyuhui.net/download/"
    },
    {
        id: 35,
        name: "Bilibili",
        description: "视频弹幕网站",
        category: "game",
        icon: "fab fa-bilibili",
        url: "https://www.bilibili.com"
    },
    
    // 系统工具
    {
        id: 18,
        name: "CCleaner",
        description: "系统清理",
        category: "system",
        icon: "fas fa-broom",
        url: "https://www.ccleaner.com/"
    },
    {
        id: 19,
        name: "CPU-Z",
        description: "处理器检测",
        category: "system",
        icon: "fas fa-microchip",
        url: "https://www.cpuid.com/softwares/cpu-z.html"
    },
    {
        id: 20,
        name: "GPU-Z",
        description: "显卡检测",
        category: "system",
        icon: "fas fa-desktop",
        url: "https://www.techpowerup.com/gpuz/"
    },
    {
        id: 21,
        name: "CrystalDiskInfo",
        description: "硬盘检测",
        category: "system",
        icon: "fas fa-hdd",
        url: "https://crystalmark.info/en/software/crystaldiskinfo/"
    },
    {
        id: 22,
        name: "Memtest86",
        description: "内存测试",
        category: "system",
        icon: "fas fa-memory",
        url: "https://www.memtest86.com/"
    },
    
    // 系统急救
    {
        id: 23,
        name: "360急救箱",
        description: "系统急救工具",
        category: "rescue",
        icon: "fas fa-first-aid",
        url: "https://weishi.360.cn/jijiuxiang/index.html"
    },
    {
        id: 24,
        name: "火绒安全软件",
        description: "轻量安全防护",
        category: "rescue",
        icon: "fas fa-shield-alt",
        url: "https://www.huorong.cn"
    },
    {
        id: 25,
        name: "360安全卫士",
        description: "全面安全防护",
        category: "rescue",
        icon: "fas fa-user-shield",
        url: "https://www.360.com"
    },
    {
        id: 26,
        name: "FirPE",
        description: "PE系统工具",
        category: "rescue",
        icon: "fas fa-hdd",
        url: "https://silver.yukaidi.com/home?path=cloudreve%3A%2F%2FZmh9%40share%2FISO"
    },
    
    // 办公软件
    {
        id: 27,
        name: "Microsoft Office",
        description: "微软办公",
        category: "office",
        icon: "fas fa-file-word",
        url: "https://www.microsoft.com/office"
    },
    {
        id: 28,
        name: "WPS Office",
        description: "国产办公",
        category: "office",
        icon: "fas fa-file-excel",
        url: "https://www.wps.com/"
    },
    {
        id: 29,
        name: "LibreOffice",
        description: "开源办公",
        category: "office",
        icon: "fas fa-file-pdf",
        url: "https://www.libreoffice.org/"
    },
    {
        id: 33,
        name: "WPS教育版",
        description: "教育版办公软件",
        category: "office",
        icon: "fas fa-graduation-cap",
        url: "https://365.wps.cn/edu/download?chn=wps365_officialweb_pc_menu"
    }
];

// DOM 元素
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const categoryBtns = document.querySelectorAll('.category-btn');
const themeToggleBtn = document.getElementById('themeToggle');
const noResults = document.getElementById('noResults');

// 当前状态
let currentCategory = 'all';
let currentSearch = '';
let currentTheme = localStorage.getItem('theme') || 'light';

// 初始化主题
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton();
}

// 更新主题按钮文本和图标
function updateThemeButton() {
    const icon = themeToggleBtn.querySelector('i');
    const text = themeToggleBtn.querySelector('span');
    
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = '浅色模式';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = '深色模式';
    }
}

// 切换主题
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeButton();
}

// 渲染工具卡片
function renderTools(tools) {
    toolsGrid.innerHTML = '';
    
    if (tools.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.dataset.category = tool.category;
        
        // 获取分类中文名
        let categoryName = '';
        switch(tool.category) {
            case 'dev': categoryName = '编程开发'; break;
            case 'utility': categoryName = '实用工具'; break;
            case 'game': categoryName = '游戏娱乐'; break;
            case 'system': categoryName = '系统工具'; break;
            case 'rescue': categoryName = '系统急救'; break;
            case 'office': categoryName = '办公软件'; break;
        }
        
        card.innerHTML = `
            <div class="tool-icon">
                <i class="${tool.icon}"></i>
            </div>
            <h3 class="tool-name">${tool.name}</h3>
            <p class="tool-desc">${tool.description}</p>
            <span class="tool-category">${categoryName}</span>
        `;
        
        // 添加点击事件，跳转到官网
        card.addEventListener('click', () => {
            window.open(tool.url, '_blank');
        });
        
        toolsGrid.appendChild(card);
    });
}

// 过滤工具
function filterTools() {
    let filteredTools = toolsData;
    
    // 按搜索词过滤
    if (currentSearch.trim() !== '') {
        const searchLower = currentSearch.toLowerCase();
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(searchLower) || 
            tool.description.toLowerCase().includes(searchLower)
        );
    }
    
    // 按分类过滤
    if (currentCategory !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === currentCategory);
    }
    
    renderTools(filteredTools);
}

// 更新分类按钮状态
function updateCategoryButtons() {
    categoryBtns.forEach(btn => {
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 事件监听器
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    filterTools();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    filterTools();
});

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        updateCategoryButtons();
        filterTools();
    });
});

themeToggleBtn.addEventListener('click', toggleTheme);

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Esc 清除搜索
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        currentSearch = '';
        filterTools();
    }
});

// 初始化
function init() {
    initTheme();
    renderTools(toolsData);
    
    // 添加一些动画效果
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 搜索框获得焦点时的效果
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.transform = 'scale(1)';
    });
    
    // 卡片悬停时的延迟效果
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transitionDelay = '0s';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transitionDelay = '0.1s';
        });
    });
});

// 添加工具统计信息
function updateToolStats() {
    const totalTools = toolsData.length;
    const devTools = toolsData.filter(t => t.category === 'dev').length;
    const utilityTools = toolsData.filter(t => t.category === 'utility').length;
    const gameTools = toolsData.filter(t => t.category === 'game').length;
    const systemTools = toolsData.filter(t => t.category === 'system').length;
    const rescueTools = toolsData.filter(t => t.category === 'rescue').length;
    const officeTools = toolsData.filter(t => t.category === 'office').length;
    
    console.log(`工具统计：总共 ${totalTools} 个工具`);
    console.log(`编程开发：${devTools} 个`);
    console.log(`实用工具：${utilityTools} 个`);
    console.log(`游戏娱乐：${gameTools} 个`);
    console.log(`系统工具：${systemTools} 个`);
    console.log(`系统急救：${rescueTools} 个`);
    console.log(`办公软件：${officeTools} 个`);
}

// 页面加载完成后显示统计信息
window.addEventListener('load', updateToolStats);

// ==================== 天气功能 ====================

// 使用免费的天气API（不需要API密钥）
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// 天气图标映射
const weatherIcons = {
    'clear': 'fas fa-sun',           // 晴天
    'partly-cloudy': 'fas fa-cloud-sun',     // 少云
    'cloudy': 'fas fa-cloud',         // 多云
    'overcast': 'fas fa-cloud',         // 阴天
    'rain': 'fas fa-cloud-rain',    // 雨
    'drizzle': 'fas fa-cloud-rain',    // 小雨
    'snow': 'fas fa-snowflake',     // 雪
    'thunderstorm': 'fas fa-bolt',          // 雷雨
    'fog': 'fas fa-smog',          // 雾
    'mist': 'fas fa-smog'           // 雾
};

// 天气描述映射
const weatherDescriptions = {
    'clear': '晴朗',
    'partly-cloudy': '少云',
    'cloudy': '多云',
    'overcast': '阴天',
    'rain': '下雨',
    'drizzle': '毛毛雨',
    'snow': '下雪',
    'thunderstorm': '雷雨',
    'fog': '雾',
    'mist': '薄雾'
};

// 获取天气数据
async function getWeatherData() {
    const weatherInfo = document.getElementById('weatherInfo');
    const weatherTime = document.getElementById('weatherTime');
    const refreshBtn = document.getElementById('refreshWeather');
    
    try {
        // 显示加载状态
        weatherInfo.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-spinner fa-spin"></i>
                正在获取天气信息...
            </div>
        `;
        
        refreshBtn.disabled = true;
        
        // 获取用户位置
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // 使用Open-Meteo免费API（不需要API密钥）
        const response = await fetch(
            `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`
        );
        
        if (!response.ok) {
            throw new Error('天气API请求失败');
        }
        
        const data = await response.json();
        
        // 更新天气显示
        updateWeatherDisplay(data);
        
        // 更新时间
        const now = new Date();
        weatherTime.textContent = `更新时间: ${now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}`;
        
    } catch (error) {
        console.error('获取天气信息失败:', error);
        showWeatherError('无法获取当前位置，使用默认位置...');
        // 使用默认位置（北京）
        getWeatherByCity('Beijing');
    } finally {
        refreshBtn.disabled = false;
    }
}

// 获取当前位置
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持地理位置功能'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
        });
    });
}

// 根据城市获取天气
async function getWeatherByCity(city) {
    try {
        // 先获取城市坐标
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=zh&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('城市未找到');
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];
        
        // 获取天气数据
        const weatherResponse = await fetch(
            `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`
        );
        
        const weatherData = await weatherResponse.json();
        
        // 添加城市信息
        weatherData.city = name;
        weatherData.country = country;
        
        updateWeatherDisplay(weatherData);
    } catch (error) {
        console.error('获取城市天气失败:', error);
        showWeatherError('天气服务暂时不可用，请稍后重试');
    }
}

// 根据天气代码获取天气状况
function getWeatherFromCode(code) {
    // WMO天气代码映射
    if (code === 0) return { condition: 'clear', description: '晴朗' };
    if (code === 1 || code === 2 || code === 3) return { condition: 'partly-cloudy', description: '少云' };
    if (code === 45 || code === 48) return { condition: 'fog', description: '雾' };
    if (code === 51 || code === 53 || code === 55) return { condition: 'drizzle', description: '毛毛雨' };
    if (code === 56 || code === 57) return { condition: 'drizzle', description: '冻毛毛雨' };
    if (code === 61 || code === 63 || code === 65) return { condition: 'rain', description: '下雨' };
    if (code === 66 || code === 67) return { condition: 'rain', description: '冻雨' };
    if (code === 71 || code === 73 || code === 75) return { condition: 'snow', description: '下雪' };
    if (code === 77) return { condition: 'snow', description: '雪粒' };
    if (code === 80 || code === 81 || code === 82) return { condition: 'rain', description: '阵雨' };
    if (code === 85 || code === 86) return { condition: 'snow', description: '阵雪' };
    if (code === 95) return { condition: 'thunderstorm', description: '雷雨' };
    if (code === 96 || code === 99) return { condition: 'thunderstorm', description: '雷暴' };
    
    return { condition: 'cloudy', description: '多云' };
}

// 更新天气显示
function updateWeatherDisplay(data) {
    const weatherInfo = document.getElementById('weatherInfo');
    
    // 获取天气信息
    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const pressure = Math.round(current.pressure_msl);
    const windSpeed = current.wind_speed_10m;
    
    // 获取天气状况
    const weatherCode = current.weather_code;
    const weatherInfoFromCode = getWeatherFromCode(weatherCode);
    const condition = weatherInfoFromCode.condition;
    const description = weatherInfoFromCode.description;
    
    // 获取城市信息
    const city = data.city || '未知城市';
    const country = data.country || '';
    
    // 获取天气图标
    const iconClass = weatherIcons[condition] || 'fas fa-cloud';
    
    // 构建天气HTML
    weatherInfo.innerHTML = `
        <div class="weather-data">
            <div class="weather-location">
                <i class="fas fa-map-marker-alt"></i>
                ${city}${country ? ', ' + country : ''}
            </div>
            
            <div class="weather-main">
                <div class="weather-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="weather-temp">
                    ${temp}°C
                </div>
            </div>
            
            <div class="weather-desc">
                ${description}
            </div>
            
            <div class="weather-details">
                <div class="weather-detail">
                    <i class="fas fa-temperature-low"></i>
                    体感: ${feelsLike}°C
                </div>
                <div class="weather-detail">
                    <i class="fas fa-tint"></i>
                    湿度: ${humidity}%
                </div>
                <div class="weather-detail">
                    <i class="fas fa-wind"></i>
                    风速: ${windSpeed} km/h
                </div>
                <div class="weather-detail">
                    <i class="fas fa-tachometer-alt"></i>
                    气压: ${pressure} hPa
                </div>
            </div>
        </div>
    `;
}

// 显示天气错误
function showWeatherError(message) {
    const weatherInfo = document.getElementById('weatherInfo');
    
    weatherInfo.innerHTML = `
        <div class="weather-error">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>获取天气信息失败</h4>
            <p>${message}</p>
            <p>请检查网络连接或稍后重试</p>
        </div>
    `;
}

// 使用备用天气API（如果主API失败）
async function getWeatherWithFallback() {
    try {
        await getWeatherData();
    } catch (error) {
        console.log('主天气API失败，尝试备用API...');
        await getWeatherByCity('Beijing');
    }
}

// 初始化天气功能
function initWeather() {
    const refreshBtn = document.getElementById('refreshWeather');
    
    // 添加刷新按钮事件
    if (refreshBtn) {
        refreshBtn.addEventListener('click', getWeatherWithFallback);
        
        // 页面加载时获取天气
        getWeatherWithFallback();
        
        // 每30分钟自动刷新天气
        setInterval(getWeatherWithFallback, 30 * 60 * 1000);
    }
}

// 页面加载完成后初始化天气
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点时间再初始化天气，避免影响页面加载
    setTimeout(initWeather, 1000);
});
