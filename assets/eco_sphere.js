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
  // Six Yao Timeline Scrubber State
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

      const hitRadius = 6.2;
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


  // 激活六爻时位演进时间轴
  
  // =========================================================================
  // 六爻故事化演进剧场：乾卦六幕史诗剧本与意象视觉引擎 (Narrative Theater)
  // =========================================================================

  let currentPerspective = 'career'; // 'career' | 'startup' | 'classic'

  const QIAN_NARRATIVE = {
    1: {
      yaoCode: '初九',
      stageTag: '第一幕 · 深渊潜伏',
      origText: '初九：潜龙，勿用。',
      origTrans: '如同潜藏深渊的巨龙，天时地利未至，切勿轻举妄动。',
      visual: {
        type: 'abyss',
        icon: '🌊',
        name: '深渊暗流 · 潜龙蓄力',
        hint: '初入江湖 · 蓄力破局'
      },
      perspectives: {
        career: {
          title: '深渊潜伏 · 职场新人的沉潜破局',
          text: '初入大厂或新团队，资历浅、人脉薄、认知盲区多，周围暗流涌动。此时最致命的错误是急于证明自己或盲目强出头。真正的聪明人懂得“深水潜伏”，把业务核心流程与团队潜规则摸透，默默把硬核技能打磨到无可替代。忍得住深渊之冷，才能撑得起日后大任。',
          wisdom: '慎始敬终，深扎根系；未见全貌，不露锋芒。'
        },
        startup: {
          title: '暗室打磨 · PMF验证前夜',
          text: '创业初期只有一份 Demo 和几人小团队，资金拮据、市场未明。此时切忌盲目扩招、搞声势浩大的宣发。必须耐住寂寞，在极小闭环内反复验证客户真实需求，把产品硬实力打磨扎实。',
          wisdom: '不要过早追求规模，要追求极致的留存与复购口碑。'
        },
        classic: {
          title: '隐潜自守 · 阳在下也',
          text: '初爻处于全卦最底层，阳气虽生但位卑力微。君子法天，当韬光养晦、积蓄德行，不因外界浮躁而动摇根本。',
          wisdom: '潜龙勿用，非不进也，藏器于身，待时而动。'
        }
      }
    },
    2: {
      yaoCode: '九二',
      stageTag: '第二幕 · 破土崭露',
      origText: '九二：见龙在田，利见大人。',
      origTrans: '巨龙破水而出昂首立于大地，利于结识并拜见德高望重的师长贵人。',
      visual: {
        type: 'daybreak',
        icon: '🌱',
        name: '大地破晓 · 现龙崭露',
        hint: '首秀才华 · 拜识贵人'
      },
      perspectives: {
        career: {
          title: '首秀破土 · 寻找导师与战略借力',
          text: '经过第一个关键攻坚项目，你的专业能力初次在团队中脱颖而出（在田）。此时最忌自矜孤傲，最关键一步是主动向部门总监、资深前辈（大人）请教，寻求资源赋能与指路明灯。贵人的关键背书与点拨，往往能让你少走五年弯路。',
          wisdom: '才华初露莫骄衿，主动借力立大功。'
        },
        startup: {
          title: '破土初现 · 寻找天使投资与产业伯乐',
          text: '核心产品跑通了最小飞轮，业务指标在垂直赛道崭露头角。此时应当积极链接懂行且有产业资源的头部战略投资人（大人），借力顶层认知与资金通道实现势能倍增。',
          wisdom: '优秀的领投人不仅带来资金，更为你打开战略天花板。'
        },
        classic: {
          title: '德施普也 · 见龙在田',
          text: '二爻居下卦之中，虽未至尊位，但已具备兼济天下之德，宜广结善缘，与志同道合者共襄盛举。',
          wisdom: '见龙在田，德施普也；君子以德会友，虚怀若谷。'
        }
      }
    },
    3: {
      yaoCode: '九三',
      stageTag: '第三幕 · 夹层危局',
      origText: '九三：君子终日乾乾，夕惕若，厉，无咎。',
      origTrans: '君子白天勤勉不息，夜晚仍戒慎自省，虽处险境亦可免除灾祸。',
      visual: {
        type: 'storm',
        icon: '⚡',
        name: '悬崖雷暴 · 自律金铠',
        hint: '中层夹缝 · 夙夜惕厉'
      },
      perspectives: {
        career: {
          title: '骨干危局 · 夹层高压与极致自省',
          text: '晋升为骨干或基层小主管，进入了内外夹层的风暴期。下有新人依赖，上有高层严苛指标，处于高压试炼场。白天全力以赴推进业务（终日乾乾），夜晚如履薄冰复盘排查漏洞（夕惕若厉）。将失误率降至最低，才能在最凶险的中层夹缝中屹立不倒。',
          wisdom: '白天拼命干，夜晚拼命想；严谨自律是跨越夹层的唯一铠甲。'
        },
        startup: {
          title: '组织裂变 · 生死存亡的至暗试炼',
          text: '团队从几十人扩充到百人，现金流吃紧，组织摩擦激增。创始人每天睁眼都是硬性成本，竞争对手围追堵截。必须白天抓营收生存，夜晚抓团队与风控，全天候保持战时敏锐。',
          wisdom: '活着就是胜利，战战兢兢方得无咎。'
        },
        classic: {
          title: '反复道也 · 终日乾乾',
          text: '三爻为下卦之极，处内外卦交界多凶之地，过刚则折。唯有以极度敬畏之心持身，反复修道，方得圆融。',
          wisdom: '行事有恒，居危思安；盛怒不决事，得理当让人。'
        }
      }
    },
    4: {
      yaoCode: '九四',
      stageTag: '第四幕 · 审慎跃迁',
      origText: '九四：或跃在渊，无咎。',
      origTrans: '或试探腾跃直上九天，或从容退守深渊蓄锐，进退自如，没有过失。',
      visual: {
        type: 'leap',
        icon: '🦅',
        name: '云渊双轨 · 试探跃迁',
        hint: '战略抉择 · 进退自如'
      },
      perspectives: {
        career: {
          title: '战略跃迁 · 进退自如的试水抉择',
          text: '迎来职业生涯最大分水岭（晋升合伙人或独立挂帅新业务线）。往上一步是无限天地，退后一步是深潭避险。真正的高手绝不孤注一掷，而是懂得进退有据：做小步试探性突破，成了便借势飞天，不成亦能保住基本盘全身而退。',
          wisdom: '重大战略前先做小闭环测试；进有抓手，退有根据地。'
        },
        startup: {
          title: '跨越鸿沟 · 第二增长曲线的试水',
          text: '主营业务触达增长天花板，必须寻找第二曲线。要么一跃进入新赛道，要么退守现有现金牛根据地。在进退之间寻找最佳战略窗口，不打无准备之仗。',
          wisdom: '战略上的“或”不是犹豫不决，而是动态博弈的最优解。'
        },
        classic: {
          title: '进无咎也 · 审时度势',
          text: '四爻脱离下卦进入上卦，天地更加广阔，然未入九五天位。不盲动，相机行事，知进知退。',
          wisdom: '审时度势，动静有常；进不失龙之威，退不失渊之深。'
        }
      }
    },
    5: {
      yaoCode: '九五',
      stageTag: '第五幕 · 至尊天位',
      origText: '九五：飞龙在天，利见大人。',
      origTrans: '巨龙翱翔于九霄之巅，利于会聚志同道合的杰出伟人共同治世。',
      visual: {
        type: 'heaven',
        icon: '👑',
        name: '九霄天庭 · 飞龙普照',
        hint: '登顶执中 · 赋能天下'
      },
      perspectives: {
        career: {
          title: '至尊天位 · 执中赋能的领袖境界',
          text: '登顶事业最高峰，成为核心业务操盘手或行业领袖。德才配位、天下归心。此时已无需证明个人能力，而是把舞台开放给更多优秀的“潜龙”与“现龙”，统揽全局、赋能团队，让组织与生态自驱运转。',
          wisdom: '领袖的终极价值不在于自己多强，而在于成就了多少优秀的人。'
        },
        startup: {
          title: '行业巨头 · 平台化与生态飞轮',
          text: '公司成功登顶行业头部或上市敲钟，掌握行业话语权。此时应主动链接全球顶尖科学家与商业生态伙伴（大人），以利他之心构建开放共赢的产业命运共同体。',
          wisdom: '至尊之位当行中正之道，得道者多助。'
        },
        classic: {
          title: '大人造也 · 君临天下',
          text: '五爻居九五至尊，阳刚中正，乾道大成。普照万物，首出庶物，万国咸宁。',
          wisdom: '飞龙在天，利见大人；刚健中正，天下归心。'
        }
      }
    },
    6: {
      yaoCode: '上九',
      stageTag: '第六幕 · 极盛知退',
      origText: '上九：亢龙有悔。',
      origTrans: '升腾到极限的巨龙终将招致悔恨，亢极过盈，不可长久保持。',
      visual: {
        type: 'zenith',
        icon: '❄️',
        name: '太虚星霜 · 玉环知止',
        hint: '极盛知退 · 善退全终'
      },
      perspectives: {
        career: {
          title: '极盛知退 · 急流勇退的生存大智',
          text: '功成名就之后，资历与声望到达顶峰，最危险的是傲慢与贪恋权位。知止是至高智慧，主动把一线帅位让给年轻人，退居二线成为幕后导师或战略顾问，既保全名节，又赢得满堂尊重。',
          wisdom: '月满则亏，水满则溢；盛极之时主动作减法，方能平安长久。'
        },
        startup: {
          title: '防范衰退 · 警惕大企业病与盲目扩张',
          text: '巨头企业最容易死于狂妄盲目的跨界扩张与官僚僵化。必须对市场常怀敬畏之心，主动拆分臃肿部门，破除唯我独尊的幻觉，回归初心。',
          wisdom: '不要与周期对抗，高点套现不如居安思危，戒除骄奢。'
        },
        classic: {
          title: '盈不可久 · 知进知退',
          text: '上九处全卦最高点，阳极必反。唯有见好就收、知足不辱，知进知退，方得终吉。',
          wisdom: '知进退存亡而不失其正者，其唯圣人乎！'
        }
      }
    }
  };

  // Canvas 2D 粒子意象微电影渲染引擎
  class NarrativeVisualCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.width = this.canvas.width = 220;
      this.height = this.canvas.height = 180;
      this.currentType = 'abyss';
      this.frame = 0;
      this.particles = [];
      this.initParticles();
      this.startLoop();
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.5 + 1,
          speed: Math.random() * 0.8 + 0.3,
          alpha: Math.random() * 0.7 + 0.3,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    setType(type) {
      this.currentType = type;
      this.frame = 0;
    }

    startLoop() {
      const render = () => {
        this.frame++;
        this.draw();
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }

    draw() {
      const { ctx, width, height, currentType, frame } = this;
      ctx.clearRect(0, 0, width, height);

      // 背景微光渐变
      let bgGrad;
      switch (currentType) {
        case 'abyss': // 深渊水纹
          bgGrad = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, 120);
          bgGrad.addColorStop(0, '#0f2b48');
          bgGrad.addColorStop(1, '#050c18');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawAbyss(ctx, width, height, frame);
          break;

        case 'daybreak': // 破晓晨曦
          bgGrad = ctx.createLinearGradient(0, height, 0, 0);
          bgGrad.addColorStop(0, '#1c1917');
          bgGrad.addColorStop(0.5, '#78350f');
          bgGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawDaybreak(ctx, width, height, frame);
          break;

        case 'storm': // 悬崖雷暴
          bgGrad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, 120);
          bgGrad.addColorStop(0, '#312e81');
          bgGrad.addColorStop(1, '#0b0f19');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawStorm(ctx, width, height, frame);
          break;

        case 'leap': // 云渊双轨
          bgGrad = ctx.createLinearGradient(0, 0, width, height);
          bgGrad.addColorStop(0, '#1e1b4b');
          bgGrad.addColorStop(0.5, '#3b0764');
          bgGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawLeap(ctx, width, height, frame);
          break;

        case 'heaven': // 九霄日出
          bgGrad = ctx.createRadialGradient(width/2, height/2, 15, width/2, height/2, 110);
          bgGrad.addColorStop(0, '#fef08a');
          bgGrad.addColorStop(0.4, '#eab308');
          bgGrad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawHeaven(ctx, width, height, frame);
          break;

        case 'zenith': // 太虚星霜
          bgGrad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, 120);
          bgGrad.addColorStop(0, '#1e293b');
          bgGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
          this.drawZenith(ctx, width, height, frame);
          break;
      }
    }

    drawAbyss(ctx, w, h, f) {
      // 潜龙深渊：水纹波荡 + 幼龙微光游动
      ctx.save();
      // 水波纹
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 10) {
          let y = h * 0.4 + i * 22 + Math.sin((x * 0.04) + (f * 0.05) + i) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // 游动的金色潜龙光芒
      let dragonX = w/2 + Math.cos(f * 0.03) * 45;
      let dragonY = h * 0.55 + Math.sin(f * 0.04) * 20;
      let dGrad = ctx.createRadialGradient(dragonX, dragonY, 2, dragonX, dragonY, 28);
      dGrad.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
      dGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
      dGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(dragonX, dragonY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawDaybreak(ctx, w, h, f) {
      // 破晓初现：光束向上喷薄 + 禾苗金粉
      ctx.save();
      // 太阳地平线光芒
      ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
      ctx.beginPath();
      ctx.arc(w/2, h + 20, 90 + Math.sin(f*0.05)*10, 0, Math.PI * 2);
      ctx.fill();

      // 上升的金色光尘
      this.particles.forEach(p => {
        p.y -= p.speed * 1.2;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = `rgba(253, 224, 71, ${0.5 + Math.sin(f * 0.1 + p.phase) * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    drawStorm(ctx, w, h, f) {
      // 夹层风暴：电弧 + 金色自律防护力场
      ctx.save();
      // 偶尔闪电
      if (f % 45 < 4) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, 0);
        ctx.lineTo(w * 0.4, h * 0.4);
        ctx.lineTo(w * 0.35, h * 0.5);
        ctx.lineTo(w * 0.55, h);
        ctx.stroke();
      }
      // 中央自律金钟罩脉冲
      let pulseR = 38 + Math.sin(f * 0.15) * 6;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w/2, h/2, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    drawLeap(ctx, w, h, f) {
      // 云渊双轨：向上跃升与向下稳守两条星光轨迹
      ctx.save();
      ctx.lineWidth = 2;
      // 向上试跃轨迹 (金光)
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.8);
      ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.7, h * 0.1, w * 0.9, h * 0.2);
      ctx.stroke();

      // 向下退守渊底轨迹 (蓝紫光)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.8);
      ctx.bezierCurveTo(w * 0.4, h * 0.9, w * 0.7, h * 0.95, w * 0.85, h * 0.75);
      ctx.stroke();

      // 沿轨迹滑动的光球
      let t = (f % 100) / 100;
      let lx = w * 0.2 + t * (w * 0.7);
      let ly = h * 0.8 - Math.sin(t * Math.PI) * (h * 0.6);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawHeaven(ctx, w, h, f) {
      // 九天飞龙：360° 超新星金光光冕
      ctx.save();
      let rot = f * 0.02;
      ctx.translate(w/2, h/2);
      ctx.rotate(rot);
      for (let i = 0; i < 8; i++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, 55 + Math.sin(f * 0.1 + i) * 10);
        ctx.lineTo(8, 55 + Math.sin(f * 0.1 + i) * 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 核心金球
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w/2, h/2, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    drawZenith(ctx, w, h, f) {
      // 太虚星霜：温润玉环缓转与知止收敛
      ctx.save();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 36 + Math.cos(f * 0.04) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // 四周冰晶星霜
      this.particles.forEach(p => {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.radius * 1.5, p.radius * 1.5);
      });
      ctx.restore();
    }
  }

  let visualTheaterCanvas = null;

  function activateYaoTimeline(node) {
    if (!node) return;
    isTimelineActive = true;
    currentTimelineStep = 1;
    if (tlGuaName) {
      const tTitle = document.getElementById('theater-gua-title'); if (tTitle) tTitle.innerText = `${node.userData.idx + 1 < 10 ? '0' : ''}${node.userData.idx + 1}. ${node.userData.name} · 六爻时位故事剧场`;
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

    const guaIdx = activeNode.userData.idx + 1;
    const isQian = (guaIdx === 1);

    // 1) 提取故事数据
    let storyData;
    if (isQian && QIAN_NARRATIVE[step]) {
      const qItem = QIAN_NARRATIVE[step];
      const pData = qItem.perspectives[currentPerspective] || qItem.perspectives['career'];
      storyData = {
        yaoCode: qItem.yaoCode,
        stageTag: qItem.stageTag,
        origText: qItem.origText,
        origTrans: qItem.origTrans,
        title: pData.title,
        text: pData.text,
        wisdom: pData.wisdom,
        visual: qItem.visual
      };
    } else {
      // 针对非乾卦：自动套用通用的时位演进故事模型
      const stageInfo = YAO_STAGES[step - 1];
      const yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
      storyData = {
        yaoCode: yaoNames[step - 1],
        stageTag: `${stageInfo.tag}`,
        origText: `${activeNode.userData.name} · 第${step}阶`,
        origTrans: `${activeNode.userData.motto || '天地变易，各正性命'}`,
        title: `${stageInfo.tag} · ${activeNode.userData.name}时空演进`,
        text: `在【${activeNode.userData.name}】的时空流转中，第${step}爻代表${stageInfo.desc}。顺应天时，明察身心动机，方能在当前时位做到无咎。`,
        wisdom: `【时位心法】${stageInfo.tag}：知进知退，持守中正。`,
        visual: {
          type: ['abyss', 'daybreak', 'storm', 'leap', 'heaven', 'zenith'][step - 1],
          icon: ['🌊', '🌱', '⚡', '🦅', '👑', '❄️'][step - 1],
          name: stageInfo.tag,
          hint: `${activeNode.userData.name} · 第${step}爻时位`
        }
      };
    }

    // 2) 更新 UI 文字
    const elYaoPill = document.querySelector('.yao-code');
    const elStageTag = document.getElementById('script-stage-tag');
    const elOrigText = document.querySelector('.orig-text');
    const elOrigTrans = document.getElementById('script-orig-trans');
    const elStoryTitle = document.getElementById('story-chapter-title');
    const elStoryText = document.getElementById('story-chapter-text');
    const elWisdomText = document.getElementById('script-wisdom-text');
    const elVisualIcon = document.getElementById('visual-icon');
    const elVisualName = document.getElementById('visual-name');
    const elVisualHint = document.getElementById('visual-scene-hint');

    if (elYaoPill) elYaoPill.innerText = storyData.yaoCode;
    if (elStageTag) elStageTag.innerText = storyData.stageTag;
    if (elOrigText) elOrigText.innerText = storyData.origText;
    if (elOrigTrans) elOrigTrans.innerText = storyData.origTrans;
    if (elStoryTitle) elStoryTitle.innerText = storyData.title;
    if (elStoryText) elStoryText.innerText = storyData.text;
    if (elWisdomText) elWisdomText.innerText = storyData.wisdom;

    if (elVisualIcon) elVisualIcon.innerText = storyData.visual.icon;
    if (elVisualName) elVisualName.innerText = storyData.visual.name;
    if (elVisualHint) elVisualHint.innerText = storyData.visual.hint;

    // 切换 Canvas 动画形态
    if (!visualTheaterCanvas) {
      visualTheaterCanvas = new NarrativeVisualCanvas('stage-canvas');
    }
    if (visualTheaterCanvas) {
      visualTheaterCanvas.setType(storyData.visual.type);
    }

    // 进度条与刻度按钮
    if (tlProgressFill) {
      tlProgressFill.style.width = `${(step / 6) * 100}%`;
    }
    const stepBtns = document.querySelectorAll('.tl-step-btn');
    stepBtns.forEach(btn => {
      const bStep = parseInt(btn.getAttribute('data-step'));
      btn.classList.remove('current', 'passed');
      if (bStep === step) btn.classList.add('current');
      else if (bStep < step) btn.classList.add('passed');
    });

    // 3) 3D 六爻自下而上实体生长与摄像机微运镜
    const linesGroup = activeNode.linesGroup;
    if (linesGroup) {
      const yaoMeshes = [];
      linesGroup.children.forEach(mesh => yaoMeshes.push(mesh));

      let meshIdx = 0;
      activeNode.userData.lines.forEach((lineVal, lIdx) => {
        const isYang = (lineVal === 1);
        const meshesForThisYao = isYang ? [yaoMeshes[meshIdx++]] : [yaoMeshes[meshIdx++], yaoMeshes[meshIdx++]];

        meshesForThisYao.forEach(mesh => {
          if (!mesh) return;
          if (lIdx < step) {
            // 已生发实体爻：金光饱满
            mesh.material.transparent = false;
            mesh.material.opacity = 1.0;
            if (lIdx === step - 1 && animate) {
              // 当前生发爻：从中心弹出生长并高亮脉冲
              mesh.scale.set(0.1, 1, 0.1);
              new TWEEN.Tween(mesh.scale)
                .to({ x: 1, y: 1, z: 1 }, 400)
                .easing(TWEEN.Easing.Back.Out)
                .start();
            } else {
              mesh.scale.set(1, 1, 1);
            }
          } else {
            // 未到时位的爻：暗灰半透明虚隐
            mesh.material.transparent = true;
            mesh.material.opacity = 0.1;
          }
        });
      });
    }

    // 3D 摄像机微运镜：随爻位步步高升
    if (animate && controls) {
      const camTargetY = (step - 3.5) * 6; // 随阶层轻微上扬
      new TWEEN.Tween(controls.target)
        .to({ y: camTargetY }, 600)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
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
    closeYaoTimeline();
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
    // 六爻时位时间轴按钮事件
    if (btnTriggerTimeline) {
      btnTriggerTimeline.addEventListener('click', () => {
        if (activeNode) activateYaoTimeline(activeNode);
      });
    }

    
    // 故事剧场交互绑定
    const btnPrev = document.getElementById('tl-btn-prev');
    const btnNext = document.getElementById('tl-btn-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        stopTimelinePlay();
        let prev = currentTimelineStep - 1;
        if (prev < 1) prev = 6;
        applyTimelineStep(prev, true);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        stopTimelinePlay();
        let next = currentTimelineStep + 1;
        if (next > 6) next = 1;
        applyTimelineStep(next, true);
      });
    }

    // 视角切换胶囊
    const perspBtns = document.querySelectorAll('.perspective-btn');
    perspBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        perspBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPerspective = btn.getAttribute('data-perspective');
        applyTimelineStep(currentTimelineStep, false);
      });
    });

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

  function resetHoverHighlight(node) {
    if (!node || !node.hitMesh) return;
    if (node === activeNode) {
      node.hitMesh.material.opacity = 0.55;
    } else if (summonedNodes.some(s => s.node === node)) {
      node.hitMesh.material.opacity = 0.35;
    } else {
      node.hitMesh.material.opacity = node.userData.isPiGua ? 0.18 : 0.08;
    }
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
