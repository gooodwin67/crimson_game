import { detectCollisionCubes } from './detectColisions.js';
export const movePlayer = (player, playerBox ,camera, city) => {
    
	let moveDistance = 0.8; 
  
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
        //if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxLeft')[0], city.children[1])) player.speedX =0;
        city.children.forEach(function(item, index, array) {
            if (item.name.indexOf('building') >= 0) {
                if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxLeft')[0], item)) {
                    player.speedX =0;
                };
            }
        });

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
        //if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxRight')[0], city.children[1])) player.speedX =0;
        city.children.forEach(function(item, index, array) {
            if (item.name.indexOf('building') >= 0) {
                if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxRight')[0], item)) {
                    player.speedX =0;
                };
            }
        });
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
        //if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxBottom')[0], city.children[1])) player.speedY =0;
        city.children.forEach(function(item, index, array) {
            if (item.name.indexOf('building') >= 0) {
                if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxBottom')[0], item)) {
                    player.speedY =0;
                };
            }
        });
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
        //if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxTop')[0], city.children[1])) player.speedY =0;
        city.children.forEach(function(item, index, array) {
            if (item.name.indexOf('building') >= 0) {
                if (detectCollisionCubes(playerBox.children.filter(el => el.name == 'playerBoxTop')[0], item)) {
                    player.speedY =0;
                };
            }
        });
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
    //console.log(city.children[1]);
    
    
    

}



