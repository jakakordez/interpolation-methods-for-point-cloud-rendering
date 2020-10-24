#version 300 es
precision mediump float;

struct Material {
    sampler2D texture0; // diffuse
    sampler2D texture1; // normals
    sampler2D texture2; // positions
    sampler2D texture3;
    sampler2D texture4;
    sampler2D texture5;
    sampler2D texture6;
};

uniform Material material;
uniform int jumpLevel;
uniform int imageWidth;
uniform int imageHeight;
uniform int numberOfJumps;

in vec2 p;
in vec3 location;
//in vec2 fragUV;
vec3 closestCoordinate;

layout (location = 0) out vec4 albedoSpec;

float angleThreshold = 0.5;
float continuityThreshold = 0.01;

bool isOnSameLayer(vec3 coord, vec3 normal, vec3 coord2, vec3 normal2){
    return dot(normal, normal2) >= angleThreshold 
        && abs(dot(coord2.xyz - coord.xyz, normal)) < continuityThreshold;
}

float screenDst(vec2 coord, vec2 coord2){
    vec2 d = coord - coord2;
    return sqrt((d.x*d.x)+(d.y*d.y));
}

void main() {

    vec3 c1 = texture(material.texture3, p).xyz;
    vec3 c2 = texture(material.texture4, p).xyz;
    vec3 c3 = texture(material.texture5, p).xyz;
    vec3 c4 = texture(material.texture6, p).xyz;
    /*vec3 pos1 = texture(material.texture2, c1).rgb;
    vec3 pos2 = texture(material.texture2, c2).rgb;
    vec3 pos3 = texture(material.texture2, c3).rgb;
    vec3 nor1 = texture(material.texture1, c1).rgb;
    vec3 nor2 = texture(material.texture1, c2).rgb;
    vec3 nor3 = texture(material.texture1, c3).rgb;
    vec3 nor =  texture(material.texture1, p).rgb;
    vec3 pos = texture(material.texture2, p).rgb;
    bool i1 = isOnSameLayer(pos1, nor1, pos, nor);
    bool i2 = isOnSameLayer(pos2, nor2, pos, nor);
    bool i3 = isOnSameLayer(pos3, nor3, pos, nor);*/
    albedoSpec = vec4(0, 0, 0, 1);

    /*if(c1.z > 0.5) albedoSpec.x = screenDst(p, c1.xy);
    if(c2.z > 0.5) albedoSpec.y = screenDst(p, c2.xy);
    if(c3.z > 0.5) albedoSpec.z = screenDst(p, c3.xy);
    if(c4.z > 0.5) albedoSpec.w = screenDst(p, c4.xy);*/

    /*if(i1) albedoSpec.x = 1.0;
    if(i2) albedoSpec.y = 1.0;
    if(i3) albedoSpec.z = 1.0;*/
    //albedoSpec = vec4(texture(material.texture0, c.xy).rgb, 1.0);
}
