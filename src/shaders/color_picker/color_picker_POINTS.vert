#version 300 es
precision mediump float;


uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix
uniform float pointSize;

in vec3 VPos;       // Vertex position


void main() {
    // MVP position
    //gl_Position = PMat * MVMat * vec4(VPos, 1.0);


    // Model view position
    vec4 VPos4 = MVMat * vec4(VPos, 1.0);

    // Projected position
    gl_Position = PMat * VPos4;


    gl_PointSize = pointSize / length(VPos4.xyz);
    if(gl_PointSize < 1.0) gl_PointSize = 1.0;
}