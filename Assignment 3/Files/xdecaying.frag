#version 330 compatibility

in vec3 vNs;
in vec3 vLs;
in vec3 vEs;
in vec3 vMC;
//in the frag shader we should be rotating the normal, as well as applying some lighting features.


uniform float uKa, uKd, uKs;

uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;

uniform float uNoiseAmp;
uniform float uNoiseFreq;

uniform sampler3D Noise3; //noise texture built in to glman

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

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;

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








	vec4 ambient = uKa * uColor;

	float d = max( dot(Normal,Light), 0. );
	vec4 diffuse = uKd * d * uColor;

	float s = 0.;







//if our normal is more than 0, only do specular
	if( dot(Normal,Light) > 0. )		// only do specular if the light can see the point
	{
		vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec4 specular = uKs * s * uSpecularColor;

	gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );
}