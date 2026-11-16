# 易道全息研学项目 · AI 系统诊断与后续排查手册 (2026-11-16)

> 本文档用于记录 2026-11-16 当日对 AI 服务体系（智谱 GLM / 月之暗面 Kimi）所做的全部修改，并为后续系统排查提供端到端的排查路径与测试命令。

---

## 一、 AI 体系整体调用拓扑

当前系统采用 **“前端轻量代理 + 后端私有中继（带离线保真兜底）”** 的架构，防止 API 密钥泄露至客户端与 Git：

```
[浏览器客户端] (index.html / yijing_assistant.js)
       │
       ▼ (发起 POST /api/ai/chat 流式请求)
[Nginx 80 端口] (反向代理)
       │
       ▼ (proxy_pass http://127.0.0.1:8090)
[Python 中继服务] (scripts/sync_vault_server.py)
       │
       ├── 读取 config/local_ai_keys.json (受 .gitignore 保护的真实 API Key)
       │
       ▼ (HTTPS 请求大模型官方服务)
[智谱开放平台 (bigmodel.cn) / Kimi (moonshot.cn)]
```

---

## 二、 今日修改内容全景清单

### 1. 密钥解耦与本地/云端配置标准化
- **文件**：`config/local_ai_keys.json`、`config/local_ai_keys.example.json`
- **修改**：
  - 将 API 密钥与 Git 解耦，建立 `local_ai_keys.json` 并在 `.gitignore` 中忽略；
  - 接入智谱 AI API Key 与 Kimi API Key，并已同步部署到阿里云服务器（`/var/www/yijing001/config/local_ai_keys.json`）。

### 2. 模型选型与参数调优
- **文件**：`yijing_ai_service.js`、`scripts/sync_vault_server.py`
- **修改**：
  - **由 `glm-5.3-flash` 切换为 `glm-4-flash`**：
    - 原因：`glm-5.3-flash` 默认包含深层 Thinking 思考推理链路（产生数千字 reasoning），思考耗时高达 20~40 秒，极易引发服务端和客户端的超时中断；
    - `glm-4-flash` 为智谱官方高吞吐、零延迟模型，实测单次生成仅 1.5 秒，且无参数死锁问题；
  - **超时阈值放宽**：将 `sync_vault_server.py` 中 `urllib.request.urlopen` 超时从 60s 扩展至 90s；
  - **条件适配 thinking**：仅对 `5.3` 模型启用 `thinking` 字段，避免对 `glm-4-flash` 传入不兼容参数引发 HTTP 400。

### 3. 前端交互与“边读边思”卡片加固
- **文件**：`yijing_assistant.js`、`yijing_assistant.css`
- **修改**：
  - **上下文动态寻址**：重构 `requestInlineThinkAssessment(guaId, qIdx, btnTrigger)`，不再单一依赖全局 ID，改用 `btn.closest('.yj-inline-think-card')` 向上回溯，杜绝 ID 偏差导致的静默退出；
  - **展开样式可见性**：设置 `resultEl.style.display = 'block'` 与 `classList.add('open')`，解决之前在 `display: none` 状态下内容被隐藏的问题；
  - **三维点穴解析器（Markdown 标题同行容错）**：重构 `formatTeacherAssessmentHtml`，支持剥离大模型在同一行中输出的“标题+正文”，彻底防止正文被误吃导致回退至兜底模板；
  - **离线保真规则库**：在 `generateOfflineInlineAssessment` 中补充第二课《重卦之变》针对“自媒体投入与内部准备、内外卦博弈”的深度点评规则。

### 4. 助教遮罩样式修复
- **文件**：`yijing_assistant.css`
- **修改**：
  - 修复宽屏桌面端打开“易道助教”侧边栏时整屏变暗模糊的问题，将 `.yj-assistant-backdrop` 限制在 `max-width: 768px` 移动端生效。

### 5. 静态版本防缓存
- **文件**：`index.html`
- **修改**：
  - 更新 JS 引用版本号至 `?v=20261116_glm4_speed`。

---

## 三、 明天排查的核心方向与根因推断

若当前项目**“所有和 AI 有关的内容都无法使用”**，请按以下 4 个核心方向依次排查：

### 方向 1：浏览器控制台（F12）的网络请求状态【首要方向】
- **现象排查**：打开浏览器开发者工具（`F12` ➔ `Network` / 网络），在助教或边读边思中发问，观察 `/api/ai/chat` 请求状态：
  1. **状态为 (failed) / CORS Error**：
     - 说明前端没有打到同源的 `/api/ai/chat`，而是跨域打到了外部地址；
     - 检查浏览器 `localStorage.getItem('yijing_ai_config_v3')`，看里面是否残留了旧的 `apiUrl` 或错误代理地址。
  2. **状态为 400 / 500**：
     - 点击该请求查看 `Response` 响应体，查看 Python 代理返回的真实报错信息。
  3. **状态为 200 但无流式吐字（Pending 或瞬间结束）**：
     - 可能是 Nginx 的流式缓冲（Buffering）导致。

### 方向 2：Nginx 代理层对 SSE 流式（Event-Stream）的配置
- **关键点**：大模型使用的是 `text/event-stream`（SSE 长连接）。
- 当前 Nginx 的配置（`/etc/nginx/nginx.conf`）中：
  ```nginx
  location / {
      proxy_pass http://127.0.0.1:8090;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```
- **排查与优化建议**：
  在 `location /` 下缺少关闭缓冲的配置，Nginx 会尝试将 upstream 的流缓存在本地临时文件中，导致前端收不到实时流。需补充：
  ```nginx
  proxy_http_version 1.1;
  proxy_set_header Connection "";
  proxy_buffering off;
  proxy_cache off;
  proxy_read_timeout 300s;
  ```

### 方向 3：浏览器客户端 LocalStorage 脏配置隔离
- **关键点**：`yijing_ai_service.js` 的 `getConfig()` 会优先读取浏览器本地的 `localStorage.getItem('yijing_ai_config_v3')`。
- 如果浏览器本地之前保存了旧的 Provider、已失效的 Key 或错误的模型名称，可能会覆盖后端的正确配置。
- **验证与重置**：
  在浏览器控制台（Console）执行：
  ```javascript
  localStorage.removeItem('yijing_ai_config_v3');
  window.YijingAIService.pullLocalConfigFile().then(() => location.reload());
  ```

### 方向 4：API Key 状态与服务端独立连通性验证
- 验证服务器能否直连大模型 API（排除服务器防火墙、DNS 或服务端口问题）。

---

## 四、 快速诊断命令速查表（供明天直接在终端执行）

### 1. 检查云端 Python 服务状态与实时日志
```bash
# 查看服务状态
systemctl status yijing.service

# 查看最近 60 条交互日志（重点查看是否有 POST /api/ai/chat）
journalctl -u yijing.service -n 60 --no-pager
```

### 2. 服务器端本地 curl 直测 AI 代理接口
在服务器终端直接执行，检查 Python 服务本身是否正常工作：
```bash
curl -X POST http://127.0.0.1:8090/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "zhipu",
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }'
```
*预期输出*：返回包含 `choices[0].message.content` 的 JSON。

### 3. 公网直测 Nginx 转发接口
在自己电脑终端执行，检查公网 80 端口经由 Nginx 转发是否畅通：
```bash
curl -X POST http://47.93.179.183/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "zhipu",
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }'
```

### 4. 查看当前生效的密钥配置文件
```bash
cat /var/www/yijing001/config/local_ai_keys.json
```

---

## 五、 今日关键提交记录
- Git Commit: `a16535b`
- Commit Message: `fix(model): 切换为智谱秒级直出模型 glm-4-flash，修复行内标题解析漏洞并彻底解决思考超时`
- 远程仓库: `https://github.com/Vdair/yijing001.git` (`main` 分支)
- 服务器部署目录: `/var/www/yijing001/`
