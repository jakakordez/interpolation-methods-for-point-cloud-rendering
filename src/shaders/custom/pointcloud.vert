#version 300 es
precision highp float;

uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix
uniform mat3 NMat;  // Normal Matrix

in vec3 VPos;       // Vertex position
in vec3 VNorm;      // Vertex normal

struct Material {
    vec3 diffuse;

    #if (TEXTURE)
        #for I_TEX in 0 to NUM_TEX
            sampler2D texture##I_TEX;
        #end
    #fi
};
uniform Material material;
#if (TEXTURE)
    //in vec2 uv;          // Texture coordinate
#fi

// Output transformed vertex position, normal and texture coordinate
out vec3 fragVPos;
out vec3 fragVNorm;
//out vec2 fragUV;
out vec3 fragVNormOriginal;

in vec4 VColor;
out vec4 fragVColor;

uniform float pointSize;

void main() {
    
    // Model view position
    vec4 VPos4 = MVMat * vec4(VPos, 1.0);

    // Projected position
    gl_Position = PMat * VPos4;
    fragVPos = vec3(VPos4) / VPos4.w;

    vec2 coordinate = gl_Position.xy / gl_Position.w;
    coordinate += vec2(1.0, 1.0);
    coordinate /= 2.0;

    float distance = sqrt((fragVPos.x*fragVPos.x)+(fragVPos.y*fragVPos.y)+(fragVPos.z*fragVPos.z));
    #if (DENSITY_SIZING)
        float density = texture(material.texture0, coordinate).a;
        if(density < 0.1) density = 0.1;
        float size = pointSize / density;
        gl_PointSize = size / distance;
    #else
        if(pointSize < 0.0) gl_PointSize = 1.0;
        else gl_PointSize = pointSize/distance;
    #fi

    // Transform normal
    fragVNorm = vec3(NMat * VNorm);
    fragVNormOriginal = VNorm;
    fragVColor = VColor;

    #if (FILTERING)
        float depthDistance = texture(material.texture0, coordinate).x;
        float far = 1.0;
        float near = 0.0;
        float ndcZ = gl_Position.z / gl_Position.w;
        float depthValue = (far - near) / 2.0 * ndcZ + (far - near) / 2.0;
        //float depthValue = ndcZ;//(ndcZ - near) / (far - near);
        depthDistance = 1.0 - sqrt(1.0 - depthDistance);
        depthValue = 1.0 - sqrt(1.0 - depthValue);
        //fragVColor = vec4(1.0-depthValue, 1.0-depthDistance, 1.0, 1.0);
        if(depthDistance * 1.001f < depthValue) gl_Position = vec4(0, 0, 0, 0);
    #fi

    //if(VPos.z > 0.5) gl_Position = vec4(0, 0, 0, 0);

    #if (TEXTURE)
        // Pass-through texture coordinate
        //fragUV = uv;
    #fi
}