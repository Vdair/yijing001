/**
 * 易道六十四卦 3D 全息生态圈
 * Cosmic Hexagram 3D Ecosystem
 * 特性：
 * 1. 3D引力召唤：点击卦象将错/综/互/序卦平滑召唤至本卦四周整齐排布
 * 2. 锁定研习态：召唤后激活全景暗光半透明蒙版，点击阵列内其他卦保持锁定不跳出，便于细致研读
 * 3. 点击蒙版/恢复按钮：平滑倒流飞回原有宇宙轨道，恢复全景
 */

(function () {
  'use strict';

  if (!window.ECO_DATA || !window.THREE) {
    console.error('ECO_DATA or THREE not loaded');
    return;
  }

  const data = window.ECO_DATA;
  let scene, camera, renderer, controls;
  let starfield, centralTaiji;
  const nodes = [];
  let activeNode = null;
  let currentMode = 'sphere';
  let activeRelationLines = [];
  let summonedNodes = [];
  let isFocusLocked = false;
  let focusVeilMesh; // 原生 3D 幕布，位于本卦后方遮蔽背景，保证卦在遮罩上方清晰呈现！ // 是否处于四维拓扑研习锁定态
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode = null;
  let isAutoRotating = false;

  const container = document.getElementById('canvas-container');
  const tooltip = document.getElementById('hover-tooltip');
  const detailCard = document.getElementById('detail-card');
  const focusBackdrop = document.getElementById('focus-backdrop');
  const btnRestorePill = document.getElementById('btn-restore-pill');

  // Materials & Colors
  const COLORS = {
    gold: 0xd4af37,
    goldGlow: 0xffe082,
    blue: 0x38bdf8,
    red: 0xf43f5e,
    green: 0x34d399,
    purple: 0xc084fc,
    cyan: 0x38bdf8,
    bgSpace: 0x070913
  };

  initScene();
  initBackgroundElements();
  buildNodes();
  calculatePositions();
  applyPositions(currentMode, false);
  setupEvents();
  animate();

  // 1. Scene Initialization
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bgSpace);
    scene.fog = new THREE.FogExp2(COLORS.bgSpace, 0.002);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 35, 250);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 550;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.3);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x88bbff, 0.9);
    dirLight2.position.set(-100, -100, -100);
    scene.add(dirLight2);
  }

  // 2. Cosmic Background Elements
  function initBackgroundElements() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 180 + Math.random() * 320;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = Math.random() > 0.6 ? new THREE.Color(COLORS.goldGlow) : new THREE.Color(COLORS.blue);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    starfield = new THREE.Points(geometry, material);
    scene.add(starfield);

    const coreGeo = new THREE.SphereGeometry(14, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    centralTaiji = new THREE.Mesh(coreGeo, coreMat);
    scene.add(centralTaiji);

    const ringGeo = new THREE.RingGeometry(18, 18.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: COLORS.gold,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    centralTaiji.add(ringMesh);

    // 3D Focus Veil (放置于被选卦象背后，遮蔽远处其余卦，使当前卦阵完全位于遮罩前表面清晰可见)
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
    scene.add(focusVeilMesh);
  }

  // 3. Build Hexagram 3D Nodes
  function buildNodes() {
    data.forEach((item, idx) => {
      const group = new THREE.Group();
      group.userData = item;
      item.nodeGroup = group;

      const yaoHeight = 0.55;
      const yaoWidth = 4.2;
      const yaoDepth = 0.5;
      const yaoGap = 0.35;

      const yangMat = new THREE.MeshStandardMaterial({
        color: COLORS.gold,
        emissive: 0x997015,
        roughness: 0.3,
        metalness: 0.8
      });

      const yinMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        roughness: 0.3,
        metalness: 0.7
      });

      const linesGroup = new THREE.Group();

      item.lines.forEach((lineVal, lineIdx) => {
        const y = (lineIdx - 2.5) * (yaoHeight + yaoGap);
        if (lineVal === 1) {
          const geom = new THREE.BoxGeometry(yaoWidth, yaoHeight, yaoDepth);
          const mesh = new THREE.Mesh(geom, yangMat);
          mesh.position.set(0, y, 0);
          linesGroup.add(mesh);
        } else {
          const segWidth = (yaoWidth - 0.9) / 2;
          const geom1 = new THREE.BoxGeometry(segWidth, yaoHeight, yaoDepth);
          const geom2 = new THREE.BoxGeometry(segWidth, yaoHeight, yaoDepth);
          const mesh1 = new THREE.Mesh(geom1, yinMat);
          const mesh2 = new THREE.Mesh(geom2, yinMat);
          mesh1.position.set(-segWidth / 2 - 0.45, y, 0);
          mesh2.position.set(segWidth / 2 + 0.45, y, 0);
          linesGroup.add(mesh1);
          linesGroup.add(mesh2);
        }
      });
      group.add(linesGroup);
      group.linesGroup = linesGroup;

      const hitRadius = 4.5;
      const hitGeo = new THREE.SphereGeometry(hitRadius, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        color: item.isPiGua ? COLORS.red : COLORS.gold,
        transparent: true,
        opacity: item.isPiGua ? 0.18 : 0.08,
        wireframe: true
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      group.add(hitMesh);
      group.hitMesh = hitMesh;

      const sprite = makeTextSprite(`${item.idx + 1 < 10 ? '0' : ''}${item.idx + 1} ${item.name}`, item.symbol);
      sprite.position.set(0, 3.8, 0);
      group.add(sprite);
      group.labelSprite = sprite;

      const relBadge = makeRelationBadgeSprite('');
      relBadge.position.set(0, -3.8, 0);
      relBadge.visible = false;
      group.add(relBadge);
      group.relBadgeSprite = relBadge;

      scene.add(group);
      nodes.push(group);
    });
  }

  function makeTextSprite(title, symbol) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(10, 14, 26, 0.8)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 2;
    roundRect(ctx, 4, 4, 248, 92, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 36px "Noto Serif SC", serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${symbol} ${title}`, 128, 58);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(7.5, 3.0, 1.0);
    return sprite;
  }

  function makeRelationBadgeSprite(text, colorHex = '#f43f5e') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 70;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(7.0, 2.0, 1.0);
    sprite.updateText = function (newText, newColorHex) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 70);
      if (!newText) return;
      ctx.fillStyle = 'rgba(14, 18, 36, 0.9)';
      ctx.strokeStyle = newColorHex || '#f43f5e';
      ctx.lineWidth = 3;
      roundRect(ctx, 4, 4, 248, 62, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 28px "Noto Serif SC", serif';
      ctx.fillStyle = newColorHex || '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText(newText, 128, 44);
      texture.needsUpdate = true;
    };
    if (text) sprite.updateText(text, colorHex);
    return sprite;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 4. Calculate Coordinates for Topologies
  function calculatePositions() {
    const R_SPHERE = 110;
    const levels = [[], [], [], [], [], [], []];
    nodes.forEach(n => {
      levels[n.userData.yangCount].push(n);
    });

    levels.forEach((list, levelIdx) => {
      const latRatio = (levelIdx - 3) / 3;
      const y = latRatio * (R_SPHERE * 0.85);
      const r_ring = Math.sqrt(Math.max(0, R_SPHERE * R_SPHERE - y * y));

      list.forEach((node, i) => {
        const theta = (i / list.length) * Math.PI * 2 + (levelIdx * 0.4);
        const x = r_ring * Math.cos(theta);
        const z = r_ring * Math.sin(theta);
        node.posSphere = new THREE.Vector3(x, y, z);
      });
    });

    nodes.forEach((node, i) => {
      const t = i / 63;
      const spiralRevs = 3.5;
      const angle = t * Math.PI * 2 * spiralRevs;
      const y = (t - 0.5) * 190;
      const r = 85 + 20 * Math.sin(t * Math.PI);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      node.posSpiral = new THREE.Vector3(x, y, z);
    });

    nodes.forEach((node, i) => {
      const palaceIdx = Math.floor(i / 8);
      const orderInPalace = i % 8;
      const angle = (palaceIdx / 8) * Math.PI * 2;
      const dist = 40 + orderInPalace * 14;
      const y = (orderInPalace - 3.5) * 8;
      const x = dist * Math.cos(angle);
      const z = dist * Math.sin(angle);
      node.posPalaces = new THREE.Vector3(x, y, z);
    });
  }

  function getHomePos(node, mode = currentMode) {
    if (mode === 'sphere') return node.posSphere;
    if (mode === 'spiral') return node.posSpiral;
    if (mode === 'palaces') return node.posPalaces;
    return node.posSphere;
  }

  function applyPositions(mode, animate = true) {
    currentMode = mode;
    dismissSummoned(false);

    nodes.forEach(node => {
      const targetPos = getHomePos(node, mode);

      if (!animate) {
        node.position.copy(targetPos);
        node.lookAt(0, 0, 0);
      } else {
        new TWEEN.Tween(node.position)
          .to(targetPos, 1100)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();

        const dummy = new THREE.Object3D();
        dummy.position.copy(targetPos);
        dummy.lookAt(0, 0, 0);
        new TWEEN.Tween(node.rotation)
          .to({ x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z }, 1100)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }
    });

    if (activeNode) {
      setTimeout(() => summonRelatedHexagrams(activeNode), animate ? 1150 : 50);
    }
  }

  // 6. 全息引力召唤排布并锁定
  function summonRelatedHexagrams(centerNode) {
    dismissSummoned(true);

    if (!centerNode) return;
    const d = centerNode.userData;
    const cPos = centerNode.position;

    const forward = new THREE.Vector3().subVectors(camera.position, cPos).normalize();
    const up = camera.up.clone().normalize();
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(forward, right).normalize();

    const DIST_H = 22;
    const DIST_V = 16;

    const summonConfigs = [
      {
        type: 'cuo',
        idx: d.cuo.idx,
        label: '错卦 · 对冲互补',
        colorHex: '#f43f5e',
        colorVal: COLORS.red,
        offset: right.clone().multiplyScalar(-DIST_H)
      },
      {
        type: 'zong',
        idx: d.zong.idx,
        label: '综卦 · 换位思考',
        colorHex: '#34d399',
        colorVal: COLORS.green,
        offset: right.clone().multiplyScalar(DIST_H)
      },
      {
        type: 'hu',
        idx: d.hu.idx,
        label: '互卦 · 内生动力',
        colorHex: '#c084fc',
        colorVal: COLORS.purple,
        offset: correctedUp.clone().multiplyScalar(DIST_V)
      },
      {
        type: 'xu',
        idx: d.next.idx,
        label: '序卦 · 演进下阶',
        colorHex: '#38bdf8',
        colorVal: COLORS.cyan,
        offset: correctedUp.clone().multiplyScalar(-DIST_V)
      }
    ];

    const activeIndices = new Set([
      centerNode.userData.idx,
      d.cuo.idx,
      d.zong.idx,
      d.hu.idx,
      d.next.idx
    ]);

    nodes.forEach(n => {
      const isRelated = activeIndices.has(n.userData.idx);
      setNodeDimmed(n, !isRelated);
    });

    summonConfigs.forEach(cfg => {
      if (cfg.idx === undefined || cfg.idx === null) return;
      const targetNode = nodes[cfg.idx];
      if (!targetNode || targetNode === centerNode) return;

      const homePos = getHomePos(targetNode, currentMode).clone();
      summonedNodes.push({
        node: targetNode,
        homePos: homePos,
        relType: cfg.type
      });

      const targetPos = cPos.clone().add(cfg.offset).add(forward.clone().multiplyScalar(3));

      new TWEEN.Tween(targetNode.position)
        .to(targetPos, 850)
        .easing(TWEEN.Easing.Back.Out)
        .start();

      new TWEEN.Tween(targetNode.rotation)
        .to({ x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z }, 850)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      targetNode.scale.set(1.15, 1.15, 1.15);
      targetNode.hitMesh.material.opacity = 0.35;
      targetNode.hitMesh.material.color.setHex(cfg.colorVal);

      targetNode.relBadgeSprite.updateText(cfg.label, cfg.colorHex);
      targetNode.relBadgeSprite.visible = true;
    });

    setTimeout(() => {
      updateRelationLines(centerNode, summonConfigs);
    }, 400);

    // 激活蒙版与锁定状态
    isFocusLocked = true;
    if (focusBackdrop) {
      focusBackdrop.classList.add('active');
    }
    // 将 3D 遮罩板精准定位到本卦的背后（背对相机方向后退 16 个单位）
    if (focusVeilMesh) {
      const veilPos = cPos.clone().sub(forward.clone().multiplyScalar(16));
      focusVeilMesh.position.copy(veilPos);
      focusVeilMesh.lookAt(camera.position);
      focusVeilMesh.visible = true;
      new TWEEN.Tween(focusVeilMesh.material)
        .to({ opacity: 0.88 }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  }

  // 7. 解除锁定，平滑归位
  function dismissSummoned(keepActiveLines = false) {
    if (!keepActiveLines) {
      clearRelationLines();
    }

    if (summonedNodes.length > 0) {
      summonedNodes.forEach(item => {
        const node = item.node;
        new TWEEN.Tween(node.position)
          .to(item.homePos, 700)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        const dummy = new THREE.Object3D();
        dummy.position.copy(item.homePos);
        dummy.lookAt(0, 0, 0);
        new TWEEN.Tween(node.rotation)
          .to({ x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z }, 700)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        node.scale.set(1, 1, 1);
        node.hitMesh.material.opacity = node.userData.isPiGua ? 0.18 : 0.08;
        node.hitMesh.material.color.setHex(node.userData.isPiGua ? COLORS.red : COLORS.gold);
        node.relBadgeSprite.visible = false;
      });
      summonedNodes = [];
    }

    nodes.forEach(n => setNodeDimmed(n, false));

    isFocusLocked = false;
    if (focusBackdrop) {
      focusBackdrop.classList.remove('active');
    }
    if (focusVeilMesh && focusVeilMesh.visible) {
      new TWEEN.Tween(focusVeilMesh.material)
        .to({ opacity: 0 }, 450)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          focusVeilMesh.visible = false;
        })
        .start();
    }
  }

  // 8. 绘制四维连线
  function updateRelationLines(sourceNode, configs) {
    clearRelationLines();
    if (!sourceNode || !configs) return;

    const sPos = sourceNode.position;

    configs.forEach(cfg => {
      if (cfg.idx === undefined || cfg.idx === null) return;
      const targetNode = nodes[cfg.idx];
      if (!targetNode || targetNode === sourceNode) return;

      const tPos = targetNode.position;
      const mid = new THREE.Vector3().addVectors(sPos, tPos).multiplyScalar(0.5);
      const dist = sPos.distanceTo(tPos);
      mid.y += dist * 0.12;

      const curve = new THREE.QuadraticBezierCurve3(sPos, mid, tPos);
      const points = curve.getPoints(30);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: cfg.colorVal,
        transparent: true,
        opacity: 0.85,
        linewidth: 2.5
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      activeRelationLines.push(line);
    });
  }

  function clearRelationLines() {
    activeRelationLines.forEach(line => {
      scene.remove(line);
      if (line.geometry) line.geometry.dispose();
      if (line.material) line.material.dispose();
    });
    activeRelationLines = [];
  }

  // 9. 选择卦象
  function selectNode(node, animateCamera = true) {
    activeNode = node;

    node.scale.set(1.3, 1.3, 1.3);
    node.hitMesh.material.opacity = 0.55;
    node.hitMesh.material.color.setHex(COLORS.gold);

    if (animateCamera) {
      const targetPos = node.position;
      const dir = targetPos.clone().normalize();
      const camTargetPos = targetPos.clone().add(dir.multiplyScalar(68));

      new TWEEN.Tween(camera.position)
        .to(camTargetPos, 900)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      new TWEEN.Tween(controls.target)
        .to(targetPos, 900)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }

    summonRelatedHexagrams(node);
    showDetailCard(node.userData);
  }

  // 10. 全息详情卡
  function showDetailCard(d) {
    document.getElementById('card-symbol').innerText = d.symbol;
    document.getElementById('card-title').innerText = `${d.idx + 1 < 10 ? '0' : ''}${d.idx + 1}. ${d.name}`;
    document.getElementById('card-part').innerText = d.partNum || '演进阶段';
    document.getElementById('card-upper-lower').innerText = `上${d.upper}下${d.lower}`;

    const piBadge = document.getElementById('card-pi-badge');
    const piBox = document.getElementById('card-pi-box');
    const piDesc = document.getElementById('card-pi-desc');
    if (d.isPiGua) {
      piBadge.style.display = 'inline-block';
      piBox.style.display = 'block';
      piDesc.innerText = d.piInfo;
    } else {
      piBadge.style.display = 'none';
      piBox.style.display = 'none';
    }

    document.getElementById('card-motto').innerText = d.motto || '刚健笃实，辉光日新。';

    document.getElementById('rel-cuo-name').innerText = d.cuo.name || '对冲卦';
    document.getElementById('rel-zong-name').innerText = d.zong.name || '颠倒卦';
    document.getElementById('rel-hu-name').innerText = d.hu.name || '内生互卦';
    document.getElementById('rel-xu-name').innerText = d.next.name || '下一阶段';

    const studyBtn = document.getElementById('study-btn');
    studyBtn.href = `learn.html?lesson=${encodeURIComponent(d.id)}`;

    detailCard.classList.add('active');
  }

  function hideDetailCard() {
    detailCard.classList.remove('active');
    dismissSummoned(false);
    if (activeNode) {
      activeNode.scale.set(1, 1, 1);
      activeNode.hitMesh.material.opacity = activeNode.userData.isPiGua ? 0.18 : 0.08;
      activeNode = null;
    }
  }

  // 11. 事件与交互
  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);

    // 点击蒙版恢复原状！
    if (focusBackdrop) {
      focusBackdrop.addEventListener('click', e => {
        // 如果点击的是提示栏本身则不误关，点击蒙版空白区域或关闭按钮则恢复
        if (e.target === focusBackdrop || e.target.id === 'btn-restore-pill') {
          hideDetailCard();
        }
      });
    }

    if (btnRestorePill) {
      btnRestorePill.addEventListener('click', hideDetailCard);
    }

    // 视图模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        const mode = targetBtn.getAttribute('data-mode');
        applyPositions(mode, true);
      });
    });

    document.getElementById('card-close-btn').addEventListener('click', hideDetailCard);

    // 详情卡片点击四维卦名：在当前研习态下切换详情卡展示，不解散阵列
    document.getElementById('rel-cuo').addEventListener('click', () => {
      if (activeNode && activeNode.userData.cuo.idx !== undefined) {
        showDetailCard(nodes[activeNode.userData.cuo.idx].userData);
      }
    });
    document.getElementById('rel-zong').addEventListener('click', () => {
      if (activeNode && activeNode.userData.zong.idx !== undefined) {
        showDetailCard(nodes[activeNode.userData.zong.idx].userData);
      }
    });
    document.getElementById('rel-hu').addEventListener('click', () => {
      if (activeNode && activeNode.userData.hu.idx !== undefined) {
        showDetailCard(nodes[activeNode.userData.hu.idx].userData);
      }
    });
    document.getElementById('rel-xu').addEventListener('click', () => {
      if (activeNode && activeNode.userData.next.idx !== undefined) {
        showDetailCard(nodes[activeNode.userData.next.idx].userData);
      }
    });

    // 过滤器选择
    const filterSelect = document.getElementById('filter-select');
    filterSelect.addEventListener('change', e => {
      const val = e.target.value;
      dismissSummoned(false);
      nodes.forEach(n => {
        const d = n.userData;
        let visible = true;
        if (val === 'pi-gua') visible = d.isPiGua;
        else if (val === 'upper-30') visible = d.idx < 30;
        else if (val === 'lower-34') visible = d.idx >= 30;
        else if (val.startsWith('part-')) {
          const partIdx = parseInt(val.replace('part-', ''));
          visible = Math.floor(d.idx / 8) + 1 === partIdx;
        }
        setNodeDimmed(n, !visible);
      });
    });

    // 搜索
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        dismissSummoned(false);
        return;
      }
      nodes.forEach(n => {
        const d = n.userData;
        const match = d.name.toLowerCase().includes(q) ||
                      d.navTitle.toLowerCase().includes(q) ||
                      String(d.idx + 1) === q;
        setNodeDimmed(n, !match);
        if (match && activeNode !== n) {
          selectNode(n, true);
        }
      });
    });

    // 自动巡航漫游
    const autoRotateBtn = document.getElementById('btn-auto-rotate');
    autoRotateBtn.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      controls.autoRotate = isAutoRotating;
      autoRotateBtn.style.background = isAutoRotating ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.2)';
    });
  }

  function setNodeDimmed(node, dimmed) {
    const opacity = dimmed ? 0.12 : 1.0;
    node.linesGroup.children.forEach(mesh => {
      mesh.material.transparent = dimmed;
      mesh.material.opacity = opacity;
    });
    node.labelSprite.material.opacity = dimmed ? 0.18 : 1.0;
    node.hitMesh.visible = !dimmed;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitMeshes = nodes.map(n => n.hitMesh).concat(focusVeilMesh ? [focusVeilMesh] : []);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
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
    }
  }

  function onClick(event) {
    if (event.target.closest('.hud-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitMeshes = nodes.map(n => n.hitMesh).concat(focusVeilMesh ? [focusVeilMesh] : []);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const clickedNode = hitObj.parent;

      // 点击了 3D 幕布，平滑恢复原状！
      if (hitObj === focusVeilMesh) {
        hideDetailCard();
        return;
      }

      // 如果处于【四维拓扑研习锁定态】：
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
      }

      // 未锁定态：正常触发引力召唤
      selectNode(clickedNode, true);
    } else {
      // 点击了空白星空区域：平滑恢复原状！
      hideDetailCard();
    }
  }

  // 12. 渲染循环
  function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();

    if (starfield) {
      starfield.rotation.y += 0.00025;
    }
    if (centralTaiji) {
      centralTaiji.rotation.y -= 0.0006;
    }

    renderer.render(scene, camera);
  }

})();
