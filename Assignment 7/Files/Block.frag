#version 330 compatibility

in float gLightIntensity;

void main() {
	//we dont need to do much here either, coloring and light intensity and thats it
	gl_FragColor = vec4( gLightIntensity*vec3(0.8, 0.8, 0.8), 1. );
}