import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { movePlayer } from './player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { detectCollisionCubes } from './detectColisions.js';

import { OrbitControls } from "three/addons/controls/OrbitControls";


let gameLoaded = false;
let playerLoaded = false;
let worldLoaded = false;

let clock = new THREE.Clock();
let stats;

let light;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const materialLine = new THREE.LineBasicMaterial( { color: 0xff0000 } );
const materialLine2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const materialLine3 = new THREE.LineBasicMaterial( { color: 0x000000 } );

let plane, player;

let playerMixers = [];
let allAnimations = [];
let playerAll;
let playerBox = new THREE.Group();
let clock2 = new THREE.Clock();

let enemy;
let enemyBox = new THREE.Group();
let enemies;

const raycasterEnemy = new THREE.Raycaster();
let lineEnemy;

let city;

let scene = new THREE.Scene();
//scene.fog = new THREE.Fog(0xffffff);
//scene.background = new THREE.Color("white");

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
stats = new Stats();
document.body.appendChild( stats.dom );

let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 10000);
camera.position.set(0, 150, 0);
//camera.lookAt(0,0,0);

var ambient = new THREE.AmbientLight( 0xffffff );
scene.add( ambient )
light = new THREE.PointLight( 0xffffff, 0.7, 700);
light.position.set(50,50, 100);
//light.castShadow = true;
scene.add( light );

let controls = new OrbitControls(camera, renderer.domElement);
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
      light.position.set(player.position.x, 100, player.position.z);
      camera.lookAt(player.position);
      
      //console.log(detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxLeft')[0], city.children[2]));


      
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
    stats.update();
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
    'models/world/world3.gltf',
    function ( gltf ) {
      
      //gltf.scene.scale.set(100,100,100);
      //gltf.scene.position.set(0,230,0);
      
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Scene
      gltf.scenes; // Array<THREE.Scene>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      city = gltf.scene;
      scene.add(city);
      console.log(city);
      
      
     

      
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
      player.position.x = -120;

      //console.log(player.children.filter(el => el.name == 'playerBox')[0].children.filter(el => el.name == 'playerBoxLeft')[0]);


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
  enemyBody.name = 'enemyBody';

  const geometryEnemyFront = new THREE.BoxGeometry(2,10,2)
  const materiaEnemyFront = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
  let enemyFront= new THREE.Mesh( geometryEnemyFront, materiaEnemyFront);


  
  enemyBox.name = 'enemyBox';
  const geometryenemyBoxLeft = new THREE.BoxGeometry(1,15,2);
  const materialenemyBoxLeft = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
  const enemyBoxLeft = new THREE.Mesh( geometryenemyBoxLeft, materialenemyBoxLeft);
  enemyBoxLeft.name = 'enemyBoxLeft';
  enemyBoxLeft.position.set(4,0,0);
  enemyBoxLeft.rotation.y = Math.PI/2;
  enemyBox.add( enemyBoxLeft );

  const geometryenemyBoxRight = new THREE.BoxGeometry(1,15,2);
  const materialenemyBoxRight = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
  const enemyBoxRight = new THREE.Mesh( geometryenemyBoxRight, materialenemyBoxRight);
  enemyBoxRight.name = 'enemyBoxRight';
  enemyBoxRight.position.set(-4,0,0);
  enemyBoxRight.rotation.y = Math.PI/2;
  enemyBox.add( enemyBoxRight );

  const geometryenemyBoxTop = new THREE.BoxGeometry(1,15,2);
  const materialenemyBoxTop = new THREE.MeshPhongMaterial( { color: 0x000000 } );
  const enemyBoxTop = new THREE.Mesh( geometryenemyBoxTop, materialenemyBoxTop);
  enemyBoxTop.name = 'enemyBoxTop';
  enemyBoxTop.position.set(0,0,4);
  enemyBox.add( enemyBoxTop );

  const geometryenemyBoxBottom = new THREE.BoxGeometry(1,15,2);
  const materialenemyBoxBottom = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
  const enemyBoxBottom = new THREE.Mesh( geometryenemyBoxBottom, materialenemyBoxBottom);
  enemyBoxBottom.name = 'enemyBoxBottom';
  enemyBoxBottom.position.set(0,0,-4);
  enemyBox.add( enemyBoxBottom );



  



  

  enemy = new THREE.Group();
  enemy.add( enemyBody );
  enemy.add( enemyFront );
  enemy.add( enemyBox );
  enemyFront.position.set(0,0,10);

  enemies = [];
  enemies.push(enemy.clone());
  enemies.push(enemy.clone());
  enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());
  // enemies.push(enemy.clone());

  enemies.forEach((el)=>{
    el.userData.speed = Math.random();
    el.userData.raycaster = new THREE.Raycaster();
    el.userData.seeRaycaster = new THREE.Raycaster();
    el.userData.idleRaycaster = new THREE.Raycaster();
    el.userData.rayLine = new THREE.Line( new THREE.BufferGeometry(), materialLine);
    el.userData.rayLine2 = new THREE.Line( new THREE.BufferGeometry(), materialLine2);
    el.userData.rayLine3 = new THREE.Line( new THREE.BufferGeometry(), materialLine3);
    el.userData.rayLine.frustumCulled = false;
    el.userData.rayLine.position.set(0,5,0);
    el.userData.rayLine2.frustumCulled = false;
    el.userData.rayLine2.position.set(0,5,0);
    el.userData.rayLine3.frustumCulled = false;
    el.userData.rayLine3.position.set(0,5,0);
    el.userData.direction = new THREE.Vector3();
    el.userData.far = new THREE.Vector3();
    el.userData.angle = ['top', 'down', 'left', 'right'];
    el.userData.turn = 'top';
    el.userData.idle = 'true';
    
    el.userData.enemyBoxTop = enemyBoxTop.clone();

    el.userData.seePlayer = false;
    el.userData.hearPlayer = false;

    el.add(enemy.userData.enemyBoxTop);

    el.userData.intersectWorld = false;

    scene.add( el );
    scene.add( el.userData.rayLine );
    scene.add( el.userData.rayLine2 );
    scene.add( el.userData.rayLine3 );
  });


  enemies[0].position.set(90, 0, 50);
  enemies[1].position.set(90, 0, 0);
  enemies[2].position.set(120, 0, 0);
  // enemies[3].position.set(40, 0, 100);
  // enemies[4].position.set(100, 0, 0);
  // enemies[5].position.set(90, 0, 50);
  // enemies[6].position.set(90, 0, 0);
  // enemies[7].position.set(120, 0, 0);
  // enemies[8].position.set(40, 0, 100);
  // enemies[9].position.set(100, 0, 0);
  // enemies[10].position.set(90, 0, 50);
  // enemies[11].position.set(90, 0, 0);
  // enemies[12].position.set(120, 0, 0);
  // enemies[13].position.set(40, 0, 100);
  // enemies[14].position.set(100, 0, 0);
  // enemies[15].position.set(90, 0, 50);
  // enemies[16].position.set(90, 0, 0);
  // enemies[17].position.set(120, 0, 0);
  // enemies[18].position.set(40, 0, 100);
  // enemies[19].position.set(100, 0, 0);
  // enemies[0].position.set(90, 0, 50);
  // enemies[21].position.set(90, 0, 0);
  // enemies[22].position.set(120, 0, 0);
  // enemies[23].position.set(40, 0, 100);
  // enemies[24].position.set(100, 0, 0);
  // enemies[25].position.set(90, 0, 50);
  // enemies[26].position.set(90, 0, 0);
  // enemies[27].position.set(120, 0, 0);
  // enemies[28].position.set(40, 0, 100);
  // enemies[29].position.set(100, 0, 0);

}

function fightEnemies() {
  enemies.forEach(element => {
    element.userData.hearPlayer = true;

    
    if (element.position.distanceTo(player.position) < 80) {
      element.userData.hearPlayer = true;
      element.userData.idle = false;
    }
    else {
      element.userData.hearPlayer = false;
      
    }


    if (element.userData.hearPlayer && element.userData.seePlayer && !element.userData.idle) {
      element.userData.raycaster.set(player.position, element.userData.direction.subVectors(element.position, player.position).normalize());
      element.userData.raycaster.far = new THREE.Vector3().subVectors(element.position, player.position).length();

      element.userData.seeRaycaster.set(player.position, element.userData.direction.subVectors(element.position, player.position).normalize());
      element.userData.seeRaycaster.far = new THREE.Vector3().subVectors(element.position, element.userData.raycaster.ray.origin).length();
    }
    else if (element.userData.hearPlayer && !element.userData.seePlayer && !element.userData.idle) {
      element.userData.seeRaycaster.set(player.position, element.userData.direction.subVectors(element.position, player.position).normalize());
      element.userData.seeRaycaster.far = new THREE.Vector3().subVectors(element.position, element.userData.seeRaycaster.ray.origin).length();
    }


    // if (!element.userData.idle) {
    //   element.userData.rayLine.geometry.setFromPoints(
    //     [
    //       element.position,
    //       element.userData.raycaster.ray.origin
    //     ]
    //   );
    //   element.userData.rayLine2.geometry.setFromPoints(
    //     [
    //       element.position,
    //       element.userData.seeRaycaster.ray.origin
    //     ]
    //   );
    // }
    // else {
    //   element.userData.rayLine3.geometry.setFromPoints(
    //     [
    //       element.position,
    //       element.userData.idleRaycaster.ray.origin
    //     ]
    //   );
    // }

    


    //element.userData.intersectWorld = false;

    if (element.userData.seePlayer && element.userData.hearPlayer && !element.userData.idle) {
      element.position.add(element.userData.raycaster.ray.origin.clone().sub(element.position).normalize().multiplyScalar(element.userData.speed));
      element.children.filter(el => el.name == 'enemyBody')[0].lookAt(element.userData.raycaster.ray.origin);
    }
    else if (!element.userData.seePlayer && element.userData.hearPlayer && !element.userData.idle){
      element.position.add(element.userData.raycaster.ray.origin.clone().sub(element.position).normalize().multiplyScalar(element.userData.speed));
      element.children.filter(el => el.name == 'enemyBody')[0].lookAt(element.userData.raycaster.ray.origin);
    }
    else if (!element.userData.hearPlayer && !element.userData.idle){
      element.position.add(element.userData.raycaster.ray.origin.clone().sub(element.position).normalize().multiplyScalar(element.userData.speed));
      element.children.filter(el => el.name == 'enemyBody')[0].lookAt(element.userData.raycaster.ray.origin);
    }
    

    
    if (element.position.distanceTo(element.userData.raycaster.ray.origin) < 4) {
      element.userData.idle = true;
      
    }


    
    element.userData.seePlayer = true;
    city.children.forEach(function(item, index, array) {
      
      if (item.name.indexOf('building') >= 0) {

        if (element.userData.raycaster.intersectObject(item).length > 0 && element.userData.seeRaycaster.intersectObject(item).length > 0) {
          element.userData.seePlayer = false;
        } 
        
      }
      
      if (element.userData.idle) {
        let timeIdleTurn = Math.random();
        let idleTurn = new THREE.Vector3(element.position.x, element.position.y, element.position.z);
        if (timeIdleTurn > 0.999) {
          element.userData.turn = element.userData.angle[randomIntFromInterval(0,3)];
          
        }
        if (element.userData.turn == 'top') {
          idleTurn = new THREE.Vector3(element.position.x, element.position.y, element.position.z + element.userData.speed/10);
        }
        else if (element.userData.turn == 'down') {
          idleTurn = new THREE.Vector3(element.position.x, element.position.y, element.position.z - element.userData.speed/10);
        }
        else if (element.userData.turn == 'left') {
          idleTurn = new THREE.Vector3(element.position.x+element.userData.speed/10, element.position.y, element.position.z);
        }
        else if (element.userData.turn == 'right') {
          idleTurn = new THREE.Vector3(element.position.x-element.userData.speed/10, element.position.y, element.position.z);
        }
        
        
  
        element.userData.idleRaycaster.set(idleTurn, element.position.clone().normalize());
        element.children.filter(el => el.name == 'enemyBody')[0].lookAt(element.userData.idleRaycaster.ray.origin);

        // element.userData.idleRaycaster.far = new THREE.Vector3().subVectors(element.position, new THREE.Vector3(element.position.x-20, element.position.y, element.position.z)).length();

        element.position.add(element.userData.idleRaycaster.ray.origin.clone().sub(element.position).normalize().multiplyScalar(element.userData.speed/15));
        //console.log(element.userData.idle);
      }

      


        if (item.name.indexOf('building') >= 0 && detectCollisionCubes(element.children.filter(el => el.name == 'enemyBox')[0].children.filter(el => el.name == 'enemyBoxLeft')[0], item)) {
          element.position.x -= element.userData.speed;
          element.userData.turn = element.userData.angle[randomIntFromInterval(0,3)];
        };
        if (item.name.indexOf('building') >= 0 && detectCollisionCubes(element.children.filter(el => el.name == 'enemyBox')[0].children.filter(el => el.name == 'enemyBoxRight')[0], item)) {
          element.position.x += element.userData.speed;
          element.userData.turn = element.userData.angle[randomIntFromInterval(0,3)];
        };
        if (item.name.indexOf('building') >= 0 && detectCollisionCubes(element.children.filter(el => el.name == 'enemyBox')[0].children.filter(el => el.name == 'enemyBoxTop')[0], item)) {
          element.position.z -= element.userData.speed;
          element.userData.turn = element.userData.angle[randomIntFromInterval(0,3)];
        };
        if (item.name.indexOf('building') >= 0 && detectCollisionCubes(element.children.filter(el => el.name == 'enemyBox')[0].children.filter(el => el.name == 'enemyBoxBottom')[0], item)) {
          element.position.z += element.userData.speed;
          element.userData.turn = element.userData.angle[randomIntFromInterval(0,3)];
        };

      


      

    });
    


    //console.log(element.children.filter(el => el.name == 'enemyBody'));
    
  });


}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}