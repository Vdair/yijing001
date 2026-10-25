# -*- coding: utf-8 -*-
import re

with open('assets/eco_sphere.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. 修复 hitMesh 尺寸：将 hitRadius 从 4.5 提升到 6.2，增大特写时的拾取命中区域
js = js.replace('const hitRadius = 4.5;', 'const hitRadius = 6.2;')

# 2. 修复 onMouseMove 中的 scale 缩放冲突：移除任何强制更改 node.scale 的代码，改用发光光晕反馈
old_mousemove = '''    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const node = hitObj.parent;

      // 如果处于锁定态，仅高亮当前阵列中的卦
      if (isFocusLocked) {
        const isRelated = node === activeNode || summonedNodes.some(s => s.node === node);
        if (!isRelated) {
          container.style.cursor = 'default';
          tooltip.style.display = 'none';
          return;
        }
      }

      if (hoveredNode !== node) {
        if (hoveredNode && hoveredNode !== activeNode) {
          const isSummoned = summonedNodes.some(s => s.node === hoveredNode);
          hoveredNode.scale.set(isSummoned ? 1.15 : 1, isSummoned ? 1.15 : 1, isSummoned ? 1.15 : 1);
        }
        hoveredNode = node;
        if (node !== activeNode) {
          node.scale.set(1.22, 1.22, 1.22);
        }
      }
      container.style.cursor = 'pointer';
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.innerText = `${node.userData.symbol} ${node.userData.idx + 1 < 10 ? '0' : ''}${node.userData.idx + 1}. ${node.userData.name}`;
    } else {
      if (hoveredNode && hoveredNode !== activeNode) {
        const isSummoned = summonedNodes.some(s => s.node === hoveredNode);
        hoveredNode.scale.set(isSummoned ? 1.15 : 1, isSummoned ? 1.15 : 1, isSummoned ? 1.15 : 1);
      }
      hoveredNode = null;
      container.style.cursor = 'default';
      tooltip.style.display = 'none';
    }'''

new_mousemove = '''    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      if (hitObj === focusVeilMesh) {
        if (hoveredNode) {
          resetHoverHighlight(hoveredNode);
          hoveredNode = null;
        }
        container.style.cursor = 'default';
        tooltip.style.display = 'none';
        return;
      }

      const node = hitObj.parent;
      if (!node || !node.userData) return;

      if (isFocusLocked) {
        const isRelated = node === activeNode || summonedNodes.some(s => s.node === node);
        if (!isRelated) {
          if (hoveredNode) resetHoverHighlight(hoveredNode);
          hoveredNode = null;
          container.style.cursor = 'default';
          tooltip.style.display = 'none';
          return;
        }
      }

      if (hoveredNode !== node) {
        if (hoveredNode) resetHoverHighlight(hoveredNode);
        hoveredNode = node;
        if (node.hitMesh) {
          node.hitMesh.material.opacity = 0.45;
        }
      }

      container.style.cursor = 'pointer';
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.innerText = `${node.userData.symbol} ${node.userData.idx + 1 < 10 ? '0' : ''}${node.userData.idx + 1}. ${node.userData.name}`;
    } else {
      if (hoveredNode) {
        resetHoverHighlight(hoveredNode);
        hoveredNode = null;
      }
      container.style.cursor = 'default';
      tooltip.style.display = 'none';
    }'''

js = js.replace(old_mousemove, new_mousemove)

reset_func = '''  function resetHoverHighlight(node) {
    if (!node || !node.hitMesh) return;
    if (node === activeNode) {
      node.hitMesh.material.opacity = 0.55;
    } else if (summonedNodes.some(s => s.node === node)) {
      node.hitMesh.material.opacity = 0.35;
    } else {
      node.hitMesh.material.opacity = node.userData.isPiGua ? 0.18 : 0.08;
    }
  }
'''

if 'function resetHoverHighlight' not in js:
    js = js.replace('  function setNodeDimmed(node, dimmed) {', reset_func + '\n  function setNodeDimmed(node, dimmed) {')

new_onclick_full = '''  function onClick(event) {
    if (event.target.closest('.hud-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitMeshes = nodes.map(n => n.hitMesh).concat(focusVeilMesh ? [focusVeilMesh] : []);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
      // 优先拾取卦节点，防止误点背后的 focusVeilMesh
      const nodeHit = intersects.find(hit => hit.object !== focusVeilMesh && hit.object.parent && hit.object.parent.userData);

      if (nodeHit) {
        const clickedNode = nodeHit.object.parent;

        if (isFocusLocked) {
          if (clickedNode === activeNode) {
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
          }
          return;
        }

        selectNode(clickedNode, true);
        return;
      }

      // 未命中任何卦，而是真正点击了背景幕布：恢复原状
      const veilHit = intersects.find(hit => hit.object === focusVeilMesh);
      if (veilHit) {
        hideDetailCard();
        return;
      }
    } else {
      hideDetailCard();
    }
  }'''

js = re.sub(r'  function onClick\(event\) \{[\s\S]*?renderer\.render\(scene, camera\);',
            new_onclick_full + '\n\n  // 12. 渲染循环\n  function animate(time) {\n    requestAnimationFrame(animate);\n    TWEEN.update();\n    controls.update();\n\n    if (starfield) {\n      starfield.rotation.y += 0.00025;\n    }\n    if (centralTaiji) {\n      centralTaiji.rotation.y -= 0.0006;\n    }\n\n    renderer.render(scene, camera);', js)

with open('assets/eco_sphere.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("assets/eco_sphere.js updated cleanly without scale jumping.")
