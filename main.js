import * as THREE from "three"
import { PointerLockControls } from "./PointerLockControls.js";
 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejsContainer').appendChild(renderer.domElement);
 

const controls = new PointerLockControls(camera, document.body);

controls.addEventListener('lock', () => {
    console.log("Pointer locked");
    const uiElement = document.getElementById('ui');
    if (uiElement) uiElement.remove();
})

document.getElementById('ui').addEventListener('click', () => {
    controls.lock();
})

scene.add(controls.getObject());


const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);


const textureLoader = new THREE.TextureLoader();
const enemyTexture = textureLoader.load('assets/images/alien.jpg');

//SpotLight( color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float )
const spotlight = new THREE.SpotLight(0xFFFF00);
spotlight.intensity = 10; 
spotlight.angle = 0.05;
spotlight.penumbra = 0.5;
spotlight.distance = 200;
scene.add(spotlight);


const enemies = [];
const enemyGeometry = new THREE.BoxGeometry(2, 2, 2);
const enemyMaterial = new THREE.MeshStandardMaterial({color: 0x43cd80, map: enemyTexture});

for(let i = 0; i < 50; i++){
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 50 - 25, 1, Math.random() * 50 - 25);
    scene.add(enemy);
    enemies.push(enemy);
}

const bulletLight = new THREE.PointLight(0xffffff, 1, 10);
scene.add(bulletLight);

const bullets = [];
const bulletSpeed = 0.5;
const bulletGeometry = new THREE.SphereGeometry(0.2, 25, 25);
const bulletMaterial = new THREE.MeshStandardMaterial({color: 0xe52b50, metalness: 1, roughness: 0.25, emissive: 0xe52b50, emissiveIntensity: 1});

function shootBullet() {
    if (!controls.isLocked) return;

    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    bullet.position.copy(camera.position).add(direction.multiplyScalar(2));
    bullet.velocity = new THREE.Vector3().copy(direction).multiplyScalar(bulletSpeed);

    bullets.push(bullet);
    scene.add(bullet);
    bulletLight.position.copy(bullet.position);

    console.log("Bullet Fired", bullet.position, bullet);
}

document.addEventListener('click', shootBullet);

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].position.add(bullets[i].velocity);
        bulletLight.position.copy(bullets[i].position);

        for(let j = enemies.length - 1; j >= 0; j--){
            const distance = bullets[i].position.distanceTo(enemies[j].position);
            if (distance < 2) {
                scene.remove(enemies[j]);
                enemies.splice(j, 1);
                scene.remove(bullets[i]);
                bullets.splice(i, 1);
                break;
            }
        }
        
        if(bullets[i] && bullets[i].position.length() > 100){
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    spotlight.position.copy(camera.position);
    spotlight.target.position.copy(camera.position).add(direction.multiplyScalar(10));
    spotlight.target.updateMatrixWorld();
    updateBullets();
    renderer.render(scene, camera);
}

animate();