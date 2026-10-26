#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为 NarrativeVisualCanvas 增补全息情境特效渲染器
利用 Canvas 原生轻量数学波形与粒子，实现 30+ 种易道意象的丝滑渲染
"""

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_FILE = os.path.join(BASE_DIR, "assets", "eco_sphere.js")

CANVAS_ENHANCE_CODE = """
      // 多维情境通用渲染调度
      switch (currentType) {
        case 'abyss':
          this.drawAbyss(ctx, width, height, frame);
          break;
        case 'daybreak':
          this.drawDaybreak(ctx, width, height, frame);
          break;
        case 'storm':
          this.drawStorm(ctx, width, height, frame);
          break;
        case 'leap':
          this.drawLeap(ctx, width, height, frame);
          break;
        case 'heaven':
          this.drawHeaven(ctx, width, height, frame);
          break;
        case 'zenith':
          this.drawZenith(ctx, width, height, frame);
          break;

        // 坤为地体系
        case 'frost':
          this.drawFrost(ctx, width, height, frame);
          break;
        case 'earth':
          this.drawEarth(ctx, width, height, frame);
          break;
        case 'gem':
          this.drawGem(ctx, width, height, frame);
          break;
        case 'shield':
        case 'shield_retreat':
          this.drawShield(ctx, width, height, frame);
          break;
        case 'robe':
          this.drawRobe(ctx, width, height, frame);
          break;
        case 'clash':
          this.drawClash(ctx, width, height, frame);
          break;

        // 屯/草创体系
        case 'seed':
          this.drawSeed(ctx, width, height, frame);
          break;
        case 'horse':
          this.drawHorse(ctx, width, height, frame);
          break;
        case 'deer':
          this.drawDeer(ctx, width, height, frame);
          break;
        case 'chariot':
        case 'handshake':
        case 'heart':
          this.drawHarmony(ctx, width, height, frame);
          break;
        case 'store':
        case 'wine_jar':
        case 'feast':
          this.drawNectar(ctx, width, height, frame);
          break;
        case 'tears':
        case 'cave_exit':
          this.drawTears(ctx, width, height, frame);
          break;

        // 蒙/求知与启蒙体系
        case 'shackle':
        case 'scale':
        case 'judge':
          this.drawLaw(ctx, width, height, frame);
          break;
        case 'embrace':
        case 'child':
        case 'net_open':
          this.drawEmbrace(ctx, width, height, frame);
          break;
        case 'mirror':
        case 'beacon':
          this.drawBeacon(ctx, width, height, frame);
          break;
        case 'cave':
        case 'camp':
        case 'beach':
          this.drawSanctuary(ctx, width, height, frame);
          break;
        case 'bell':
        case 'flag':
        case 'general':
        case 'crown':
          this.drawCommand(ctx, width, height, frame);
          break;

        default:
          this.drawGeneric(ctx, width, height, frame);
          break;
      }
"""

RENDER_METHODS = """
    // --- 增补多维情境渲染函数集 ---
    drawFrost(ctx, w, h, f) {
      // 履霜坚冰：寒霜晶莹粒子
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        let ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(w/2, h/2);
        ctx.lineTo(w/2 + Math.cos(ang) * (40 + Math.sin(f*0.05)*5), h/2 + Math.sin(ang) * (40 + Math.sin(f*0.05)*5));
        ctx.stroke();
      }
    }

    drawEarth(ctx, w, h, f) {
      // 直方大：大地厚载平铺
      let grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.strokeRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);
    }

    drawGem(ctx, w, h, f) {
      // 含章玉韫：暗室明珠温润
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      let g = ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, 45);
      g.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      g.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    drawShield(ctx, w, h, f) {
      // 括囊与防守：同心圆坚韧盾牌
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.lineWidth = 2;
      for (let r = 20; r <= 50; r += 15) {
        ctx.beginPath();
        ctx.arc(w/2, h/2, r + Math.sin(f * 0.1 + r) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawRobe(ctx, w, h, f) {
      // 黄裳元吉：中道之黄色波光
      let grad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, 80);
      grad.addColorStop(0, 'rgba(234, 179, 8, 0.85)');
      grad.addColorStop(0.6, 'rgba(161, 98, 7, 0.3)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 60 + Math.sin(f * 0.05) * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    drawClash(ctx, w, h, f) {
      // 龙战于野：红金与玄蓝双色碰撞
      ctx.fillStyle = '#180808';
      ctx.fillRect(0, 0, w, h);
      let g1 = ctx.createRadialGradient(w * 0.35, h/2, 2, w * 0.35, h/2, 40);
      g1.addColorStop(0, '#f43f5e');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(w * 0.35, h/2, 40, 0, Math.PI * 2);
      ctx.fill();

      let g2 = ctx.createRadialGradient(w * 0.65, h/2, 2, w * 0.65, h/2, 40);
      g2.addColorStop(0, '#0284c7');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(w * 0.65, h/2, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSeed(ctx, w, h, f) {
      // 磐桓萌芽：破土初生之绿苗
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w/2, h * 0.8);
      ctx.quadraticCurveTo(w/2 - 15 + Math.sin(f*0.08)*5, h * 0.5, w/2, h * 0.35);
      ctx.stroke();
    }

    drawHorse(ctx, w, h, f) {
      // 乘马班如：徘徊蹄印金环
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);
      let r = 35 + Math.sin(f * 0.08) * 4;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w/2, h/2, r, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    drawDeer(ctx, w, h, f) {
      // 即鹿无虞：深林微光
      ctx.fillStyle = '#022c22';
      ctx.fillRect(0, 0, w, h);
      let g = ctx.createRadialGradient(w/2 + Math.cos(f*0.04)*30, h/2, 5, w/2, h/2, 55);
      g.addColorStop(0, '#a7f3d0');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHarmony(ctx, w, h, f) {
      // 亲睦共赢：双心双核引力波
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      let x1 = w * 0.4 + Math.sin(f * 0.05) * 12;
      let x2 = w * 0.6 - Math.sin(f * 0.05) * 12;
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x1, h/2, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, h/2, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawNectar(ctx, w, h, f) {
      // 琼浆蜜露 / 酒食宴乐：金色流体水波
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(0, 0, w, h);
      let g = ctx.createRadialGradient(w/2, h * 0.6, 5, w/2, h * 0.6, 50);
      g.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w/2, h * 0.6, 45 + Math.sin(f*0.1)*5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawTears(ctx, w, h, f) {
      // 泣血与脱穴：雨滴与生天光束
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      for (let i = 0; i < 8; i++) {
        let x = (w * 0.2) + i * 20;
        let y = ((f * 2 + i * 15) % h);
        ctx.fillRect(x, y, 2, 6);
      }
    }

    drawLaw(ctx, w, h, f) {
      // 法度与天平：黄金律动平衡杆
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);
      let tilt = Math.sin(f * 0.05) * 10;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h/2 - tilt);
      ctx.lineTo(w * 0.7, h/2 + tilt);
      ctx.stroke();
    }

    drawEmbrace(ctx, w, h, f) {
      // 有容乃大 / 童蒙之吉：温暖光晕脉冲
      let g = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, 60);
      g.addColorStop(0, 'rgba(254, 215, 170, 0.9)');
      g.addColorStop(0.7, 'rgba(249, 115, 22, 0.3)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 55 + Math.sin(f*0.06)*8, 0, Math.PI * 2);
      ctx.fill();
    }

    drawBeacon(ctx, w, h, f) {
      // 灯塔明光：旋转扫描光芒
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.rotate(f * 0.03);
      ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, -25);
      ctx.lineTo(80, 25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawSanctuary(ctx, w, h, f) {
      // 庇护营地与沙滩：从容宁静微波
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.3)';
      for (let y = h * 0.3; y < h; y += 18) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 15) {
          let dy = y + Math.sin((x * 0.05) + (f * 0.04)) * 4;
          if (x === 0) ctx.moveTo(x, dy);
          else ctx.lineTo(x, dy);
        }
        ctx.stroke();
      }
    }

    drawCommand(ctx, w, h, f) {
      // 军令战旗 / 登基冠冕：巍峨金光
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 35 + Math.sin(f*0.1)*5, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawGeneric(ctx, w, h, f) {
      // 通用八卦流光粒子
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);
      this.particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = `rgba(212, 175, 55, ${0.4 + Math.sin(f * 0.08 + p.phase) * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
"""

with open(JS_FILE, 'r', encoding='utf-8') as f:
    js = f.read()

# 替换 switch(currentType) 部分
old_switch = """      switch (currentType) {
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
      }"""

if old_switch in js:
    js = js.replace(old_switch, CANVAS_ENHANCE_CODE)
    print("Replaced canvas switch with enhanced multi-theme dispatcher!")
else:
    print("Could not find exact switch block.")

# 在 drawZenith 后面追加 RENDER_METHODS
if 'drawFrost' not in js:
    js = js.replace('drawZenith(ctx, w, h, f) {', RENDER_METHODS + '\n    drawZenith(ctx, w, h, f) {')
    print("Injected new render methods into NarrativeVisualCanvas!")

with open(JS_FILE, 'w', encoding='utf-8') as f:
    f.write(js)
"""
"""
