# -*- coding: utf-8 -*-
with open('assets/eco_sphere.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 检查或替换场景中的 3D 遮罩板逻辑
# 在 initScene() 后创建 focusVeilMesh
veil_init_code = '''  let focusVeilMesh; // 原生 3D 幕布，位于本卦后方遮蔽背景，保证卦在遮罩上方清晰呈现！'''

js = js.replace('  let isFocusLocked = false;', '  let isFocusLocked = false;\n' + veil_init_code)

# 在 initBackgroundElements 中加入 focusVeilMesh 的创建
veil_create_code = '''    // 3D Focus Veil (放置于被选卦象背后，遮蔽远处其余卦，使当前卦阵完全位于遮罩前表面清晰可见)
    const veilGeo = new THREE.PlaneGeometry(600, 600);
    const veilMat = new THREE.MeshBasicMaterial({
      color: 0x050713,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    focusVeilMesh = new THREE.Mesh(veilGeo, veilMat);
    focusVeilMesh.visible = false;
    scene.add(focusVeilMesh);'''

js = js.replace('    centralTaiji.add(ringMesh);\n  }', '    centralTaiji.add(ringMesh);\n\n' + veil_create_code + '\n  }')

# 在 summonRelatedHexagrams 中定位 focusVeilMesh
# 放在 cPos + forward * (-18)，也就是面向相机方向的背后！
veil_summon_code = '''    // 将 3D 遮罩板精准定位到本卦的背后（背对相机方向后退 16 个单位）
    if (focusVeilMesh) {
      const veilPos = cPos.clone().sub(forward.clone().multiplyScalar(16));
      focusVeilMesh.position.copy(veilPos);
      focusVeilMesh.lookAt(camera.position);
      focusVeilMesh.visible = true;
      new TWEEN.Tween(focusVeilMesh.material)
        .to({ opacity: 0.88 }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }'''

js = js.replace("    if (focusBackdrop) {\n      focusBackdrop.classList.add('active');\n    }", 
                "    if (focusBackdrop) {\n      focusBackdrop.classList.add('active');\n    }\n" + veil_summon_code)

# 在 dismissSummoned 中淡出 focusVeilMesh
veil_dismiss_code = '''    if (focusVeilMesh && focusVeilMesh.visible) {
      new TWEEN.Tween(focusVeilMesh.material)
        .to({ opacity: 0 }, 450)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          focusVeilMesh.visible = false;
        })
        .start();
    }'''

js = js.replace("    if (focusBackdrop) {\n      focusBackdrop.classList.remove('active');\n    }",
                "    if (focusBackdrop) {\n      focusBackdrop.classList.remove('active');\n    }\n" + veil_dismiss_code)

# 在 onClick 中支持点击 focusVeilMesh 恢复原状
js = js.replace("      // 如果处于【四维拓扑研习锁定态】：\n      if (isFocusLocked) {",
'''      // 点击了 3D 幕布，平滑恢复原状！
      if (hitObj === focusVeilMesh) {
        hideDetailCard();
        return;
      }

      // 如果处于【四维拓扑研习锁定态】：
      if (isFocusLocked) {''')

# 在 onMouseMove 中忽略 focusVeilMesh 的悬停命中
js = js.replace("    const hitMeshes = nodes.map(n => n.hitMesh);",
                "    const hitMeshes = nodes.map(n => n.hitMesh).concat(focusVeilMesh ? [focusVeilMesh] : []);")

with open('assets/eco_sphere.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("assets/eco_sphere.js with 3D veil updated successfully.")
