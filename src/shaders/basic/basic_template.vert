#version 300 es
precision mediump float;

uniform mat4 MVMat; // Model View Matrix
uniform mat4 PMat;  // Projection Matrix

in vec3 VPos;       // Vertex position
#if (OUTLINE)
    in vec3 VNorm;      // Vertex normal
    //uniform mat3 NMat;  // Normal Matrix
    //uniform vec3 cameraPosition;
    uniform float offset;
#fi

#if (COLORS)
    in vec4 VColor;
    out vec4 fragVColor;
#fi

#if (TEXTURE)
    in vec2 uv;
    out vec2 fragUV;
#fi

#if (LIGHTS)
    out vec3 fragVPos;
#fi

#if (POINTS)
    uniform float pointSize;
#fi

#if (CLIPPING_PLANES)
    out vec3 vViewPosition;
#fi

void main() {
    // Model view position
    #if (!OUTLINE)
        vec4 VPos4 = MVMat * vec4(VPos, 1.0);
    #fi
    #if (OUTLINE)
        vec4 VPos4 = MVMat * vec4(VPos + VNorm * offset, 1.0);
    #fi

    // Projected position
    gl_Position = PMat * VPos4;

    #if (LIGHTS)
        // Pass vertex position to fragment shader
        fragVPos = vec3(VPos4) / VPos4.w;
    #fi

    #if (COLORS)
        // Pass vertex color to fragment shader
        fragVColor = VColor;
    #fi

    #if (TEXTURE)
        // Pass uv coordinate to fragment shader
        fragUV = uv;
    #fi

    #if (POINTS)
        gl_PointSize = pointSize / length(VPos4.xyz);
        if(gl_PointSize < 1.0) gl_PointSize = 1.0;
    #fi

    #if (CLIPPING_PLANES)
        vViewPosition = -VPos4.xyz;
    #fi
 }