#!/usr/bin/env bash
# ============================================================
# 易道认知工坊 · 修学档案多端云同步脚本 (Git Sync)
# ============================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "☯️ ==========================================================="
echo "    易道认知工坊 · 修学档案跨端同步"
echo "============================================================"

# 1. 检查是否有未拉取的远程更新
echo "📡 正在检查远程修学档案更新..."
git fetch origin main --quiet || true

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "📥 发现云端有更新，正在同步合并..."
    git pull --rebase origin main || git pull origin main
    echo "✅ 云端最新档案已同步至本地！"
fi

# 2. 检查本地是否有新的笔记、复盘、费曼记录
if [ -n "$(git status --porcelain data/learning_vault/)" ]; then
    echo "📝 检测到本地有新产生的修学笔记/复盘数据："
    git status -s data/learning_vault/
    
    echo "💾 正在提交并推送到云端..."
    git add data/learning_vault/
    TIME_STR=$(date "+%Y-%m-%d %H:%M:%S")
    git commit -m "docs(vault): 同步修学档案与悟道复盘实录 ($TIME_STR)"
    git push origin main
    echo "🚀 本地修学记录已成功同步到远程 Git 仓库！"
else
    echo "🟢 本地修学档案已是最新，无待推送变动。"
fi

echo "============================================================"
echo "✨ 同步完毕！您可以在任何设备执行本脚本保持档案无缝一致。"
echo "============================================================"
