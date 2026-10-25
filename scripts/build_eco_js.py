# -*- coding: utf-8 -*-
import os

js_code = r'''/**
 * 易道六十四卦 3D 全息生态圈
 * Cosmic Hexagram 3D Ecosystem
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
    scene.fog = new THREE.FogExp2(COLORS.bgSpace, 0.0022);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 40, 260);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 25;
    controls.maxDistance = 550;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x88bbff, 0.8);
    dirLight2.position.set(-100, -100, -100);
    scene.add(dirLight2);
  }

  // 2. Cosmic Dust & Taiji Core
  function initBackgroundElements() {
    // Cosmic dust particles
    const particleCount = 1800;
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
      opacity: 0.25
    });
    centralTaiji = new THREE.Mesh(coreGeo, coreMat);
    scene.add(centralTaiji);

    // Taiji outer aura rings
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

  // 3. Create 3D Hexagram Entities
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
      const totalYaoY = 6 * (yaoHeight + yaoGap);

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
      const hitRadius = 4.2;
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

      scene.add(group);
      nodes.push(group);
    });
  }

  // Helper: Create Canvas Sprite Text
  function makeTextSprite(title, symbol) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(10, 14, 26, 0.75)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
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

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 4. Calculate Coordinates for Different Topologies
  function calculatePositions() {
    // 1) Celestial Sphere Mode (Based on Yang Count & Yin-Yang gradation)
    const R_SPHERE = 110;
    // Group nodes by yang count (0 to 6)
    const levels = [[], [], [], [], [], [], []];
    nodes.forEach(n => {
      levels[n.userData.yangCount].push(n);
    });

    levels.forEach((list, levelIdx) => {
      // Y from -R (level 0: Kun) to +R (level 6: Qian)
      const latRatio = (levelIdx - 3) / 3; // -1 to +1
      const y = latRatio * (R_SPHERE * 0.85);
      const r_ring = Math.sqrt(Math.max(0, R_SPHERE * R_SPHERE - y * y));

      list.forEach((node, i) => {
        const theta = (i / list.length) * Math.PI * 2 + (levelIdx * 0.4);
        const x = r_ring * Math.cos(theta);
        const z = r_ring * Math.sin(theta);
        node.posSphere = new THREE.Vector3(x, y, z);
      });
    });

    // 2) King Wen Spiral Ribbon Mode (DNA double helix cosmic track)
    nodes.forEach((node, i) => {
      const t = i / 63; // 0 to 1
      const spiralRevs = 3.5;
      const angle = t * Math.PI * 2 * spiralRevs;
      const y = (t - 0.5) * 190;
      const r = 85 + 20 * Math.sin(t * Math.PI);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      node.posSpiral = new THREE.Vector3(x, y, z);
    });

    // 3) Eight Palaces Galaxy Mode (8 Spokes)
    nodes.forEach((node, i) => {
      const palaceIdx = Math.floor(i / 8); // 0 to 7
      const orderInPalace = i % 8; // 0 to 7
      const angle = (palaceIdx / 8) * Math.PI * 2;
      const dist = 40 + orderInPalace * 14;
      const y = (orderInPalace - 3.5) * 8;
      const x = dist * Math.cos(angle);
      const z = dist * Math.sin(angle);
      node.posPalaces = new THREE.Vector3(x, y, z);
    });
  }

  // 5. Apply Position Transitions via TWEEN
  function applyPositions(mode, animate = true) {
    currentMode = mode;
    nodes.forEach(node => {
      let targetPos;
      if (mode === 'sphere') targetPos = node.posSphere;
      else if (mode === 'spiral') targetPos = node.posSpiral;
      else if (mode === 'palaces') targetPos = node.posPalaces;

      if (!animate) {
        node.position.copy(targetPos);
        node.lookAt(0, 0, 0);
      } else {
        new TWEEN.Tween(node.position)
          .to(targetPos, 1200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();

        // Also smoothly adjust rotation to face center
        const dummy = new THREE.Object3D();
        dummy.position.copy(targetPos);
        dummy.lookAt(0, 0, 0);
        new TWEEN.Tween(node.rotation)
          .to({ x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z }, 1200)
          .easing(TWEEN.Easing.Cubic.InOut)
          .start();
      }
    });

    // Refresh active lines after movement
    if (activeNode) {
      setTimeout(() => updateRelationLines(activeNode), animate ? 1250 : 50);
    }
  }

  // 6. Draw 4D Topological Relation Lines
  function updateRelationLines(sourceNode) {
    clearRelationLines();
    if (!sourceNode) return;

    const sPos = sourceNode.position;
    const d = sourceNode.userData;

    const relations = [
      { targetIdx: d.cuo.idx, color: COLORS.red, label: '错卦' },
      { targetIdx: d.zong.idx, color: COLORS.green, label: '综卦' },
      { targetIdx: d.hu.idx, color: COLORS.purple, label: '互卦' },
      { targetIdx: d.next.idx, color: COLORS.cyan, label: '序卦' }
    ];

    relations.forEach(rel => {
      if (rel.targetIdx === undefined || rel.targetIdx === null) return;
      const targetNode = nodes[rel.targetIdx];
      if (!targetNode || targetNode === sourceNode) return;

      const tPos = targetNode.position;

      // Create an arc curve through space
      const mid = new THREE.Vector3().addVectors(sPos, tPos).multiplyScalar(0.5);
      const dist = sPos.distanceTo(tPos);
      // Lift the arc slightly away from center
      const normal = mid.clone().normalize();
      mid.add(normal.multiplyScalar(dist * 0.25));

      const curve = new THREE.QuadraticBezierCurve3(sPos, mid, tPos);
      const points = curve.getPoints(40);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: rel.color,
        transparent: true,
        opacity: 0.85,
        linewidth: 2
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

  // 7. Focus on Selected Node
  function selectNode(node, animateCamera = true) {
    activeNode = node;

    // Reset scales
    nodes.forEach(n => {
      n.hitMesh.material.opacity = n.userData.isPiGua ? 0.18 : 0.08;
      n.scale.set(1, 1, 1);
    });

    // Highlight selected
    node.hitMesh.material.opacity = 0.5;
    node.scale.set(1.25, 1.25, 1.25);

    // Camera fly to node
    if (animateCamera) {
      const targetPos = node.position;
      const dir = targetPos.clone().normalize();
      const camTargetPos = targetPos.clone().add(dir.multiplyScalar(38));

      new TWEEN.Tween(camera.position)
        .to(camTargetPos, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      new TWEEN.Tween(controls.target)
        .to(targetPos, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }

    updateRelationLines(node);
    showDetailCard(node.userData);
  }

  // 8. Populate & Display Detail Card
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

    // Set Relation Card Names
    document.getElementById('rel-cuo-name').innerText = d.cuo.name || '对冲卦';
    document.getElementById('rel-zong-name').innerText = d.zong.name || '颠倒卦';
    document.getElementById('rel-hu-name').innerText = d.hu.name || '内生互卦';
    document.getElementById('rel-xu-name').innerText = d.next.name || '下一阶段';

    // Study Link
    const studyBtn = document.getElementById('study-btn');
    studyBtn.href = `learn.html?lesson=${encodeURIComponent(d.id)}`;

    detailCard.classList.add('active');
  }

  function hideDetailCard() {
    detailCard.classList.remove('active');
    clearRelationLines();
    if (activeNode) {
      activeNode.scale.set(1, 1, 1);
      activeNode.hitMesh.material.opacity = activeNode.userData.isPiGua ? 0.18 : 0.08;
      activeNode = null;
    }
  }

  // 9. Event Listeners & UI Controls
  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);

    // View Mode Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        const mode = targetBtn.getAttribute('data-mode');
        applyPositions(mode, true);
      });
    });

    // Close Detail Card
    document.getElementById('card-close-btn').addEventListener('click', hideDetailCard);

    // Relation Nodes Click to Jump
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

    // Filter Selection
    const filterSelect = document.getElementById('filter-select');
    filterSelect.addEventListener('change', e => {
      const val = e.target.value;
      applyFilter(val);
    });

    // Search Input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        nodes.forEach(n => setNodeDimmed(n, false));
        return;
      }
      nodes.forEach(n => {
        const d = n.userData;
        const match = d.name.toLowerCase().includes(q) ||
                      d.navTitle.toLowerCase().includes(q) ||
                      String(d.idx + 1) === q;
        setNodeDimmed(n, !match);
        if (match && !activeNode) {
          selectNode(n, true);
        }
      });
    });

    // Auto-Rotate Button
    const autoRotateBtn = document.getElementById('btn-auto-rotate');
    autoRotateBtn.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      controls.autoRotate = isAutoRotating;
      autoRotateBtn.style.background = isAutoRotating ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.2)';
    });
  }

  function applyFilter(filterVal) {
    nodes.forEach(n => {
      const d = n.userData;
      let visible = true;
      if (filterVal === 'pi-gua') visible = d.isPiGua;
      else if (filterVal === 'upper-30') visible = d.idx < 30;
      else if (filterVal === 'lower-34') visible = d.idx >= 30;
      else if (filterVal.startsWith('part-')) {
        const partIdx = parseInt(filterVal.replace('part-', ''));
        visible = Math.floor(d.idx / 8) + 1 === partIdx;
      }
      setNodeDimmed(n, !visible);
    });
  }

  function setNodeDimmed(node, dimmed) {
    const opacity = dimmed ? 0.15 : 1.0;
    node.linesGroup.children.forEach(mesh => {
      mesh.material.transparent = dimmed;
      mesh.material.opacity = opacity;
    });
    node.labelSprite.material.opacity = dimmed ? 0.2 : 1.0;
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
          hoveredNode.scale.set(1, 1, 1);
        }
        hoveredNode = node;
        if (node !== activeNode) {
          node.scale.set(1.15, 1.15, 1.15);
        }
      }
      container.style.cursor = 'pointer';
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.innerText = `${node.userData.symbol} ${node.userData.idx + 1 < 10 ? '0' : ''}${node.userData.idx + 1}. ${node.userData.name}`;
    } else {
      if (hoveredNode && hoveredNode !== activeNode) {
        hoveredNode.scale.set(1, 1, 1);
      }
      hoveredNode = null;
      container.style.cursor = 'default';
      tooltip.style.display = 'none';
    }
  }

  function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const hitMeshes = nodes.map(n => n.hitMesh);
    const intersects = raycaster.intersectObjects(hitMeshes);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const node = hitObj.parent;
      selectNode(node, true);
    }
  }

  // 10. Animation Loop
  function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();

    // Cosmic background gentle rotation
    if (starfield) {
      starfield.rotation.y += 0.0003;
    }
    if (centralTaiji) {
      centralTaiji.rotation.y -= 0.0008;
    }

    renderer.render(scene, camera);
  }

  // Initialize with Hexagram 1 (Qian) selected by default
  setTimeout(() => {
    if (nodes.length > 0) {
      selectNode(nodes[0], false);
    }
  }, 400);

})();
'''

with open('assets/eco_sphere.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("assets/eco_sphere.js generated successfully.")
