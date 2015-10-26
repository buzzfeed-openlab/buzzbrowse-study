var camera;
var scene;
var renderer;
var meshes = [];

var cur_headline = 0;
var cur_radius_scale;
var cur_cb;
var cur_state;
var effect, controls;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


init();
animate();
trigger_thing();

//places the images in a circle in the
function show_headline(x, y, i) {
    var geometry = new THREE.CubeGeometry( 10, 10, 10);
    var imagenum = i;
    var stringnum = imagenum = imagenum+''; 
    var material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('images/post-'+ stringnum+ '.png')});
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.z = -50;
    mesh.position.x = x;
    mesh.position.y = y;
  
    return mesh;

}

function move_to_center( idx, cb){
    cur_headline = idx;
    cur_radius_scale = 1;
    cur_cb = cb;
    cur_state = "incoming";
}
function move_from_center(cb) {
    cur_state = "outgoing";
    cur_cb = cb;
}
var $audio = document.createElement("audio");
function play_sound(cb){
    $audio.src = "audio/post-" + cur_headline + ".wav";
    $audio.play();
    $audio.onended = cb;
}

function trigger_thing() {
    move_to_center((cur_headline + 1) % meshes.length,
        function() {
            play_sound(function() {
                move_from_center(trigger_thing);
            })
        });
}

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z=50;
    scene.add(camera);

    effect = new THREE.StereoEffect(renderer);
    effect.eyeSeparation = 10;
    effect.setSize( window.innerWidth, window.innerHeight);

    //

    window.addEventListener( 'resize', onWindowResize, false);
  
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    scene.add(light);



    var radius = 30;
    var decknum = 52;
    for (i = 0; i<decknum; i++) {
        theta = (i/10) * (2 * Math.PI) ;
        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);
        var mesh = show_headline(x, y, i);
        meshes.push(mesh);
        scene.add(mesh);
    }

  
   
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

  
    window.addEventListener( 'resize', onWindowResize, false );
  
    render();
}

function onWindowResize() {

                windowHalfX = window.innerWidth / 2,
                windowHalfY = window.innerHeight / 2,

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                effect.setSize( window.innerWidth, window.innerHeight );

}

var phase = 0;
var radius = 30;

function animate() {

    for (i = 0; i<meshes.length; i++) {
        var r = radius;
        if (i == cur_headline) {
            r = radius * cur_radius_scale;
            if(cur_state == "incoming") {
                cur_radius_scale -= 0.03;
                if(cur_radius_scale <= 0) {
                    // We've reached the center!
                    cur_radius_scale = 0;
                    cur_state = "centered";
                    cur_cb();
                }
            }
            else if(cur_state == "outgoing") {
                cur_radius_scale += 0.03;
                if(cur_radius_scale >= 1) {
                    //Back in the line-up!
                    cur_radius_scale = 1;
                    cur_state = "circle";
                    cur_cb();
                }
            }
        } 

        theta = (i/meshes.length) * (2 * Math.PI) ;
        var x = r * Math.cos(theta+phase);
        var y = r * Math.sin(theta+phase);
        var mesh = meshes[i];
        mesh.position.x = x;
        mesh.position.y = y;
    }
    phase += 0.01


    render();
    requestAnimationFrame( animate );
}
  
function render() {
    effect.render( scene, camera );
}

 
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}


//look up how to generate additional cubes
//possible to do actual textures ?
//cube opacity?
//