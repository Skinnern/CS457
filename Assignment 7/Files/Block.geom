#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable


//triangles in for our layout
layout( triangles ) in;
layout( triangle_strip, max_vertices=200 ) out;


//ulever controls the number of levels of triangle subdivision
uniform int uLevel;

//this controls the quantization equation
uniform float uQuantize;

//on/off model coords for viewing
uniform bool uModelCoords;


//normalized in vector
in vec3 vNormal[3];

//pass light intensity to frag
out float gLightIntensity;


//change position of light
const vec3 LIGHTPOS = vec3( 0., 10., 0. );


//vec3's to be used
vec3 V01, V02;


//quantize single number
float Quantize( float f ) {
	f *= uQuantize;
	f += .5;		// round-off
	int fi = int( f );
	f = float( fi ) / uQuantize;
	
	return f;
}


//send the values to be quantized
vec3 QuantizeVec3( vec3 v ) {
	vec3 vv;
	vv.x = Quantize( v.x );
	vv.y = Quantize( v.y );
	vv.z = Quantize( v.z );
	return vv;
}



//produce vertex
//should produce and emit vertex depending on modelview
void ProduceVertex( float s, float t ) {
	vec3 v = gl_in[0].gl_Position.xyz + vec3(s)*V01 + vec3(t)*V02;
	vec3 n = v;
	vec3 tnorm = normalize( gl_NormalMatrix * n ); // the transformed normal
	
	
	//if we're using model coordinates, we want to use our modelviewmatrix
	if(uModelCoords) {
		vec4 ECposition = gl_ModelViewMatrix * vec4( v, 1. );
		//get lightintensity to pass to frag
		gLightIntensity = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );
		gl_Position = gl_ProjectionMatrix * vec4(QuantizeVec3(ECposition.xyz), 1.);
	} else {
		vec4 ECposition = vec4( v, 1. );
		//get lightintensity to pass to frag
		gLightIntensity = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );
		gl_Position = gl_ModelViewProjectionMatrix * vec4(QuantizeVec3(ECposition.xyz), 1.);	
	}
	EmitVertex( );
}


//main, 
void main() {
	//take in gl positions
	//these display the corner points of the original triangle
	V01 = (gl_in[1].gl_Position - gl_in[0].gl_Position).xyz;
	V02 = (gl_in[2].gl_Position - gl_in[0].gl_Position).xyz;
	
	//use normal vectors
	//these are the corner normals of the original triangle
	vec3 N01 = vNormal[1] - vNormal[0];
	vec3 N02 = vNormal[2] - vNormal[0];
	
	
	//
	int numLayers = 1 << uLevel;
	float dt = 1. / float( numLayers );
	float t_top = 1.;
	
	
	//loop for each number of layers
	//for each new triangle created by the triangle subdivision:

	for(int it = 0; it < numLayers; it++) {
		float t_bot = t_top - dt;
		float smax_top = 1. - t_top;
		float smax_bot = 1. - t_bot;
		int nums = it + 1;
		float ds_top = smax_top / float( nums - 1 );
		float ds_bot = smax_bot / float( nums );
		float s_top = 0.;
		float s_bot = 0.;
		//	for each (s,t) corner point in that new triangle:

		for( int is = 0; is < nums; is++ ) {
		/*
				Turn that (s,t) into an (nx,ny,nz)
		Transform and normalize that (nx,ny,nz)
		Use the (nx,ny,nz) to produce gLightIntensity

		Turn that same (s,t) into an (x,y,z)
		If you are working in ????? coordinates, multiply the (x,y,z) by the ModelView matrix
		Quantize that (x,y,z)
		If you are working in ????? coordinates, multiply the (x,y,z) by the ModelView matrix

		Multiply that (x,y,z) by the Projection matrix to produce gl_Position
		EmitVertex( );

		*/
			ProduceVertex( s_bot, t_bot );
			ProduceVertex( s_top, t_top );
			s_top += ds_top;
			s_bot += ds_bot;
		}
		//call produce vertex to produce a final quantized vertex that contains all the info we need
		ProduceVertex( s_bot, t_bot );
		//end our primitive
		EndPrimitive( );
		
		
		t_top = t_bot;
		t_bot -= dt;
	}
}