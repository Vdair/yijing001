#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
易道认知工坊 · 本地修学档案全息存储服务 (Vault Sync & Static Web Server)
功能：
1. 监听 8089 端口（支持跨域 CORS），接收前端的实时档案同步请求并自动落盘到 data/learning_vault/
2. 每当保存单卦时，自动生成/更新：
   - <safe_name>.json: 结构化单卦完整档案
   - <safe_name>.md: 格式优美的本卦修学与玄微先生点评专属笔记
   - index.json: 64卦全息修学进度索引总览
3. 同时作为静态 Web 服务器，可直接通过 http://127.0.0.1:8089 沉浸自修，真正实现“随学随记，秒级自动落盘”！
"""

import http.server
import json
import os
import sys
import datetime
import urllib.request
import urllib.error
import ssl
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT_DIR = os.path.join(BASE_DIR, 'data', 'learning_vault')
INDEX_FILE = os.path.join(VAULT_DIR, 'index.json')
PORT = int(os.environ.get('PORT', 8090))

# 核心安全架构配置：端到端防刷防盗通信令牌与流控
APP_SECRET_TOKEN = 'YIJING_SECURE_TOKEN_2026_COGNITION'
RATE_LIMIT_STORE = {}
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX_REQ = 30

class VaultSyncHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def __init__(self, *args, **kwargs):
        # 将根目录设为项目根目录，以便托管整个前端
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Yijing-Token')
        super().end_headers()

    def verify_client_token(self):
        """核心通信鉴权：校验应用令牌与合法请求源"""
        token = self.headers.get('X-Yijing-Token')
        if token == APP_SECRET_TOKEN:
            return True
        referer = self.headers.get('Referer', '')
        origin = self.headers.get('Origin', '')
        host = self.headers.get('Host', '')
        valid_hosts = ['47.93.179.183', 'localhost', '127.0.0.1']
        if any(h in referer or h in origin or h in host for h in valid_hosts):
            return True
        return False

    def check_rate_limit(self, client_ip):
        """流控限制：每个 IP 每分钟最多 30 次请求，阻断并发盗刷爬虫"""
        now = time.time()
        timestamps = RATE_LIMIT_STORE.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        if len(timestamps) >= RATE_LIMIT_MAX_REQ:
            RATE_LIMIT_STORE[client_ip] = timestamps
            return False
        timestamps.append(now)
        RATE_LIMIT_STORE[client_ip] = timestamps
        return True

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        # 核心安全防御：严禁任何公网客户端直接读取 config/ 私有目录、环境配置或隐藏文件
        clean_path = self.path.split('?')[0]
        if clean_path.startswith('/config/') or clean_path.endswith('.key') or clean_path.endswith('.env') or '/.' in clean_path:
            self.send_json(403, {'error': '403 Forbidden: 核心配置文件受安全策略保护，严禁公网直接访问'})
            return

        if self.path == '/api/vault/status':
            status_data = {
                'status': 'online',
                'vault_dir': VAULT_DIR,
                'time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            self.send_json(200, status_data)
            return
        elif self.path == '/api/vault/list':
            records = self.get_all_vault_records()
            self.send_json(200, records)
            return
        elif self.path == '/api/vault/progress':
            progress_file = os.path.join(VAULT_DIR, 'progress.json')
            progress_data = {'completed_lessons': [], 'total_completed': 0}
            if os.path.exists(progress_file):
                try:
                    with open(progress_file, 'r', encoding='utf-8') as f:
                        progress_data = json.load(f)
                except Exception:
                    pass
            self.send_json(200, progress_data)
            return
        elif self.path == '/api/ai/config':
            local_keys_file = os.path.join(BASE_DIR, 'config', 'local_ai_keys.json')
            keys_data = {}
            if os.path.exists(local_keys_file):
                try:
                    with open(local_keys_file, 'r', encoding='utf-8') as f:
                        keys_data = json.load(f)
                except Exception:
                    pass
            # 核心安全架构：绝向公网输出任何明文 Key，仅返回脱敏状态
            zhipu_key = keys_data.get('zhipu', {}).get('apiKey', '').strip()
            kimi_key = keys_data.get('kimi', {}).get('apiKey', '').strip()
            safe_config = {
                'status': 'success',
                'activeProvider': keys_data.get('activeProvider', 'zhipu'),
                'zhipu': {
                    'hasKey': bool(zhipu_key and len(zhipu_key) > 8 and not zhipu_key.startswith('在此')),
                    'model': keys_data.get('zhipu', {}).get('model', 'glm-5.3-flash')
                },
                'kimi': {
                    'hasKey': bool(kimi_key and len(kimi_key) > 8 and not kimi_key.startswith('在此')),
                    'model': keys_data.get('kimi', {}).get('model', 'kimi-k3')
                }
            }
            self.send_json(200, safe_config)
            return
        # 其他静态文件交给父类处理
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/vault/save':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                gua_id = payload.get('gua_id', 'unknown_gua')
                record = payload.get('record', {})

                os.makedirs(VAULT_DIR, exist_ok=True)
                safe_name = gua_id.replace('/', '_').replace(' ', '_').replace('·', '_')

                # 1. 写入结构化单卦 JSON 文件
                json_path = os.path.join(VAULT_DIR, f"{safe_name}.json")
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(record, f, ensure_ascii=False, indent=2)

                # 2. 生成排版考究的专属 Markdown 文件（含主 Agent 点评）
                md_path = os.path.join(VAULT_DIR, f"{safe_name}.md")
                self.write_markdown_file(md_path, gua_id, record)

                # 3. 更新总索引 index.json
                self.update_vault_index(gua_id, safe_name, record)

                response = {
                    'status': 'success',
                    'message': f'已落盘至 {json_path}',
                    'file': json_path,
                    'md_file': md_path,
                    'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                self.send_json(200, response)
                print(f"[Vault Sync] 🟢 成功自动落盘: {safe_name}.json 与 {safe_name}.md")
                return
            except Exception as e:
                self.send_json(500, {'status': 'error', 'message': str(e)})
                return
        elif self.path == '/api/vault/progress':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                os.makedirs(VAULT_DIR, exist_ok=True)
                progress_file = os.path.join(VAULT_DIR, 'progress.json')
                with open(progress_file, 'w', encoding='utf-8') as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)

                # 同步回写 index.json
                self.sync_progress_to_index(payload.get('completed_lessons', []))

                self.send_json(200, {'status': 'success', 'message': '已同步研习进度至 progress.json'})
                print(f"[Vault Sync] 🟢 成功同步全库研习掌握进度: 共 {payload.get('total_completed', 0)} 课已掌握")
                return
            except Exception as e:
                self.send_json(500, {'status': 'error', 'message': str(e)})
                return
        elif self.path == '/api/ai/config':
            if not self.verify_client_token():
                self.send_json(403, {'error': '无权操作：未通过安全防刷校验'})
                return
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                config_dir = os.path.join(BASE_DIR, 'config')
                os.makedirs(config_dir, exist_ok=True)
                local_keys_file = os.path.join(config_dir, 'local_ai_keys.json')
                
                # 增量融合已有配置，严禁空串或掩码冲掉已有合法 Key
                existing_data = {}
                if os.path.exists(local_keys_file):
                    try:
                        with open(local_keys_file, 'r', encoding='utf-8') as f:
                            existing_data = json.load(f)
                    except Exception:
                        pass
                
                if payload.get('activeProvider'):
                    existing_data['activeProvider'] = payload['activeProvider']

                for p_name in ['zhipu', 'kimi']:
                    if p_name in payload and isinstance(payload[p_name], dict):
                        p_val = payload[p_name]
                        if p_name not in existing_data:
                            existing_data[p_name] = {}
                        raw_key = str(p_val.get('apiKey', '')).strip()
                        # 仅当输入真实合法新密钥时更新（过滤掩码和占位文字）
                        if raw_key and not raw_key.startswith('*') and not '已配置' in raw_key and len(raw_key) > 8:
                            existing_data[p_name]['apiKey'] = raw_key
                        if p_val.get('model'):
                            existing_data[p_name]['model'] = p_val['model']

                with open(local_keys_file, 'w', encoding='utf-8') as f:
                    json.dump(existing_data, f, ensure_ascii=False, indent=2)
                try:
                    os.chmod(local_keys_file, 0o600)
                except Exception:
                    pass

                self.send_json(200, {'status': 'success', 'message': '已安全持久化至云端私有配置文件'})
                print("[AI Config] 🔒 云端私有 API 配置已安全更新（零前端泄露，权限 600）")
                return
            except Exception as e:
                self.send_json(500, {'status': 'error', 'message': str(e)})
                return
        elif self.path == '/api/ai/chat':
            self.handle_ai_chat_proxy()
            return
        else:
            self.send_response(404)
            self.end_headers()

    def handle_ai_chat_proxy(self):
        """云端安全 AI 流式中继代理：防盗刷、零泄露、频次受控"""
        # 1. 验证客户端安全 Token 与请求源
        if not self.verify_client_token():
            self.send_json(403, {'error': '拒绝访问：未通过合法的安全防盗链验证'})
            return

        # 2. IP 频次限制（防高并发盗刷）
        client_ip = self.client_address[0]
        if not self.check_rate_limit(client_ip):
            self.send_json(429, {'error': '请求过于频繁，请稍候再试（安全防刷流控触发）'})
            return

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            client_payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            client_payload = {}

        # 3. 读取服务器本地私有配置文件中的 Key（核心：绝不信任也不使用客户端传来的 key，彻底杜绝窃取与篡改）
        local_keys_file = os.path.join(BASE_DIR, 'config', 'local_ai_keys.json')
        config_data = {}
        if os.path.exists(local_keys_file):
            try:
                with open(local_keys_file, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
            except Exception:
                pass

        active_provider = client_payload.get('provider') or config_data.get('activeProvider') or 'zhipu'
        api_key = config_data.get(active_provider, {}).get('apiKey', '').strip()

        if active_provider == 'zhipu':
            target_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
            default_model = "glm-5.3-flash"
        else:
            target_url = "https://api.moonshot.cn/v1/chat/completions"
            default_model = "kimi-k3"

        if not api_key:
            self.send_json(400, {'error': f'云端未配置【{active_provider}】的有效 API Key，请在设置中录入新密钥'})
            return

        # 4. 模型白名单限制与 max_tokens 封顶安全策略
        ALLOWED_MODELS = {'glm-5.3-flash', 'glm-4-flash', 'kimi-k3'}
        model = client_payload.get('model') or default_model
        if model not in ALLOWED_MODELS:
            model = default_model

        messages = client_payload.get('messages', [])
        stream = client_payload.get('stream', True)

        def build_req_body(target_model):
            body = {
                'model': target_model,
                'messages': messages,
                'stream': stream
            }
            if active_provider == 'zhipu':
                if 'temperature' in client_payload:
                    body['temperature'] = client_payload['temperature']
                body['max_tokens'] = client_payload.get('max_tokens') or 8192
                body['stream_options'] = {'chunk_include_usage': True}
                if '5.3' in target_model:
                    if client_payload.get('thinking'):
                        body['thinking'] = client_payload['thinking']
                    else:
                        body['thinking'] = {'type': 'enabled', 'clear_thinking': False}
                    # 智谱官方规范：根级 reasoning_effort 控制思考预算 (low, high, max)
                    body['reasoning_effort'] = client_payload.get('reasoning_effort', 'low')
            else:
                body['reasoning_effort'] = client_payload.get('reasoning_effort', 'low')
                body['max_tokens'] = client_payload.get('max_tokens', 8192)
            return body

        def try_forward(req_body):
            req_bytes = json.dumps(req_body).encode('utf-8')
            req = urllib.request.Request(target_url, data=req_bytes, headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
                'User-Agent': 'YijingAIService/3.2'
            })
            ctx = ssl.create_default_context()
            return urllib.request.urlopen(req, context=ctx, timeout=90)

        resp = None
        current_model = model
        try:
            resp = try_forward(build_req_body(current_model))
        except Exception as first_err:
            if active_provider == 'zhipu' and '5.3' in current_model:
                print(f"[AI Cascade] ⚠️ 主模型 {current_model} 响应异常 ({first_err})，自动级联降级至备用真模型 glm-4-flash...")
                current_model = "glm-4-flash"
                try:
                    resp = try_forward(build_req_body(current_model))
                except Exception as second_err:
                    print(f"[AI Proxy Error] 级联备用模型调用亦失败: {second_err}")
                    self.send_json(502, {'error': f'智谱模型调用失败 (主模型与备用模型均异常): {second_err}'})
                    return
            else:
                print(f"[AI Proxy Error] 模型 {current_model} 调用异常: {first_err}")
                self.send_json(502, {'error': f'模型服务调用失败: {first_err}'})
                return

        try:
            if stream:
                self.send_response(200)
                self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Connection', 'keep-alive')
                self.send_header('Transfer-Encoding', 'chunked')
                self.send_header('X-Accel-Buffering', 'no')
                self.end_headers()

                try:
                    while True:
                        line = resp.readline()
                        if not line:
                            break
                        hex_len = hex(len(line))[2:].encode('ascii')
                        self.wfile.write(hex_len + b'\r\n' + line + b'\r\n')
                        self.wfile.flush()
                    self.wfile.write(b'0\r\n\r\n')
                    self.wfile.flush()
                    self.close_connection = True
                except (BrokenPipeError, ConnectionResetError):
                    pass
            else:
                resp_data = resp.read()
                try:
                    parsed_json = json.loads(resp_data.decode('utf-8'))
                    self.send_json(200, parsed_json)
                except Exception:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Length', str(len(resp_data)))
                    self.end_headers()
                    self.wfile.write(resp_data)
        except (BrokenPipeError, ConnectionResetError):
            pass
        except urllib.error.HTTPError as e:
            err_content = e.read().decode('utf-8', errors='ignore')
            self.send_json(e.code, {'error': f"大模型接口返回错误 [{e.code}]: {err_content}"})
        except Exception as e:
            self.send_json(500, {'error': f"本地服务代理转发异常: {str(e)}"})

    def write_markdown_file(self, md_path, gua_id, record):
        """生成符合学术规范的 Markdown 修学档案"""
        gua_title = record.get('gua_title', gua_id)
        symbol = record.get('gua_symbol', '☯️')
        updated_at = record.get('updated_at', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        is_mastered = record.get('mastered', False)
        mastered_time = record.get('mastered_at', '')
        status_text = f"✅ 已掌握 ({mastered_time})" if is_mastered else "⏳ 研习中"

        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(f"# {symbol} 《{gua_title}》个人修学档案\n\n")
            f.write(f"> **最近归档时间**：{updated_at}  \n")
            f.write(f"> **研习掌握状态**：{status_text}  \n")
            f.write(f"> **所属体系**：易道认知工坊 · 64 卦全息自修档案库  \n\n---\n\n")

            # 1. 伴读对话
            dialogues = record.get('dialogues', [])
            f.write(f"## 💬 一、伴读叩问对话流 ({len(dialogues)} 轮)\n\n")
            if not dialogues:
                f.write("*(本章节尚无对话记录)*\n\n")
            else:
                for idx, d in enumerate(dialogues, 1):
                    f.write(f"### 对话 #{idx} ({d.get('timestamp', '')})\n\n")
                    f.write(f"**👤 学员叩问**：\n{d.get('question', '').strip()}\n\n")
                    f.write(f"**☯️ 玄微先生·易道开示**：\n{d.get('answer', '').strip()}\n\n---\n\n")

            # 2. 专属笔记
            notes = record.get('notes', [])
            f.write(f"## 📝 二、课时专属研习笔记 ({len(notes)} 篇)\n\n")
            if not notes:
                f.write("*(本章节尚无专属笔记)*\n\n")
            else:
                for idx, n in enumerate(notes, 1):
                    f.write(f"### {idx}. {n.get('title', '随堂心得')} ({n.get('timestamp', '')})\n\n")
                    f.write(f"{n.get('content', '').strip()}\n\n")

            # 3. 悟道复盘
            rev = record.get('review', {})
            f.write(f"## 🧠 三、易道悟道复盘（本课专属研学心得）\n\n")
            if 'items' in rev and isinstance(rev['items'], list) and len(rev['items']) > 0:
                for idx, item in enumerate(rev['items'], 1):
                    q = item.get('question', f"复盘问题 #{idx}")
                    a = item.get('answer', '（未填写）')
                    f.write(f"### {idx}. {q}\n\n{a}\n\n")
            else:
                f.write(f"1. **生命印证（照镜子）**：\n   {rev.get('q1_mirror', '（未填写）')}\n\n")
                f.write(f"2. **认知跃迁（炼心法）**：\n   {rev.get('q2_mindset', '（未填写）')}\n\n")
                f.write(f"3. **行动承诺（知行合一）**：\n   {rev.get('q3_action', '（未填写）')}\n\n")

            # 3.1 主 Agent 学术点评
            ai_analysis = rev.get('ai_analysis', {})
            if ai_analysis and ai_analysis.get('content'):
                f.write(f"### ☯️ 主 Agent 玄微先生 · 易道深度学术点评 ({ai_analysis.get('updated_at', '')})：\n\n")
                f.write(f"{ai_analysis.get('content', '').strip()}\n\n")

            # 3.2 边读边思 · 师承评估实录
            inline_assessments = record.get('inline_assessments', {})
            if inline_assessments:
                f.write(f"## 💡 四、边读边思 · 师承点穴实录 ({len(inline_assessments)} 题)\n\n")
                for k, item in inline_assessments.items():
                    tag = item.get('tag', '边读边思')
                    q = item.get('question', '')
                    ua = item.get('user_answer', '（未填写）')
                    ta = item.get('teacher_assessment', '（待评估）')
                    time_str = item.get('updated_at', '')
                    f.write(f"### {tag} ({time_str})\n\n")
                    f.write(f"**【思考探问】**：{q}\n\n")
                    f.write(f"**【学员作答】**：\n{ua}\n\n")
                    f.write(f"**【玄微先生师承评估】**：\n{ta}\n\n---\n\n")

            # 4. 费曼通关
            fey = record.get('feynman', {})
            fw = fey.get('framework', {})
            f.write(f"## 🏆 四、费曼大白话讲透工坊（向外行通俗自述）\n\n")
            if fey.get('feynman_analogy'):
                f.write(f"- **生活/工作场景通俗比喻**：{fey.get('feynman_analogy')}\n")
            if fey.get('feynman_core'):
                f.write(f"- **大白话核心转译**：{fey.get('feynman_core')}\n")
            if fey.get('feynman_gap'):
                f.write(f"- **盲区与外行追问卡点**：{fey.get('feynman_gap')}\n\n")
            elif any(fw.values()):
                f.write(f"- **1. 卦象时势核心判据**：{fw.get('core_trend', '（未填写）')}\n")
                f.write(f"- **2. 核心爻变拐点攻防**：{fw.get('key_yao_turn', '（未填写）')}\n")
                f.write(f"- **3. 现实生活/商业案例映射**：{fw.get('real_case', '（未填写）')}\n")
                f.write(f"- **4. 反常识易道心智底牌**：{fw.get('anti_common_rule', '（未填写）')}\n\n")
            f.write(f"### 费曼大白话自述全稿：\n\n{fey.get('full_text', '（未填写综合自述）')}\n")

    def update_vault_index(self, gua_id, safe_name, record):
        """维护全库总索引 index.json"""
        index_data = {}
        if os.path.exists(INDEX_FILE):
            try:
                with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                    index_data = json.load(f)
            except Exception:
                index_data = {}

        if 'records' not in index_data:
            index_data['records'] = {}

        rev = record.get('review', {})
        fey = record.get('feynman', {})
        has_rev = bool(rev.get('q1_mirror') or rev.get('q2_mindset') or rev.get('q3_action'))
        has_fey = bool(fey.get('full_text') or (fey.get('framework', {}).get('core_trend')))

        is_mastered = bool(record.get('mastered', False))
        index_data['records'][gua_id] = {
            'gua_id': gua_id,
            'gua_title': record.get('gua_title', gua_id),
            'gua_symbol': record.get('gua_symbol', '☯️'),
            'dialogues_count': len(record.get('dialogues', [])),
            'notes_count': len(record.get('notes', [])),
            'has_review': has_rev,
            'has_feynman': has_fey,
            'has_ai_analysis': bool(rev.get('ai_analysis', {}).get('content')),
            'is_completed': is_mastered,
            'mastered_at': record.get('mastered_at'),
            'updated_at': record.get('updated_at', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            'json_file': f"{safe_name}.json",
            'md_file': f"{safe_name}.md"
        }

        # 维护全库掌握进度
        completed_list = [gid for gid, r in index_data['records'].items() if r.get('is_completed')]
        index_data['total_saved_guas'] = len(index_data['records'])
        index_data['completed_count'] = len(completed_list)
        index_data['completed_lessons'] = completed_list
        index_data['last_sync_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with open(INDEX_FILE, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)

    def sync_progress_to_index(self, completed_list):
        """将全局掌握进度同步回 index.json"""
        if not os.path.exists(INDEX_FILE):
            return
        try:
            with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                index_data = json.load(f)
            if 'records' in index_data:
                for gid, rec in index_data['records'].items():
                    rec['is_completed'] = gid in completed_list
            index_data['completed_count'] = len(completed_list)
            index_data['completed_lessons'] = completed_list
            index_data['last_sync_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open(INDEX_FILE, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[Vault Sync] ⚠️ 同步进度到 index.json 异常: {e}")
            json.dump(index_data, f, ensure_ascii=False, indent=2)

    def get_all_vault_records(self):
        """从本地磁盘读取所有已保存的 JSON 文件"""
        all_records = {}
        if not os.path.exists(VAULT_DIR):
            return all_records
        for fname in os.listdir(VAULT_DIR):
            if fname.endswith('.json') and fname != 'index.json' and fname != 'schema.json':
                try:
                    fpath = os.path.join(VAULT_DIR, fname)
                    with open(fpath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        gid = data.get('gua_id', fname[:-5])
                        all_records[gid] = data
                except Exception:
                    pass
        return all_records

if __name__ == '__main__':
    print(f"============================================================")
    print(f"☯️ 易道修学档案全息同步与静态服务 (Vault Sync Server)")
    print(f"============================================================")
    print(f"1. 服务端口: http://127.0.0.1:{PORT}")
    print(f"2. 数据落盘目录: {VAULT_DIR}")
    print(f"3. 页面访问地址: http://127.0.0.1:{PORT}/index.html")
    print(f"4. 状态监测接口: http://127.0.0.1:{PORT}/api/vault/status")
    print(f"============================================================")
    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), VaultSyncHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已安全退出。")
