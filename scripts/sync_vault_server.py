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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT_DIR = os.path.join(BASE_DIR, 'data', 'learning_vault')
INDEX_FILE = os.path.join(VAULT_DIR, 'index.json')
PORT = 8089

class VaultSyncHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 将根目录设为项目根目录，以便托管整个前端
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/vault/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            status_data = {
                'status': 'online',
                'vault_dir': VAULT_DIR,
                'time': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            self.wfile.write(json.dumps(status_data).encode('utf-8'))
            return
        elif self.path == '/api/vault/list':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            records = self.get_all_vault_records()
            self.wfile.write(json.dumps(records, ensure_ascii=False).encode('utf-8'))
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

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'status': 'success',
                    'message': f'已落盘至 {json_path}',
                    'file': json_path,
                    'md_file': md_path,
                    'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                print(f"[Vault Sync] 🟢 成功自动落盘: {safe_name}.json 与 {safe_name}.md")
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
                return
        else:
            self.send_response(404)
            self.end_headers()

    def write_markdown_file(self, md_path, gua_id, record):
        """生成符合学术规范的 Markdown 修学档案"""
        gua_title = record.get('gua_title', gua_id)
        symbol = record.get('gua_symbol', '☯️')
        updated_at = record.get('updated_at', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(f"# {symbol} 《{gua_title}》个人修学档案\n\n")
            f.write(f"> **最近归档时间**：{updated_at}  \n")
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
            f.write(f"## 🧠 三、易道悟道复盘（反身而诚）\n\n")
            f.write(f"1. **生命印证（照镜子）**：\n   {rev.get('q1_mirror', '（未填写）')}\n\n")
            f.write(f"2. **认知跃迁（炼心法）**：\n   {rev.get('q2_mindset', '（未填写）')}\n\n")
            f.write(f"3. **行动承诺（知行合一）**：\n   {rev.get('q3_action', '（未填写）')}\n\n")

            # 3.1 主 Agent 学术点评
            ai_analysis = rev.get('ai_analysis', {})
            if ai_analysis and ai_analysis.get('content'):
                f.write(f"### ☯️ 主 Agent 玄微先生 · 易道深度学术点评 ({ai_analysis.get('updated_at', '')})：\n\n")
                f.write(f"{ai_analysis.get('content', '').strip()}\n\n")

            # 4. 费曼通关
            fey = record.get('feynman', {})
            fw = fey.get('framework', {})
            f.write(f"## 🏆 四、费曼认知通关骨架\n\n")
            f.write(f"- **1. 卦象时势核心判据**：{fw.get('core_trend', '（未填写）')}\n")
            f.write(f"- **2. 核心爻变拐点攻防**：{fw.get('key_yao_turn', '（未填写）')}\n")
            f.write(f"- **3. 现实生活/商业案例映射**：{fw.get('real_case', '（未填写）')}\n")
            f.write(f"- **4. 反常识易道心智底牌**：{fw.get('anti_common_rule', '（未填写）')}\n\n")
            f.write(f"### 综合通俗白话自述全稿：\n\n{fey.get('full_text', '（未填写综合自述）')}\n")

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

        index_data['records'][gua_id] = {
            'gua_id': gua_id,
            'gua_title': record.get('gua_title', gua_id),
            'gua_symbol': record.get('gua_symbol', '☯️'),
            'dialogues_count': len(record.get('dialogues', [])),
            'notes_count': len(record.get('notes', [])),
            'has_review': has_rev,
            'has_feynman': has_fey,
            'has_ai_analysis': bool(rev.get('ai_analysis', {}).get('content')),
            'updated_at': record.get('updated_at', datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            'json_file': f"{safe_name}.json",
            'md_file': f"{safe_name}.md"
        }

        index_data['total_saved_guas'] = len(index_data['records'])
        index_data['last_sync_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        with open(INDEX_FILE, 'w', encoding='utf-8') as f:
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
    server = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), VaultSyncHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已安全退出。")
