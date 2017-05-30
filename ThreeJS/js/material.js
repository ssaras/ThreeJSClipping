CAPS.MATERIAL = {

    sheet: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping,
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClipping
    }),

    cap: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.caps,
        vertexShader: CAPS.SHADER.vertex,
        fragmentShader: CAPS.SHADER.fragment
    }),

    //backStencil: new THREE.ShaderMaterial({
    //    uniforms: {
    //        color: { type: "c", value: new THREE.Color(0x3d9ecb) },
    //        clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
    //        clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
    //    },
    //    vertexShader: CAPS.SHADER.vertexClipping,
    //    fragmentShader: CAPS.SHADER.fragmentClippingFront,
    //    colorWrite: false,
    //    depthWrite: false,
    //    side: THREE.BackSide
    //}),

    //frontStencil: new THREE.ShaderMaterial({
    //    uniforms: {
    //        color: { type: "c", value: new THREE.Color(0x3d9ecb) },
    //        clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
    //        clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
    //    },
    //    vertexShader: CAPS.SHADER.vertexClipping,
    //    fragmentShader: CAPS.SHADER.fragmentClippingFront,
    //    colorWrite: false,
    //    depthWrite: false,
    //}),

    backStencil: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping,
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClippingFront,
        colorWrite: false,
        depthWrite: false,
        side: THREE.BackSide
    }),

    frontStencil: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping,
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClippingFront,
        colorWrite: false,
        depthWrite: false,
    }),

    // Color of the capping box face
    BoxBackFace: new THREE.MeshBasicMaterial({ color: 0xEEDDCC, transparent: true }), //

    // Color of the capping box edges
    BoxWireframe: new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }), //

    // Color of capping box edges when hovering over a capping box face
    BoxWireActive: new THREE.LineBasicMaterial({ color: 0xf83610, linewidth: 4 }), //

    Invisible: new THREE.ShaderMaterial({
        vertexShader: CAPS.SHADER.invisibleVertexShader,
        fragmentShader: CAPS.SHADER.invisibleFragmentShader
    })

};

