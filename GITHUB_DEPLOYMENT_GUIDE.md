# 🚀 GitHub Pages 部署指南 - 健康生活助手

## 📋 目录
1. [准备工作](#准备工作)
2. [方法一：网页界面上传（推荐新手）](#方法一网页界面上传推荐新手)
3. [方法二：Git 命令行上传（推荐开发者）](#方法二git-命令行上传推荐开发者)
4. [启用 GitHub Pages](#启用-github-pages)
5. [访问您的网站](#访问您的网站)
6. [常见问题解决](#常见问题解决)
7. [更新网站内容](#更新网站内容)

---

## 🎯 准备工作

### 需要准备的东西：
✅ 一个 GitHub 账号（免费注册：https://github.com）
✅ 您的网站文件（已全部准备好）

### 您的文件清单：
```
health-app-v2/
├── index.html          # 主页面（登录+主功能合一）
├── login-final.html   # 登录页面
├── main-final.html    # 主页（登录后）
├── plan.html          # 健康计划页面
├── habits.html        # 习惯打卡页面
├── data.html         # 健康数据页面
├── videos.html       # 健康视频页面
├── style.css         # 样式文件
├── app-fixed.js      # JavaScript 文件
└── README.md         # 说明文档
```

---

## 🌟 方法一：网页界面上传（推荐新手）

### 第1步：注册/登录 GitHub
1. 访问 https://github.com
2. 点击右上角 **"Sign up"** 注册账号（或 **"Sign in"** 登录）
3. 填写用户名、邮箱、密码完成注册

### 第2步：创建新仓库（Repository）
1. 登录后，点击右上角 **"+"** 号图标
2. 选择 **"New repository"**

**重要设置：**
- **Repository name（仓库名）**：输入 `health-app` 或 `health-website`
  - 这个名称会变成您网站地址的一部分
  - 例如：`https://您的用户名.github.io/health-app`
- **Description（描述）**：输入 `健康生活助手 - 智能健康管理平台`
- **Public（公开）**：✅ 必须选中（否则无法使用 GitHub Pages）
- **Add a README file**：❌ 不要勾选（我们要上传自己的文件）

3. 点击 **"Create repository"** 创建仓库

### 第3步：上传文件

**方式A：直接拖拽上传（最简单）**

1. 在新建的仓库页面，点击 **"uploading an existing file"** 链接
2. 打开您电脑上的 `health-app-v2` 文件夹
3. **选中所有文件**（Ctrl + A）
4. **拖拽到 GitHub 网页中**
5. 等待文件上传完成（进度条显示 100%）

**方式B：逐个上传**

1. 点击仓库页面的 **"Add file"** → **"Upload files"**
2. 点击 **"choose your files"** 选择文件
3. 重复直到所有文件都上传完成

### 第4步：提交文件

1. 在页面底部找到 **"Commit changes"** 区域
2. **Commit message（提交信息）**：输入 `Initial commit - 健康生活助手 v2`
3. 确保选中 **"Commit directly to the main branch"**
4. 点击 **"Commit changes"** 按钮

**⏳ 等待 10-30 秒，文件上传完成！**

---

## 🔧 方法二：Git 命令行上传（推荐开发者）

### 第1步：安装 Git（如果还没有）
- Windows：下载 https://git-scm.com/download/win
- 安装时全部保持默认选项

### 第2步：配置 Git（首次使用需要）
```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

### 第3步：克隆仓库到本地
1. 在 GitHub 仓库页面，点击 **"Code"** 绿色按钮
2. 复制仓库地址（例如：`https://github.com/用户名/health-app.git`）

3. 打开命令行（终端），执行：
```bash
# 进入您的项目文件夹
cd "D:\Users\jia\Documents\WXWork\新建文件夹\health-app-v2"

# 初始化 Git 仓库
git init

# 添加远程仓库（替换成您的仓库地址）
git remote add origin https://github.com/用户名/health-app.git

# 添加所有文件
git add .

# 提交文件
git commit -m "Initial commit - 健康生活助手 v2"

# 推送到 GitHub
git push -u origin main
```

**首次推送需要输入 GitHub 用户名和密码（或 Token）**

---

## ⚙️ 启用 GitHub Pages

### 第1步：进入仓库设置
1. 在 GitHub 仓库页面，点击顶部导航栏的 **"Settings"**

### 第2步：找到 Pages 设置
1. 在左侧菜单中，找到并点击 **"Pages"**（可能在 "Code and automation" 分类下）

### 第3步：配置 GitHub Pages
1. **Source（源）**：选择 **"Deploy from a branch"**
2. **Branch（分支）**：
   - Branch: 选择 **"main"** (或 **"master"**)
   - Folder: 选择 **"/ (root)"**
3. 点击 **"Save"** 保存

**⏳ 等待 1-3 分钟，GitHub 会构建您的网站**

### 第4步：查看部署状态
1. 在 **"Pages"** 设置页面，会显示部署状态：
   - 🟡 **"Building"**：正在构建中（等待 1-3 分钟）
   - ✅ **"Your site is live"**：网站已上线！

2. 您的网站地址会显示在页面顶部，格式为：
   ```
   https://您的用户名.github.io/health-app
   ```

---

## 🌐 访问您的网站

### 您现在可以通过以下方式访问：

1. **直接访问 GitHub Pages 地址**：
   ```
   https://您的用户名.github.io/health-app
   ```

2. **分享给朋友**：
   - 复制上面的网址
   - 发送给朋友
   - 他们打开后就能使用您的健康网站了！

### 测试网站功能：
✅ 打开网站，看到登录页面
✅ 点击 "注册" 标签，创建账号
✅ 登录后，测试所有功能（打卡、记录数据、观看视频）
✅ 在手机上打开网址，测试响应式设计

---

## 🛠️ 常见问题解决

### 问题1：网站显示 404 错误
**原因**：GitHub Pages 没有正确启用
**解决方案**：
1. 检查仓库是否为 **Public**（私有仓库无法使用免费 GitHub Pages）
2. 进入 **Settings → Pages**，确认 Branch 选择正确
3. 等待 5-10 分钟后再试

### 问题2：样式或功能无法正常工作
**原因**：文件路径引用错误
**解决方案**：
1. 检查所有 HTML 文件中的文件路径是否为相对路径
   - ✅ 正确：`<link rel="stylesheet" href="style.css">`
   - ❌ 错误：`<link rel="stylesheet" href="C:\Users\...">`

2. 确保所有文件都在仓库的根目录下（不要在子文件夹里）

### 问题3：网站地址太长，能改短一点吗？
**解决方案**：
- **方案A**：将仓库名改为 `健康`（网址会变成 `https://用户名.github.io/health`）
- **方案B**：购买自定义域名（例如：`www.您的名字-health.com`）

### 问题4：如何更新网站内容？
**通过网页界面更新**：
1. 在 GitHub 仓库中，找到要修改的文件
2. 点击文件右上角的 **"铅笔"图标**（Edit this file）
3. 修改内容后，滚动到页面底部
4. 输入提交信息（例如："更新首页内容"）
5. 点击 **"Commit changes"**

**通过 Git 命令行更新**：
```bash
# 拉取最新代码
git pull origin main

# 修改文件后...
git add .
git commit -m "更新说明"
git push origin main
```

---

## 🎨 高级功能（可选）

### 1. 自定义域名（让它更专业）

**步骤**：
1. 购买域名（推荐：Namesilo、阿里云、腾讯云）
2. 在 GitHub 仓库中创建 `CNAME` 文件
3. 在 `CNAME` 文件中输入您的域名（例如：`www.yourname-health.com`）
4. 在域名服务商处添加 **CNAME 记录**
   - Host: `www`
   - Value: `您的用户名.github.io`

### 2. 添加自定义 404 页面

创建一个 `404.html` 文件，当用户访问不存在的页面时显示。

### 3. 使用 Jekyll 主题（让网站更漂亮）

GitHub Pages 默认支持 Jekyll 静态网站生成器，可以轻松应用主题。

---

## 📊 部署检查清单

在启用 GitHub Pages 之前，请确认：

- [ ] 所有 HTML 文件都能在本地正常打开
- [ ] 所有 CSS 和 JS 文件路径都是正确的相对路径
- [ ] 图片和其他资源文件都已上传
- [ ] 仓库设置为 **Public**
- [ ] 已提交所有文件到 `main` 分支
- [ ] 已在 **Settings → Pages** 中启用 GitHub Pages

---

## 🎉 完成！

**现在您的网站已经上线了！**

### 您的成就是：
✅ 学会使用 GitHub（全球最大的代码托管平台）
✅ 成功部署了一个真实的网站
✅ 拥有了一个可以自由分享的网址
✅ 可以随时更新网站内容

### 下一步可以做什么？
- 🎨 继续改进网站设计和功能
- 📱 分享给朋友，让他们也使用您的健康助手
- 🌐 学习更多 Web 开发知识，添加新功能
- 💡 尝试其他部署平台（Netlify、Vercel 等）

---

## 🆘 需要帮助？

如果您在部署过程中遇到任何问题，可以：

1. **查看 GitHub 官方文档**：
   https://docs.github.com/en/pages

2. **检查常见错误**：
   - 仓库是否为 Public
   - 文件路径是否正确
   - 是否已提交所有文件

3. **请求帮助**：
   告诉我您遇到的具体问题，我会帮您解决！

---

**祝您部署顺利！🚀 您的健康生活助手马上就能被全世界访问了！**
