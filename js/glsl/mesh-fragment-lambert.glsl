#extension GL_OES_standard_derivatives : enable
#define LAMBERT

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float emissiveIntensity;
uniform float opacity;

varying vec3 vLightFront;

#ifdef DOUBLE_SIDED

	varying vec3 vLightBack;

#endif

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

//////////////////////////////////////////////////////////////////
varying vec4 vertex_color;
varying vec3 vertex_position;
varying vec2 vertex_uv;

#ifdef USE_TEXTURE
    uniform sampler2D texture;
    uniform sampler2D texture_previous;
    uniform float animation_time_texture;
#endif

void main() 
{
	vec4 finalColor2 = vec4( 0.0, 0.0, 0.0, 1.0 );
	
#ifdef USE_RGB
    finalColor2 = vec4( vertex_color.rgb, 1.0 );
#else
#ifdef AS_LINE
    finalColor2 = vec4( vertex_color.rgb, vertex_color.a );
#else

    vec3 fdx_ = dFdx( vertex_position );
    vec3 fdy_ = dFdy( vertex_position );
    vec3 normal_position = normalize( cross( fdx_, fdy_ ) );
    float diffuse_ = dot( normal_position, vec3( 0.0, 0.0, 1.0 ) );

#ifdef USE_TEXTURE
    vec4 sample = mix( texture2D( texture_previous, vertex_uv ), texture2D( texture, vertex_uv ), animation_time_texture );
    finalColor2 = vec4( clamp(diffuse_, 0.2, 1.) * sample.rgb, 1.0 );
#else
    finalColor2 = vec4( clamp(diffuse_, 0.2, 1.) * vertex_color.rgb, vertex_color.a );
#endif // USE_TEXTURE
#endif // AS_LINE
#endif // USE_RGB

//////////////////////////////////////////////////////

#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( vec3(1,1,1), opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive * emissiveIntensity;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	//#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <emissivemap_fragment>

	// accumulation
	reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );

	#include <lightmap_fragment>

	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

	#ifdef DOUBLE_SIDED

		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

	#else

		reflectedLight.directDiffuse = vLightFront;

	#endif

	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}