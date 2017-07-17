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

        // Check box to determine if it should be capped or clipped
        this.showCaps = true;

        this.init();

    };

    CAPS.Simulation.prototype = {

        constructor: CAPS.Simulation,

        init: function () {

            var self = this;

            var clinicModel = {
                mtl: "../models/Clinic_A_20110906_optimized.mtl",
                obj: "../models/Clinic_A_20110906_optimized.obj"
            };

            var buildingModel = {
                mtl: "../models/Building 5-11.mtl",
                obj: "../models/Building 5-11.obj"
            }

            var houseModel = "../models/house.dae";

            var bldg511Model = "../models/Building 5-11.dae";

            var nodeModel = "../models/Node 2B.obj";
            
            //Load the model
            //var loader = new THREE.ColladaLoader();
            //loader.options.convertUpAxis = true;
            //loader.load(nodeModel, function (collada) {
            //    self.initScene(collada.scene);
            //});

            var loader = new THREE.OBJLoader();
            loader.load(nodeModel, function (collada) {
                self.initScene(collada);
            });

            //var mtlLoader = new THREE.MTLLoader();
            //mtlLoader.load("../models/Clinic_A_20110906_optimized.mtl", function (materials) {
            //    var objLoader = new THREE.OBJLoader();
            //    materials.preload();
            //    objLoader.setMaterials(materials);
            //    var loader = new THREE.OBJLoader();
            //    loader.load("../models/Clinic_A_20110906_optimized.obj", function (collada) {
            //        self.initScene(collada);
            //    });
            //});

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

            var gridHelper = new THREE.GridHelper(60, 60);
            this.scene.add(gridHelper);

            // // This generates the the capping cube
            // this.selection = new CAPS.Selection(
            //     new THREE.Vector3(-50, -50, -50),
            //     new THREE.Vector3(50, 50, 50)
            // );
            // // this.selection = new CAPS.Selection(
            // //     new THREE.Vector3(-7, -14, -14),
            // //     new THREE.Vector3(14, 9, 3)
            // // );
            // this.capsScene.add(this.selection.boxMesh);
            // this.scene.add(this.selection.touchMeshes);
            // this.scene.add(this.selection.displayMeshes);

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

            // Set flags and events for showCaps input
            var showCapsInput = document.getElementById('showCaps');
            this.showCaps = showCapsInput.checked;
            var onShowCaps = function () {
                self.showCaps = showCapsInput.checked;
                throttledRender();
            };
            showCapsInput.addEventListener('change', onShowCaps, false);

            console.log("selection: ", this.selection);

            // Start rendering
            throttledRender();
        },

        initScene: function (collada) {

            var box = new THREE.Box3;
            box = box.setFromObject(collada);

            // This generates the the capping cube
            this.selection = new CAPS.Selection(
               box.min,
               box.max
            );
            // this.selection = new CAPS.Selection(
            //     new THREE.Vector3(-7, -14, -14),
            //     new THREE.Vector3(14, 9, 3)
            // );
            this.capsScene.add(this.selection.boxMesh);
            this.scene.add(this.selection.touchMeshes);
            this.scene.add(this.selection.displayMeshes);

            // Apply materials
            var setMaterial = function (node, material) {
                node.material = material;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        setMaterial(node.children[i], material);
                    }
                }
            };

            // Once the model is loaded, it makes 2 clones
            // One for the back and front side
            // When a model is clipped, the red that you see are the two clones being rendered

            // This is the back sideclone (red)
            var back = collada.clone();
            setMaterial(back, CAPS.MATERIAL.backStencil);
            // back.scale.set(0.03, 0.03, 0.03);
            back.updateMatrix();
            this.backStencil.add(back);

            // This is the front side clone (red)
            var front = collada.clone();
            setMaterial(front, CAPS.MATERIAL.frontStencil);
            // front.scale.set(0.03, 0.03, 0.03);
            front.updateMatrix();
            this.frontStencil.add(front);

            // And this is the main mesh (blue) you see on parts that arent clipped
            setMaterial(collada, CAPS.MATERIAL.sheet);
            // collada.scale.set(0.03, 0.03, 0.03);
            collada.updateMatrix();
            this.scene.add(collada);
            
            console.log("scene: ", this.scene);
            console.log("capsScene: ", this.capsScene);
            console.log("backStencil: ", this.backStencil);
            console.log("frontStencil: ", this.frontStencil);
            console.log("renderer: ", this.renderer);

            this.throttledRender();

        },

        // The render function will be an issue
        // It used depracated methods that don't exist in the newer ThreeJS version
        // Luckily, these methods are methods that just call other methods that already exist
        // TODO: Figure out how to call the method that does exist
        _render: function () {

            this.renderer.clear();

            var gl = this.renderer.context;

            if (this.showCaps) {

                this.renderer.state.setStencilTest(true);

                this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
                this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.INCR);
                this.renderer.render(this.backStencil, this.camera);

                this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
                this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                this.renderer.render(this.frontStencil, this.camera);

                this.renderer.state.setStencilFunc(gl.EQUAL, 1, 0xff);
                this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                this.renderer.render(this.capsScene, this.camera);

                this.renderer.state.setStencilTest(false);

            }

            this.renderer.render(this.scene, this.camera);

        }

    };


})();

