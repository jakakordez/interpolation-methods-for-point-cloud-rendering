#version 300 es
precision mediump float;


uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix

in vec3 VPos;       // Vertex position


void main() {
    // MVP position
    gl_Position = PMat * MVMat * vec4(VPos, 1.0);
}