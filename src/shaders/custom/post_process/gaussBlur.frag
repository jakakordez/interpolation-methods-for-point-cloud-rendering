#version 300 es
precision mediump float;


struct Material {
    #if (TEXTURE)
        sampler2D texture0; //MODIFIABLE, VOLATILE!
        sampler2D texture1; //ORIGINAL
    #fi
};


uniform Material material;
uniform bool horizontal;

#if (TEXTURE)
    in vec2 fragUV;
#fi

out vec4 color[2];


void main() {
	#if (TEXTURE)
		//bool horizontal = true;

		float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);


		vec2 tex_offset = 1.0 / vec2(textureSize(material.texture0, 0)); // gets size of single texel
		vec3 result = texture(material.texture0, fragUV).rgb * weight[0]; // current fragment's contribution


		if(horizontal) {
			for(int i = 0; i < 5; i++) {
			    result += texture(material.texture0, fragUV + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
			    result += texture(material.texture0, fragUV - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
			}
		}else {
			for(int i = 0; i < 5; i++) {
			    result += texture(material.texture0, fragUV + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
			    result += texture(material.texture0, fragUV - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
			}
		}
		color[0] = vec4(result, 1.0);


		color[1] = texture(material.texture1, fragUV);
	#fi
}
