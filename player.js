
export const movePlayer = (player, clock, camera, city) => {
    let delta = clock.getDelta(); // seconds.
	let moveDistance = 25*delta; // 200 pixels per second
  
    player.position.x -= player.speedX;
    player.position.z += player.speedY;


    addEventListener("keydown", onkeydown, false);
    function onkeydown(event) {
        var keyCode = event.which;
        if (keyCode == 87) {
            player.userData.goTurn.goUp = true;
        } 
        if (keyCode == 83) {
            player.userData.goTurn.goDown = true;
        }

        if (keyCode == 65) {
            player.userData.goTurn.goLeft = true;
        }
        if (keyCode == 68) {
            player.userData.goTurn.goRight = true;
        }
    };
    addEventListener("keyup", onkeyup, false);
    function onkeyup(event) {
        var keyCode = event.which;
        if (keyCode == 87) {
            player.userData.goTurn.goUp = false;
        } 
        if (keyCode == 83) {
            player.userData.goTurn.goDown = false;
        }

        if (keyCode == 65) {
            player.userData.goTurn.goLeft = false;
        }
        if (keyCode == 68) {
            player.userData.goTurn.goRight = false;
        }
    };

    let anim = 'animStay';


    if (player.userData.goTurn.goLeft && !player.userData.goTurn.goRight) {
        player.speedX = -moveDistance;
        switch(player.userData.playerTurn) {
            case 'top':
                anim = 'animRight'
                break
            case 'down':
                anim = 'animRight'
                break
            case 'left':
                anim = 'animForward'        
                break
            case 'right':
                anim = 'animForward'
                break
            default:
                anim = 'animStay'     
        } 
    }
    else if (player.userData.goTurn.goRight && !player.userData.goTurn.goLeft) {
        player.speedX = moveDistance;
        switch(player.userData.playerTurn) {
            case 'top':
                anim = 'animRight'
                break
            case 'down':
                anim = 'animRight'
                break
            case 'left':
                anim = 'animForward'        
                break
            case 'right':
                anim = 'animForward'
                break
            default:
                anim = 'animStay'     
        } 
        
    }
    if (!player.userData.goTurn.goLeft && !player.userData.goTurn.goRight) {
        player.speedX = 0;
    }


    
    if (player.userData.goTurn.goDown && !player.userData.goTurn.goUp) {
        player.speedY = -moveDistance;
        switch(player.userData.playerTurn) {
            case 'top':
                anim = 'animForward'
                break
            case 'down':
                anim = 'animForward'
                break
            case 'left':
                anim = 'animRight'        
                break
            case 'right':
                anim = 'animRight'
                break
            default:
                anim = 'animStay'     
        } 
        
    }
    else if (player.userData.goTurn.goUp && !player.userData.goTurn.goDown) {
        player.speedY = moveDistance;
        switch(player.userData.playerTurn) {
            case 'top':
                anim = 'animForward'
                break
            case 'down':
                anim = 'animForward'
                break
            case 'left':
                anim = 'animRight'        
                break
            case 'right':
                anim = 'animRight'
                break
            default:
                anim = 'animStay'     
        } 
        
    }
    if (!player.userData.goTurn.goUp && !player.userData.goTurn.goDown) {
        player.speedY = 0;
        
    }

    if (!player.userData.goTurn.goLeft && !player.userData.goTurn.goRight && !player.userData.goTurn.goUp && !player.userData.goTurn.goDown) {
        
    }
    

    
    if (anim == 'animForward') {
        player.userData.animations.actionStay.stop();
        player.userData.animations.actionRunForward.play();

        //player.userData.animations.actionRunForward.reset().crossFadeFrom(player.userData.animations.actionStay, 1).play();
    }
    else if (anim == 'animRight') {
        player.userData.animations.actionRunRight.play();
        player.userData.animations.actionStay.stop();
     
    }
    else if (anim == 'animStay') {
        player.userData.animations.actionRunForward.stop();
        player.userData.animations.actionRunRight.stop();
        player.userData.animations.actionStay.play();
    }



    camera.position.x = player.position.x;
    camera.position.z = player.position.z-3;

    // city.children.forEach(element => {
        
    // });

    //var p1 = player.children[0];

    //console.log(p1.geometry);


//     for (var vertexIndex = 0; vertexIndex < Player.geometry.vertices.length; vertexIndex++)
// {       
//         var localVertex = Player.geometry.vertices[vertexIndex].clone();
//         var globalVertex = Player.matrix.multiplyVector3(localVertex);
//         var directionVector = globalVertex.subSelf( Player.position );

//         var ray = new THREE.Ray( Player.position, directionVector.clone().normalize() );
//         var collisionResults = ray.intersectObjects( collidableMeshList );
//         if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
//         {
//             // a collision occurred... do something...
//         }
//     }
}



