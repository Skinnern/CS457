#version 330 compatibility

uniform float uLightX, uLightY, uLightZ;
uniform float uA, uB, uC, uD, uE;
//vertex shader should possess vectors from points to light position as well as to the to the eye position


out vec3 vNs;
out vec3 vLs;
out vec3 vEs;
out vec3 vMC;

const float PI = 3.14159265359;
const float e = 2.71828;

vec3 eyeLightPosition = vec3( uLightX, uLightY, uLightZ );


void
main( )
{ 
	float z = uA * (cos(2. * PI * uB *gl_Vertex.x + uC) * pow(e,(uD*gl_Vertex.x) )) * pow(e,(uE*gl_Vertex.y)) ;
	vec4 vert = vec4(gl_Vertex.x, gl_Vertex.y, z, gl_Vertex.w);

	vec4 ECposition = gl_ModelViewMatrix * vert;




	
	float dzdx = uA * (-sin(2*PI*uB*gl_Vertex.x+uC)*2*PI*uB*pow(e,(-uD*gl_Vertex.x))+cos(2. * PI * uB *gl_Vertex.x + uC) *-uD *pow(e,(-uD*gl_Vertex.x)))*(pow(e,(-uD*gl_Vertex.y))); 
	float dzdy = uA *(cos(2. * PI * uB *gl_Vertex.x + uC) * pow(e,(-uD*gl_Vertex.x))) * (-uE *(pow(e,(-uE*gl_Vertex.y))));
	





	vNs = normalize( gl_NormalMatrix * cross(vec3(1., 0., dzdx ), vec3(0., 1., dzdy)) );
	
	vLs = eyeLightPosition - ECposition.xyz;		// vector that is from the point




									// to the light position
	vEs = vec3( 0., 0., 0. ) - ECposition.xyz;		// vector from the point
									// to the eye position 
	vMC = vert.xyz;



	
	gl_Position = gl_ModelViewProjectionMatrix * vert;
}
