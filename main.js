import * as THREE from 'three';
import { movePlayer } from './player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OrbitControls } from "three/addons/controls/OrbitControls";


let gameLoaded = false;

let clock = new THREE.Clock();
let light;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

let plane, player;

let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff);
scene.background = new THREE.Color("white");

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0xffffff)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.gammaInput = true;
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 100, 0);

var ambient = new THREE.AmbientLight( 0xffffff, 0.2 );
scene.add( ambient )
light = new THREE.PointLight( 0xffffff, 0.7, 700);
light.position.set(50,50, 100);
light.castShadow = true;
scene.add( light );

//let controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
//controls.target.set(0, 5, 0);


let mixers = [];
let allAnimations = [];
let playerAll;
let clock2 = new THREE.Clock();





function init() {
    
    var geometryPlane = new THREE.BoxGeometry(3000, 1, 3000);
    var materialPlane = new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
    plane = new THREE.Mesh ( geometryPlane, materialPlane );
    plane.receiveShadow = true;
    scene.add( plane );

    const size = 1000;
    const divisions = 100;

    const gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.position.y = 2;
    scene.add( gridHelper );

    const geometryPlayer = new THREE.BoxGeometry(10,10,10);
    const materialPlayer = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    const playerBody = new THREE.Mesh( geometryPlayer, materialPlayer);

    const geometryPlayerFront = new THREE.BoxGeometry(2,2,1)
    const materialPlayerFront = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    const playerFront = new THREE.Mesh( geometryPlayerFront, materialPlayerFront);
    playerFront.position.set(0,0,10);

    player = new THREE.Group();
    //player.add( playerBody );
    player.add( playerFront );
    //player.rotation.x = Math.PI / 2;
    //player.rotation.y = Math.PI / 2;
    player.castShadow = true;
    //player.lookAt(5,5,0);
    
    scene.add( player );
    
    player.speedX = 0;
    player.speedY = 0;

    player.userData.goTurn = {
      goLeft: false,
      goRight: false,
      goUp: false,
      goDown: false
    }

    player.userData.animations = {
      actionStay: null,
      actionRunForward: null,
      actionRunRight: null,
      actionRunLeft: null
    }

    
    
    player.userData.playerTurn = 'top';
    



    var loader = new GLTFLoader();

        loader.load(
        'models/player/player.gltf',
        function ( gltf ) {
          
          gltf.scene.scale.set(10,10,10);
          console.log(gltf.scene);
          
          
          //scene.add( gltf.scene );
          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Scene
          gltf.scenes; // Array<THREE.Scene>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

        
          gltf.scene.animations = gltf.animations;
          playerAll = gltf.scene;

          playerAll.rotation.y = Math.PI*2;

          
          // playerAll.traverse( function ( child ) {
          //   if ( child.isMesh ) {
          //     child.castShadow = true;
          //   }
          // } );
          playerAll.mixer = new THREE.AnimationMixer( playerAll );

          mixers.push( playerAll.mixer );

          


          allAnimations.push(player.userData.animations.actionStay = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='idle')));
          //actionStay.timeScale = 0.5;
          allAnimations.push(player.userData.animations.actionRunForward = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='run_forward')));

          allAnimations.push(player.userData.animations.actionRunRight = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='run_right')));
          //actionRunForward.timeScale = 2.2;

          //player.userData.animations.actionRunForward.weight = 0;
          //player.userData.animations.actionRunLeft.weight = 0;
          //player.userData.animations.actionRunRight.weight = 0;
          //player.userData.animations.actionStay.weight = 1;

          // player.userData.animations.actionRunForward.play();
          // player.userData.animations.actionRunLeft.play();
          // player.userData.animations.actionRunRight.play();
          player.userData.animations.actionStay.play();
          //player.userData.animations.actionRunForward.play();
          

          $('.btn1').click(function() {
            
            player.userData.animations.actionRunForward.reset().crossFadeFrom(player.userData.animations.actionStay, 1).play();
          })
          $('.btn2').click(function() {
            player.userData.animations.actionStay.reset().crossFadeFrom(player.userData.animations.actionRunForward, 1).play();
          })
          
          
          
          
          //scene.add(playerAll);
          player.add(playerAll);
          gameLoaded = true;

          
        
        },
        // called while loading is progressing
        function ( xhr ) {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
          console.log( 'An error happened' );
        }


      );

      
























    
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
};

/*///////////////////////////////////////////////////////////////////*/

function animate() {
    if (gameLoaded) movePlayer(player, clock, camera);
    camera.lookAt(player.position);

    

				
    if ( mixers.length > 0 ) {
      for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[ i ].update( clock2.getDelta() );
      }
    }
		
    

    
};


init();
animate();

/*///////////////////////////////////////////////////////////////////*/
renderer.setAnimationLoop((_) => {
    
    animate();
    //controls.update();
    renderer.render(scene, camera);
});

/*///////////////////////////////////////////////////////////////////*/






function onDocumentMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera );
    
    plane.geometry.computeBoundingBox();
    var box1 = plane.geometry.boundingBox.clone();
    box1.applyMatrix4(plane.matrixWorld);
    
    let intersects = raycaster.ray.intersectBox( box1, new THREE.Vector3() );
    
    
    if (intersects) {
      player.lookAt(intersects.x, 0, intersects.z);
      //console.log(player.getWorldDirection(new THREE.Vector3()));
      
      let playerAngle = player.getWorldDirection(new THREE.Vector3());
      if (playerAngle.x <= 0.6 && playerAngle.x >= -0.6 && playerAngle.z >= 0.6) {
        player.userData.playerTurn = 'top';
      }
      else if(playerAngle.x <= 0.6 && playerAngle.z <= 0.6 && playerAngle.z >= -0.6) {
        player.userData.playerTurn = 'right';
      }
      else if(playerAngle.x >= -0.6 && playerAngle.x <= 0.6 && playerAngle.z <= -0.6) {
        player.userData.playerTurn = 'down';
      }
      else if(playerAngle.x >= 0.6 && playerAngle.z <= 0.6 && playerAngle.z >= -0.6) {
        player.userData.playerTurn = 'left';
      }
      
      
    }
    
}