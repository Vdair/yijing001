# -*- coding: utf-8 -*-
with open('assets/eco_sphere.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 增加时间轴相关的变量定义
timeline_vars = '''  // Six Yao Timeline Scrubber State
  let isTimelineActive = false;
  let currentTimelineStep = 1; // 1 to 6
  let timelinePlayTimer = null;
  const yaoTimelineBar = document.getElementById('yao-timeline-bar');
  const tlGuaName = document.getElementById('tl-gua-name');
  const tlStageTag = document.getElementById('tl-stage-tag');
  const tlStageDesc = document.getElementById('tl-stage-desc');
  const tlProgressFill = document.getElementById('tl-progress-fill');
  const tlBtnPlay = document.getElementById('tl-btn-play');
  const tlBtnReset = document.getElementById('tl-btn-reset');
  const tlBtnClose = document.getElementById('tl-btn-close');
  const btnTriggerTimeline = document.getElementById('btn-trigger-timeline');
  const tlStepBtns = document.querySelectorAll('.tl-step-btn');

  const YAO_STAGES = [
    { tag: '初爻 · 基层潜伏', desc: '地道之初：深潜扎根，未可施用。积蓄势能摸清规则，切忌盲动出风头。' },
    { tag: '二爻 · 破土崭露', desc: '地道之中：崭露头角，德施普也。主动对接大人贵人，借力平台把成果放大。' },
    { tag: '三爻 · 夹层危厉', desc: '人道之始：进德修业，夕惕若厉。处于基层之上高管之下，防骄戒躁守底线。' },
    { tag: '四爻 · 审慎跃迁', desc: '人道之终：或跃在渊，进退有恒。跃迁关键分水岭，敏捷试错，始终留足退路。' },
    { tag: '五爻 · 至尊执中', desc: '天道之中：飞龙在天，大人造也。掌舵领袖搭建生态，同气相求，互相成就。' },
    { tag: '上爻 · 极盛知退', desc: '天道之极：亢龙有悔，盈不可久。任何事物达到极点必然反转，居安思危提前布局。' }
  ];
'''

js = js.replace('  let isFocusLocked = false;', timeline_vars + '\n  let isFocusLocked = false;')

# 增加六爻时间进度推进的核心动画函数
timeline_funcs = '''
  // 激活六爻时位演进时间轴
  function activateYaoTimeline(node) {
    if (!node) return;
    isTimelineActive = true;
    currentTimelineStep = 1;
    if (tlGuaName) {
      tlGuaName.innerText = `${node.userData.idx + 1 < 10 ? '0' : ''}${node.userData.idx + 1}. ${node.userData.name} · 六爻时位演进`;
    }
    if (yaoTimelineBar) {
      yaoTimelineBar.classList.add('active');
    }
    applyTimelineStep(1, true);
  }

  function closeYaoTimeline() {
    isTimelineActive = false;
    stopTimelinePlay();
    if (yaoTimelineBar) {
      yaoTimelineBar.classList.remove('active');
    }
    // 恢复六爻全亮状态
    if (activeNode) {
      restoreAllYaoLines(activeNode);
    }
  }

  function applyTimelineStep(step, animate = true) {
    currentTimelineStep = step;
    if (!activeNode) return;

    // 1) 更新 UI 文字与进度条
    const stageInfo = YAO_STAGES[step - 1];
    if (tlStageTag) tlStageTag.innerText = stageInfo.tag;
    if (tlStageDesc) tlStageDesc.innerText = stageInfo.desc;
    if (tlProgressFill) {
      tlProgressFill.style.width = `${(step / 6) * 100}%`;
    }

    // 按钮高亮状态
    tlStepBtns.forEach(btn => {
      const bStep = parseInt(btn.getAttribute('data-step'));
      btn.classList.remove('current', 'passed');
      if (bStep === step) btn.classList.add('current');
      else if (bStep < step) btn.classList.add('passed');
    });

    // 2) 3D 六爻自下而上动态显隐与生长
    const linesGroup = activeNode.linesGroup;
    if (!linesGroup) return;

    // linesGroup 中每个爻可能包含 1 个 mesh (阳) 或 2 个 mesh (阴)
    // 按照 lines 的索引 0 到 5 归组
    const yaoMeshes = [];
    linesGroup.children.forEach(mesh => yaoMeshes.push(mesh));

    // lines: [初, 二, 三, 四, 五, 上]
    let meshIdx = 0;
    activeNode.userData.lines.forEach((lineVal, lIdx) => {
      const isYang = (lineVal === 1);
      const meshesForThisYao = isYang ? [yaoMeshes[meshIdx++]] : [yaoMeshes[meshIdx++], yaoMeshes[meshIdx++]];

      meshesForThisYao.forEach(mesh => {
        if (!mesh) return;
        if (lIdx < step) {
          // 已生发的爻：实体高亮呈现
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
          if (lIdx === step - 1 && animate) {
            // 当前刚生发的一爻：带有缩放生长动画！
            mesh.scale.set(0.1, 1, 0.1);
            new TWEEN.Tween(mesh.scale)
              .to({ x: 1, y: 1, z: 1 }, 350)
              .easing(TWEEN.Easing.Back.Out)
              .start();
          } else {
            mesh.scale.set(1, 1, 1);
          }
        } else {
          // 未来未到时位的爻：暗化半透明虚隐！
          mesh.material.transparent = true;
          mesh.material.opacity = 0.12;
        }
      });
    });
  }

  function restoreAllYaoLines(node) {
    if (!node || !node.linesGroup) return;
    node.linesGroup.children.forEach(mesh => {
      mesh.material.transparent = false;
      mesh.material.opacity = 1.0;
      mesh.scale.set(1, 1, 1);
    });
  }

  function toggleTimelinePlay() {
    if (timelinePlayTimer) {
      stopTimelinePlay();
    } else {
      startTimelinePlay();
    }
  }

  function startTimelinePlay() {
    if (tlBtnPlay) tlBtnPlay.innerText = '⏸ 暂停';
    timelinePlayTimer = setInterval(() => {
      let nextStep = currentTimelineStep + 1;
      if (nextStep > 6) {
        nextStep = 1; // 循环或重置
      }
      applyTimelineStep(nextStep, true);
    }, 1300);
  }

  function stopTimelinePlay() {
    if (timelinePlayTimer) {
      clearInterval(timelinePlayTimer);
      timelinePlayTimer = null;
    }
    if (tlBtnPlay) tlBtnPlay.innerText = '▶ 自动演进';
  }
'''

js = js.replace('  // 7. 解除锁定，平滑归位', timeline_funcs + '\n  // 7. 解除锁定，平滑归位')

# 在 hideDetailCard 时也关闭时间轴
js = js.replace('  function hideDetailCard() {\n    detailCard.classList.remove(\'active\');',
                '  function hideDetailCard() {\n    closeYaoTimeline();\n    detailCard.classList.remove(\'active\');')

# 在 setupEvents 中绑定时间轴事件
timeline_events = '''    // 六爻时位时间轴按钮事件
    if (btnTriggerTimeline) {
      btnTriggerTimeline.addEventListener('click', () => {
        if (activeNode) activateYaoTimeline(activeNode);
      });
    }

    if (tlBtnPlay) tlBtnPlay.addEventListener('click', toggleTimelinePlay);
    if (tlBtnReset) tlBtnReset.addEventListener('click', () => {
      stopTimelinePlay();
      applyTimelineStep(1, true);
    });
    if (tlBtnClose) tlBtnClose.addEventListener('click', closeYaoTimeline);

    tlStepBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        stopTimelinePlay();
        const step = parseInt(e.currentTarget.getAttribute('data-step'));
        applyTimelineStep(step, true);
      });
    });
'''

js = js.replace('    document.getElementById(\'card-close-btn\').addEventListener(\'click\', hideDetailCard);',
                '    document.getElementById(\'card-close-btn\').addEventListener(\'click\', hideDetailCard);\n' + timeline_events)

# 在 onClick 中，如果再次点击本卦，直接触发或切换六爻时间推进！
reclick_code = '''      // 如果处于【四维拓扑研习锁定态】：
      if (isFocusLocked) {
        if (clickedNode === activeNode) {
          // 【再次点击本卦】：直接激活并推进六爻时位演进！
          if (!isTimelineActive) {
            activateYaoTimeline(activeNode);
          } else {
            let nextStep = currentTimelineStep + 1;
            if (nextStep > 6) nextStep = 1;
            applyTimelineStep(nextStep, true);
          }
          return;
        }

        const isCurrentCluster = clickedNode === activeNode || summonedNodes.some(s => s.node === clickedNode);
        if (isCurrentCluster) {
          showDetailCard(clickedNode.userData);
          return;
        } else {
          return;
        }
      }'''

js = js.replace('''      // 如果处于【四维拓扑研习锁定态】：
      if (isFocusLocked) {
        const isCurrentCluster = clickedNode === activeNode || summonedNodes.some(s => s.node === clickedNode);
        if (isCurrentCluster) {
          // 在阵列内点击某个卦，仅切换右侧详情卡并微调高亮，保持锁定不跳出！
          showDetailCard(clickedNode.userData);
          return;
        } else {
          // 点击了远处无关背景卦：在锁定态下不做任何切换，避免误触！
          return;
        }
      }''', reclick_code)

with open('assets/eco_sphere.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("assets/eco_sphere.js updated with Six Yao Timeline Scrubber successfully.")
