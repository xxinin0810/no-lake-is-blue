import * as THREE from 'three'

/**
 * 湖面 Shader 材质
 * - 波浪动画
 * - 蓝色琥珀扩散效果（从中心点向外蔓延）
 * - 可控扰动强度
 */
export function createLakeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmberCenter: { value: new THREE.Vector2(0, 0) },
      uAmberRadius: { value: 0 },
      uAmberIntensity: { value: 0 },
      uDisturbance: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uDisturbance;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float d = uDisturbance;
        pos.y += sin(pos.x * 1.5 + uTime * 0.8) * (0.02 + d * 0.06)
               + cos(pos.z * 2.0 + uTime * 0.6) * (0.015 + d * 0.04)
               + sin((pos.x + pos.z) * 3.0 + uTime * 1.2) * (0.008 + d * 0.03);
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uAmberCenter;
      uniform float uAmberRadius;
      uniform float uAmberIntensity;
      uniform float uDisturbance;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vec3 baseColor = vec3(0.06, 0.18, 0.2);
        vec3 amberColor = vec3(0.02, 0.12, 0.4);
        float dist = distance(vWorldPos.xz, uAmberCenter);
        float spread = 1.0 - smoothstep(uAmberRadius * 0.75, uAmberRadius, dist);
        vec3 color = mix(baseColor, amberColor, spread * uAmberIntensity);

        float rippleStr = smoothstep(0.5, 2.0, uAmberRadius) * (0.04 + uDisturbance * 0.08);
        color += sin(dist * 10.0 - uTime * 3.0) * rippleStr;

        float spec = pow(max(0.0, sin(vWorldPos.x * 3.5 + uTime * 1.5) * sin(vWorldPos.z * 2.5 + uTime)), 16.0);
        color += spec * 0.1 * (1.0 - spread * 0.5);

        float edge = distance(vUv, vec2(0.5));
        float alpha = 1.0 - smoothstep(0.38, 0.5, edge);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  })
}
