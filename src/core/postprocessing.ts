/**
 * 黑白 ↔ 彩色 后处理 Shader
 * uSaturation: 1.0 = 全黑白, 0.0 = 全彩色
 */
export const bwColorShader = {
  uniforms: {
    tDiffuse: { value: null },
    uSaturation: { value: 1.0 },
    uVignetteIntensity: { value: 0.45 },
    uContrast: { value: 1.15 },
    uBrightness: { value: 0.9 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uSaturation;
    uniform float uVignetteIntensity;
    uniform float uContrast;
    uniform float uBrightness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // 饱和度调节
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(color, vec3(gray), uSaturation);

      // 对比度
      color = (color - 0.5) * uContrast + 0.5;

      // 亮度
      color *= uBrightness;

      // 暗角
      vec2 uv = (vUv - 0.5) * 2.0;
      float vignette = 1.0 - dot(uv * 0.5, uv * 0.5);
      vignette = smoothstep(0.0, 1.0, vignette);
      color *= mix(1.0, vignette, uVignetteIntensity);

      // 胶片颗粒
      float grain = fract(sin(dot(vUv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - 0.5) * 0.025;

      gl_FragColor = vec4(color, texel.a);
    }
  `,
}
