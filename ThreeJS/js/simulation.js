(function () {

    CAPS.Simulation = function () {

        // Main Scene
        this.scene = undefined;

        // Scene which contains the capping cube
        this.capsScene = undefined;

        // Contains clone of the backside of model
        this.backStencil = undefined;

        // Contains clone of the frontside of the model
        this.frontStencil = undefined;

        // Standard ThreeJS objects
        this.camera = undefined;
        this.renderer = undefined;
        this.controls = undefined;

        this.loadModel();

    };

    CAPS.Simulation.prototype = {

        constructor: CAPS.Simulation,

        loadModel: function () {

            var self = this;

            var clinicModel = {
                mtl: "../models/Clinic_A_20110906_optimized.mtl",
                obj: "../models/Clinic_A_20110906_optimized.obj"
            };

            var buildingModel = {
                mtl: "../models/Building 5-11.mtl",
                obj: "../models/Building 5-11.obj"
            }

            var houseModel = "./models/house.dae";
            var houseJakob = "./models/house-jakob.dae";
            var fourcolors = "./models/fourcolors.dae";
            var bldg511Model = "../models/Building 5-11.dae";

            var nodeModel = "../models/Node 2B.obj";

            // Load the model
            var loader = new THREE.ColladaLoader();
            loader.options.convertUpAxis = true;
            loader.load(houseJakob, function (collada) {
                self.setupScene(collada.scene);
            });

            /*
            var loader = new THREE.OBJLoader();
            loader.load(nodeModel, function (collada) {
                self.setupScene(collada);
            });
            */

            /*
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.load("../models/Clinic_A_20110906_optimized.mtl", function (materials) {
                var objLoader = new THREE.OBJLoader();
                materials.preload();
                objLoader.setMaterials(materials);
                var loader = new THREE.OBJLoader();
                loader.load("../models/Clinic_A_20110906_optimized.obj", function (collada) {
                    self.setupScene(collada);
                });
            });
            */

        },

        setupScene: function (collada) {

            var self = this;

            // Generate the div that will hold the renderer
            var container = document.createElement('div');
            document.body.appendChild(container);

            // Create camera and point it at center of scene
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            this.camera.position.set(20, 20, 30);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));

            // Initialize all the scenes
            this.scene = new THREE.Scene();
            this.capsScene = new THREE.Scene();
            this.backStencil = new THREE.Scene();
            this.frontStencil = new THREE.Scene();

            // Create and configure renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0xffffff);
            this.renderer.autoClear = false;
            container.appendChild(this.renderer.domElement);

            // This (seemingly?) deffers the rendering to achieve a certain frame rate while dragging the capping box.
            var throttledRender = CAPS.SCHEDULE.deferringThrottle(this._render, this, 40);
            this.throttledRender = throttledRender;

            // get dimensions of loaded model
            var box = new THREE.Box3;
            box = box.setFromObject(collada);

            // This handles the selected area, that is the limit of the clipping
            this.selection = new CAPS.Selection(
               box.min,
               box.max
            );

            // a grid on the ground
            var gridHelper = new THREE.GridHelper(60, 60);
            gridHelper.position.y = box.min.y;
            this.scene.add(gridHelper);

            // This handles the actual selection and dragging of the capping cube
            // must come before OrbitControls, so it can cancel them
            CAPS.picking(this);

            // Create the controls and use throttlesRender when the contols update
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.addEventListener('change', throttledRender);

            // Update the camera and renderer when the window is resized
            var onWindowResize = function () {
                self.camera.aspect = window.innerWidth / window.innerHeight;
                self.camera.updateProjectionMatrix();
                self.renderer.setSize(window.innerWidth, window.innerHeight);
                throttledRender();
            };
            window.addEventListener('resize', onWindowResize, false);

            // scene with the capping surface, which is a box
            this.capsScene.add(this.selection.boxMesh);
            // scene with the faces of the cube that are draggable
            this.scene.add(this.selection.touchMeshes);
            // scene with the faces of the cube that are displayed (backfaces)
            this.scene.add(this.selection.displayMeshes);

            // helper function for applying materials
            var setMaterial = function (node, material) {
                node.material = material;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        setMaterial(node.children[i], material);
                    }
                }
            };

            var setMaterial2 = function( node ) {
                if ( node.material && node.material.color ) {
                    if ( node.material.opacity < 1 ) {
                        // TODO do something with transparent faces
                        node.material = CAPS.MATERIAL.sheet( node.material.color );
                    } else {
                        node.material = CAPS.MATERIAL.sheet( node.material.color );
                    }
                }
                if ( node.children ) {
                    for (var i = 0; i < node.children.length; i++) {
                        setMaterial2( node.children[i] );
                    }
                }
            }

            // two clones of the main model are generated, so there will always
            // be three instances of the model rendered, but two are only
            // rendered into the stencil which is applied on the capping cube

            // scene for the area added to the stencil
            var back = collada.clone();
            setMaterial(back, CAPS.MATERIAL.backStencil);
            back.updateMatrix();
            this.backStencil.add(back);

            // scene for the area substracted from the stencil
            var front = collada.clone();
            setMaterial(front, CAPS.MATERIAL.frontStencil);
            front.updateMatrix();
            this.frontStencil.add(front);

            // scene for main model
            setMaterial2( collada );
            collada.updateMatrix();
            this.scene.add(collada);

            this.selection.setUniforms();
            this.throttledRender();

        },

        // The render function will be an issue
        // It used depracated methods that don't exist in the newer ThreeJS version
        // Luckily, these methods are methods that just call other methods that already exist
        // TODO: Figure out how to call the method that does exist
        _render: function () {

            this.renderer.clear();

            var gl = this.renderer.context;

            this.renderer.state.setStencilTest(true);

            // add the backsides to the stencil
            this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            this.renderer.render(this.backStencil, this.camera);

            // substract the frontsides from the stencil
            this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            this.renderer.render(this.frontStencil, this.camera);

            // render the cap surface in the area of the stencil
            this.renderer.state.setStencilFunc(gl.EQUAL, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            this.renderer.render(this.capsScene, this.camera);

            this.renderer.state.setStencilTest(false);

            // render the model inside the clipping bounds
            this.renderer.render(this.scene, this.camera);

        }

    };

})();

