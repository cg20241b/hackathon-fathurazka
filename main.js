import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let cube;

// Load the font
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Create the alphabet mesh
    const alphabetGeometry = new TextGeometry('i', {
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
    const alphabetMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(73,151,208)' }); // Hex color string for red
    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    alphabetMesh.position.set(-10, 0, 0); // Position on the left side
    scene.add(alphabetMesh);

    // Create the digit mesh
    const digitGeometry = new TextGeometry('6', {
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
    const digitMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(182,104,47)' }); // RGB color for green
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(10, 0, 0); // Position on the right side
    scene.add(digitMesh);

    // Create ambient light for better overall visibility
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Create the central cube (light source)
    const cubeGeometry = new THREE.BoxGeometry(3,3,3);
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
                intensity = pow(0.5 - dot(vNormal, vNormel), 2.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            uniform float time;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0); // Center of the scene
    scene.add(cube);

    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
});

function animate() {
    requestAnimationFrame(animate);

    if (cube) {  // Check if cube exists
        cube.material.uniforms.time.value += 0.016;
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});