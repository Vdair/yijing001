#!/usr/bin/env bash
# ============================================================
# 易道认知工坊 · 一键启动本地修学档案同步与自修课堂服务
# ============================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT="${PORT:-8090}"

echo "☯️ ==========================================================="
echo "    易道认知工坊 · 东方现代沉浸式自修课堂"
echo "    本地项目数据自动落盘守护服务 (Vault Auto-Sync)"
echo "============================================================"
echo "📁 数据落盘目录: $DIR/data/learning_vault"
echo "🚀 服务端口: http://127.0.0.1:$PORT"
echo "🌐 课堂页面: http://127.0.0.1:$PORT/learn.html"
echo "🏠 主页导航: http://127.0.0.1:$PORT/index.html"
echo "============================================================"

# 检查 Python 环境
if command -v python3 >/dev/null 2>&1; then
    PY_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PY_CMD="python"
else
    echo "❌ 错误: 未检测到 Python 环境，请先安装 Python 3。"
    exit 1
fi

# 检查端口是否已被占用
if lsof -Pi :"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️ 端口 $PORT 已在运行中，守护进程已处于就绪状态。"
    echo "👉 请直接在浏览器打开: http://127.0.0.1:$PORT/learn.html"
    exit 0
fi

# 启动守护与静态服务器
exec "$PY_CMD" "$DIR/scripts/sync_vault_server.py"
