var UniformManager = function () {
    this.uniforms = [];
};

UniformManager.prototype = {

    constructor: UniformManager,

    get: function ( color ) {
        var u = {
            color: { type: "c", value: new THREE.Color(color) },//
            clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
        };
        this.uniforms.push( u );
        return u;
    },

    update: function ( limitLow, limitHigh ) {
        this.uniforms.forEach( function ( u ) {
            u.clippingLow.value.copy( limitLow );
            u.clippingHigh.value.copy( limitHigh );
        });
    }

};

﻿CAPS.UNIFORMS = {

    clipping: new UniformManager(),

    caps: {
        color: { type: "c", value: new THREE.Color(0xf83610) }//
    }

};

