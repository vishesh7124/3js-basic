import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI }  from 'dat.gui'

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 2;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff,0);

renderer.setSize(window.innerWidth,
    window.innerHeight);

document.body.appendChild(renderer.domElement);

// cube
// var geometry = new THREE.BoxGeometry(1,1,1);
// var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);




const loader = new GLTFLoader();

loader.load( "rickenbacker_40032.glb", function(gltf){
    gltf.scene.rotation.set(0,THREE.MathUtils.degToRad(270),THREE.MathUtils.degToRad(270))
    scene.add(gltf.scene);
}, undefined, function ( error ) {
    
    console.error( error );
    
} )
renderer.physicallyCorrectLights = true
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 );
scene.add( ambientLight );

const dirLight = new THREE.DirectionalLight( 0xefefff, 1.5 );
dirLight.position.set( 10, 10, 10 );
scene.add( dirLight );

//spotlight 
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 0, 10, 10 );
scene.add(spotLight);

// for control
const controls = new OrbitControls( camera, renderer.domElement );
controls.minPolarAngle = controls.maxPolarAngle = Math.PI/2
controls.addEventListener('change', onCameraUpdate);

// markers
let markers=[];//all markers
let markerData=[
    {
        position:[-0.89568,0.10144,0.14479],
        headline:'One',
        description : ''
    },
    {
        position:[-0.2,0,0.2],
        headline:'Two',
        description : ''
    },
]

Object.keys(markerData).forEach(function(key){
    let marker = markerData[key];
    console.log(marker);

    var markerContainer = new THREE.Object3D();

    var geometry = new THREE.TorusGeometry(0.06,0.01,2,100);
    var material = new THREE.MeshBasicMaterial({color: 0xcccccc});
    var torus = new THREE.Mesh(geometry, material);
    markerContainer.add(torus);

    var geometry = new THREE.CircleGeometry(0.05, 32);
    var material = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.5});
    var circle = new THREE.Mesh(geometry, material);
    circle.userData.markerName = key;
    markerContainer.add(circle);

    markerContainer.position.set(marker.position[0], marker.position[1], marker.position[2]);
    markers.push(markerContainer);

    scene.add(markerContainer);
})

function onCameraUpdate(){
    let cameraAngle = controls.getAzimuthalAngle();
    markers.forEach(function(marker){
        marker.rotation.set(0, cameraAngle, 0);
    } )
}


// ADD HELPER 

function addHelper(){
    var geometry = new THREE.SphereGeometry( 0.05, 32, 32);
    var material = new THREE.MeshBasicMaterial({color:0xFF0000});
    const markerHelper = new THREE.Mesh(geometry,material);
    scene.add(markerHelper);
    markerHelper.position.set(0,0,0.01);

    var gui = new GUI();
    gui.add(markerHelper.position, 'x',-1,1).step(0.00001);
    gui.add(markerHelper.position, 'y',-1,1).step(0.00001);
    gui.add(markerHelper.position, 'z',-1,1).step(0.00001);
}

addHelper();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

window.addEventListener('mousemove', onMouseMove, false);

var canvas = document.getElementsByTagName('canvas');
canvas = canvas[0];
canvas.addEventListener('click', onCanvasClick);

var tooltipContainer = document.getElementById('tooltip');

function onCanvasClick(){
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse,camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children,true);
    
    var marker = null;
    var markerName = null;
    var activeMarker = null;
    if(intersects.length){
        console.log(intersects);
        console.log(intersects[0].object.userData.markerName)
        if(intersects[0].object.userData.markerName){

            marker = intersects[0].object;
            markerName = marker.userData.markerName;
            tooltipContainer.innerHTML = "<p><strong>"+markerData[markerName].headline+"</strong><br/>"+markerData[markerName].description+'</p>'
            // console.clear();
            console.log(markerData[markerName]);
        }
    }
    if(markerName){
        activeMarker = marker;
        tooltipContainer.classList.remove('is-visible');
        positionMarker(activeMarker);
    }
    else{
        activeMarker = null;
        tooltipContainer.classList.remove('is-visible');
        positionMarker(activeMarker);
    }
}

function positionMarker(activeMarker){
    let position = toScreenPosition(activeMarker, camera);
    console.log(position)
}

function toScreenPosition(obj,camera){
    var vector = new THREE.Vector3();
    var widthHalf = 0.5*canvas.width;
    var heightHalf = 0.5*canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = - (vector.y * heightHalf) + heightHalf;

    return vector;
}

function animate(){
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    requestAnimationFrame(animate)
    renderer.render(scene, camera);
}
animate()
// renderer.setAnimationLoop(animate);
