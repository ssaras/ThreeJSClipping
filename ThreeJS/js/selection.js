// parameters: extreme points of object bounds
CAPS.Selection = function (low, high) {

    var diffHalf = high.clone().sub( low ).multiplyScalar( 0.5 );
    var midPoint = low.clone().add( diffHalf );

    // extend 10% above the models bounds
    diffHalf.multiplyScalar(1.1);

    // the maximum extension of the selection
    this.limitLowMax = midPoint.clone().sub( diffHalf )
    this.limitHighMax = midPoint.clone().add( diffHalf );

    // the two corners of the selection cube with their current value
    this.limitLow = this.limitLowMax.clone();
    this.limitHigh = this.limitHighMax.clone();

    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.boxMesh = new THREE.Mesh(this.box, CAPS.MATERIAL.cap);

    this.vertices = [
		new THREE.Vector3(), new THREE.Vector3(),
		new THREE.Vector3(), new THREE.Vector3(),
		new THREE.Vector3(), new THREE.Vector3(),
		new THREE.Vector3(), new THREE.Vector3()
    ];
    this.updateVertices();

    var v = this.vertices;

    this.touchMeshes = new THREE.Object3D();
    this.displayMeshes = new THREE.Object3D();
    this.meshGeometries = [];
    this.lineGeometries = [];
    this.selectables = [];

    this.faces = [];
    var f = this.faces;
    this.faces.push(new CAPS.SelectionBoxFace('y1', v[0], v[1], v[5], v[4], this));
    this.faces.push(new CAPS.SelectionBoxFace('z1', v[0], v[2], v[3], v[1], this));
    this.faces.push(new CAPS.SelectionBoxFace('x1', v[0], v[4], v[6], v[2], this));
    this.faces.push(new CAPS.SelectionBoxFace('x2', v[7], v[5], v[1], v[3], this));
    this.faces.push(new CAPS.SelectionBoxFace('y2', v[7], v[3], v[2], v[6], this));
    this.faces.push(new CAPS.SelectionBoxFace('z2', v[7], v[6], v[4], v[5], this));

    var l0 = new CAPS.SelectionBoxLine(v[0], v[1], f[0], f[1], this);
    var l1 = new CAPS.SelectionBoxLine(v[0], v[2], f[1], f[2], this);
    var l2 = new CAPS.SelectionBoxLine(v[0], v[4], f[0], f[2], this);
    var l3 = new CAPS.SelectionBoxLine(v[1], v[3], f[1], f[3], this);
    var l4 = new CAPS.SelectionBoxLine(v[1], v[5], f[0], f[3], this);
    var l5 = new CAPS.SelectionBoxLine(v[2], v[3], f[1], f[4], this);
    var l6 = new CAPS.SelectionBoxLine(v[2], v[6], f[2], f[4], this);
    var l7 = new CAPS.SelectionBoxLine(v[3], v[7], f[3], f[4], this);
    var l8 = new CAPS.SelectionBoxLine(v[4], v[5], f[0], f[5], this);
    var l9 = new CAPS.SelectionBoxLine(v[4], v[6], f[2], f[5], this);
    var l10 = new CAPS.SelectionBoxLine(v[5], v[7], f[3], f[5], this);
    var l11 = new CAPS.SelectionBoxLine(v[6], v[7], f[4], f[5], this);

    this.setBox();
    this.setUniforms();

};

CAPS.Selection.prototype = {

    constructor: CAPS.Selection,

    updateVertices: function () {

        this.vertices[0].set(this.limitLow.x, this.limitLow.y, this.limitLow.z);
        this.vertices[1].set(this.limitHigh.x, this.limitLow.y, this.limitLow.z);
        this.vertices[2].set(this.limitLow.x, this.limitHigh.y, this.limitLow.z);
        this.vertices[3].set(this.limitHigh.x, this.limitHigh.y, this.limitLow.z);
        this.vertices[4].set(this.limitLow.x, this.limitLow.y, this.limitHigh.z);
        this.vertices[5].set(this.limitHigh.x, this.limitLow.y, this.limitHigh.z);
        this.vertices[6].set(this.limitLow.x, this.limitHigh.y, this.limitHigh.z);
        this.vertices[7].set(this.limitHigh.x, this.limitHigh.y, this.limitHigh.z);

    },

    updateGeometries: function () {

        for (var i = 0; i < this.meshGeometries.length; i++) {
            this.meshGeometries[i].verticesNeedUpdate = true;
            this.meshGeometries[i].computeBoundingSphere();
            this.meshGeometries[i].computeBoundingBox();
        }
        for (var i = 0; i < this.lineGeometries.length; i++) {
            this.lineGeometries[i].verticesNeedUpdate = true;
        }

    },

    setBox: function () {

        var width = new THREE.Vector3();
        width.subVectors(this.limitHigh, this.limitLow);

        this.boxMesh.scale.copy(width);
        width.multiplyScalar(0.5).add(this.limitLow);
        this.boxMesh.position.copy(width);

    },

    // Set values for the shader
    setUniforms: function () {

        CAPS.UNIFORMS.clipping.update( this.limitLow, this.limitHigh );

    },

    setValue: function (axis, value) {

        // The user shouldn't be able to drag one side of the selection box
        // behind the opposite side. Also sides should not coincide, so there's
        // at least the specified buffer width between them.
        var buffer = 0.01;
        if (axis === 'x1') {
            this.limitLow.x = Math.max( this.limitLowMax.x, Math.min(this.limitHigh.x - buffer, value));
        } else if (axis === 'x2') {
            this.limitHigh.x = Math.max(this.limitLow.x + buffer, Math.min(this.limitHighMax.x, value));
        } else if (axis === 'y1') {
            this.limitLow.y = Math.max(this.limitLowMax.y, Math.min(this.limitHigh.y - buffer, value));
        } else if (axis === 'y2') {
            this.limitHigh.y = Math.max(this.limitLow.y + buffer, Math.min(this.limitHighMax.y, value));
        } else if (axis === 'z1') {
            this.limitLow.z = Math.max(this.limitLowMax.z, Math.min(this.limitHigh.z - buffer, value));
        } else if (axis === 'z2') {
            this.limitHigh.z = Math.max(this.limitLow.z + buffer, Math.min(this.limitHighMax.z, value));
        }

        this.setBox();
        this.setUniforms();

        this.updateVertices();
        this.updateGeometries();

    }

};
