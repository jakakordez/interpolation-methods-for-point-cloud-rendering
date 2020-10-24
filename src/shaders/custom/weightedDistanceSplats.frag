#version 300 es
precision mediump float;

struct Material {
    sampler2D texture0;
    sampler2D texture1;
};

uniform Material material;
uniform int imageWidth;
uniform int imageHeight;

out vec4 color;
in vec2 p;
in vec3 location;

#define FLT_MAX 3.402823466e+20

void main() {
    float dx = 1.0/float(imageWidth);
    float dy = 1.0/float(imageHeight);
    
    color = texture(material.texture1, p);
    if(color.w == 0.0) color = vec4(0, 0, 0, 1);
    else color /= color.w;
}
