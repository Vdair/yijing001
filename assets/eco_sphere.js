/**
 * 易道六十四卦 3D 全息生态圈
 * Cosmic Hexagram 3D Ecosystem
 * 特性：点击任意卦象触发【全息引力召唤排布】（错综互序卦优雅平滑移动至本卦四周，点击空白处平滑归位）
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
  let summonedNodes = []; // 记录当前被召唤移动到附近的节点与原本位置
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode = null;
  let isAutoRotating = false;

  const container = document.getElementById('canvas-container');
  const tooltip = document.getElementById('hover-tooltip');
  const detailCard = document.getElementById('detail-card');

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

    // Ambient & Directional Lights
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

    // Center Taiji Orb
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
  }

  // 3. Build Hexagram 3D Nodes
  function buildNodes() {
    data.forEach((item, idx) => {
      const group = new THREE.Group();
      group.userData = item;
      item.nodeGroup = group;

      // 6 Yao Lines
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
          // Yang (Solid)
          const geom = new THREE.BoxGeometry(yaoWidth, yaoHeight, yaoDepth);
          const mesh = new THREE.Mesh(geom, yangMat);
          mesh.position.set(0, y, 0);
          linesGroup.add(mesh);
        } else {
          // Yin (Broken into two segments)
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

      // Hit sphere for Raycaster & Halo
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

      // Sprite Label
      const sprite = makeTextSprite(`${item.idx + 1 < 10 ? '0' : ''}${item.idx + 1} ${item.name}`, item.symbol);
      sprite.position.set(0, 3.8, 0);
      group.add(sprite);
      group.labelSprite = sprite;

      // Special Relationship Badge Sprite (initially hidden, used during summoning)
      const relBadge = makeRelationBadgeSprite('');
      relBadge.position.set(0, -3.8, 0);
      relBadge.visible = false;
      group.add(relBadge);
      group.relBadgeSprite = relBadge;

      scene.add(group);
      nodes.push(group);
    });
  }

  // Canvas Sprite Text Generator
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

  // Relation Badge Sprite (e.g., "错卦 · 对冲互补")
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
    // 1) Celestial Sphere Mode (Based on Yang Count)
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

    // 2) King Wen Spiral Ribbon Mode
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

    // 3) Eight Palaces Galaxy Mode
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

  // 5. Apply Mode Positions
  function getHomePos(node, mode = currentMode) {
    if (mode === 'sphere') return node.posSphere;
    if (mode === 'spiral') return node.posSpiral;
    if (mode === 'palaces') return node.posPalaces;
    return node.posSphere;
  }

  function applyPositions(mode, animate = true) {
    currentMode = mode;
    dismissSummoned(false); // 模式切换时重置被召唤的排布

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

  // 6. 【核心特性】全息引力召唤排布：将错卦、综卦、互卦、序卦优雅移动到本卦四周排列！
  function summonRelatedHexagrams(centerNode) {
    // 1) 先将之前被召唤的旧节点平滑飞回原位
    dismissSummoned(true);

    if (!centerNode) return;
    const d = centerNode.userData;
    const cPos = centerNode.position;

    // 计算面向相机的基底坐标系（Right, Up, Forward），使环绕阵列完美正对观察视角！
    const forward = new THREE.Vector3().subVectors(camera.position, cPos).normalize();
    const up = camera.up.clone().normalize();
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(forward, right).normalize();

    // 需召唤的四维关系定义与相对偏移
    // 错卦在左侧，综卦在右侧，互卦在上方，序卦在下方
    const DIST_H = 22; // 水平间距
    const DIST_V = 16; // 垂直间距

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

    // 非相关卦：透明度调暗为 0.12，突出本卦与四大关联卦的能量场
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

    // 遍历执行召唤动画
    summonConfigs.forEach(cfg => {
      if (cfg.idx === undefined || cfg.idx === null) return;
      const targetNode = nodes[cfg.idx];
      // 如果目标卦与本卦相同（例如乾卦的综卦是自身），则跳过位移
      if (!targetNode || targetNode === centerNode) return;

      // 记录原本的真实宇宙家园坐标
      const homePos = getHomePos(targetNode, currentMode).clone();
      summonedNodes.push({
        node: targetNode,
        homePos: homePos,
        relType: cfg.type
      });

      // 计算环绕目标位置：以本卦为中心加上偏移，同时向相机方向轻微浮出 3 个单位避免穿插
      const targetPos = cPos.clone().add(cfg.offset).add(forward.clone().multiplyScalar(3));

      // 1) 优雅平滑飞到位
      new TWEEN.Tween(targetNode.position)
        .to(targetPos, 850)
        .easing(TWEEN.Easing.Back.Out)
        .start();

      // 2) 旋转正对相机
      new TWEEN.Tween(targetNode.rotation)
        .to({ x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z }, 850)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      // 3) 放大发光
      targetNode.scale.set(1.15, 1.15, 1.15);
      targetNode.hitMesh.material.opacity = 0.35;
      targetNode.hitMesh.material.color.setHex(cfg.colorVal);

      // 4) 显示关系徽章 Sprite
      targetNode.relBadgeSprite.updateText(cfg.label, cfg.colorHex);
      targetNode.relBadgeSprite.visible = true;
    });

    // 绘制近距离紧凑的四维能量连线
    setTimeout(() => {
      updateRelationLines(centerNode, summonConfigs);
    }, 400);
  }

  // 7. 【平滑归位】将召唤出来的相关卦放回星空，恢复全局状态
  function dismissSummoned(keepActiveLines = false) {
    if (!keepActiveLines) {
      clearRelationLines();
    }

    if (summonedNodes.length > 0) {
      summonedNodes.forEach(item => {
        const node = item.node;
        // 平滑飞回原始宇宙家园位置
        new TWEEN.Tween(node.position)
          .to(item.homePos, 700)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        // 旋转恢复面向中心
        const dummy = new THREE.Object3D();
        dummy.position.copy(item.homePos);
        dummy.lookAt(0, 0, 0);
        new TWEEN.Tween(node.rotation)
          .to({ x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z }, 700)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();

        // 恢复原有尺度与材质
        node.scale.set(1, 1, 1);
        node.hitMesh.material.opacity = node.userData.isPiGua ? 0.18 : 0.08;
        node.hitMesh.material.color.setHex(node.userData.isPiGua ? COLORS.red : COLORS.gold);
        node.relBadgeSprite.visible = false;
      });
      summonedNodes = [];
    }

    // 恢复所有卦的亮度
    nodes.forEach(n => setNodeDimmed(n, false));
  }

  // 8. 绘制四维能量光束
  function updateRelationLines(sourceNode, configs) {
    clearRelationLines();
    if (!sourceNode || !configs) return;

    const sPos = sourceNode.position;

    configs.forEach(cfg => {
      if (cfg.idx === undefined || cfg.idx === null) return;
      const targetNode = nodes[cfg.idx];
      if (!targetNode || targetNode === sourceNode) return;

      const tPos = targetNode.position;

      // 弧形光束
      const mid = new THREE.Vector3().addVectors(sPos, tPos).multiplyScalar(0.5);
      // 微妙弯曲
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

  // 9. 选择卦象节点
  function selectNode(node, animateCamera = true) {
    if (activeNode === node) return; // 已经是当前选中的卦
    activeNode = node;

    // 本卦高亮
    node.scale.set(1.3, 1.3, 1.3);
    node.hitMesh.material.opacity = 0.55;
    node.hitMesh.material.color.setHex(COLORS.gold);

    // 相机平滑飞行推近
    if (animateCamera) {
      const targetPos = node.position;
      const dir = targetPos.clone().normalize();
      // 在舒适距离观察本卦与环绕的四维星宿
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

    // 触发【全息引力召唤排布】！
    summonRelatedHexagrams(node);
    showDetailCard(node.userData);
  }

  // 10. 全息详情卡片
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

    // 关闭卡片
    document.getElementById('card-close-btn').addEventListener('click', hideDetailCard);

    // 详情卡片四维快捷跳转
    document.getElementById('rel-cuo').addEventListener('click', () => {
      if (activeNode && activeNode.userData.cuo.idx !== undefined) {
        selectNode(nodes[activeNode.userData.cuo.idx], true);
      }
    });
    document.getElementById('rel-zong').addEventListener('click', () => {
      if (activeNode && activeNode.userData.zong.idx !== undefined) {
        selectNode(nodes[activeNode.userData.zong.idx], true);
      }
    });
    document.getElementById('rel-hu').addEventListener('click', () => {
      if (activeNode && activeNode.userData.hu.idx !== undefined) {
        selectNode(nodes[activeNode.userData.hu.idx], true);
      }
    });
    document.getElementById('rel-xu').addEventListener('click', () => {
      if (activeNode && activeNode.userData.next.idx !== undefined) {
        selectNode(nodes[activeNode.userData.next.idx], true);
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
    const hitMeshes = nodes.map(n => n.hitMesh);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const node = hitObj.parent;
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
    // 忽略点击在 HUD 面板上的事件
    if (event.target.closest('.hud-panel')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hitMeshes = nodes.map(n => n.hitMesh);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
      // 命中某个卦节点
      const hitObj = intersects[0].object;
      const node = hitObj.parent;
      selectNode(node, true);
    } else {
      // 【点击空白星空区域】：优雅恢复原状！
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

  // 默认启动时呈现全景，不强行召唤，用户随时点击体验引力聚合
  setTimeout(() => {
    // 平滑启动
  }, 200);

})();
