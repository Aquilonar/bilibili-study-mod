# bilibili-study-mod
一款专为 B 站网页端网课学习打造的辅助脚本，致力于优化在线学习体验、提升学习效率。  

## Language

- [English](#english)
- [中文](#中文)

---

### English

![Bilibili Study Helper](https://img.shields.io/badge/Bilibili-Study%20Helper-brightgreen)
![License](https://img.shields.io/github/license/Aquilonar/bilibili-study-mod)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A feature-rich auxiliary script tailored for Bilibili's web-based online courses, solving common pain points like distractions, tedious operations, and unstable settings to enhance learning focus and efficiency.


## ✨ Core Features

### 1. Intelligent Playback Control
- **Break Speed Limits**: Supports 0.1x-10.0x playback speed adjustment, far exceeding Bilibili's default 2x limit.
- **Author Speed Memory**: After adding a "matched author", the script automatically saves and applies your preferred speed for that author's videos (e.g., 1.5x for a specific teacher's courses).
- **Cross-Browser Auto-Play**: Optimized for Firefox and other browsers, auto-plays videos after loading; triggers "simulated click playback" as a fallback if auto-play fails.

### 2. Distraction Blocking
- **One-Click Recommendation Cleanup**: Hides recommend modules on the playback page to eliminate distractions from irrelevant videos.
- **Simplified Chapter List**: Increases the chapter list height from default to 800px (reduces scrolling) and adds gray serial numbers to each chapter for quick to locate.

### 3. Subtitle & Title Optimization
- **Auto-Enable Subtitles**: Automatically detects and enables subtitles (prioritizes Chinese/AI subtitles) after video loading, with 3 retries to fix the "subtitle not enabled after video switch" issue.
- **Full-Screen Title Sync**: Displays the current video title and chapter info in full-screen mode, so you can check progress without exiting full screen.

### 4. Personalized Enhancement Panel
Click the "Enhance" button on the page to open the control panel, which supports:
- Toggling "Recommendation Block" status (takes effect in real time).
- Switching enhancement modes: "Global Mode" (works for all videos) / "Matched Mode" (only works for added authors).
- Managing "Matched Authors List": Add/delete authors, view saved playback speeds for authors.


## 📌 Use Cases
- Reviewing class replays: Quickly locate key points and block recommendations.
- Self-selected course learning: Adjust playback speed to your rhythm and save settings.
- Long-duration online courses: Optimize chapter/subtitle experience to reduce repeated operations.
- Multi-author courses: Set exclusive playback habits for different teachers.


## 🚀 Installation & Usage

### Prerequisites
1. Install a script manager extension (choose one):
   - **Tampermonkey** (Recommended): [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox Add-ons](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
   - Violentmonkey: [Chrome Web Store](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)

### Installation Steps
1. Click [Script Installation Link] (replace with your direct link, e.g., Greasy Fork or GitHub Raw link).
2. The script manager will automatically detect and pop up the installation page; click "Install".
3. Open a Bilibili video page (e.g., `https://www.bilibili.com/video/BVxxxxxx`). The script will take effect automatically, and an "Enhance" button will appear on the page.


## ⌨️ Shortcut Keys
| Key         | Function                | Note                                  |
|-------------|-------------------------|---------------------------------------|
| `,` (Comma) | Decrease playback speed | Decreases by 1.0x each time (min 0.1x)|
| `.` (Period)| Increase playback speed | Increases by 1.0x each time (max 10.0x)|
| No modifiers| Avoid browser shortcut conflicts | Debug info is printed in the console |


## 📝 Changelog
- **v1.0.0** (2025-11-04): Initial release
  - Implemented speed adjustment (0.1x-10.0x) and author speed memory.
  - Added recommendation blocking, chapter numbering, and height optimization.
  - Added auto-subtitle enabling and full-screen title sync.
  - Developed enhancement panel (mode switch, author management).


## 🛠️ FAQ
### Q1: The script doesn’t work after installation?
A1: Check the following:
1. Is the script manager enabled (e.g., Tampermonkey icon is colored)?
2. Does the current page match the script rules (only supports `https://www.bilibili.com/video/*` and `https://www.bilibili.com/video/*/course/*`)?
3. Refresh the page or restart the browser; some browsers require manual triggering of "script activation".

### Q2: Playback speed isn’t saved?
A2: First, click "Add Current Author to Matched Rules" in the enhancement panel. The script will then automatically apply the saved speed for that author’s videos.

### Q3: Auto-subtitle enabling fails?
A3: The video may have no subtitle resources, or subtitles may load slowly. Manually click the "Subtitle" button on the player; the script will record the operation and optimize subsequent retry logic.


## 🤝 Contribution Guide
You’re welcome to contribute to the project in the following ways:
1. **Feedback Issues**: Submit bugs or feature suggestions in GitHub Issues, and include "browser version + operation steps + problem screenshots".
2. **Code Contributions**: Fork the repository and submit a Pull Request; it’s recommended to discuss the modification plan in Issues first.
3. **Feature Expansion**: For new features (e.g., video progress memory, note export), submit a "Feature Proposal" Issue to discuss implementation details together.

Derived versions must retain the original copyright notice (Author: Aquilonar). Thanks for supporting open-source collaboration!


## 📄 License
This project is open-sourced under the [MIT License](LICENSE), allowing free use, modification, and distribution, provided that the original copyright notice and license text are retained.

---

### 中文

![Bilibili Study Helper](https://img.shields.io/badge/Bilibili-网课助手-brightgreen)
![License](https://img.shields.io/github/license/Aquilonar/bilibili-study-mod)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

针对 B 站网页端网课场景开发的增强脚本，通过屏蔽干扰、智能适配播放习惯、优化界面交互，解决网课学习中的「分心」「操作繁琐」「设置不记忆」等问题，让学习更专注、高效。


## ✨ 核心功能

### 1. 智能播放控制
- **突破倍速上限**：支持 0.1x-10.0x 大范围倍速调节，远超 B 站默认 2 倍速限制
- **作者倍速记忆**：添加「匹配作者」后，自动保存并应用该作者视频的常用倍速（如某老师课程固定 1.5x 播放）
- **跨浏览器自动播放**：优化 Firefox 等浏览器兼容性，视频加载后自动播放，失败时触发「模拟点击播放」兜底

### 2. 干扰信息屏蔽
- **一键清理推荐**：隐藏播放页推荐模块，消除无关视频诱惑
- **简洁选集界面**：选集列表高度从默认提升至 800px，减少滚动操作；同时为每个选集添加灰色序号，快速定位章节

### 3. 字幕与标题优化
- **自动启用字幕**：视频加载后自动检测并开启字幕（优先选择中文/AI 字幕），支持 3 次重试机制，解决切换视频后字幕未启用问题
- **全屏标题同步**：全屏模式下实时显示当前视频标题与章节信息，无需退出全屏即可确认学习进度

### 4. 个性化增强面板
点击页面「增强」按钮打开控制面板，支持：
- 切换「推荐屏蔽」状态（实时生效）
- 切换增强模式：「全局模式」（所有视频生效）/「匹配模式」（仅对添加的作者生效）
- 管理「匹配作者列表」：添加/删除作者、查看已保存的作者倍速


## 📌 适用场景
- 课堂回放复习：快速定位知识点，屏蔽推荐干扰
- 自主选课学习：按个人节奏调节倍速，记忆常用设置
- 长时间网课：优化选集、字幕体验，减少重复操作
- 多作者课程：为不同老师的课程设置专属播放习惯


## 🚀 安装与使用

### 前提条件
1. 安装脚本管理器插件（任选其一）：
   - **Tampermonkey**（推荐）：[Chrome 商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox 商店](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)
   - Violentmonkey：[Chrome 商店](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)

### 安装步骤
1. 点击 [脚本安装链接]（替换为你的脚本直链，如 Greasy Fork 链接或 GitHub Raw 链接）
2. 脚本管理器会自动识别并弹出安装页，点击「安装」即可
3. 打开 B 站视频页（如 `https://www.bilibili.com/video/BVxxxxxx`），脚本自动生效，页面将出现「增强」按钮


## ⌨️ 快捷键说明
| 按键       | 功能                  | 备注                     |
|------------|-----------------------|--------------------------|
| `,`（逗号）| 降低播放倍速          | 每次减少 1.0x，最低 0.1x |
| `.`（句号）| 提高播放倍速          | 每次增加 1.0x，最高 10.0x |
| 无修饰键   | 避免与浏览器快捷键冲突 | 按下时会在控制台打印调试信息 |


## 📝 更新日志
- **v1.0.0**（2025-11-04）：初始版本
  - 实现倍速调节（0.1x-10.0x）与作者倍速记忆
  - 支持推荐列表屏蔽、选集序号与高度优化
  - 添加自动字幕启用、全屏标题同步功能
  - 开发增强控制面板（模式切换、作者管理）


## 🛠️ 常见问题（FAQ）
### Q1：脚本安装后不生效？
A1：检查以下几点：
1. 脚本管理器是否已启用（如 Tampermonkey 图标是否为彩色）
2. 当前页面是否匹配脚本规则（仅支持 `https://www.bilibili.com/video/*` 和 `https://www.bilibili.com/video/*/course/*`）
3. 刷新页面或重启浏览器，部分浏览器需手动触发「脚本生效」

### Q2：倍速调节后不记忆？
A2：需先在「增强面板」中点击「添加当前作者到匹配规则」，后续该作者的视频会自动应用记忆的倍速。

### Q3：字幕自动启用失败？
A3：可能是视频无字幕资源，或字幕加载延迟。可手动点击播放器「字幕」按钮开启，脚本会记录操作并优化后续重试逻辑。


## 🤝 贡献指南
欢迎通过以下方式参与项目优化：
1. **反馈问题**：在 GitHub Issues 中提交 bug 或功能建议，需注明「浏览器版本 + 操作步骤 + 问题截图」
2. **代码贡献**：Fork 仓库后提交 Pull Request，建议先在 Issues 中沟通修改方案
3. **功能扩展**：如需添加新功能（如视频进度记忆、笔记导出），可先提交「功能提案」Issue，共同讨论实现细节

衍生版本需保留原始版权声明（作者：Aquilonar），感谢支持开源协作！


## 📄 许可证
本项目采用 [MIT 许可证](LICENSE) 开源，允许自由使用、修改和分发，只需保留原版权声明与许可证文本。
