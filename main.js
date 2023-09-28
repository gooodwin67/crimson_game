import * as THREE from 'three';
import { movePlayer } from './player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OrbitControls } from "three/addons/controls/OrbitControls";


let gameLoaded = false;
let playerLoaded = false;
let worldLoaded = false;

let clock = new THREE.Clock();

let light;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const materialLine = new THREE.LineBasicMaterial( { color: 0x0000ff } );

let plane, player;

let playerMixers = [];
let allAnimations = [];
let playerAll;
let playerBox = new THREE.Group();
let clock2 = new THREE.Clock();

let enemy;
let enemies;

const raycasterEnemy = new THREE.Raycaster();
let lineEnemy;

let city;

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

var ambient = new THREE.AmbientLight( 0xffffff, 0.3 );
scene.add( ambient )
light = new THREE.PointLight( 0xffffff, 0.7, 700);
light.position.set(50,50, 100);
light.castShadow = true;
scene.add( light );

//let controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
//controls.target.set(0, 5, 0);








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

    addPlayer();
    addEnemy();
    addWorld();
 
};

/*///////////////////////////////////////////////////////////////////*/

function animate() {

    gameIsLoaded();

    if (gameLoaded) {
      movePlayer(player, playerBox, camera, city);
      light.position.set(player.position);
      camera.lookAt(player.position);
      
      fightEnemies();
    }

    

    		
    if ( playerMixers.length > 0 ) {
      for ( var i = 0; i < playerMixers.length; i ++ ) {
        playerMixers[ i ].update( clock2.getDelta() );
      }
    }  
};

/*///////////////////////////////////////////////////////////////////*/

function gameIsLoaded() {
  if (!gameLoaded && playerLoaded && worldLoaded) gameLoaded = true;
}

$('.btn1').click(function() {console.log(1)});
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
init();


/*///////////////////////////////////////////////////////////////////*/


renderer.setAnimationLoop((_) => {
    
    animate();
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
    
    
    if (intersects && gameLoaded) {
      playerAll.lookAt(intersects.x, 0, intersects.z);
      //console.log(player.getWorldDirection(new THREE.Vector3()));
      
      let playerAngle = playerAll.getWorldDirection(new THREE.Vector3());
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


/*///////////////////////////////////////////////////////////////////*/



function addWorld() {

  var loader = new GLTFLoader();

  loader.load(
    'models/world/city.gltf',
    function ( gltf ) {
      
      gltf.scene.scale.set(20,20,20);
      gltf.scene.position.set(0,20,0);
      
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.scenes; // Array<THREE.Scene>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      city = gltf.scene;
      scene.add(city);
      //console.log(gltf.scene)
      
     

      
      // playerAll.traverse( function ( child ) {
      //   if ( child.isMesh ) {
      //     child.castShadow = true;
      //   }
      // } );
      
      worldLoaded = true;
    
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

}


/*///////////////////////////////////////////////////////////////////*/



function addPlayer() {
  const geometryPlayerFront = new THREE.BoxGeometry(2,2,1)
  const materialPlayerFront = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
  const playerFront = new THREE.Mesh( geometryPlayerFront, materialPlayerFront);
  playerFront.position.set(0,0,10);

  player = new THREE.Group();
  player.add( playerFront );

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

      playerMixers.push( playerAll.mixer );

      allAnimations.push(player.userData.animations.actionStay = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='idle')));
      //actionStay.timeScale = 0.5;
      allAnimations.push(player.userData.animations.actionRunForward = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='run_forward')));

      allAnimations.push(player.userData.animations.actionRunRight = playerAll.mixer.clipAction( playerAll.animations.find(el=>el.name==='run_right')));

      player.userData.animations.actionStay.play();


      player.add(playerAll);


      playerBox.name = 'playerBox';
      const geometryPlayerBoxLeft = new THREE.BoxGeometry(4,15,2);
      const materialPlayerBoxLeft = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
      const playerBoxLeft = new THREE.Mesh( geometryPlayerBoxLeft, materialPlayerBoxLeft);
      playerBoxLeft.name = 'playerBoxLeft';
      playerBoxLeft.position.set(3,0,0);
      playerBoxLeft.rotation.y = Math.PI/2;
      playerBox.add( playerBoxLeft );

      const geometryPlayerBoxRight = new THREE.BoxGeometry(4,15,2);
      const materialPlayerBoxRight = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
      const playerBoxRight = new THREE.Mesh( geometryPlayerBoxRight, materialPlayerBoxRight);
      playerBoxRight.name = 'playerBoxRight';
      playerBoxRight.position.set(-3,0,0);
      playerBoxRight.rotation.y = Math.PI/2;
      playerBox.add( playerBoxRight );

      const geometryPlayerBoxTop = new THREE.BoxGeometry(4,15,2);
      const materialPlayerBoxTop = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
      const playerBoxTop = new THREE.Mesh( geometryPlayerBoxTop, materialPlayerBoxTop);
      playerBoxTop.name = 'playerBoxTop';
      playerBoxTop.position.set(0,0,3);
      playerBox.add( playerBoxTop );

      const geometryPlayerBoxBottom = new THREE.BoxGeometry(4,15,2);
      const materialPlayerBoxBottom = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
      const playerBoxBottom = new THREE.Mesh( geometryPlayerBoxBottom, materialPlayerBoxBottom);
      playerBoxBottom.name = 'playerBoxBottom';
      playerBoxBottom.position.set(0,0,-3);
      playerBox.add( playerBoxBottom );




      player.add(playerBox);

      console.log(player.children.filter(el => el.name == 'playerBox')[0].children.filter(el => el.name == 'playerBoxLeft')[0]);


      playerLoaded = true;
    
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
}


/*///////////////////////////////////////////////////////////////////*/



function addEnemy() {
  const geometryEnemy = new THREE.BoxGeometry(10,10,10)
  const materiaEnemy = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
  let enemyBody = new THREE.Mesh( geometryEnemy, materiaEnemy);

  const geometryEnemyFront = new THREE.BoxGeometry(2,10,2)
  const materiaEnemyFront = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
  let enemyFront= new THREE.Mesh( geometryEnemyFront, materiaEnemyFront);
  

  enemy = new THREE.Group();
  enemy.add( enemyBody );
  enemy.add( enemyFront );
  enemy.userData.speed = Math.random();
  enemy.userData.raycaster = new THREE.Raycaster();
  enemy.userData.rayLine = new THREE.Line( new THREE.BufferGeometry(), materialLine);
  enemy.userData.rayLine.position.set(0,5,0);

  enemy.position.set(50,0,0);
  enemyFront.position.set(0,0,10);

  enemies = [];
  enemies.push(enemy.clone());
  enemies.push(enemy.clone());


  enemies[0].position.set(90, 0, 50);
  enemies[0].userData.speed = Math.random();
  enemies[0].userData.raycaster = new THREE.Raycaster();
  enemies[0].userData.rayLine = new THREE.Line( new THREE.BufferGeometry(), materialLine);
  enemies[0].userData.rayLine.position.set(0,5,0);
  enemies[0].userData.direction = new THREE.Vector3();
  enemies[1].position.set(90, 0, 0);
  enemies[1].userData.speed = Math.random();
  enemies[1].userData.raycaster = new THREE.Raycaster();
  enemies[1].userData.rayLine = new THREE.Line( new THREE.BufferGeometry(), materialLine);
  enemies[1].userData.rayLine.position.set(0,5,0);
  enemies[1].userData.direction = new THREE.Vector3();



  enemies.forEach(element => {
    //element.userData = enemy.userData;
    scene.add( element );
    scene.add( element.userData.rayLine );
  });
  

  
  



  

}

function fightEnemies() {

  enemies.forEach(element => {
    if (element.position.distanceTo(player.position) < 80) {
      element.position.add(player.position.clone().sub(element.position).normalize().multiplyScalar(element.userData.speed));
      element.lookAt(player.position);

    }

    
    element.userData.raycaster.set(element.position, element.userData.direction.subVectors(player.position, element.position).normalize());
    element.userData.rayLine.geometry.setFromPoints(
      [
        element.userData.raycaster.ray.origin,
        element.userData.raycaster.ray.direction,
      ]
    );
    console.log(element.userData.rayLine);
  });

  // enemies[0].userData.raycaster.set(element.position, element.userData.direction.subVectors(element.position, player.position).normalize());
  // element.userData.rayLine.geometry.setFromPoints(
  //   [
  //     element.userData.raycaster.ray.origin,
  //     element.userData.raycaster.ray.direction,
  //   ]
  // );

}