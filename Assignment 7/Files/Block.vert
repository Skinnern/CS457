#version 330 compatibility

out vec3 vNormal;

void main() {

//we just need the vertex normal from here
	vNormal = normalize( gl_NormalMatrix * gl_Normal );
	//assign our glpos to our glvert
	gl_Position = gl_Vertex;
}