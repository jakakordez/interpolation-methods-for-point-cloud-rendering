#version 300 es
precision mediump float;

struct Material {
    sampler2D texture0; // position
    sampler2D texture1; // normals
};

uniform Material material;
uniform int imageWidth;
uniform int imageHeight;
uniform int numberOfJumps;

in vec2 p;
in vec3 location;

layout (location = 0) out vec3 slot1;
layout (location = 1) out vec3 slot2;
layout (location = 2) out vec3 slot3;
layout (location = 3) out vec3 slot4;

vec4 tCoord;
vec3 tNorm;

vec3 scrSlot[5] = vec3[](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
vec3 coordSlot[5] = vec3[](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
vec3 normSlot[5] = vec3[](vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
float distSlot[5] = float[](0.0, 0.0, 0.0, 0.0, 0.0);

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

void testAndSet(vec2 v){
    vec4 coord = texture(material.texture0, v);
    vec3 norm = texture(material.texture1, v).xyz;
    float dist = screenDst(p, v);

    if(coord.w > 0.5 && isOnSameLayer(coord.xyz, norm, tCoord.xyz, tNorm)) {
        int insert = 4;
        if(scrSlot[0].z < 0.5) insert = 0;
        else if(scrSlot[1].z < 0.5) insert = 1;
        else if(scrSlot[2].z < 0.5) insert = 2;
        else if(scrSlot[3].z < 0.5) insert = 3;
        else{ // No slots are free
            float maxDist = distSlot[0];
            insert = 0;
            if(distSlot[1] > maxDist) {
                insert = 1;
                maxDist = distSlot[1];
            }
            else if(distSlot[2] > maxDist) {
                insert = 2;
                maxDist = distSlot[2];
            }
            else if(distSlot[3] > maxDist) {
                insert = 3;
                maxDist = distSlot[3];
            }

            if(dist > maxDist) insert = 4; // All existing points are closer

        }

        scrSlot[insert] = vec3(v, 1.0);
        coordSlot[insert] = coord.xyz;
        normSlot[insert] = norm;
        distSlot[insert] = dist;
    }
}

void main() {
    float dx = 1.0/float(imageWidth);
    float dy = 1.0/float(imageHeight);

    tCoord = texture(material.texture0, p);
    tNorm = texture(material.texture1, p).xyz;

    if(tCoord.w > 0.5){
        float fjl = float(numberOfJumps);
        testAndSet(p+vec2(dx*fjl, 0.0));
        testAndSet(p+vec2(0.0, dy*fjl));
        testAndSet(p+vec2(-dx*fjl, 0.0));
        testAndSet(p+vec2(0.0, -dy*fjl));
        testAndSet(p+vec2(dx*fjl, dy*fjl));
        testAndSet(p+vec2(-dx*fjl, -dy*fjl));
        testAndSet(p+vec2(-dx*fjl, dy*fjl));
        testAndSet(p+vec2(dx*fjl, -dy*fjl));
    }
    
    slot1 = scrSlot[0];
    slot2 = scrSlot[1];
    slot3 = scrSlot[2];
    slot4 = scrSlot[3];
}
