// scatter-vertex shader
#define USE_SCALE_X
#define USE_SCALE_Y
#define USE_SCALE_Z
#define USE_SCALE_SIZE_X
#define USE_SCALE_SIZE_Y
#define USE_SCALE_SIZE_Z
#define USE_SCALE_AUX
#include <scales>

 // for animation, all between 0 and 1
uniform float animation_time_x;
uniform float animation_time_y;
uniform float animation_time_z;
uniform float animation_time_aux;
uniform float animation_time_vx;
uniform float animation_time_vy;
uniform float animation_time_vz;
uniform float animation_time_size;
uniform float animation_time_color;

uniform vec2 domain_x;
uniform vec2 domain_y;
uniform vec2 domain_z;
uniform vec2 domain_aux;

uniform vec2 domain_size_x;
uniform vec2 domain_size_y;
uniform vec2 domain_size_z;

uniform mat4 geo_matrix;

varying vec4 vertex_color;
varying vec3 vertex_position;
varying vec2 vertex_uv;

#ifdef IS_LINE
    attribute vec3 position_previous;
#else
    attribute float x_next;
    attribute float x_previous;
    attribute float y_next;
    attribute float y_previous;
    attribute float z_next;
    attribute float z_previous;
    // attribute float aux_next;
    // attribute float aux_previous;

    attribute vec3 v_next;
    attribute vec3 v_previous;

    attribute float size_next;
    attribute float size_previous;
#endif

#ifdef USE_COLORMAP
    attribute float color_next;
    attribute float color_previous;
    uniform vec2 domain_color;
#else
    attribute vec4 color_next;
    attribute vec4 color_previous;
#endif

uniform sampler2D colormap;

#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
    // similar to phong
    // varying vec3 vColor;
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
    // we repeat threejs's shader, up to begin_vertex
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

    // after begin_vertex, we modify transformed


    vec3 animation_time = vec3(animation_time_x, animation_time_y, animation_time_z);
    vec3 animation_time_v = vec3(animation_time_vx, animation_time_vy, animation_time_vz);

#ifdef IS_LINE
    vec3 position_current = mix(position_previous, position, animation_time);
    vec3 model_pos = vec3(SCALE_X(position_current.x), SCALE_Y(position_current.y), SCALE_Z(position_current.z));
    vec4 view_pos = modelViewMatrix * vec4(model_pos, 1.0);
#else
    vec3 vector_next = v_next;
    vec3 vector_previous = v_previous;
    vec3 position_offset_next = vec3(x_next, y_next, z_next);
    vec3 position_offset_previous = vec3(x_previous, y_previous, z_previous);

    // assume the vector points to the y axis
    vec3 vector_current = mix(normalize(vector_previous), normalize(vector_next), animation_time_v)
           * mix(length(vector_previous), length(vector_next), (animation_time_vx+ animation_time_vy+ animation_time_vz)/3.);
    vec3 y_axis = normalize(vector_current);
    // we may have bad luck, and alight with 1 vector, so take two vectors, and we'll always find a non-zero vector
    vec3 some_z_vector_a = vec3(0., 1., 1.);
    vec3 some_z_vector_b = normalize(vec3(0., 2., 1.));
    vec3 x_axis = normalize(cross(y_axis, some_z_vector_a)  + cross(y_axis, some_z_vector_b));
    vec3 z_axis = -normalize(cross(y_axis, x_axis)); // - to keep it right handed
    //float vector_length = length(vector_current);
    // the following matrix should point it to the direction of 'vector'
    mat3 move_to_vector = mat3(x_axis, y_axis, z_axis);

    float size_current = mix(size_previous, size_next, animation_time_size);
    // TODO: replace the 0. in SCALE_SIZE_X(0.) by a uniform, so we can make it work with log?
    vec3 size_vector = vec3(SCALE_SIZE_X(size_current) - SCALE_SIZE_X(0.), SCALE_SIZE_Y(size_current) - SCALE_SIZE_Y(0.), SCALE_SIZE_Z(size_current) -  SCALE_SIZE_Z(0.));
    // float aux_current = mix(aux_previous, aux_next, animation_time_aux);
    vec3 position_current_offset = mix(position_offset_previous, position_offset_next, animation_time);
    vec3 model_pos = vec3(SCALE_X(position_current_offset.x), SCALE_Y(position_current_offset.y), SCALE_Z(position_current_offset.z));
    // vec3 model_pos = vec3((position_current_offset.x), (position_current_offset.y), (position_current_offset.z));
    SHADER_SNIPPET_SIZE;
    //vec3 pos = (pos_object ) / size;// - 0.5;
    #ifdef USE_SPRITE
        // if we are a sprite, we add the position in view coordinates, and need to 
        vec4 view_pos = modelViewMatrix * vec4(model_pos, 1.0);
        view_pos += vec4((position.xy)*(s*0.5),0,0);
    #else
        // the position is the orignal mesh position, so we scale and add that to the centrol location
        // and we also rotate it into the direction of the vector v
        vec4 position_transformed = geo_matrix * vec4(position, 1.0);
        position_transformed.xyz = position_transformed.xyz / position_transformed.w;
        model_pos += move_to_vector * (position_transformed.xyz*size_vector);
        vec4 view_pos = viewMatrix * vec4(model_pos, 1.0);
    #endif
    transformed = model_pos;
#endif
    // mvPosition = view_pos;
    gl_Position = projectionMatrix * view_pos;
    // vec3 positionEye = ( modelViewMatrix * vec4( model_pos, 1.0 ) ).xyz;
    // vertex_position = positionEye;
    vertex_uv = position.xy / 2. - 0.5;
#ifdef AS_COORDINATE
    vertex_color = vec4(model_pos + vec3(0.5, 0.5, 0.5), 1.0);
#else
    #ifdef USE_COLORMAP
        float color_current = mix(color_previous, color_next, animation_time_color);
        float color_index = scale_transform_linear(color_current, vec2(0.0, 1.0), domain_color);
        vertex_color = texture2D(colormap, vec2(color_index, 0));
    #else
        vertex_color = mix(color_previous, color_next, animation_time_color);
    #endif
#endif
    #if defined(USE_COLOR) && !(defined(AS_DEPTH) || defined(AS_DISTANCE))
        vColor = vertex_color.rgb;
    #endif


#if defined( AS_DEFAULT ) || defined( AS_COORDINATE )
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>


	#include <worldpos_vertex>
    vec3 positionEye = ( modelViewMatrix * vec4(transformed, 1.0 ) ).xyz;
    vertex_position = positionEye;
	// vViewPosition = - mvPosition.xyz;
	// #include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>    
#endif // defined( AS_DEFAULT ) || defined( AS_COORDINATE )
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
