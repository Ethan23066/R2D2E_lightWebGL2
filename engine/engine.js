// =========================
// R2D2 Mini Web Engine
// =========================

// Canvas & WebGL2
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    alert("WebGL2 non supporté sur ce navigateur.");
        throw new Error("WebGL2 non supporté");
        }

        // Resize propre
        function resize() {
            const dpr = window.devicePixelRatio || 1;
                const w = Math.floor(window.innerWidth * dpr);
                    const h = Math.floor(window.innerHeight * dpr);

                        if (canvas.width !== w || canvas.height !== h) {
                                canvas.width = w;
                                        canvas.height = h;
                                                gl.viewport(0, 0, w, h);
                                                    }
                                                    }
                                                    window.addEventListener("resize", resize);
                                                    resize();

                                                    // Shaders
                                                    const vsSource = `#version 300 es
                                                    in vec2 aPos;
                                                    in vec3 aColor;
                                                    out vec3 vColor;

                                                    uniform float uTime;

                                                    void main() {
                                                        float angle = uTime * 0.7;
                                                            mat2 rot = mat2(
                                                                    cos(angle), -sin(angle),
                                                                            sin(angle),  cos(angle)
                                                                                );
                                                                                    vec2 p = rot * aPos;
                                                                                        gl_Position = vec4(p, 0.0, 1.0);
                                                                                            vColor = aColor;
                                                                                            }
                                                                                            `;

                                                                                            const fsSource = `#version 300 es
                                                                                            precision highp float;
                                                                                            in vec3 vColor;
                                                                                            out vec4 outColor;

                                                                                            void main() {
                                                                                                outColor = vec4(vColor, 1.0);
                                                                                                }
                                                                                                `;

                                                                                                // Utils shaders
                                                                                                function compileShader(type, source) {
                                                                                                    const sh = gl.createShader(type);
                                                                                                        gl.shaderSource(sh, source);
                                                                                                            gl.compileShader(sh);

                                                                                                                if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                                                                                                                        console.error(gl.getShaderInfoLog(sh));
                                                                                                                                throw new Error("Erreur compilation shader");
                                                                                                                                    }
                                                                                                                                        return sh;
                                                                                                                                        }

                                                                                                                                        function createProgram(vsSrc, fsSrc) {
                                                                                                                                            const vs = compileShader(gl.VERTEX_SHADER, vsSrc);
                                                                                                                                                const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);

                                                                                                                                                    const prog = gl.createProgram();
                                                                                                                                                        gl.attachShader(prog, vs);
                                                                                                                                                            gl.attachShader(prog, fs);
                                                                                                                                                                gl.linkProgram(prog);

                                                                                                                                                                    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                                                                                                                                                                            console.error(gl.getProgramInfoLog(prog));
                                                                                                                                                                                    throw new Error("Erreur link program");
                                                                                                                                                                                        }
                                                                                                                                                                                            return prog;
                                                                                                                                                                                            }

                                                                                                                                                                                            const program = createProgram(vsSource, fsSource);
                                                                                                                                                                                            gl.useProgram(program);

                                                                                                                                                                                            // Données : triangle coloré
                                                                                                                                                                                            const vertices = new Float32Array([
                                                                                                                                                                                                //   x,    y,     r,    g,    b
                                                                                                                                                                                                     0.0,  0.7,   1.0, 0.3, 0.3,
                                                                                                                                                                                                         -0.7, -0.7,   0.3, 1.0, 0.3,
                                                                                                                                                                                                              0.7, -0.7,   0.3, 0.3, 1.0,
                                                                                                                                                                                                              ]);

                                                                                                                                                                                                              const vao = gl.createVertexArray();
                                                                                                                                                                                                              gl.bindVertexArray(vao);

                                                                                                                                                                                                              const vbo = gl.createBuffer();
                                                                                                                                                                                                              gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
                                                                                                                                                                                                              gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

                                                                                                                                                                                                              const stride = 5 * 4;

                                                                                                                                                                                                              const aPosLoc = gl.getAttribLocation(program, "aPos");
                                                                                                                                                                                                              gl.enableVertexAttribArray(aPosLoc);
                                                                                                                                                                                                              gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, stride, 0);

                                                                                                                                                                                                              const aColorLoc = gl.getAttribLocation(program, "aColor");
                                                                                                                                                                                                              gl.enableVertexAttribArray(aColorLoc);
                                                                                                                                                                                                              gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, stride, 2 * 4);

                                                                                                                                                                                                              const uTimeLoc = gl.getUniformLocation(program, "uTime");

                                                                                                                                                                                                              // Clear
                                                                                                                                                                                                              gl.clearColor(0.03, 0.03, 0.06, 1.0);

                                                                                                                                                                                                              // Boucle
                                                                                                                                                                                                              let start = performance.now();

                                                                                                                                                                                                              function loop() {
                                                                                                                                                                                                                  const t = (performance.now() - start) / 1000.0;

                                                                                                                                                                                                                      resize();
                                                                                                                                                                                                                          gl.clear(gl.COLOR_BUFFER_BIT);

                                                                                                                                                                                                                              gl.useProgram(program);
                                                                                                                                                                                                                                  gl.uniform1f(uTimeLoc, t);

                                                                                                                                                                                                                                      gl.bindVertexArray(vao);
                                                                                                                                                                                                                                          gl.drawArrays(gl.TRIANGLES, 0, 3);

                                                                                                                                                                                                                                              requestAnimationFrame(loop);
                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                              loop();
                                                                                                                                                                                                                                              