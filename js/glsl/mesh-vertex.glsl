// mesh-vertex shader
#define USE_SCALE_X
#define USE_SCALE_Y
#define USE_SCALE_Z
#include <scales>


 // for animation, all between 0 and 1
uniform float animation_time_x;
uniform float animation_time_y;
uniform float animation_time_z;
uniform float animation_time_u;
uniform float animation_time_v;
uniform float animation_time_color;

uniform vec2 domain_x;
uniform vec2 domain_y;
uniform vec2 domain_z;

varying vec4 vertex_color;
varying vec3 vertex_position;

attribute vec3 position_previous;

#ifdef USE_TEXTURE
    attribute float u;
    attribute float v;
    attribute float u_previous;
    attribute float v_previous;
    varying vec2 vertex_uv;
#endif

#ifdef USE_COLORMAP
    attribute float color_current;
    attribute float color_previous;
    uniform vec2 domain_color;
#else
    attribute vec4 color_current;
    attribute vec4 color_previous;
#endif
uniform sampler2D colormap;

#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
    // similar to phong
    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <envmap_pars_vertex>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //defined( AS_DEFAULT ) || defined( AS_COORDINATE )

#ifdef AS_LAMBERT
    #define LAMBERT
    varying vec3 vLightFront;

    #ifdef DOUBLE_SIDED
        varying vec3 vLightBack;
    #endif

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <envmap_pars_vertex>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //AS_LAMBERT

#ifdef AS_PHONG
    #define PHONG
    varying vec3 vViewPosition;

    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //AS_PHONG

#ifdef AS_PHYSICAL
    #define PHYSICAL
    varying vec3 vViewPosition;

    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif

    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //AS_PHYSICAL
#ifdef AS_DEPTH
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //AS_DEPTH
#ifdef AS_DISTANCE
    #define DISTANCE

    varying vec3 vWorldPosition;

    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <clipping_planes_pars_vertex>
#endif //AS_DISTANCE

void main(void) {
#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
    #include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	#include <begin_vertex>
#endif //defined( AS_DEFAULT ) || defined( AS_COORDINATE )
#ifdef AS_LAMBERT
    #include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	#include <begin_vertex>
#endif //AS_LAMBERT
#ifdef AS_PHONG
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

    #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	    vNormal = normalize( transformedNormal );
    #endif

	#include <begin_vertex>
#endif //AS_PHONG
#ifdef AS_PHYSICAL
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

    #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	    vNormal = normalize( transformedNormal );
    #endif

	#include <begin_vertex>
#endif //AS_PHYSICAL
#ifdef AS_DEPTH
	#include <uv_vertex>

	#include <skinbase_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
#endif //AS_DEPTH
#ifdef AS_DISTANCE
	#include <uv_vertex>

	#include <skinbase_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
#endif //AS_DISTANCE

    vec3 animation_time = vec3(animation_time_x, animation_time_y, animation_time_z);
    vec3 animated_position = mix(position_previous, position, animation_time);

    transformed = vec3(SCALE_X(animated_position.x), SCALE_Y(animated_position.y), SCALE_Z(animated_position.z));
    // gl_Position = projectionMatrix *
    //             modelViewMatrix *
    //             vec4(model_pos, 1.0);
    // vec3 positionEye = ( modelViewMatrix * vec4(model_pos, 1.0 ) ).xyz;
    // vertex_position = positionEye;

    #ifdef AS_COORDINATE
        // vertex_color = vec4(model_pos + vec3(0.5, 0.5, 0.5), 1.0);
    #else
        #ifdef USE_COLORMAP
            float color_animated = mix(color_previous, color_current, animation_time_color);
            float color_index = scale_transform_linear(color_animated, vec2(0.0, 1.0), domain_color);
            vertex_color = texture2D(colormap, vec2(color_index, 0));
        #else
            vertex_color = mix(color_previous, color_current, animation_time_color);
        #endif
    #endif


#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
    // vec3 model_pos = vec3(SCALE_X(animated_position.x), SCALE_Y(animated_position.y), SCALE_Z(animated_position.z));
    // gl_Position = projectionMatrix *
    //             modelViewMatrix *
    //             vec4(model_pos, 1.0);
    // vec3 positionEye = ( modelViewMatrix * vec4(model_pos, 1.0 ) ).xyz;
    // vertex_position = positionEye;
#endif //defined( AS_DEFAULT ) || defined( AS_COORDINATE )

#ifdef USE_TEXTURE
    vertex_uv = vec2(mix(u_previous, u, animation_time_u), mix(v_previous, v, animation_time_v));
#endif

    #if defined(USE_COLOR) && !(defined(AS_DEPTH) || defined(AS_DISTANCE))
        vColor = vertex_color.rgb;
    #endif


#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
    vec3 positionEye = ( modelViewMatrix * vec4(transformed, 1.0 ) ).xyz;
    vertex_position = positionEye;
	// #include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#endif //defined( AS_DEFAULT ) || defined( AS_COORDINATE )
#ifdef AS_LAMBERT
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <lights_lambert_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#endif //AS_LAMBERT
#ifdef AS_PHONG
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#endif //AS_PHONG
#ifdef AS_PHYSICAL
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#endif //AS_PHYSICAL
#ifdef AS_DISTANCE
    #include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>

	vWorldPosition = worldPosition.xyz;
#endif //AS_DISTANCE
#ifdef AS_DEPTH
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#endif //AS_DEPTH
}
