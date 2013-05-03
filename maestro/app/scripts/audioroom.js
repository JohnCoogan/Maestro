var Core = function (e) {
    function v() {
        i.clearColor(0, 0, 0, 1), i.enable(i.DEPTH_TEST), i.depthFunc(i.LEQUAL), i.depthMask(!0), i.enable(i.CULL_FACE), i.cullFace(i.BACK), i.frontFace(i.CCW), document.body.appendChild(r), e.camera = u, e.cameraPosition = a, e.cameraRotation = f, e.cameraInvMatrix = l, e.cameraMatrix = c, e.gl = i, e.viewport = h, m(t, n)
    }
    function m(e, s) {
        r.width = e, r.height = s, t = e, n = s, i.viewportWidth = e, i.viewportHeight = s, i.viewport(0, 0, i.viewportWidth, i.viewportHeight), vec4.set([0, 0, i.viewportWidth, i.viewportHeight], h), mat4.perspective(45, t / n, 1, 1e3, u), g()
    }
    function g() {
        i.clear(i.COLOR_BUFFER_BIT | i.DEPTH_BUFFER_BIT)
    }
    function y(e, t) {
        return s !== e ? (!o || o.disableAttributes(), i.useProgram(e), s = e, o = t, !0) : !1
    }
    function b() {
        mat4.lookAt(a, p, d, l)
    }
    function w() {}
    var t = window.innerWidth - 5,
        n = window.innerHeight - 5,
        r = document.createElement("canvas"),
        i = r.getContext("experimental-webgl", {
            antialias: !0
        }),
        s = null,
        o = null,
        u = mat4.create(),
        a = vec3.createFrom(0, 0, 0),
        f = vec3.createFrom(0, 0, 0),
        l = mat4.create(),
        c = mat4.create(),
        h = vec4.create(),
        p = vec3.createFrom(0, 0, 0),
        d = vec3.createFrom(0, 1, 0);
    return m(t, n), v(), {
        resize: m,
        start: b,
        end: w,
        clear: g,
        switchProgram: y
    }
}(window),
    Renderable = function () {
        this.program = gl.createProgram(), this.vertexShader = null, this.fragmentShader = null, this.matrix = mat4.create(), this.matrixWorld = mat4.create(), this.buffer = null, this.bufferAux = null, this.textures = [], this.has = {
            positions: !0,
            uv: !1,
            textures: !1,
            colors: !1
        }, mat4.identity(this.matrix), this.attributes = {
            a_position: -1,
            a_uv: -1,
            a_aux: -1
        }, this.uniforms = {
            u_mvMatrix: -1,
            u_pMatrix: -1,
            u_texture: -1,
            u_time: -1
        }
    };
Renderable.prototype = {
    translate: function (e, t, n) {
        mat4.translate(this.matrix, [e, t, n])
    },
    rotate: function (e, t) {
        mat4.rotate(this.matrix, e, t)
    },
    init: function (e, t) {
        var n = Object.keys(this.attributes),
            r = Object.keys(this.uniforms);
        this.vertexShader = this.createShader(e, gl.VERTEX_SHADER), this.fragmentShader = this.createShader(t, gl.FRAGMENT_SHADER), gl.attachShader(this.program, this.vertexShader), gl.attachShader(this.program, this.fragmentShader), gl.linkProgram(this.program);
        for (var i = 0; i < n.length; i++) {
            var s = n[i];
            this.attributes[s] = gl.getAttribLocation(this.program, s)
        }
        for (var o = 0; o < r.length; o++) {
            var u = r[o];
            this.uniforms[u] = gl.getUniformLocation(this.program, u)
        }
    },
    enableAttributes: function () {
        this.setAttributes("enableVertexAttribArray")
    },
    disableAttributes: function () {
        this.setAttributes("disableVertexAttribArray")
    },
    setAttributes: function (e) {
        var t = Object.keys(this.attributes),
            n = t.length,
            r = -1;
        while (n--) r = this.attributes[t[n]], r !== -1 && gl[e](r)
    },
    render: function (e, t) {
        var n = Core.switchProgram(this.program, this);
        n && (this.enableAttributes(), this.setTextures(), typeof this.setAdditionalTextures == "function" && this.setAdditionalTextures(e)), this.setMVMatrix(), this.setCamera(), this.setEyePosition(), this.setUniformFloatValue4fv(this.uniforms.u_positionOffset, e.positionOffset), this.setUniformFloatValue1f(this.uniforms.u_lightvalue, e.light), this.setUniformFloatValue1f(this.uniforms.u_time, e.time), typeof this.setAdditionalUniforms == "function" && this.setAdditionalUniforms(e), gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        var r = 12,
            i = 12,
            s = 12,
            o = 12;
        this.has.uvs && (r += 8, s += 8, o += 8), this.has.textures && (r += 4), this.has.colors && (r += 12), gl.vertexAttribPointer(this.attributes.a_position, 3, gl.FLOAT, !1, r, 0), this.has.uvs && gl.vertexAttribPointer(this.attributes.a_uv, 2, gl.FLOAT, !1, r, i), this.has.textures && gl.vertexAttribPointer(this.attributes.a_texture, 1, gl.FLOAT, !1, r, s), this.has.colors && gl.vertexAttribPointer(this.attributes.a_color, 3, gl.FLOAT, !1, r, o), this.bufferAux && this.attributes.a_aux != -1 && (gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferAux), gl.vertexAttribPointer(this.attributes.a_aux, 4, gl.FLOAT, !1, 0, 0)), gl.drawArrays(t, 0, this.buffer.size)
    },
    addTexture: function (e, t) {
        var n = gl.createTexture();
        this.textures.push({
            data: n,
            uniform: t,
            activated: !1
        }), gl.bindTexture(gl.TEXTURE_2D, n), gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !0), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, e), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.bindTexture(gl.TEXTURE_2D, null)
    },
    setCamera: function () {
        gl.uniformMatrix4fv(this.uniforms.u_pMatrix, !1, camera)
    },
    setMVMatrix: function () {
        mat4.set(this.matrix, this.matrixWorld), mat4.multiply(this.matrixWorld, cameraInvMatrix), gl.uniformMatrix4fv(this.uniforms.u_mvMatrix, !1, this.matrixWorld)
    },
    setUniformFloatValue1f: function (e, t) {
        e !== -1 && gl.uniform1f(e, t)
    },
    setUniformFloatValue4fv: function (e, t) {
        e !== -1 && gl.uniform4fv(e, t)
    },
    setEyePosition: function () { !! this.uniforms.u_eyePosition && this.uniforms.u_eyePosition !== -1 && gl.uniform3fv(this.uniforms.u_eyePosition, cameraPosition)
    },
    setTextures: function () {
        var e = null;
        for (var t = 0; t < this.textures.length; t++) e = this.textures[t], e.activated || (gl.activeTexture(gl.TEXTURE0 + t), gl.bindTexture(gl.TEXTURE_2D, e.data), gl.uniform1i(this.uniforms[e.uniform], t), e.activated = !0)
    },
    configure: function (e, t, n, r) {
        var i = [{
                data: e,
                size: 3
            }
        ];
        !t || (i.push({
            data: t,
            size: 2
        }), this.has.uvs = !0), !n || (i.push({
            data: n,
            size: 1
        }), this.has.textures = !0), !r || (i.push({
            data: r,
            size: 3
        }), this.has.colors = !0);
        var s = this.interleave(i);
        this.buffer = gl.createBuffer(), this.buffer.size = e.length, gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer), gl.bufferData(gl.ARRAY_BUFFER, s, gl.STATIC_DRAW)
    },
    configureAuxiliary: function (e) {
        this.bufferAux || (this.bufferAux = gl.createBuffer()), this.bufferAux.size = e.length, gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferAux), gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(e), gl.STATIC_DRAW)
    },
    interleave: function (e) {
        var t = 0,
            n = 0,
            r = null,
            i = e[0].data;
        for (var s = 0; s < e.length; s++) n += e[s].data.length * e[s].size;
        r = new Float32Array(n);
        for (var o = 0; o < i.length; o++) for (var u = 0; u < e.length; u++) {
                var a = e[u].data,
                    f = e[u].size;
                for (var l = 0; l < f; l++) r[t++] = a[o][l]
        }
        return r
    },
    createShader: function (e, t) {
        var n = gl.createShader(t);
        gl.shaderSource(n, e), gl.compileShader(n);
        if (!gl.getShaderParameter(n, gl.COMPILE_STATUS)) throw console.error("Shader compile failed"), console.error(e), gl.getShaderInfoLog(n);
        return n
    }
};

var Sphere = function (e, t, n) {
    function N(t, n) {
        var r = Math.cos(t),
            i = Math.sin(t),
            s = Math.cos(n),
            o = Math.sin(n);
        return x = r * s * e, y = -i * e, z = -r * o * e, new vec3.createFrom(x, y, z)
    }
    function C(e, t) {
        return new vec2.createFrom(t / u, 1 - (e / i + 1) * .5)
    }
    var r = Math.PI * -0.5,
        i = Math.PI * .5,
        s = Math.PI,
        o = 0,
        u = Math.PI * 2,
        a = [],
        f = [],
        l = [],
        c = [],
        h = 0,
        p = 0,
        d = r,
        v = o,
        m = 0,
        g = 0,
        b = null,
        w = null,
        E = null,
        S = null,
        T = null;
    n = Math.max(n, 3), t = Math.max(t, 3);
    while (h < n) {
        v = h / n * u, g = (h + 1) / n * u, p = 0;
        while (p < t) d = r + p / t * s, m = r + (p + 1) / t * s, w = N(d, v), E = N(m, v), S = N(m, g), T = N(d, g), a.push(w, E, S), a.push(w, S, T), l.push(C(d, v)), l.push(C(m, v)), l.push(C(m, g)), l.push(C(d, g)), p++;
        h++
    }
    return {
        vertices: a,
        colors: c,
        faceUVs: l,
        separateFaces: !0
    }
}, 

Ball = function (e) {
        var t = [],
            n = [],
            r = e.Ball,
            i = new Sphere(.5, 16, 16);
        Renderable.call(this), this.uniforms.u_eyePosition = -1, this.uniforms.u_lightvalue = -1, this.uniforms.u_positionOffset = -1, t = i.vertices, this.init(r.vert.content, r.frag.content), this.configure(t), this.render = function (e) {
            Renderable.prototype.render.call(this, e, gl.TRIANGLES)
        };
        var s = !1;
        this.setAdditionalTextures = function (e) {
            s || (s = !0)
        }
    };

Ball.prototype = new Renderable;

var Room = function (e) {
    var t = document.getElementById("side"),
        n = document.getElementById("back"),
        r = document.getElementById("floor"),
        i = document.getElementById("ceiling"),
        s = [],
        o = [],
        u = [],
        a = e.Wall,
        f = function (e, t, n, r) {
            t *= .5, n *= .5, s.push(mat4.multiplyVec3(e, vec3.createFrom(-t, n, 0)), mat4.multiplyVec3(e, vec3.createFrom(-t, -n, 0)), mat4.multiplyVec3(e, vec3.createFrom(t, -n, 0)), mat4.multiplyVec3(e, vec3.createFrom(-t, n, 0)), mat4.multiplyVec3(e, vec3.createFrom(t, -n, 0)), mat4.multiplyVec3(e, vec3.createFrom(t, n, 0))), o.push([0, 1], [0, 0], [1, 0], [0, 1], [1, 0], [1, 1]), u.push([r], [r], [r], [r], [r], [r])
        };
    this.left = mat4.identity(mat4.create()), this.right = mat4.identity(mat4.create()), this.floor = mat4.identity(mat4.create()), this.back = mat4.identity(mat4.create()), this.ceiling = mat4.identity(mat4.create()), this.leftWallWidth = 6, this.leftWallHeight = 3, this.rightWallWidth = 6, this.rightWallHeight = 3, this.backWallWidth = 6, this.backWallHeight = 3, this.floorWidth = 6, this.floorHeight = 6, this.ceilingWidth = 6, this.ceilingHeight = 6, mat4.translate(this.back, [0, 0, -3]), mat4.translate(this.left, [-3, 0, 0]), mat4.rotate(this.left, Math.PI * .5, [0, 1, 0]), mat4.translate(this.right, [3, 0, 0]), mat4.rotate(this.right, Math.PI * .5, [0, -1, 0]), mat4.translate(this.floor, [0, -1.5, 0]), mat4.rotate(this.floor, Math.PI * .5, [-1, 0, 0]), mat4.translate(this.ceiling, [0, 1.5, 0]), mat4.rotate(this.ceiling, Math.PI * .5, [1, 0, 0]), f(this.left, this.leftWallWidth, this.leftWallHeight, 0), f(this.right, this.rightWallWidth, this.rightWallHeight, .5), f(this.back, this.backWallWidth, this.backWallHeight, 1), f(this.floor, this.floorWidth, this.floorHeight, 2), f(this.ceiling, this.ceilingWidth, this.ceilingHeight, 3), Renderable.call(this), this.uniforms.u_lightvalue = -1, this.uniforms.u_textureSide = -1, this.uniforms.u_textureBack = -1, this.uniforms.u_textureFloor = -1, this.uniforms.u_textureCeiling = -1, this.uniforms.u_textureLeftOverlay = -1, this.uniforms.u_textureBackOverlay = -1, this.uniforms.u_textureFloorOverlay = -1, this.uniforms.u_textureRightOverlay = -1, this.attributes.a_texture = -1, this.init(a.vert.content, a.frag.content), this.configure(s, o, u), this.addTexture(t, "u_textureSide"), this.addTexture(n, "u_textureBack"), this.addTexture(r, "u_textureFloor"), this.addTexture(i, "u_textureCeiling"), this.render = function (e) {
        gl.enable(gl.BLEND), gl.blendEquation(gl.FUNC_ADD), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA), Renderable.prototype.render.call(this, e, gl.TRIANGLES), gl.disable(gl.BLEND)
    };
    var l = !1;
    this.setAdditionalTextures = function (e) {
        if (!l) {
            var t = this.textures.length;
            gl.activeTexture(gl.TEXTURE0 + t), gl.bindTexture(gl.TEXTURE_2D, e.particleBox.textures.left.texture), gl.uniform1i(this.uniforms.u_textureLeftOverlay, t), t++, gl.activeTexture(gl.TEXTURE0 + t), gl.bindTexture(gl.TEXTURE_2D, e.particleBox.textures.back.texture), gl.uniform1i(this.uniforms.u_textureBackOverlay, t), t++, gl.activeTexture(gl.TEXTURE0 + t), gl.bindTexture(gl.TEXTURE_2D, e.particleBox.textures.floor.texture), gl.uniform1i(this.uniforms.u_textureFloorOverlay, t), t++, gl.activeTexture(gl.TEXTURE0 + t), gl.bindTexture(gl.TEXTURE_2D, e.particleBox.textures.right.texture), gl.uniform1i(this.uniforms.u_textureRightOverlay, t), t++, l = !0
        }
    }
};

Room.prototype = new Renderable;
var ParticleBox = function (e) {
    function g(e, t, n) {
        gl.bindTexture(gl.TEXTURE_2D, e), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, t, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, null), gl.bindTexture(gl.TEXTURE_2D, null)
    }
    var t = e.Particle,
        n = gl.createFramebuffer();
    Renderable.call(this), this.textures = {
        back: {
            texture: gl.createTexture(),
            width: 256,
            height: 128
        },
        left: {
            texture: gl.createTexture(),
            width: 256,
            height: 128
        },
        right: {
            texture: gl.createTexture(),
            width: 256,
            height: 128
        },
        floor: {
            texture: gl.createTexture(),
            width: 256,
            height: 256
        }
    }, this.uniforms.u_lightvalue = -1, this.uniforms.u_eyePosition = -1, this.uniforms.u_mode = -1, this.attributes.a_color = -1;
    var r = [],
        i = [],
        s = 16,
        o = 8,
        u = 8,
        a, f, l, c = 1024;
    for (var h = 0; h < s; h++) {
        a = h / s;
        for (var p = 0; p < o; p++) {
            f = p / o;
            for (var d = 0; d < u; d++) l = d / u, i.push(vec3.createFrom(-2 + Math.random() * 4, -1 + Math.random() * 2, -2 + Math.random() * 4)), r.push(vec3.createFrom(a, f, l))
        }
    }
    this.init(t.vert.content, t.frag.content), this.configure(i);
    var v = Object.keys(this.textures);
    for (var m = 0; m < v.length; m++) g(this.textures[v[m]].texture, this.textures[v[m]].width, this.textures[v[m]].height);
    this.mode = 0, this.updateLighting = function (e) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, n);
        var t = mat4.create(),
            r = mat4.create(),
            i = vec3.create();
        mat4.set(camera, t), mat4.set(cameraInvMatrix, r), vec3.set(cameraPosition, i), this.mode = 1, this.setFor(e, this.textures.back.texture, 0, 0, 6, e.room.backWallWidth, e.room.backWallHeight), this.setFor(e, this.textures.left.texture, 6, 0, 0, e.room.leftWallWidth, e.room.leftWallHeight), this.setFor(e, this.textures.right.texture, -6, 0, 0, e.room.rightWallWidth, e.room.rightWallHeight), this.setFor(e, this.textures.floor.texture, 0, 6, .01, e.room.floorWidth, e.room.floorHeight), this.mode = 0, mat4.set(r, cameraInvMatrix), vec3.set(i, cameraPosition), mat4.set(t, camera), gl.bindFramebuffer(gl.FRAMEBUFFER, null), gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    }, this.setFor = function (e, t, n, r, i, s, o) {
        var u = s / 2,
            a = o / 2;
        gl.viewport(0, 0, 256, o / s * 256), gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0), gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT), cameraPosition[0] = n, cameraPosition[1] = r, cameraPosition[2] = i, mat4.ortho(-u, u, -a, a, 1, 1e3, camera), mat4.lookAt(cameraPosition, vec3.createFrom(0, 0, 0), vec3.createFrom(0, 1, 0), cameraInvMatrix), this.render(e)
    }, this.setAdditionalUniforms = function () {
        this.setUniformFloatValue1f(this.uniforms.u_mode, this.mode)
    }, this.render = function (e) {
        gl.enable(gl.BLEND), gl.blendEquation(gl.FUNC_ADD), gl.blendFunc(gl.SRC_ALPHA, gl.ONE), gl.enable(gl.DEPTH_TEST), gl.depthMask(!1), Renderable.prototype.render.call(this, e, gl.POINTS), gl.disable(gl.BLEND), gl.depthMask(!0)
    }
};
ParticleBox.prototype = new Renderable;

var AudioManager = function () {
    function u(n) {
        var r = e.createMediaStreamSource(n);
        r.connect(t), setTimeout(function () {
            var e = 0;
            t.getByteFrequencyData(o);
            for (var n = 0; n < o.length; n++) e += o[n];
            e === 0 ? a() : (document.getElementById("tehoptions").classList.add("hidden"), document.getElementById("title").classList.add("hidden"), document.getElementById("credits").classList.add("hidden"), Experiment())
        }, 300)
    }
    function a() {
        document.getElementById("mic-error").classList.remove("hidden")
    }
    function f() {
        navigator.webkitGetUserMedia({
            audio: !0
        }, u)
    }
    function l(o) {
        e.decodeAudioData(o, function (o) {
            i || (i = e.createBufferSource(), s = e.createGainNode(), i.connect(s), i.loop = !0, s.connect(t), t.connect(e.destination), s.gain.value = .5), i.buffer = o, n ? Experiment() : (i.noteOn(0), console.log("Playing file...")), n = !1, r = !0
        }, function () {
            alert("Unable to decode audio data")
        })
    }
    function c() {
        r && i.noteOn(0)
    }
    var e = new webkitAudioContext,
        t = e.createAnalyser(),
        n = !0,
        r = !1,
        i = null,
        s = null,
        o = new Uint8Array(1024);
    return t.smoothingTimeConstant = .5, t.fftSize = 2048, window.analyser = t, {
        useMic: f,
        useArrayBuffer: l,
        startArrayBufferPlayback: c
    }
}(),

    Experiment = function () {
        function B() {
            var t = Object.keys(e);
            for (var n = 0; n < t.length; n++) {
                var r = e[t[n]];
                Loader.load(r.vert.path, U.bind(this, r.vert)), Loader.load(r.frag.path, U.bind(this, r.frag))
            }
            window.addEventListener("keyup", R, !1), window.addEventListener("mousedown", F, !1), window.addEventListener("mousemove", I, !1), window.addEventListener("mouseup", q, !1), window.addEventListener("resize", j, !1)
        }
        function j() {
            var e = window.innerWidth - 5,
                t = window.innerHeight - 5;
            Core.resize(e, t)
        }
        function F() {
            b = !0
        }
        function I(e) {
            if (b) {
                var t = e.offsetX || e.clientX,
                    n = e.offsetY || e.clientY;
                t = t / viewport[2] - .5, n = n / viewport[3] - .5, h[0] = Math.max(-5, Math.min(-t * 5, 5)), h[1] = Math.max(-1.4, Math.min(n * 3, 1.4))
            }
        }
        function q() {
            b = !1
        }
        function R(e) {
            if (!p) return;
            e.keyCode === 76 && (c ? (f = 0, l = .2, c = !1) : W())
        }
        function U(t, n) {
            var r = Object.keys(e),
                i = !0;
            t.loaded = !0, t.content = n.target.responseText;
            for (var s = 0; s < r.length; s++) {
                var o = e[r[s]];
                if (!o.vert.loaded || !o.frag.loaded) {
                    i = !1;
                    break
                }
            }
            i && z()
        }
        function z() {
            ball = new Ball(e), r = new Room(e), i = new ParticleBox(e), cameraPosition[2] = 14, V(), H.particleBox = i, H.room = r, H.positionOffset = S, setTimeout(W, 500)
        }
        function W() {
            u = !0, p = !1, c = !0, setTimeout(function () {
                p = !0, u = !1, l = .05, a = -10, f = 1, setTimeout(function () {
                    X(), AudioManager.startArrayBufferPlayback()
                }, 1500)
            }, 1400)
        }
        function X() {
            x || (x = !0, s = 0, S[3] = 1)
        }
        function V() {
            x && (S[0] = Math.sin(s * .01) * 3.5, S[1] = Math.sin(s * .0025) * 1, S[2] = Math.sin(s * .02) * 3.5, y = $(S)), S[3] += (y - S[3]) * .05, u ? a = Math.random() * 1.5 * Math.round(s % 120 / 120) : a += (f - a) * l, H.light = a, H.time = s, Core.start(), o = s * .001, s % 2 == 1 ? (cameraPosition[0] += (h[0] - cameraPosition[0]) * .05, cameraPosition[1] += (h[1] - cameraPosition[1]) * .05, cameraPosition[2] += (h[2] - cameraPosition[2]) * .05, Core.clear(), r.render(H), ball.render(H), x && i.render(H)) : x && i.updateLighting(H), s++, webkitRequestAnimationFrame(V)
        }
        function $() {
            C = 0, analyser.getByteFrequencyData(d);
            for (k = 0; k < P; k++) T = d[k], T /= 255, N = k * 16, C += T, J(N, T), J(N + 4, T), J(N + 8, T), J(N + 12, T);
            return C /= 512, i.configureAuxiliary(v), C
        }
        function J(e, t) {
            s === 0 && (v[e] = -0.1 + Math.random() * .2, v[e + 1] = -0.05 + Math.random() * .1, v[e + 2] = -0.05 + Math.random() * .1, t = y = .4), M = S[0] - v[e], _ = S[1] - v[e + 1], D = S[2] - v[e + 2], L = M * M + _ * _ + D * D, A = t * y / L, A *= .01, y > .65 && (A *= -6 + Math.random()), m[e] = A * M, m[e + 1] = A * _, m[e + 2] = A * D, g[e] += m[e], g[e + 1] += m[e + 1], g[e + 2] += m[e + 2], v[e] += g[e], v[e + 1] += g[e + 1], v[e + 2] += g[e + 2], K(e, -3, !0), K(e, 3, !1), K(e + 1, -1.5, !0), K(e + 1, 1.5, !1), K(e + 2, -3, !0), K(e + 2, 3, !1), O = Math.random() * .02, g[e] *= .98 + O, g[e + 1] *= .98 + O, g[e + 2] *= .98 + O, v[e + 3] = t
        }
        function K(e, t, n) {
            n ? v[e] < t && (v[e] = t + .01, g[e] *= -(.5 + Math.random() * .5)) : v[e] > t && (v[e] = t - .01, g[e] *= -(.5 + Math.random() * .5))
        }
        var e = {
            Wall: {
                vert: {
                    path: "shaders/wall.vert",
                    loaded: !1,
                    content: null
                },
                frag: {
                    path: "shaders/wall.frag",
                    loaded: !1,
                    content: null
                }
            },
            Particle: {
                vert: {
                    path: "shaders/particle.vert",
                    loaded: !1,
                    content: null
                },
                frag: {
                    path: "shaders/particle.frag",
                    loaded: !1,
                    content: null
                }
            },
            Ball: {
                vert: {
                    path: "shaders/ball.vert",
                    loaded: !1,
                    content: null
                },
                frag: {
                    path: "shaders/ball.frag",
                    loaded: !1,
                    content: null
                }
            }
        }, t = null,
            n = null,
            r = null,
            i = null,
            s = 0,
            o = 0,
            u = !1,
            a = .1,
            f = .1,
            l = .05,
            c = !1,
            h = vec3.createFrom(0, 0, 7),
            p = !1,
            d = new Uint8Array(256),
            v = new Float32Array(4096),
            m = new Float32Array(4096),
            g = new Float32Array(4096),
            y = 0,
            b = !1,
            w = vec3.create(),
            E = vec3.create(),
            S = vec4.createFrom(0, 0, 0, 0),
            x = !1,
            T = 0,
            N = 0,
            C = 0,
            k = 0,
            L = 1,
            A = 0,
            O = 0,
            M = 0,
            _ = 0,
            D = 0,
            P = d.length,
            H = {
                light: 0,
                particleBox: null,
                room: null,
                time: 0,
                positionOffset: null
            };
        return B(), {
            updateAudioData: $
        }
    }, 

    App = function () {
        function u(e) {
            e.preventDefault()
        }
        function a(e) {
            e.stopPropagation(), e.preventDefault();
            var t = e.dataTransfer.files;
            t.length && f(t[0])
        }
        function f(e) {
            var t = new FileReader;
            t.onloadend = l, t.readAsArrayBuffer(e)
        }
        function l(e) {
            s.classList.add("hidden"), i.classList.add("hidden"), o.classList.add("hidden"), AudioManager.useArrayBuffer(e.target.result)
        }
        var e = document.getElementById("tehoptions"),
            t = document.getElementById("fileDropArea"),
            n = document.getElementById("audio-mic"),
            r = document.getElementById("audio-file"),
            i = document.getElementById("drop-your-file"),
            s = document.getElementById("title"),
            o = document.getElementById("credits");
        e.display = "block", n.addEventListener("click", function (e) {
            AudioManager.useMic(), e.preventDefault()
        }, !1), r.addEventListener("click", function (n) {
            e.classList.add("hidden"), i.classList.remove("hidden"), t.classList.remove("hidden"), t.addEventListener("drop", a, !1), t.addEventListener("dragover", u, !1), t.addEventListener("dragenter", u, !1), t.addEventListener("dragexit", u, !1), n.preventDefault()
        }, !1)
    }