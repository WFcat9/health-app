// 健康生活助手 Pro - 修复版（真正可用的版本）

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
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('健康生活助手 Pro 初始化...');
    loadData();
    checkAuth();
    setupEventListeners();
    updateDate();
    loadDailyQuote();
});

// ==================== 认证系统（修复版）====================
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
    
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('welcome-name').textContent = currentUser.name;
    }
    
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
    // 只有已登录的用户才能关闭模态框
    if (currentUser) {
        document.getElementById('auth-modal').classList.add('hidden');
    } else {
        alert('请先登录或注册！');
    }
}

// 登录功能（修复版）
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('请填写完整的登录信息！');
        return;
    }
    
    // 从localStorage获取用户数据
    const users = JSON.parse(localStorage.getItem('healthAppUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('healthAppUser', JSON.stringify(user));
        showApp();
        alert('登录成功！欢迎回来，' + user.name + '！');
    } else {
        alert('邮箱或密码错误！请检查后重试。');
    }
}

// 注册功能（修复版）
function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // 验证
    if (!name || !email || !password || !confirmPassword) {
        alert('请填写完整的注册信息！');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度至少6位！');
        return;
    }
    
    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('请输入有效的邮箱地址！');
        return;
    }
    
    // 检查邮箱是否已存在
    const users = JSON.parse(localStorage.getItem('healthAppUsers') || '[]');
    if (users.find(u => u.email === email)) {
        alert('该邮箱已注册！请直接登录。');
        switchAuthTab('login');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: 'user_' + Date.now(),
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
    alert('注册成功！欢迎，' + name + '！\n\n现在你可以开始使用健康生活助手了。');
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        currentUser = null;
        localStorage.removeItem('healthAppUser');
        showAuthModal();
        alert('已退出登录');
    }
}

// ==================== 表单提交处理（修复版）====================
document.addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止表单默认提交行为
    
    if (e.target.id === 'login-form') {
        handleLogin();
    } else if (e.target.id === 'register-form') {
        handleRegister();
    } else if (e.target.id === 'sleep-form') {
        recordSleepData();
    } else if (e.target.id === 'water-form') {
        recordWaterData();
    }
});

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
    
    // 为登录和注册表单添加事件监听
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
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
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ==================== 习惯打卡系统（修复版）====================
function checkHabit(habitType) {
    if (!currentUser) {
        alert('请先登录！');
        return;
    }
    
    const today = new Date().toDateString();
    
    // 如果今天已经打卡，则不再重复打卡
    if (healthData.habits[habitType].lastCheck === today) {
        alert('今天已经打卡过了！明天再来吧。');
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
    alert(`${getHabitName(habitType)}打卡成功！\n连续打卡：${healthData.habits[habitType].streak}天`);
    
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
        card.classList.add('checked');
        checkIcon.style.opacity = '1';
        checkIcon.style.transform = 'scale(1)';
        
        if (statusElement) {
            statusElement.textContent = '已打卡';
            statusElement.style.background = '#28a745';
            statusElement.style.color = 'white';
        }
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
    
    const todayCompletedElement = document.getElementById('today-completed');
    if (todayCompletedElement) {
        todayCompletedElement.textContent = `${completedToday}/5`;
    }
    
    if (completedToday === 5) {
        setTimeout(() => {
            alert('🎉 恭喜！今天的所有健康习惯都完成了！太棒了！');
        }, 500);
    }
}

// ==================== 数据记录系统（修复版）====================
function openSleepModal() {
    document.getElementById('sleep-modal').style.display = 'flex';
}

function closeSleepModal() {
    document.getElementById('sleep-modal').style.display = 'none';
}

function openWaterModal() {
    document.getElementById('water-modal').style.display = 'flex';
}

function closeWaterModal() {
    document.getElementById('water-modal').style.display = 'none';
}

function recordSleepData() {
    const sleepTime = document.getElementById('sleep-time-input').value;
    const wakeTime = document.getElementById('wake-time-input').value;
    
    if (!sleepTime || !wakeTime) {
        alert('请填写完整的睡眠时间！');
        return;
    }
    
    // 计算睡眠时长
    const sleepDateTime = new Date(`2000-01-01T${sleepTime}`);
    let wakeDateTime = new Date(`2000-01-01T${wakeTime}`);
    
    if (wakeDateTime < sleepDateTime) {
        wakeDateTime = new Date(`2000-01-02T${wakeTime}`);
    }
    
    const duration = (wakeDateTime - sleepDateTime) / (1000 * 60 * 60);
    
    const record = {
        date: new Date().toISOString().split('T')[0],
        sleepTime: sleepTime,
        wakeTime: wakeTime,
        duration: duration.toFixed(1)
    };
    
    healthData.sleepRecords.push(record);
    
    // 更新显示
    const sleepDurationElement = document.getElementById('sleep-duration');
    const sleepTimeElement = document.getElementById('sleep-time');
    const wakeTimeElement = document.getElementById('wake-time');
    const sleepTimeDisplayElement = document.getElementById('sleep-time-display');
    
    if (sleepDurationElement) sleepDurationElement.textContent = `${duration.toFixed(1)} 小时`;
    if (sleepTimeElement) sleepTimeElement.textContent = sleepTime;
    if (wakeTimeElement) wakeTimeElement.textContent = wakeTime;
    if (sleepTimeDisplayElement) sleepTimeDisplayElement.textContent = sleepTime;
    
    saveData();
    closeSleepModal();
    
    alert(`睡眠记录成功！\n入睡时间：${sleepTime}\n起床时间：${wakeTime}\n睡眠时长：${duration.toFixed(1)}小时`);
    
    const sleepHour = parseInt(sleepTime.split(':')[0]);
    if (sleepHour >= 22 || sleepHour <= 23) {
        setTimeout(() => {
            alert('🌙 恭喜！你在23:00前入睡，符合早睡目标！');
        }, 500);
    }
}

function recordWaterData() {
    const amount = parseInt(document.getElementById('water-amount').value);
    
    if (!amount || amount <= 0) {
        alert('请输入有效的饮水量！');
        return;
    }
    
    healthData.habits.water.todayIntake += amount;
    
    const record = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        amount: amount
    };
    
    healthData.waterRecords.push(record);
    
    saveData();
    updateDisplay();
    closeWaterModal();
    
    alert(`饮水记录成功！\n今日饮水量：${healthData.habits.water.todayIntake}杯`);
    
    if (healthData.habits.water.todayIntake >= 8) {
        setTimeout(() => {
            alert('💧 恭喜！你已达到每日8杯水的目标！');
        }, 500);
    }
}

// ==================== 视频系统（简化版）====================
const videoData = [
    {
        id: 1,
        title: '科学改善睡眠质量',
        description: '本视频将教你如何通过科学方法改善睡眠质量。',
        category: 'sleep',
        thumbnail: 'https://via.placeholder.com/300x180?text=Sleep+Video',
        videoId: '6o2bz5Rk0WY',
        duration: '10:25'
    },
    {
        id: 2,
        title: '健康饮食指南',
        description: '学习如何搭配营养均衡的饮食。',
        category: 'diet',
        thumbnail: 'https://via.placeholder.com/300x180?text=Diet+Video',
        videoId: '6o2bz5Rk0WY',
        duration: '15:30'
    },
    {
        id: 3,
        title: '居家锻炼教程',
        description: '适合初学者的居家锻炼教程。',
        category: 'exercise',
        thumbnail: 'https://via.placeholder.com/300x180?text=Exercise+Video',
        videoId: '6o2bz5Rk0WY',
        duration: '20:15'
    }
];

function loadVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = '';
    
    videoData.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.setAttribute('data-category', video.category);
        videoCard.onclick = () => playVideo(video);
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-duration">${video.duration}</div>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.views || '0'}次观看 · ${getCategoryName(video.category)}</p>
            </div>
        `;
        
        videoGrid.appendChild(videoCard);
    });
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
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function playVideo(video) {
    if (typeof video === 'string') {
        const videoMap = {
            sleep: videoData[0],
            diet: videoData[1],
            exercise: videoData[2]
        };
        video = videoMap[video] || videoData[0];
    }
    
    const videoFrame = document.getElementById('video-frame');
    if (videoFrame) {
        videoFrame.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
    }
    
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    
    if (videoTitle) videoTitle.textContent = video.title;
    if (videoDescription) videoDescription.textContent = video.description;
    
    document.getElementById('video-modal').classList.add('active');
}

function closeVideoModal() {
    document.getElementById('video-modal').classList.remove('active');
    const videoFrame = document.getElementById('video-frame');
    if (videoFrame) {
        videoFrame.src = '';
    }
}

// ==================== 阶段进度更新 ====================
function updatePhaseProgress() {
    const habits = healthData.habits;
    
    let phase1Score = 0;
    if (habits.sleep.streak > 0) phase1Score += 33;
    if (habits.wake.streak > 0) phase1Score += 33;
    if (healthData.sleepRecords.length > 0) {
        const lastRecord = healthData.sleepRecords[healthData.sleepRecords.length - 1];
        const sleepHour = parseInt(lastRecord.sleepTime.split(':')[0]);
        if (sleepHour >= 22 && sleepHour <= 23) phase1Score += 34;
    }
    healthData.phaseProgress.phase1 = Math.min(phase1Score, 100);
    
    let phase2Score = 0;
    if (habits.diet.streak > 0) phase2Score += 50;
    if (habits.water.streak > 0) phase2Score += 50;
    healthData.phaseProgress.phase2 = Math.min(phase2Score, 100);
    
    let phase3Score = 0;
    if (habits.exercise.streak > 0) phase3Score += 100;
    healthData.phaseProgress.phase3 = Math.min(phase3Score, 100);
    
    saveData();
    updatePhaseDisplay();
}

function updatePhaseDisplay() {
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
    for (const habit in healthData.habits) {
        const streakElement = document.getElementById(`${habit}-streak`);
        if (streakElement) {
            streakElement.textContent = healthData.habits[habit].streak;
        }
        
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
                    statusElement.style.background = '#28a745';
                    statusElement.style.color = 'white';
                }
            }
        }
    }
    
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
    
    updatePhaseDisplay();
    updateQuickStats();
    loadVideos();
}

function updateQuickStats() {
    const totalStreakElement = document.getElementById('total-streak');
    if (totalStreakElement) {
        const streaks = Object.values(healthData.habits).map(h => h.streak);
        const maxStreak = Math.max(...streaks);
        totalStreakElement.textContent = maxStreak;
    }
    
    checkAllHabitsCompleted();
    
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
        { text: '早睡早起使人健康、富有和聪明。', author: '富兰克林' },
        { text: '运动是一切生命的源泉。', author: '达·芬奇' },
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

console.log('健康生活助手 Pro 修复版已加载完成！');