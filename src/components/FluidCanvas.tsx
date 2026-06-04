"use client";
import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   WebGL Fluid Simulation — Adapted from Pavel Dobryakov (MIT)
   Simplified Navier-Stokes for emotional creative expression
   ═══════════════════════════════════════════════════════════════════ */

const VERTEX = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL, vR, vT, vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const SPLAT_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = dissipation * texture2D(uSource, coord);
    gl_FragColor = result;
  }
`;

const DIVERGENCE_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vL, vR, vT, vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const PRESSURE_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vL, vR, vT, vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  varying vec2 vL, vR, vT, vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const DISPLAY_FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;
    float a = max(c.r, max(c.g, c.b));
    gl_FragColor = vec4(c, a);
  }
`;

type FluidConfig = {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE_ITERATIONS: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
};

const DEFAULT_CONFIG: FluidConfig = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 0.97,
  VELOCITY_DISSIPATION: 0.98,
  PRESSURE_ITERATIONS: 20,
  SPLAT_RADIUS: 0.0025,
  SPLAT_FORCE: 6000,
};

type Props = {
  className?: string;
  colors?: [number, number, number][];
  config?: Partial<FluidConfig>;
  style?: React.CSSProperties;
};

export default function FluidCanvas({ className = "", colors, config: userConfig, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const configRef = useRef<FluidConfig>({ ...DEFAULT_CONFIG, ...userConfig });

  const defaultColors: [number, number, number][] = [
    [0.7, 0.63, 0.83],  // lavender
    [0.77, 0.45, 0.35],  // terracotta
    [0.56, 0.68, 0.55],  // sage
    [0.48, 0.69, 0.77],  // sky
    [0.83, 0.53, 0.56],  // rose
  ];
  const colorPalette = colors || defaultColors;

  const getRandomColor = useCallback((): [number, number, number] => {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
  }, [colorPalette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const config = configRef.current;

    // — Extensions —
    const halfFloat = gl.getExtension("OES_texture_half_float");
    const halfFloatLinear = gl.getExtension("OES_texture_half_float_linear");
    const floatType = halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    // — Helpers —
    function compileShader(type: number, source: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      return s;
    }

    function createProgram(vs: string, fs: string) {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, compileShader(gl!.VERTEX_SHADER, vs));
      gl!.attachShader(p, compileShader(gl!.FRAGMENT_SHADER, fs));
      gl!.linkProgram(p);
      return p;
    }

    function getUniforms(program: WebGLProgram) {
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl!.getActiveUniform(program, i);
        if (info) uniforms[info.name] = gl!.getUniformLocation(program, info.name);
      }
      return uniforms;
    }

    function createFBO(w: number, h: number) {
      const tex = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, floatType, null);

      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return { texture: tex, fbo, width: w, height: h };
    }

    function createDoubleFBO(w: number, h: number) {
      let fbo1 = createFBO(w, h);
      let fbo2 = createFBO(w, h);
      return {
        get read() { return fbo1; },
        get write() { return fbo2; },
        swap() { const tmp = fbo1; fbo1 = fbo2; fbo2 = tmp; },
      };
    }

    // — Programs —
    const splatProg = createProgram(VERTEX, SPLAT_FRAG);
    const splatUni = getUniforms(splatProg);
    const advProg = createProgram(VERTEX, ADVECTION_FRAG);
    const advUni = getUniforms(advProg);
    const divProg = createProgram(VERTEX, DIVERGENCE_FRAG);
    const divUni = getUniforms(divProg);
    const presProg = createProgram(VERTEX, PRESSURE_FRAG);
    const presUni = getUniforms(presProg);
    const gradProg = createProgram(VERTEX, GRADIENT_FRAG);
    const gradUni = getUniforms(gradProg);
    const dispProg = createProgram(VERTEX, DISPLAY_FRAG);
    const dispUni = getUniforms(dispProg);

    // — Quad —
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    function blit(target: { fbo: WebGLFramebuffer; width: number; height: number } | null) {
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
        gl!.viewport(0, 0, target.width, target.height);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      }
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      const posLoc = 0;
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(posLoc);
      gl!.drawArrays(gl!.TRIANGLE_FAN, 0, 4);
    }

    // — Init FBOs —
    let simW: number, simH: number, dyeW: number, dyeH: number;

    function resize() {
      const w = gl!.drawingBufferWidth;
      const h = gl!.drawingBufferHeight;
      const aspect = w / h;
      simW = config.SIM_RESOLUTION;
      simH = Math.round(config.SIM_RESOLUTION / aspect);
      dyeW = config.DYE_RESOLUTION;
      dyeH = Math.round(config.DYE_RESOLUTION / aspect);
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    resize();

    let velocity = createDoubleFBO(simW!, simH!);
    let dye = createDoubleFBO(dyeW!, dyeH!);
    let divergence = createFBO(simW!, simH!);
    let pressure = createDoubleFBO(simW!, simH!);

    // — Splat —
    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      gl!.useProgram(splatProg);
      gl!.uniform1i(splatUni.uTarget, 0);
      gl!.uniform1f(splatUni.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(splatUni.point, x, 1.0 - y);
      gl!.uniform3f(splatUni.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
      gl!.uniform1f(splatUni.radius, config.SPLAT_RADIUS);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velocity.read.texture);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform3f(splatUni.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, dye.read.texture);
      blit(dye.write);
      dye.swap();
    }

    // — Simulation Step —
    function step(dt: number) {
      // Advect velocity
      gl!.useProgram(advProg);
      gl!.uniform2f(advUni.texelSize, 1.0 / simW!, 1.0 / simH!);
      gl!.uniform1i(advUni.uVelocity, 0);
      gl!.uniform1i(advUni.uSource, 0);
      gl!.uniform1f(advUni.dt, dt);
      gl!.uniform1f(advUni.dissipation, config.VELOCITY_DISSIPATION);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velocity.read.texture);
      blit(velocity.write);
      velocity.swap();

      // Advect dye
      gl!.uniform1i(advUni.uVelocity, 0);
      gl!.uniform1i(advUni.uSource, 1);
      gl!.uniform1f(advUni.dissipation, config.DENSITY_DISSIPATION);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velocity.read.texture);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, dye.read.texture);
      blit(dye.write);
      dye.swap();

      // Divergence
      gl!.useProgram(divProg);
      gl!.uniform2f(divUni.texelSize, 1.0 / simW!, 1.0 / simH!);
      gl!.uniform1i(divUni.uVelocity, 0);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, velocity.read.texture);
      blit(divergence);

      // Pressure solve (Jacobi iterations)
      gl!.useProgram(presProg);
      gl!.uniform2f(presUni.texelSize, 1.0 / simW!, 1.0 / simH!);
      gl!.uniform1i(presUni.uDivergence, 1);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, divergence.texture);
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(presUni.uPressure, 0);
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, pressure.read.texture);
        blit(pressure.write);
        pressure.swap();
      }

      // Gradient subtract
      gl!.useProgram(gradProg);
      gl!.uniform2f(gradUni.texelSize, 1.0 / simW!, 1.0 / simH!);
      gl!.uniform1i(gradUni.uPressure, 0);
      gl!.uniform1i(gradUni.uVelocity, 1);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, pressure.read.texture);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, velocity.read.texture);
      blit(velocity.write);
      velocity.swap();
    }

    // — Render —
    function render() {
      gl!.useProgram(dispProg);
      gl!.uniform1i(dispUni.uTexture, 0);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, dye.read.texture);
      blit(null);
    }

    // — Mouse/Touch —
    let pointer = { x: 0, y: 0, dx: 0, dy: 0, down: false, moved: false, color: getRandomColor() };

    function updatePointer(x: number, y: number) {
      const rect = canvas!.getBoundingClientRect();
      const nx = (x - rect.left) / rect.width;
      const ny = (y - rect.top) / rect.height;
      pointer.dx = (nx - pointer.x) * 10;
      pointer.dy = (ny - pointer.y) * 10;
      pointer.x = nx;
      pointer.y = ny;
      pointer.moved = Math.abs(pointer.dx) > 0.0001 || Math.abs(pointer.dy) > 0.0001;
    }

    const onMouseDown = (e: MouseEvent) => { pointer.down = true; pointer.color = getRandomColor(); updatePointer(e.clientX, e.clientY); };
    const onMouseUp = () => { pointer.down = false; };
    const onMouseMove = (e: MouseEvent) => { if (pointer.down) updatePointer(e.clientX, e.clientY); };
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); pointer.down = true; pointer.color = getRandomColor(); const t = e.touches[0]; updatePointer(t.clientX, t.clientY); };
    const onTouchEnd = () => { pointer.down = false; };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); if (pointer.down) { const t = e.touches[0]; updatePointer(t.clientX, t.clientY); } };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    // — Auto splats for ambient effect —
    let autoSplatTimer = 0;
    function autoSplat() {
      const c = getRandomColor();
      const x = Math.random();
      const y = Math.random();
      const dx = (Math.random() - 0.5) * 0.001;
      const dy = (Math.random() - 0.5) * 0.001;
      splat(x, y, dx, dy, c);
    }

    // — Loop —
    let lastTime = Date.now();
    function loop() {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016);
      lastTime = now;

      // Resize check
      if (canvas!.width !== canvas!.clientWidth || canvas!.height !== canvas!.clientHeight) {
        canvas!.width = canvas!.clientWidth;
        canvas!.height = canvas!.clientHeight;
      }

      if (pointer.down && pointer.moved) {
        splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
        pointer.moved = false;
      }

      // Auto ambient splats
      autoSplatTimer += dt;
      if (autoSplatTimer > 3) {
        autoSplatTimer = 0;
        autoSplat();
      }

      step(dt);
      render();
      animRef.current = requestAnimationFrame(loop);
    }

    // Initial splats
    setTimeout(() => { for (let i = 0; i < 3; i++) autoSplat(); }, 100);

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [getRandomColor]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
}
