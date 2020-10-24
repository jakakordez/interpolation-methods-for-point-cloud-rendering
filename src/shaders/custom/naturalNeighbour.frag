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
layout (location = 1) out vec3 position;
layout (location = 2) out vec3 normals;
layout (location = 3) out vec3 coordinates;

void main() {
    float dx = 1.0/float(imageWidth);
    float dy = 1.0/float(imageHeight);

    int dimension = 40;
    int surface = 0;
    vec3 sum = vec3(0.0);
    for(int x = -dimension; x < dimension; x++){
        for(int y = -dimension; y < dimension; y++){
            vec2 screenCoordinate = p + vec2(dx * float(x), dy * float(y));
            vec4 coord = texture(material.texture2, screenCoordinate);

            float d1 = distance(screenCoordinate, p);
            float d2 = distance(screenCoordinate, coord.xy);

            if(d1 < d2){
                sum += texture(material.texture1, coord.xy).xyz;
                surface++;
            }
        }
    }
    if(surface == 0){
        vec4 coord = texture(material.texture2, p);
    
        if(coord.b == 1.0){
            vec3 clr = texture(material.texture1, coord.xy).rgb;
            albedoSpec = vec4(clr, 1.0);
        }
        else albedoSpec = vec4(0.5, 0, 0.5, 1.0);
    }
    else{
        sum /= float(surface);
        //vec4 coord = texture(material.texture2, p);
        //sum = texture(material.texture1, coord.xy).xyz;
        //sum = texture(material.texture0, p).xyz;
        albedoSpec = vec4(sum, 1.0);
    }
}
