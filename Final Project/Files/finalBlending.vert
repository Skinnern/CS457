#version 330 compatibility 


//declaring my out variables to pass to the fragment shader, these will give context to lighting position and information
out vec2 vST;
out vec3 vNormal;
out vec3 vLightVector;
out vec3 vEyeVector;

uniform float LightX, LightY, LightZ;

vec3 lightPos = vec3(LightX, LightY, LightZ);
//in the vert file all I think I need is to create the lighting xyz movement
//shouls be as simple as an xyz position uniform with some outVecs for 
//vertex normalize
//vertex light color
//vertex eye vector
//vertex ST = texture coordinates
void main() {


	//in our main, we will want to grab texture coords, normalize our normal values, get the lightpos, as well as the eye vector

	//get texture coordinates
	vST = gl_MultiTexCoord0.st;
	
	//normalize our normal matrix with our gl_normal
	vNormal = normalize(gl_NormalMatrix * gl_Normal);
	
	
	//get our lightPos
	vLightVector = lightPos - (gl_ModelViewMatrix * gl_Vertex).xyz;
	
	//get our eye vector
	vEyeVector = vec3(0., 0., 0.) - (gl_ModelViewMatrix * gl_Vertex).xyz;
	
	
	
	//set our position to the modelviewmatrix * gl_vertex
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}