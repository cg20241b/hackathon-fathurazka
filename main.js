import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Create scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Declare cube globally
let cube;

// Shared uniforms for materials
const ambientIntensity = 0.328; // (128 + 200) /
const sharedUniforms = {
    lightPosition: { value: new THREE.Vector3(0, 0, 0) },
    ambientIntensity: { value: ambientIntensity },
    viewPosition: { value: camera.position }
};

// Load font and create geometries
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Create alphabet mesh
    const alphabetGeometry = new TextGeometry('A', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5
    });

    // Alphabet shader material (Plastic-like)
    const alphabetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...sharedUniforms,
            baseColor: { value: new THREE.Color('rgb(73,151,208)') },
            shininess: { value: 32.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalMatrix * normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 baseColor;
            uniform vec3 viewPosition;
            uniform float shininess;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                
                vec3 ambient = baseColor * ambientIntensity;
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
                vec3 specular = spec * vec3(1.0);
                
                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `
    });

    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    alphabetMesh.position.set(-10, 0, 0);
    scene.add(alphabetMesh);

    // Create digit mesh
    const digitGeometry = new TextGeometry('8', {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5
    });

    // Digit shader material (Metallic)
    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...sharedUniforms,
            baseColor: { value: new THREE.Color('rgb(182,104,47)') },
            shininess: { value: 64.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalMatrix * normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 baseColor;
            uniform vec3 viewPosition;
            uniform float shininess;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                
                vec3 ambient = baseColor * ambientIntensity;
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
                vec3 specular = spec * baseColor;
                
                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `
    });

    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(10, 0, 0);
    scene.add(digitMesh);

    // Create central glowing cube
    const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
    const cubeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
            viewVector: { type: 'v3', value: camera.position },
            time: { type: 'f', value: 0.0 }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);
                vec3 vNormel = normalize(normalMatrix * viewVector);
                intensity = pow(1.0 - dot(vNormal, vNormel), 3.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            uniform float time;
            varying float intensity;
            void main() {
                float pulseFactor = 1.0 + 0.3 * sin(time * 2.0);
                vec3 glow = glowColor * intensity * pulseFactor * 2.0;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (cube) {
        cube.material.uniforms.time.value += 0.016;
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        
        // Update light position uniforms for text materials
        const lightPos = cube.position;
        scene.traverse((object) => {
            if (object.material && object.material.uniforms && object.material.uniforms.lightPosition) {
                object.material.uniforms.lightPosition.value.copy(lightPos);
            }
        });
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});