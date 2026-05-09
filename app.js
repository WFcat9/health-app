// 健康生活助手 Pro - 主要功能实现

// ==================== 全局变量 ====================
let currentUser = null;
let healthData = {
    habits: {
        sleep: { streak: 0, lastCheck: null, checked: false },
        wake: { streak: 0, lastCheck: null, checked: false },
        exercise: { streak: 0, lastCheck: null, checked: false },
        water: { streak: 0, lastCheck: null, todayIntake: 0, checked: false },
        diet: { streak: 0, lastCheck: null, checked: false }
    },
    sleepRecords: [],
    waterRecords: [],
    phaseProgress: {
        phase1: 0,
        phase2: 0,
        phase3: 0
    },
    videoProgress: {}
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('健康生活助手 Pro 初始化...');
    loadData();
    checkAuth();
    setupEventListeners();
    updateDate();
    loadDailyQuote();
    startReminders();
});

// ==================== 认证系统 ====================
function checkAuth() {
    const savedUser = localStorage.getItem('healthAppUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // 更新用户信息
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('welcome-name').textContent = currentUser.name;
    }
    
    // 更新显示
    updateDisplay();
}

function switchAuthTab(tab) {
    // 更新标签样式
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // 显示对应表单
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tab + '-form').classList.add('active');
}

function closeAuthModal() {
    // 如果已登录，关闭模态框
    if (currentUser) {
        document.getElementById('auth-modal').classList.add('hidden');
    }
}

// 登录表单提交
document.addEventListener('submit', function(e) {
    if (e.target.id === 'login-form') {
        e.preventDefault();
        handleLogin();
    } else if (e.target.id === 'register-form') {
        e.preventDefault();
        handleRegister();
    } else if (e.target.id === 'sleep-form') {
        e.preventDefault();
        recordSleepData();
    } else if (e.target.id === 'water-form') {
        e.preventDefault();
        recordWaterData();
    }
});

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // 从localStorage获取用户数据
    const users = JSON.parse(localStorage.getItem('healthAppUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('healthAppUser', JSON.stringify(user));
        showApp();
        showNotification('登录成功！欢迎回来，' + user.name + '！', 'success');
    } else {
        showNotification('邮箱或密码错误！', 'error');
    }
}

function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // 验证
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致！', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('密码长度至少6位！', 'error');
        return;
    }
    
    // 检查邮箱是否已存在
    const users = JSON.parse(localStorage.getItem('healthAppUsers') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('该邮箱已注册！', 'error');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('healthAppUsers', JSON.stringify(users));
    
    // 自动登录
    currentUser = newUser;
    localStorage.setItem('healthAppUser', JSON.stringify(newUser));
    
    showApp();
    showNotification('注册成功！欢迎，' + name + '！', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('healthAppUser');
    showAuthModal();
    showNotification('已退出登录', 'info');
}

// ==================== 导航系统 ====================
function setupEventListeners() {
    // 导航链接点击
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // 更新导航链接样式
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // 显示对应部分
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // 添加动画效果
    document.getElementById(sectionName + '-section').style.animation = 'fadeIn 0.5s ease';
}

// ==================== 习惯打卡系统 ====================
function checkHabit(habitType) {
    const today = new Date().toDateString();
    
    // 如果今天已经打卡，则不再重复打卡
    if (healthData.habits[habitType].lastCheck === today) {
        showNotification('今天已经打卡过了！明天再来吧。', 'info');
        return;
    }
    
    // 更新连续打卡天数
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (healthData.habits[habitType].lastCheck === yesterdayStr) {
        healthData.habits[habitType].streak++;
    } else if (healthData.habits[habitType].lastCheck !== today) {
        // 如果昨天没有打卡，重置连续天数
        healthData.habits[habitType].streak = 1;
    }
    
    // 更新最后打卡日期和状态
    healthData.habits[habitType].lastCheck = today;
    healthData.habits[habitType].checked = true;
    
    // 特殊习惯处理
    if (habitType === 'water') {
        // 饮水习惯需要记录饮水量
        openWaterModal();
        return;
    }
    
    // 播放打卡动画
    playCheckAnimation(habitType);
    
    // 保存数据并更新显示
    saveData();
    updateDisplay();
    
    // 显示成功消息
    showNotification(`${getHabitName(habitType)}打卡成功！连续打卡：${healthData.habits[habitType].streak}天`, 'success');
    
    // 更新阶段进度
    updatePhaseProgress();
    
    // 检查是否完成所有今日习惯
    checkAllHabitsCompleted();
}

function playCheckAnimation(habitType) {
    const card = document.querySelector(`[data-habit="${habitType}"]`);
    const checkIcon = document.getElementById(`${habitType}-check`);
    const statusElement = document.getElementById(`${habitType}-status`);
    
    if (card && checkIcon) {
        // 添加打卡样式
        card.classList.add('checked');
        
        // 显示对勾动画
        setTimeout(() => {
            checkIcon.style.opacity = '1';
            checkIcon.style.transform = 'scale(1)';
        }, 100);
        
        // 更新状态文本
        if (statusElement) {
            statusElement.textContent = '已打卡';
            statusElement.style.background = 'var(--success)';
            statusElement.style.color = 'white';
        }
        
        // 卡片弹跳动画
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}

function getHabitName(habitType) {
    const names = {
        sleep: '早睡习惯',
        wake: '早起习惯',
        exercise: '锻炼习惯',
        water: '喝水习惯',
        diet: '健康饮食习惯'
    };
    return names[habitType] || habitType;
}

function checkAllHabitsCompleted() {
    const today = new Date().toDateString();
    const allHabits = ['sleep', 'wake', 'exercise', 'water', 'diet'];
    const completedToday = allHabits.filter(h => healthData.habits[h].lastCheck === today).length;
    
    // 更新首页统计
    const todayCompletedElement = document.getElementById('today-completed');
    if (todayCompletedElement) {
        todayCompletedElement.textContent = `${completedToday}/5`;
    }
    
    // 如果全部完成，显示祝贺消息
    if (completedToday === 5) {
        setTimeout(() => {
            showNotification('🎉 恭喜！今天的所有健康习惯都完成了！太棒了！', 'success');
        }, 1000);
    }
}

// ==================== 数据记录系统 ====================
function openSleepModal() {
    document.getElementById('sleep-modal').classList.add('active');
}

function closeSleepModal() {
    document.getElementById('sleep-modal').classList.remove('active');
}

function openWaterModal() {
    document.getElementById('water-modal').classList.add('active');
}

function closeWaterModal() {
    document.getElementById('water-modal').classList.remove('active');
}

function recordSleepData() {
    const sleepTime = document.getElementById('sleep-time-input').value;
    const wakeTime = document.getElementById('wake-time-input').value;
    
    if (!sleepTime || !wakeTime) {
        showNotification('请填写完整的睡眠时间！', 'error');
        return;
    }
    
    // 计算睡眠时长
    const sleepDateTime = new Date(`2000-01-01T${sleepTime}`);
    let wakeDateTime = new Date(`2000-01-01T${wakeTime}`);
    
    // 如果起床时间小于入睡时间，说明跨天了
    if (wakeDateTime < sleepDateTime) {
        wakeDateTime = new Date(`2000-01-02T${wakeTime}`);
    }
    
    const duration = (wakeDateTime - sleepDateTime) / (1000 * 60 * 60); // 小时
    
    // 保存睡眠记录
    const record = {
        date: new Date().toISOString().split('T')[0],
        sleepTime: sleepTime,
        wakeTime: wakeTime,
        duration: duration.toFixed(1)
    };
    
    healthData.sleepRecords.push(record);
    
    // 更新显示
    document.getElementById('sleep-duration').textContent = `${duration.toFixed(1)} 小时`;
    document.getElementById('sleep-time').textContent = sleepTime;
    document.getElementById('wake-time').textContent = wakeTime;
    document.getElementById('sleep-time-display').textContent = sleepTime;
    
    // 保存数据
    saveData();
    
    // 关闭模态框
    closeSleepModal();
    
    // 显示成功消息
    showNotification(`睡眠记录成功！\n入睡时间：${sleepTime}\n起床时间：${wakeTime}\n睡眠时长：${duration.toFixed(1)}小时`, 'success');
    
    // 检查是否达到早睡目标
    const sleepHour = parseInt(sleepTime.split(':')[0]);
    if (sleepHour >= 22 || sleepHour <= 23) {
        setTimeout(() => {
            showNotification('🌙 恭喜！你在23:00前入睡，符合早睡目标！', 'success');
        }, 1500);
    }
}

function recordWaterData() {
    const amount = parseInt(document.getElementById('water-amount').value);
    
    if (!amount || amount <= 0) {
        showNotification('请输入有效的饮水量！', 'error');
        return;
    }
    
    // 更新今日饮水量
    healthData.habits.water.todayIntake += amount;
    
    // 保存饮水记录
    const record = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        amount: amount
    };
    
    healthData.waterRecords.push(record);
    
    // 保存数据并更新显示
    saveData();
    updateDisplay();
    
    // 关闭模态框
    closeWaterModal();
    
    // 显示成功消息
    showNotification(`饮水记录成功！\n今日饮水量：${healthData.habits.water.todayIntake}杯`, 'success');
    
    // 检查是否达到饮水目标
    if (healthData.habits.water.todayIntake >= 8) {
        setTimeout(() => {
            showNotification('💧 恭喜！你已达到每日8杯水的目标！', 'success');
        }, 1500);
    }
}

// ==================== 视频系统 ====================
const videoData = [
    {
        id: 1,
        title: '科学改善睡眠质量',
        description: '本视频将教你如何通过科学方法改善睡眠质量，包括睡前准备、睡眠环境优化等。',
        category: 'sleep',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '10:25',
        views: '12.5万'
    },
    {
        id: 2,
        title: '健康饮食指南',
        description: '学习如何搭配营养均衡的饮食，减少重盐重油，增加蔬菜水果摄入。',
        category: 'diet',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '15:30',
        views: '8.3万'
    },
    {
        id: 3,
        title: '居家锻炼教程',
        description: '适合初学者的居家锻炼教程，无需器械，每天30分钟即可。',
        category: 'exercise',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '20:15',
        views: '15.7万'
    },
    {
        id: 4,
        title: '冥想放松入门',
        description: '学习基础冥想技巧，帮助放松身心，改善睡眠质量。',
        category: 'meditation',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '12:40',
        views: '9.1万'
    },
    {
        id: 5,
        title: '早睡早起养成术',
        description: '如何逐步调整作息时间，建立健康的睡眠习惯。',
        category: 'sleep',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '18:20',
        views: '11.2万'
    },
    {
        id: 6,
        title: '健康早餐制作',
        description: '学习制作简单健康的早餐，为一天提供充足能量。',
        category: 'diet',
        thumbnail: 'https://img.youtube.com/vi/6o2bz5Rk0WY/maxresdefault.jpg',
        videoId: '6o2bz5Rk0WY',
        duration: '14:35',
        views: '7.8万'
    }
];

function loadVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = '';
    
    videoData.forEach(video => {
        const videoCard = createVideoCard(video);
        videoGrid.appendChild(videoCard);
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-category', video.category);
    card.onclick = () => playVideo(video);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="play-button">
                <i class="fas fa-play"></i>
            </div>
            <div class="video-duration">${video.duration}</div>
        </div>
        <div class="video-info">
            <h4>${video.title}</h4>
            <p>${video.views}次观看 · ${getCategoryName(video.category)}</p>
        </div>
    `;
    
    return card;
}

function getCategoryName(category) {
    const names = {
        sleep: '睡眠改善',
        diet: '健康饮食',
        exercise: '运动健身',
        meditation: '冥想放松'
    };
    return names[category] || category;
}

function filterVideos(category) {
    // 更新按钮样式
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 过滤视频
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

function playVideo(video) {
    // 如果是字符串，说明是从首页调用的
    if (typeof video === 'string') {
        const videoMap = {
            sleep: videoData[0],
            diet: videoData[1],
            exercise: videoData[2]
        };
        video = videoMap[video] || videoData[0];
    }
    
    // 设置视频播放器
    const videoFrame = document.getElementById('video-frame');
    videoFrame.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
    
    // 设置视频详情
    document.getElementById('video-title').textContent = video.title;
    document.getElementById('video-description').textContent = video.description;
    
    // 显示视频模态框
    document.getElementById('video-modal').classList.add('active');
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.remove('active');
    document.getElementById('video-frame').src = '';
}

// ==================== 阶段进度更新 ====================
function updatePhaseProgress() {
    // 计算各阶段进度
    const habits = healthData.habits;
    
    // 第一阶段：调整作息时间
    let phase1Score = 0;
    if (habits.sleep.streak > 0) phase1Score += 33;
    if (habits.wake.streak > 0) phase1Score += 33;
    if (healthData.sleepRecords.length > 0) {
        const lastRecord = healthData.sleepRecords[healthData.sleepRecords.length - 1];
        const sleepHour = parseInt(lastRecord.sleepTime.split(':')[0]);
        if (sleepHour >= 22 && sleepHour <= 23) phase1Score += 34;
    }
    healthData.phaseProgress.phase1 = Math.min(phase1Score, 100);
    
    // 第二阶段：改善饮食习惯
    let phase2Score = 0;
    if (habits.diet.streak > 0) phase2Score += 50;
    if (habits.water.streak > 0) phase2Score += 50;
    healthData.phaseProgress.phase2 = Math.min(phase2Score, 100);
    
    // 第三阶段：增加身体活动
    let phase3Score = 0;
    if (habits.exercise.streak > 0) phase3Score += 100;
    healthData.phaseProgress.phase3 = Math.min(phase3Score, 100);
    
    // 保存数据并更新显示
    saveData();
    updatePhaseDisplay();
}

function updatePhaseDisplay() {
    // 更新阶段进度条
    for (let i = 1; i <= 3; i++) {
        const progressBar = document.getElementById(`phase${i}-progress`);
        const progressText = document.getElementById(`phase${i}-text`);
        if (progressBar && progressText) {
            const progress = healthData.phaseProgress[`phase${i}`];
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
    }
}

// ==================== 显示更新 ====================
function updateDisplay() {
    // 更新习惯打卡显示
    for (const habit in healthData.habits) {
        const streakElement = document.getElementById(`${habit}-streak`);
        if (streakElement) {
            streakElement.textContent = healthData.habits[habit].streak;
        }
        
        // 检查今天是否已打卡
        const today = new Date().toDateString();
        if (healthData.habits[habit].lastCheck === today) {
            const card = document.querySelector(`[data-habit="${habit}"]`);
            const checkIcon = document.getElementById(`${habit}-check`);
            const statusElement = document.getElementById(`${habit}-status`);
            
            if (card && checkIcon) {
                card.classList.add('checked');
                checkIcon.style.opacity = '1';
                checkIcon.style.transform = 'scale(1)';
                
                if (statusElement) {
                    statusElement.textContent = '已打卡';
                    statusElement.style.background = 'var(--success)';
                    statusElement.style.color = 'white';
                }
            }
        }
    }
    
    // 更新饮水显示
    const waterIntakeElement = document.getElementById('water-intake');
    if (waterIntakeElement) {
        waterIntakeElement.textContent = `${healthData.habits.water.todayIntake} 杯`;
    }
    
    const waterIntakeDisplay = document.getElementById('water-intake-display');
    if (waterIntakeDisplay) {
        waterIntakeDisplay.textContent = `${healthData.habits.water.todayIntake} 杯`;
    }
    
    const waterFillElement = document.getElementById('water-fill');
    if (waterFillElement) {
        const percentage = (healthData.habits.water.todayIntake / 8) * 100;
        waterFillElement.style.height = `${percentage}%`;
    }
    
    const waterTextElement = document.getElementById('water-text');
    if (waterTextElement) {
        waterTextElement.textContent = `${healthData.habits.water.todayIntake}/8 杯`;
    }
    
    // 更新阶段进度显示
    updatePhaseDisplay();
    
    // 更新首页统计
    updateQuickStats();
    
    // 加载视频
    loadVideos();
}

function updateQuickStats() {
    // 更新总连续天数
    const totalStreakElement = document.getElementById('total-streak');
    if (totalStreakElement) {
        const streaks = Object.values(healthData.habits).map(h => h.streak);
        const maxStreak = Math.max(...streaks);
        totalStreakElement.textContent = maxStreak;
    }
    
    // 更新今日完成习惯
    checkAllHabitsCompleted();
    
    // 更新睡眠显示
    if (healthData.sleepRecords.length > 0) {
        const lastRecord = healthData.sleepRecords[healthData.sleepRecords.length - 1];
        const sleepTimeDisplay = document.getElementById('sleep-time-display');
        if (sleepTimeDisplay) {
            sleepTimeDisplay.textContent = lastRecord.sleepTime;
        }
    }
}

// ==================== 工具函数 ====================
function updateDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateElement.textContent = now.toLocaleDateString('zh-CN', options);
    }
}

function loadDailyQuote() {
    const quotes = [
        { text: '健康不是一切，但没有健康就没有一切。', author: '佚名' },
        { text: '健康的身体是灵魂的客厅，病弱的身体是灵魂的监狱。', author: '培根' },
        { text: '早睡早起使人健康、富有和聪明。', author: '富兰克林' },
        { text: '运动是一切生命的源泉。', author: '达·芬奇' },
        { text: '健康是人生第一财富。', author: '爱默生' },
        { text: '今天的不健康，是昨天不良生活习惯的累积。', author: '佚名' },
        { text: '改变习惯的过程虽然痛苦，但结果会是幸福的。', author: '佚名' }
    ];
    
    const today = new Date().getDate();
    const quote = quotes[today % quotes.length];
    
    const quoteElement = document.getElementById('daily-quote');
    const authorElement = document.querySelector('.quote-author');
    
    if (quoteElement && authorElement) {
        quoteElement.textContent = quote.text;
        authorElement.textContent = `— ${quote.author}`;
    }
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;
    
    // 添加图标
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    notification.innerHTML = `<i class="fas fa-${icon}" style="margin-right: 10px; color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function startReminders() {
    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // 每分钟检查一次提醒
    setInterval(checkReminders, 60000);
    checkReminders();
}

function checkReminders() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute;
    
    // 定义提醒时间
    const reminders = [
        { time: 800, title: '早起提醒', message: '新的一天开始了！喝一杯温水，做5分钟伸展运动' },
        { time: 1200, title: '午餐提醒', message: '健康午餐时间！注意减少重盐重油，多吃蔬菜' },
        { time: 1500, title: '下午茶提醒', message: '下午茶时间！喝一杯茶或水，避免含糖饮料' },
        { time: 1700, title: '运动提醒', message: '运动时间！散步15-30分钟，或做简单锻炼' },
        { time: 2200, title: '睡前提醒', message: '准备睡觉！避免使用电子设备，喝一杯温牛奶' }
    ];
    
    // 检查每个提醒
    reminders.forEach(reminder => {
        if (currentTime >= reminder.time && currentTime < reminder.time + 5) {
            // 显示浏览器通知
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(reminder.title, {
                    body: reminder.message,
                    icon: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/svgs/solid/heartbeat.svg'
                });
            }
            
            // 显示应用内通知
            showNotification(`${reminder.title}：${reminder.message}`, 'info');
        }
    });
}

// ==================== 数据持久化 ====================
function saveData() {
    if (currentUser) {
        const key = `healthAppData_${currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(healthData));
    }
}

function loadData() {
    if (currentUser) {
        const key = `healthAppData_${currentUser.id}`;
        const savedData = localStorage.getItem(key);
        if (savedData) {
            healthData = JSON.parse(savedData);
        }
    }
}

// ==================== 添加CSS动画 ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .notification {
        font-family: 'Noto Sans SC', sans-serif;
        font-size: 0.95rem;
        line-height: 1.5;
    }
`;
document.head.appendChild(style);

console.log('健康生活助手 Pro 已加载完成！');