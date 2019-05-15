#version 330 compatibility

in vec3 vNs;
in vec3 vLs;
in vec3 vEs;
in vec3 vMC;
uniform float uMix;
//in the frag shader we should be rotating the normal, as well as applying some lighting features.
varying float LightIntensity; 
varying vec3 ReflectVector;
varying vec3 RefractVector;

uniform float Mix;
uniform samplerCube uReflectUnit;
uniform samplerCube uRefractUnit;

uniform float uKa, uKd, uKs;

uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;

uniform float uNoiseAmp;
uniform float uNoiseFreq;

uniform sampler3D Noise3; //noise texture built in to glman

const vec4 WHITE = vec4( 1.,1.,1.,1. );

vec3
RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}



void
main( )
{

	

	
	
	
	// calculate noise-based bump mapping
	vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;
	angx *= uNoiseAmp;
        vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;
	angy *= uNoiseAmp;



	vec3 Normal = RotateNormal(angx, angy, vNs);
	vec3 Light = normalize(vLs);
	vec3 Eye = normalize(vEs);
	
	
	vec4 refractcolor = textureCube( uRefractUnit, RefractVector );
	vec4 reflectcolor = textureCube( uReflectUnit, ReflectVector );
	refractcolor = mix( refractcolor, WHITE, 0.20 );
	gl_FragColor = mix( refractcolor, reflectcolor, uMix );
}