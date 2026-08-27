function particleTextEngine(canvas, cfg){
    var W = cfg.width || 1200, H = cfg.height || 1200;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    var ASCII_POOL = "0123456789-*/=%#@&!?$<>~^()[]{}_".split("");
    var MASK_FAMILY = '"Arial Black","PingFang SC","Microsoft YaHei",Arial,sans-serif';
    var TWO_PI = Math.PI*2, DEG = Math.PI/180;
    var reduced = false;
    try{ reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(err){}

    function makeRng(sd){
      var s = (sd >>> 0) || 1;
      return function(){
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }
    function hashText(t){
      var h = (cfg.seed >>> 0) || 1;
      for(var i=0;i<t.length;i++) h = Math.imul(h ^ t.charCodeAt(i), 2654435761);
      return h >>> 0;
    }
    function lerp(a,b,t){ return a + (b-a)*t; }
    function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
    function easeOutCubic(t){ return 1 - Math.pow(1-t,3); }
    function easeInOutCubic(t){ return t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
    function weightedPick(colors, r){
      var total = 0, i;
      for(i=0;i<colors.length;i++) total += colors[i].w;
      var x = r()*total;
      for(i=0;i<colors.length;i++){
        x -= colors[i].w;
        if(x<=0) return colors[i].hex;
      }
      return colors[colors.length-1].hex;
    }

    var off = document.createElement("canvas");
    off.width = W; off.height = H;
    var offCtx = off.getContext("2d", { willReadFrequently: true });
    var maskCache = {};
    function buildMask(text){
      offCtx.clearRect(0,0,W,H);
      var px = 0.95 * H;
      if(text.length > 1){
        offCtx.font = '900 100px ' + MASK_FAMILY;
        var w100 = offCtx.measureText(text).width || 1;
        px = Math.min(px, (W * 0.84) / (w100 / 100));
      }
      offCtx.font = '900 ' + px + 'px ' + MASK_FAMILY;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "#000";
      offCtx.fillText(text, W/2, H/2);
      var img = offCtx.getImageData(0,0,W,H).data;
      var pts = [];
      var STEP = text.length > 1 ? 2 : 3;
      for(var y=0;y<H;y+=STEP){
        var rowBase = y*W;
        for(var x=0;x<W;x+=STEP){
          if(img[(rowBase+x)*4+3] > 128) pts.push(x,y);
        }
      }
      return pts;
    }
    function getMask(text){
      if(!maskCache[text]) maskCache[text] = buildMask(text);
      return maskCache[text];
    }

    var shapes = [];
    (function(){
      var r = makeRng(cfg.seed);
      for(var i=0;i<cfg.count;i++){
        var color = weightedPick(cfg.colors, r);
        var size = lerp(cfg.minSize, cfg.maxSize, r());
        var rotBase = (r()*2-1) * cfg.rotationJitter;
        var opacity = lerp(cfg.minOpacity, 1, r());
        var trembleFreq = 0.5 + r()*1.3;
        var tremblePhase = r()*Math.PI*2;
        var breathPhase = r()*Math.PI*2;
        var glyph = ASCII_POOL[Math.floor(r()*ASCII_POOL.length)];
        var bricks = [];
        var bw = Math.max(1, size*0.32);
        for(var b=0;b<cfg.brickBars;b++){
          bricks.push({
            dx: (b - (cfg.brickBars-1)/2) * bw,
            w: bw,
            h: size * (0.6 + r()*0.9),
            color: weightedPick(cfg.colors, r)
          });
        }
        shapes.push({
          color: color, size: size, rotBase: rotBase, opacity: opacity,
          trembleFreq: trembleFreq, tremblePhase: tremblePhase, breathPhase: breathPhase,
          glyph: glyph, bricks: bricks,
          floatU: r(), floatV: r(),
          baseX: W/2, baseY: H/2, fromX: 0, fromY: 0,
          toX: W/2, toY: H/2, scatterX: 0, scatterY: 0
        });
      }
    })();

    function assignTargets(text){
      var pts = getMask(text);
      var n = pts.length/2;
      if(!n) return;
      var r = makeRng(hashText(text));
      for(var i=0;i<shapes.length;i++){
        var pick = Math.floor(r()*n);
        shapes[i].toX = pts[pick*2]   + (r()*2-1)*cfg.edgeFeather;
        shapes[i].toY = pts[pick*2+1] + (r()*2-1)*cfg.edgeFeather;
      }
    }

    var phrases = (cfg.phrases && cfg.phrases.length) ? cfg.phrases : [cfg.text];
    var current = cfg.text || phrases[0];
    var seqIndex = Math.max(0, phrases.indexOf(current));
    var hover = cfg.mode === "hover";
    var state = hover ? "float" : "static";
    var stateT = 0, clock = 0;
    var motionRng = makeRng(((cfg.seed >>> 0) || 1) + 1);
    var i0, p0;

    function fx(p){ var rg = cfg.scatterRange; return (-rg + p.floatU*(1+2*rg)) * W; }
    function fy(p){ var rg = cfg.scatterRange; return (-rg + p.floatV*(1+2*rg)) * H; }

    assignTargets(current);
    for(i0=0;i0<shapes.length;i0++){
      p0 = shapes[i0];
      if(hover){ p0.baseX = fx(p0); p0.baseY = fy(p0); }
      else { p0.baseX = p0.toX; p0.baseY = p0.toY; }
    }

    var hoverActive = false;
    function setHover(active){
      if(!hover || hoverActive === active) return;
      hoverActive = active;
      var i, p;
      if(reduced){
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          if(active){ p.baseX = p.toX; p.baseY = p.toY; }
          else { p.baseX = fx(p); p.baseY = fy(p); }
        }
        state = active ? "formed" : "float";
        stateT = 0;
        return;
      }
      for(i=0;i<shapes.length;i++){
        p = shapes[i];
        p.fromX = p.baseX; p.fromY = p.baseY;
      }
      state = active ? "gather" : "disperse";
      stateT = 0;
    }
    function onEnter(e){ if(e.pointerType !== "touch") setHover(true); }
    function onLeave(){ setHover(false); }
    function onDown(e){ if(e.pointerType === "touch") setHover(true); }
    function onUp(e){ if(e.pointerType === "touch") setHover(false); }
    if(hover){
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointerenter", onEnter);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onLeave);
    }

    function startScatter(){
      state = "scatter"; stateT = 0;
      var range = cfg.scatterRange;
      for(var i=0;i<shapes.length;i++){
        var p = shapes[i];
        p.fromX = p.baseX; p.fromY = p.baseY;
        p.scatterX = (-range + motionRng()*(1+2*range)) * W;
        p.scatterY = (-range + motionRng()*(1+2*range)) * H;
      }
    }
    function startReform(){
      state = "reform"; stateT = 0;
      seqIndex = (seqIndex+1) % phrases.length;
      current = phrases[seqIndex];
      assignTargets(current);
      for(var i=0;i<shapes.length;i++){
        var p = shapes[i];
        p.fromX = p.scatterX; p.fromY = p.scatterY;
      }
    }
    function settleStatic(){
      state = "static"; stateT = 0;
      for(var i=0;i<shapes.length;i++){
        shapes[i].baseX = shapes[i].toX;
        shapes[i].baseY = shapes[i].toY;
      }
    }
    function update(dt){
      var i, p, e;
      if(hover){
        if(state === "gather"){
          stateT += dt;
          e = easeInOutCubic(clamp(stateT / cfg.reformTime, 0, 1));
          for(i=0;i<shapes.length;i++){
            p = shapes[i];
            p.baseX = lerp(p.fromX, p.toX, e);
            p.baseY = lerp(p.fromY, p.toY, e);
          }
          if(stateT >= cfg.reformTime) state = "formed";
        } else if(state === "disperse"){
          stateT += dt;
          e = easeOutCubic(clamp(stateT / cfg.scatterTime, 0, 1));
          for(i=0;i<shapes.length;i++){
            p = shapes[i];
            p.baseX = lerp(p.fromX, fx(p), e);
            p.baseY = lerp(p.fromY, fy(p), e);
          }
          if(stateT >= cfg.scatterTime) state = "float";
        } else if(state === "float"){
          for(i=0;i<shapes.length;i++){
            p = shapes[i];
            p.baseX = fx(p); p.baseY = fy(p);
          }
        }
        return;
      }
      stateT += dt;
      if(state === "static"){
        if(stateT >= cfg.holdTime) startScatter();
      } else if(state === "scatter"){
        e = easeOutCubic(clamp(stateT / cfg.scatterTime, 0, 1));
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          p.baseX = lerp(p.fromX, p.scatterX, e);
          p.baseY = lerp(p.fromY, p.scatterY, e);
        }
        if(stateT >= cfg.scatterTime) startReform();
      } else if(state === "reform"){
        e = easeInOutCubic(clamp(stateT / cfg.reformTime, 0, 1));
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          p.baseX = lerp(p.fromX, p.toX, e);
          p.baseY = lerp(p.fromY, p.toY, e);
        }
        if(stateT >= cfg.reformTime) settleStatic();
      }
    }

    var SPRITE_CELL = 96, SPRITE_FONT = 64, SPRITE_HALF = SPRITE_CELL/2;
    var spriteCache = {};
    function getSprite(glyph, color){
      var key = glyph + color;
      var sp = spriteCache[key];
      if(!sp){
        sp = document.createElement("canvas");
        sp.width = sp.height = SPRITE_CELL;
        var g = sp.getContext("2d");
        g.font = '700 ' + SPRITE_FONT + 'px ui-monospace,"SF Mono",Menlo,Consolas,monospace';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = color;
        g.fillText(glyph, SPRITE_HALF, SPRITE_HALF);
        spriteCache[key] = sp;
      }
      return sp;
    }

    function render(){
      ctx.fillStyle = cfg.background;
      ctx.fillRect(0,0,W,H);
      var shapeMode = cfg.shape;
      var tAmp = cfg.trembleAmp, bAmp = cfg.breathAmp;
      var t = clock * cfg.trembleSpeed;
      var lastAlpha = -1;
      var i, p, wob, wob2, breathe, x, y, size;
      if(shapeMode === "circle"){
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          wob  = Math.sin(t*p.trembleFreq + p.tremblePhase) * tAmp;
          wob2 = Math.cos(t*p.trembleFreq*0.83 + p.tremblePhase*1.3) * tAmp;
          breathe = 1 + Math.sin(t*p.trembleFreq*0.6 + p.breathPhase) * bAmp;
          x = p.baseX + wob; y = p.baseY + wob2;
          size = p.size * breathe; if(size < 0.2) size = 0.2;
          if(p.opacity !== lastAlpha){ ctx.globalAlpha = p.opacity; lastAlpha = p.opacity; }
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(x, y, size/2, 0, TWO_PI);
          ctx.fill();
        }
      } else if(shapeMode === "ascii"){
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          wob  = Math.sin(t*p.trembleFreq + p.tremblePhase) * tAmp;
          wob2 = Math.cos(t*p.trembleFreq*0.83 + p.tremblePhase*1.3) * tAmp;
          breathe = 1 + Math.sin(t*p.trembleFreq*0.6 + p.breathPhase) * bAmp;
          x = p.baseX + wob; y = p.baseY + wob2;
          size = p.size * breathe; if(size < 0.2) size = 0.2;
          if(p.opacity !== lastAlpha){ ctx.globalAlpha = p.opacity; lastAlpha = p.opacity; }
          var rot = (p.rotBase + Math.sin(t*p.trembleFreq*0.5 + p.tremblePhase) * 15) * DEG;
          var fs = size*1.7; if(fs < 6) fs = 6;
          var sc = fs / SPRITE_FONT;
          var cs = Math.cos(rot)*sc, sn = Math.sin(rot)*sc;
          ctx.setTransform(cs, sn, -sn, cs, x, y);
          ctx.drawImage(getSprite(p.glyph, p.color), -SPRITE_HALF, -SPRITE_HALF);
        }
        ctx.setTransform(1,0,0,1,0,0);
      } else {
        for(i=0;i<shapes.length;i++){
          p = shapes[i];
          wob  = Math.sin(t*p.trembleFreq + p.tremblePhase) * tAmp;
          wob2 = Math.cos(t*p.trembleFreq*0.83 + p.tremblePhase*1.3) * tAmp;
          breathe = 1 + Math.sin(t*p.trembleFreq*0.6 + p.breathPhase) * bAmp;
          x = p.baseX + wob; y = p.baseY + wob2;
          if(breathe < 0.05) breathe = 0.05;
          if(p.opacity !== lastAlpha){ ctx.globalAlpha = p.opacity; lastAlpha = p.opacity; }
          var bricks = p.bricks;
          for(var b=0;b<bricks.length;b++){
            var br = bricks[b];
            var bwpx = br.w*breathe; if(bwpx < 1) bwpx = 1;
            var bhpx = br.h*breathe; if(bhpx < 1) bhpx = 1;
            ctx.fillStyle = br.color;
            ctx.fillRect(x + br.dx*breathe - bwpx/2, y - bhpx/2, bwpx, bhpx);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    var raf = null, last = null;
    function frame(now){
      if(last === null) last = now;
      var dt = Math.min(0.05, (now-last)/1000);
      last = now;
      clock += dt;
      update(dt);
      render();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      destroy: function(){
        if(raf !== null) cancelAnimationFrame(raf);
        raf = null;
        canvas.removeEventListener("pointerenter", onEnter);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onLeave);
      }
    };
  }
particleTextEngine;
