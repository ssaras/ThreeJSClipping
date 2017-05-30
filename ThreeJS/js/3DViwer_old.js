/*  CAST Viewer
    display three dimensional mesh or various formats

    Victoria M Erickson
    Shawn Saras
    TJ DeGanyar
    Sundeep Veguru

    02.14.2017
*/

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), offset = new THREE.Vector3(), INTERSECTED, SELECTED;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;

// initialize viewer
initViewer();

var info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '10px';
info.style.width = '100%';
info.style.textAlign = 'left';
container.appendChild(info);
info.innerHTML = "CAST Viewer ";

console.log("ThreeDViewer");

var fileName = docExtId + extension;
var url = '/Document/DownloadFile?mime=stream&bucket=PDF&externalId=' + fileName + '&projectId= ' + projectId;
loadModel(url, fileName);

// create axis
var axisHelper = new THREE.AxisHelper(camera.position.x / 6);
scene.add(axisHelper);

/*Added by V*/
//Grid Helper for where object is placed
var helper = new THREE.GridHelper(1000, 100, 0x444444, 0x444444);
helper.name = "myGrid";
scene.add(helper);

// Activate the orbital controls  move mouse and: left   click to rotate, middle click to zoom,  right  click to pan
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.userZoomSpeed = 1.0;
controls.userPanSpeed = camera.position.x / 100;

animate();

/*Function to load Model*/
function loadModel(url, fileName) {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(fileName)[1].toUpperCase();
    switch (ext) {
        case "STL":
            loadMySTL(url);
            break;
        case "OBJ":
            loadMyOBJ(url);
            break;
        case "DAE":
            loadMyDAE(url);
            break;
        default:
            break;
    };
}
/*Function to load obj Model*/
function loadModel2(fileName2) {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(fileName2)[1].toUpperCase();
    switch (ext) {
        case "OBJ":
            loadMyOBJ(fileName2);
            break;
    };
}
function loadModel3(fileName3) {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(fileName3)[1].toUpperCase();
    switch (ext) {
        case "DAE":
            loadMyDAE(fileName3);
            break;
    };
}

/*function to load stl model */
function loadMySTL(fileName) {

    var loader = new THREE.STLLoader();
    var materialColor = new THREE.Color();
    materialColor.setRGB(.4, .3, .2);

    loader.load(fileName, function (geometry) {

        var material = new THREE.MeshPhongMaterial({
            color: materialColor,
            side: THREE.DoubleSide,
            clipShadows: true
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //this is how they are use to viewing the items as architects based on the axis
        //mesh.rotation.set(-Math.PI / 2, 0, 0);
        mesh.name = "myMesh";

        scene.add(mesh);

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        var box = geometry.boundingBox;
        camera.position.set(3 * box.max.x, 3 * box.max.y, 3 * box.max.z);
        controls.userZoomSpeed = 1.0;
        controls.userPanSpeed = box.max.x / 50;

        // initialize object to perform world/screen calculations
        projector = new THREE.Projector();
        // when the mouse moves, call the given function
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        mesh.scale.set(1, 1, 1);
    });
}

/*function to load OBJ model*/
function loadMyOBJ(fileName2) {

    //uses loader to load the file type
    var loader = new THREE.OBJLoader();

    //color for the object that loads
    var materialColor = new THREE.Color();
    materialColor.setRGB(.4, .3, .2);

    //actual loading of the file and the object
    loader.load(fileName2, function (obj) {

        //this is how the material(color) loads
        var material = new THREE.MeshPhongMaterial({
            color: materialColor,
            side: THREE.DoubleSide,
            clipShadows: true
        });

        var box;

        //function written inside traverse argument will be applied to all the children of our object
        //if you do not wanna use treverse, the info inside it will need to be applied to each of the objects in the scene and merge them into one object
        obj.traverse(function (child) {

            //calls the mesh to load the material
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;

                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
                box = child.geometry.boundingBox;
            }
        });

        //this is how they are use to viewing the items as architects based on the axis
        //obj.rotation.set(-Math.PI / 2, 0, 0);
        obj.name = "myObjMesh";

        //renders the object in the scene, the object will not display without this line
        scene.add(obj);
                        
        camera.position.set(box.min.x, box.min.y, box.min.z);
        controls.userZoomSpeed = 1.0;
        controls.userPanSpeed = box.max.x / 50;

        // initialize object to perform world/screen calculations
        projector = new THREE.Projector();
        // when the mouse moves, call the given function
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        //these can be removed - for resizing the very large man figure
        obj.scale.set(.04, .04, .04);
        obj.position.set(-2, 0, 0);
    });
}

/*function to load Collada model*/
function loadMyDAE(fileName3) {

    //uses loader to load the file type
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;

    //color for the object that loads
    var materialColor = new THREE.Color();
    materialColor.setRGB(.4, .3, .2);

    //actual loading of the file and the object
    loader.load(fileName3, function (collada) {
        dae = collada.scene;

        //this is how the material(color) loads
        var material = new THREE.MeshPhongMaterial({
            color: materialColor,
            side: THREE.DoubleSide,
            clipShadows: true
        });

        //function written inside traverse argument will be applied to all the children of our object
        //if you do not wanna use treverse, the info inside it will need to be applied to each of the objects in the scene and merge them into one object
        dae.traverse(function (child) {
            //calls the mesh to load the material
            if (child instanceof THREE.Mesh) {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        //this is how they are use to viewing the items as architects based on the axis
        //obj.rotation.set(-Math.PI / 2, 0, 0);
        dae.name = "myColMesh";

        //renders the object in the scene, the object will not display without this line
        scene.add(dae);

        // initialize object to perform world/screen calculations
        dae.projector = new THREE.Projector();
        // when the mouse moves, call the given function
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        //these can be removed - for resizing the very large man figure
        //collada.scale.set(.04, .04, .04);
        dae.position.set(4, 0, 0);
    });
}
/////////////FOR LOADING THE OBJ FROM THE SAME LOCATION AS THE STL
///*function to load OBJ model*/
//function loadMyOBJ(fileName) {

//    //uses loader to load the file type
//    var loader = new THREE.OBJLoader();

//    //color for the object that loads
//    var materialColor = new THREE.Color();
//    materialColor.setRGB(.4, .3, .2);

//    //actual loading of the file and the object
//    loader.load(fileName, function (obj) {

//        //this is how the material(color) loads
//        var material = new THREE.MeshBasicMaterial({ color: materialColor, side: THREE.DoubleSide });

//        //function written inside traverse argument will be applied to all the children of our object
//        //if you do not wanna use treverse, the info inside it will need to be applied to each of the objects in the scene and merge them into one object
//        obj.traverse(function (child) {

//            //calls the mesh to load the material
//            if (child instanceof THREE.Mesh) {
//                child.material = material;
//            }
//        });

//        //renders the object in the scene, the object will not display without this line
//        scene.add(obj);
//    });
//}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function render() {
    renderer.render(scene, camera);
}

function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    // vector.unproject(camera);
    // var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    //// raycaster.setFromCamera(mouse, camera);
    // raycaster.set(camera.position, vector.sub(camera.position).normalize());

    // if (SELECTED) {
    //     var intersects = raycaster.intersectObject(scene.children);
    //       SELECTED.position.copy(intersects[0].point.sub(offset));
    //     return;
    // }

    // var intersects = raycaster.intersectObjects(scene.children);

    // if (intersects.length > 0) {
    //     if (INTERSECTED != intersects[0].object) {
    //         if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

    //         INTERSECTED = intersects[0].object;
    //         INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    //         intersects.position.copy(INTERSECTED.position);
    //         intersects.lookAt(camera.position);
    //     }

    //     container.style.cursor = 'pointer';

    // } else {
    //     if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    //     INTERSECTED = null;
    //     container.style.cursor = 'auto';
    // }
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    //var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);

    //var raycaster = new THREE.Raycaster();
    //raycaster.setFromCamera(mouse3D, camera);
    //var intersects = raycaster.intersectObjects(mesh);

    //if (intersects.length > 0) {
    //    alert("selected!");
    //    intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
    //    _SELECTED_DOWN = true;
    //}

    //if (intersects.length > 0) {

    //    controls.enabled = false;

    //    SELECTED = intersects[0].object;

    //    var intersects = raycaster.intersectObject(referencePlane);
    //    offset.copy(intersects[0].point).sub(referencePlane.position);

    //    info.innerHTML = " ";
    //    info.innerHTML = '   Unit: ' + enclosUnitReferences[SELECTED.id];

    //    container.style.cursor = 'pointer';

    //}

    //var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    //projector.unprojectVector(vector, camera);

    //var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    //var intersects = raycaster.intersectObjects(scene.children, true);

    //if (intersects.length > 0) {
    //    controls.enabled = false;
    //    SELECTED = intersects[0].object.parent;
    //    var intersects = raycaster.intersectObject(plane);
    //    offset.copy(intersects[0].point).sub(plane.position);
    //    container.style.cursor = 'move';
    //}
}

function onDocumentMouseUp(event) {

    event.preventDefault();

    controls.enabled = true;

    //if (INTERSECTED) {
    //    referencePlane.position.copy(INTERSECTED.position);
    //    SELECTED = null;
    //}

    //if (INTERSECTED) {
    //    plane.position.copy(INTERSECTED.position);
    //    SELECTED = null;
    //}

    // container.style.cursor = 'auto';

}

function update() {

    // delta = change in time since last call (in seconds)
    var delta = clock.getDelta();

    //info.innerHTML = " ";
    //info.innerHTML = 'mouse location ' + mouse.x.toFixed(1) + "," + mouse.y.toFixed(1) +
    //' <br />  selected plane ';

    // create a Ray with origin at the mouse position and direction into the scene (camera direction)
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    //true selects all items inside of the child - need for the obj files
    var intersects = ray.intersectObjects(scene.children, true);

    // INTERSECTED = the object in the scene currently closest to the camera and intersected by the Ray projected from the mouse position
    // if there is one (or more) intersections
    if (intersects.length > 0) {
        // if the closest object intersected is not the currently stored intersection object
        if (intersects[0].object != INTERSECTED) {
            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }
            // store reference to closest object as current intersection object
            INTERSECTED = intersects[0].object;
            if (typeof (INTERSECTED) !== "undefined" && INTERSECTED !== null && INTERSECTED.name !== "myGrid") {
                container.style.cursor = 'pointer';
                // store color of closest object (for later restoration)
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                // set a new color for closest object
                INTERSECTED.material.color.setHex(0xffff00);
            }
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        // remove previous intersection object reference by setting current intersection object to "nothing"
        INTERSECTED = null;
        container.style.cursor = 'auto';
    }

    controls.update();
}

function initViewer() {

    /*
        Function to initiliazd the DPI viewer
        TJ DeGanyar 02.12.17

        */
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

    // initilize the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
    //renderer = new THREE.WebGLRenderer({ antialias: true });

    //  Set rendere property
    //sets background to be blank so we can change the scene colors
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        shadowMapEnabled: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    //  set the camera
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // create light
    var cameraLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(cameraLight);

    var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    var ambientLight = new THREE.AmbientLight(0x030303);
    scene.add(ambientLight);
    scene.add(light);

    // attach div element to variable to contain the renderer
    container = document.getElementById('ThreeJS');

    // attach renderer to the container div
    container.appendChild(renderer.domElement);

    // automatically resize renderer
    THREEx.WindowResize(renderer, camera);

    // toggle full-screen on given key press
    //THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

}



function move() {
    var controls = new THREE.OrbitControls(camera);
    controls.enabled = false;

    var editControls = new THREE.EditorControls(camera, renderer.domElement);
    editControls.addEventListener('change', render);

    var transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', render);
    transformControls.attach(mesh);
    transformControls.addEventListener('mouseDown', function () {
        editControls.enabled = false;
    });
    transformControls.addEventListener('mouseUp', function () {
        editControls.enabled = true;
    });
};
function rotate() {
};
function scale() {
};


/*Function to change background color
-Victoria Erickson 02.21.17*/

//change background color of the area
function white() {
    document.body.style.backgroundColor = "#f7f7f7"
};
function black() {
    document.body.style.backgroundColor = "#000000"
};

/*keyboard commands changed to on button click
-created by TJ 02.22.17
-changed by V 02.22.17*/

//If STL file load this
//function topview() {
//    mesh = scene.getObjectByName("myMesh");
//    if (mesh !== undefined) {
//        var boundingRadius = mesh.geometry.boundingSphere.radius;
//        fov = camera.fov;
//        var dist = boundingRadius / Math.tan(fov * Math.PI / 360)
//        camera.position.set(0, dist, 0);
//    }
//    controls.update();
//};
//function frontview() {
//    mesh = scene.getObjectByName("myMesh");
//    if (mesh !== undefined) {
//        var boundingRadius = mesh.geometry.boundingSphere.radius;
//        fov = camera.fov;
//        var dist = boundingRadius / Math.tan(fov * Math.PI / 360)
//        camera.position.set(0, 0, dist);
//    }
//    controls.update();
//};
//function sideview() {
//    mesh = scene.getObjectByName("myMesh");
//    if (mesh !== undefined) {
//        var boundingRadius = mesh.geometry.boundingSphere.radius;
//        fov = camera.fov;
//        var dist = boundingRadius / Math.tan(fov * Math.PI / 360)
//        camera.position.set(dist, 0, 0);
//    }
//    controls.update();
//};
//function threeDview() {
//    mesh = scene.getObjectByName("myMesh");
//    if (mesh !== undefined) {
//        var min_x = mesh.geometry.boundingBox.min.x;
//        var min_y = mesh.geometry.boundingBox.min.y;
//        var min_z = mesh.geometry.boundingBox.min.z;
//        var max_x = mesh.geometry.boundingBox.max.x;
//        var max_y = mesh.geometry.boundingBox.max.y;
//        var max_z = mesh.geometry.boundingBox.max.z;

//        camera.position.set(2 * max_x, 2 * max_y, 2 * max_z);
//        camera.lookAt(min_x, min_y, min_z);
//    }
//    controls.update();
//};

//Else if load this

//function topview() {
//    obj = scene.getObjectByName("myObjMesh");
//    if (obj !== undefined) {
//        var myBox = new THREE.Box3;
//        myBox.setFromObject(scene);
//        fov = camera.fov;
//        var dist = (myBox.max.y - myBox.min.y) / Math.tan(fov * Math.PI / 360);
//        camera.position.set(0, dist, 0);
//    }
//    controls.update();
//};
//function frontview() {
//    obj = scene.getObjectByName("myObjMesh");
//    if (obj !== undefined) {
//        var myBox = new THREE.Box3;
//        myBox.setFromObject(scene);
//        fov = camera.fov;
//        var dist = (myBox.max.z - myBox.min.y) / Math.tan(fov * Math.PI / 360);
//        camera.position.set(0, 0, dist);
//    }
//    controls.update();
//};
//function sideview() {
//    obj = scene.getObjectByName("myObjMesh");
//    if (obj !== undefined) {
//        var myBox = new THREE.Box3;
//        myBox.setFromObject(scene);
//        fov = camera.fov;
//        var dist = (myBox.max.z - myBox.min.y) / Math.tan(fov * Math.PI / 360);
//        camera.position.set(dist, 0, 0);
//    }
//    controls.update();
//};
//function threeDview() {
//    obj = scene.getObjectByName("myObjMesh");
//    if (obj !== undefined) {
//        var myBox = new THREE.Box3;
//        myBox.setFromObject(scene);
//        fov = camera.fov;

//        var min_x = myBox.min.x;
//        var min_y = myBox.min.y;
//        var min_z = myBox.min.z;
//        var max_x = myBox.max.x;
//        var max_y = myBox.max.y;
//        var max_z = myBox.max.z;

//        camera.position.set(2 * max_x, 2 * max_y, 2 * max_z);
//        camera.lookAt(min_x, min_y, min_z);
//    }
//    controls.update();
//};


//Else if load this

function topview() {
    dae = scene.getObjectByName("myColMesh");
    if (dae !== undefined) {
        var myBox = new THREE.Box3;
        myBox.setFromObject(scene);
        fov = camera.fov;
        var dist = (myBox.max.y - myBox.min.y) / Math.tan(fov * Math.PI / 360);
        camera.position.set(0, dist, 0);
    }
    controls.update();
};
function frontview() {
    dae = scene.getObjectByName("myColMesh");
    if (dae !== undefined) {
        var myBox = new THREE.Box3;
        myBox.setFromObject(scene);
        fov = camera.fov;
        var dist = (myBox.max.z - myBox.min.y) / Math.tan(fov * Math.PI / 360);
        camera.position.set(0, 0, dist);
    }
    controls.update();
};
function sideview() {
    dae = scene.getObjectByName("myColMesh");
    if (dae !== undefined) {
        var myBox = new THREE.Box3;
        myBox.setFromObject(scene);
        fov = camera.fov;
        var dist = (myBox.max.z - myBox.min.y) / Math.tan(fov * Math.PI / 360);
        camera.position.set(dist, 0, 0);
    }
    controls.update();
};
function threeDview() {
    dae = scene.getObjectByName("myColMesh");
    if (dae !== undefined) {
        var myBox = new THREE.Box3;
        myBox.setFromObject(scene);
        fov = camera.fov;

        var min_x = myBox.min.x;
        var min_y = myBox.min.y;
        var min_z = myBox.min.z;
        var max_x = myBox.max.x;
        var max_y = myBox.max.y;
        var max_z = myBox.max.z;

        camera.position.set(2 * max_x, 2 * max_y, 2 * max_z);
        camera.lookAt(min_x, min_y, min_z);
    }
    controls.update();
};

//zooming in different ways
function ZoomIn2() {
    controls.minDistance = 0;
}
function ZoomOut2() {
    controls.maxDistance = Infinity;
}


function ZoomIn() {
    controls.object.position.z -= 10;
}
function ZoomOut() {
    controls.object.position.z += 10;
}

$('#zoom-in').click(function () {
    updateZoom(0.1);
});

$('#zoom-out').click(function () {
    updateZoom(-0.1);
});
zoomLevel = 1;
var updateZoom = function (zoom) {
    zoomLevel += zoom;
    $('#ThreeJS').css({ zoom: zoomLevel, '-moz-transform': 'scale(' + zoomLevel + ')' });
}