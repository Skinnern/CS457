#version 330 compatibility 


//invecs from our vertex shader
in vec2 vST;
in vec3 vNormal;
in vec3 vLightVector;
in vec3 vEyeVector;



//splatmap import
uniform sampler2D splatmap;


//heightmap import
uniform sampler2D mat1Height;
uniform sampler2D mat2Height;


//diffusemap import
uniform sampler2D mat1Diffuse;
uniform sampler2D mat2Diffuse;


//normals import
uniform sampler2D mat1Normal;
uniform sampler2D mat2Normal;


//roughness import
uniform sampler2D mat1Roughness;
uniform sampler2D mat2Roughness;


//light import
uniform vec3 LightColor;
uniform vec4 AmbientColor;

//calculate our lightning depending on our diffuse and specularity
vec4 CalculateTheLighting(vec3 diffuseColor, vec3 specularIntensity, vec3 normal) {
	//set our base 'shineness' for our objects
	float shininess = 10.;
	
	//normalize our in vectors so they are usable for our lighting calcs
	vec3 light = normalize(vLightVector);
	vec3 eye = normalize(vEyeVector);
	
	
	
	//ambient assignment 
	vec3 ambient = AmbientColor.rgb * (1 - max( dot(normal, light), 0. )) * diffuseColor;
	
	
	//diffuse assignment
	vec3 diffuse = diffuseColor * max( dot(normal, light), 0. ) * LightColor;
	
	
	//specular assignment (only need to do if the dot product of the normal and the light > 0)
	vec3 specular = vec3(0.);
	
	if( dot(normal, light) > 0. ) {
		vec3 ref = normalize( 2. * normal * dot(normal, light) - light );
		specular = pow(max(dot(eye, ref), 0.), shininess) * (vec3(1.) - specularIntensity);
	}
	
	
	//return a vec that contains our ambient + diffuse + specular
	return vec4(ambient + diffuse + specular * 0.2, 1.);
}

vec4 drawBaseTexture() {
	//grab our diffuse, normal and specular files
	vec3 diffuseColor = texture(mat1Diffuse, vST).rgb;
	vec3 normal = vNormal * texture(mat1Normal, vST).rgb;
	vec3 specular = texture(mat1Roughness, vST).rgb;
	
	//send the files to our lighting calculation
	return CalculateTheLighting(diffuseColor, specular, normal);
}

vec4 DrawCoverTexture() {
	//gather our diffuse, normal, and specular files
	vec3 diffuseColor = texture(mat2Diffuse, vST).rgb;
	vec3 normal = vNormal * texture(mat2Normal, vST).rgb;
	vec3 specular = texture(mat2Roughness, vST).rgb;
	
	
	//send them to calculate the lighting
	return CalculateTheLighting(diffuseColor, specular, normal);
}

//main contains all actions we need to perform
void main() {
	//find what our bias should be by reading splatmap
	float mat1Bias = texture(splatmap, vST).r;
	float mat2Bias = texture(splatmap, vST).g;
	
	//we want to use our bias, as well as our heights to figure out what to draw where
	//we want to draw both textures, but we do not want to completly overlay one with the other
	//height will be important, it will show a texture 'rising above'
	
	//BRICK AND DIRT EXAMPLE:
	//Bricks should be the most prominent item
	//dirt should be concentrated around cracks, and in some locations on top of bricks
	//should only be on top of bricks if bias and height determine it should
	if(texture(mat1Height, vST).r * mat1Bias > texture(mat2Height, vST).r * mat2Bias) {
		//gl frag our first mat
		gl_FragColor = drawBaseTexture();
	} 
	else {
		//glfrag our second mat
		gl_FragColor = DrawCoverTexture();
	}
}