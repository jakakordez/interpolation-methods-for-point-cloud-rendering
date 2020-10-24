#version 300 es
//#extension GL_EXT_frag_depth : enable
precision highp float;

struct Material {
    vec3 diffuse;

    #if (TEXTURE)
        #for I_TEX in 0 to NUM_TEX
            sampler2D texture##I_TEX;
        #end
    #fi
};

uniform mat4 PMat;  // Projection Matrix
uniform Material material;

// From vertex shader
in vec3 fragVNorm;
in vec3 fragVPos;

in vec3 fragVNormOriginal;      // Vertex normal

#if (TEXTURE)
    //in vec2 fragUV;
#fi

in vec4 fragVColor;
uniform float paraboloidSlope;

layout (location = 0) out vec4 albedoSpec;
layout (location = 1) out vec4 position;
layout (location = 2) out vec3 normals;
layout (location = 3) out vec3 coordinates;

const float SQRTTWOPI =  2.50662827463;

float gauss(float x, float variance){
    return exp((-0.5*x*x) / variance) / (variance * SQRTTWOPI);
}

float gauss2(float x, float variance){
    return exp((-0.5*x*x) / variance);
}

void main() {

    // Diffuse color and shininess as alpha
    albedoSpec = fragVColor;
    
    float u = 2.0 * gl_PointCoord.x - 1.0;
    float v = 2.0 * gl_PointCoord.y - 1.0;
    float vRadius = 1.0;
    float wi = 0.0 - ( u*u + v*v);
    #if (PARABOLOIDS)
        vec4 pp = vec4(fragVPos, 1.0);
        pp.z += wi * vRadius;

        pp = PMat * pp;
        pp = pp / pp.w;

        gl_FragDepth = (pp.z + 1.0) / paraboloidSlope;
    #fi

    #if (DISTANCE_OPACITY)
        //albedoSpec.w = (1.0+wi) * 0.02;
        float d = pow(-wi, 0.1);
        albedoSpec.w = gauss2(d, 0.06) * 0.1;
        albedoSpec.xyz *= albedoSpec.w;
    #fi

    //if(wi < -1.0) discard;
    coordinates = vec3(0, 0, 0);
    // Write positions
    position = vec4(fragVPos.xyz, 1.0);
    // Write normals
    normals = normalize(fragVNormOriginal);
}