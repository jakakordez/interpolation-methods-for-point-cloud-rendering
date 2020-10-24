#version 300 es
precision mediump float;

struct Material {
    sampler2D texture0; // position
    sampler2D texture1; // diffuse
    sampler2D texture2; // coordinate
};

uniform Material material;
uniform int imageWidth;
uniform int imageHeight;

in vec2 p;
in vec3 location;
//in vec2 fragUV;
vec3 closestCoordinate;

layout (location = 0) out vec4 albedoSpec;

void main() {
    float dx = 1.0/float(imageWidth);
    float dy = 1.0/float(imageHeight);

    vec4 coord = texture(material.texture2, p);
    
    if(coord.b == 1.0){
        vec3 clr = texture(material.texture1, coord.xy).rgb;
        albedoSpec = vec4(clr, 1.0);
    }
    else albedoSpec = vec4(0.5, 0, 0.5, 1.0);
}
