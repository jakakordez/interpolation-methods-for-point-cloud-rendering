#version 300 es
precision mediump float;

uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix
uniform mat3 NMat;  // Normal Matrix

in vec3 VPos;       // Vertex position
in vec3 VNorm;      // Vertex normal

#if (TEXTURE)
    in vec2 uv;          // Texture coordinate
#fi

#if (COLORS)
    in vec4 VColor;
    out vec4 fragVColor;
#fi

// Output transformed vertex position, normal and texture coordinate
out vec3 fragVPos;
out vec3 fragVNorm;
out vec2 fragUV;

#if (POINTS)
    uniform float pointSize;
#fi

#if (CLIPPING_PLANES)
    out vec3 vViewPosition;
#fi

void main() {
    // Model view position
    vec4 VPos4 = MVMat * vec4(VPos, 1.0);

    // Projected position
    gl_Position = PMat * VPos4;
    fragVPos = vec3(VPos4) / VPos4.w;

    // Transform normal
    fragVNorm = vec3(NMat * VNorm);

    #if (TEXTURE)
        // Pass-through texture coordinate
        fragUV = uv;
        //fragUV = (VPos.xy+vec2(250.0))/500.0;
        fragUV = (VPos.xy)/500.0;
    #fi

    #if (COLORS)
        // Pass vertex color to fragment shader
        fragVColor = VColor;
    #fi

    #if (POINTS)
        gl_PointSize = pointSize / length(VPos4.xyz);
        if(gl_PointSize < 1.0) gl_PointSize = 1.0;
    #fi

    #if (CLIPPING_PLANES)
        vViewPosition = -VPos4.xyz;
    #fi
}