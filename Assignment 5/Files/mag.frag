#version 330 compatibility

uniform sampler2D uImageUnit;
uniform float uScenter;
uniform float uTcenter;
uniform float uRadius;
uniform float uMagFactor;
uniform float uRotAngle;
uniform float uSharpFactor;

in vec2 vST;

void main() {
	vec4 color;

	if(sqrt(pow(uScenter - vST.s, 2) + pow(uTcenter - vST.t, 2)) <= uRadius) {
		vec2 magnificationOffset = (vec2(uScenter, uTcenter) - vST) * uMagFactor;
		
		vec2 rotatedST;
		rotatedST = vec2(uScenter, uTcenter) + vec2((vST.s - uScenter)*cos(uRotAngle) - (vST.t - uTcenter)*sin(uRotAngle),(vST.s -  uScenter)*sin(uRotAngle) + (vST.t - uTcenter)*cos(uRotAngle));
		
		vec2 newST = rotatedST + magnificationOffset;
		
		ivec2 ires = textureSize(uImageUnit, 0);
		float ResS = float( ires.s );
		float ResT = float( ires.t );
		
		vec2 stp0 = vec2(1./ResS, 0.);
		vec2 st0p = vec2(0., 1./ResT);
		vec2 stpp = vec2(1./ResS, 1./ResT);
		vec2 stpm = vec2(1./ResS, -1./ResT);
		vec3 i00 = texture2D(uImageUnit, newST ).rgb;
		vec3 im1m1 = texture2D(uImageUnit, newST-stpp).rgb;
		vec3 ip1p1 = texture2D(uImageUnit, newST+stpp).rgb;
		vec3 im1p1 = texture2D(uImageUnit, newST-stpm).rgb;
		vec3 ip1m1 = texture2D(uImageUnit, newST+stpm).rgb;
		vec3 im10 = texture2D(uImageUnit, newST-stp0).rgb;
		vec3 ip10 = texture2D(uImageUnit, newST+stp0).rgb;
		vec3 i0m1 = texture2D(uImageUnit, newST-st0p).rgb;
		vec3 i0p1 = texture2D(uImageUnit, newST+st0p).rgb;
		vec3 target = vec3(0.,0.,0.);
		target += 1.*(im1m1+ip1m1+ip1p1+im1p1);
		target += 2.*(im10+ip10+i0m1+i0p1);
		target += 4.*(i00);
		target /= 16.;
	
		color = vec4(mix( target, texture(uImageUnit, newST).rgb, uSharpFactor ), 1.);
	}
	else {
		color = texture(uImageUnit, vST);
	}
	
	gl_FragColor = color;
}