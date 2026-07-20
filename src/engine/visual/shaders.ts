export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uMemoryAnchor;
  uniform sampler2D uAttention;
  uniform float uPressure;
  uniform float uStillness;
  uniform float uAbsence;
  uniform float uSeed;
  uniform float uState;
  uniform float uQuality;
  uniform float uMotion;
  uniform float uContrast;
  uniform float uMatterDensity;
  uniform float uDepth;
  uniform float uOrganic;
  uniform float uPeripheral;
  uniform float uGrain;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32 + uSeed * 17.0);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 9.17;
      amplitude *= 0.5;
    }
    return value;
  }

  float line(float value, float width) {
    return 1.0 - smoothstep(width, width + fwidth(value) * 1.5, abs(value));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    float slowTime = uTime * 0.024 * uMotion;
    float attention = texture2D(uAttention, vec2(uv.x, 1.0 - uv.y)).r;
    float ignored = pow(1.0 - attention, 1.6);
    vec2 pointerDelta = vec2((uv.x - uPointer.x) * aspect, uv.y - (1.0 - uPointer.y));
    float pointerField = exp(-dot(pointerDelta, pointerDelta) * 29.0);
    float withdrawal = clamp(attention * 0.92 + pointerField * uPressure * 0.72, 0.0, 0.97);
    float reveal = smoothstep(0.08, 0.82, uStillness) * ignored;

    float lowNoise = fbm(p * vec2(1.7, 2.2) + vec2(slowTime, -slowTime * 0.7));
    float fineNoise = fbm(p * vec2(8.0, 11.0) - vec2(slowTime * 2.0, 0.0));
    float warp = (lowNoise - 0.5) * (0.12 + uOrganic * 0.16);

    // The chosen composition: a vertical membrane held against a measured breach.
    float membraneX = p.x - 0.13 + warp * (0.55 + reveal * 0.5);
    float membraneWidth = 0.2 + 0.06 * sin(p.y * 5.0 + lowNoise * 2.0);
    float membrane = 1.0 - smoothstep(membraneWidth, membraneWidth + 0.045, abs(membraneX));
    membrane *= smoothstep(0.53, 0.35, abs(p.y + 0.015));

    float innerEdge = line(abs(membraneX) - membraneWidth * 0.58, 0.004);
    float folds = pow(max(0.0, sin((p.y + warp) * 32.0 + fineNoise * 4.0)), 18.0);
    folds *= membrane * (0.13 + reveal * 0.46);
    float tissue = membrane * (0.12 + lowNoise * 0.12 + fineNoise * 0.055);
    tissue += innerEdge * (0.07 + reveal * 0.12) + folds;

    // A large incomplete contour gives the image scale without becoming navigable 3D.
    vec2 arcPoint = p - vec2(0.34, -0.01);
    float arcRadius = length(arcPoint * vec2(0.72, 1.0));
    float monolithArc = line(arcRadius - 0.45, 0.0016);
    monolithArc *= smoothstep(-0.25, 0.2, p.x) * (0.08 + reveal * 0.35);

    // Measurement lines remain incomplete and are most legible outside attention.
    float horizontalMeasure = line(p.y + 0.285 + warp * 0.04, 0.0008);
    horizontalMeasure *= smoothstep(0.5, 0.08, abs(p.x + 0.28));
    float verticalMeasure = line(p.x + 0.47, 0.0007);
    verticalMeasure *= smoothstep(0.38, 0.03, abs(p.y + 0.03));
    float ticks = step(0.82, fract((p.y + 0.5) * 19.0));
    verticalMeasure *= 0.4 + ticks * 0.6;

    // The memory anchor migrates between visits; it never appears as a literal marker.
    vec2 memoryDelta = vec2((uv.x - uMemoryAnchor.x) * aspect, uv.y - uMemoryAnchor.y);
    float residue = exp(-dot(memoryDelta, memoryDelta) * 15.0);
    residue *= (0.025 + uAbsence * 0.16) * ignored;

    float peripheralVeil = fbm(p * 3.6 + vec2(5.0, -2.0));
    peripheralVeil = smoothstep(0.54, 0.82, peripheralVeil) * reveal * uPeripheral;
    peripheralVeil *= smoothstep(0.18, 0.62, length(p));

    float matter = tissue * uMatterDensity;
    matter += monolithArc + horizontalMeasure * 0.11 + verticalMeasure * 0.16;
    matter += peripheralVeil * 0.15 + residue;
    matter *= 1.0 - withdrawal;

    vec3 deepBlack = vec3(0.006, 0.007, 0.006);
    vec3 graphite = vec3(0.055, 0.06, 0.056);
    vec3 oxidized = vec3(0.115, 0.17, 0.142);
    vec3 bone = vec3(0.69, 0.69, 0.635);
    vec3 alarm = vec3(0.42, 0.035, 0.024);

    float depthShade = pow(max(0.0, 1.0 - length(p - vec2(0.08, 0.0)) * 0.9), 3.0);
    vec3 color = deepBlack + graphite * depthShade * 0.12 * uDepth;
    color += mix(oxidized, bone, clamp(folds + innerEdge * 0.2, 0.0, 0.55)) * matter;

    float defensive = 1.0 - step(0.45, abs(uState - 6.0));
    float alarmVein = line(membraneX + 0.012 * sin(p.y * 47.0), 0.0013);
    alarmVein *= membrane * defensive * (0.18 + uPressure * 0.35);
    color = mix(color, alarm, alarmVein);

    float vignette = smoothstep(0.88, 0.22, length(p * vec2(0.78, 1.0)));
    color *= 0.45 + vignette * 0.72;
    color *= 1.0 + (uContrast - 1.0) * 0.55;

    float grain = hash21(gl_FragCoord.xy + fract(uTime) * 191.0) - 0.5;
    grain *= uGrain * (0.018 + (1.0 - uQuality) * 0.005);
    color += grain;

    gl_FragColor = vec4(max(color, 0.0), 1.0);
  }
`
