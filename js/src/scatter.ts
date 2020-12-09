import * as widgets from "@jupyter-widgets/base";
import { isArray, isEqual, isNumber } from "lodash";
import * as THREE from "three";
import { MeshDepthMaterialCustom, MeshDistanceMaterialCustom } from "./materials";
import { createColormap, patchShader, scaleTypeMap } from "./scales";
import * as serialize from "./serialize.js";
import { materialToLightingModel, semver_range } from "./utils";
import * as values from "./values.js";
// tslint:disable-next-line: no-var-requires
const cat_data = require("../data/cat.json");

const vertexShader = (require("raw-loader!../glsl/scatter-vertex.glsl") as any).default;
const fragmentShader = (require("raw-loader!../glsl/scatter-fragment.glsl") as any).default;

export
class ScatterView extends widgets.WidgetView {
    renderer: any;
    previous_values: {color?: any, size?: any, sequence_index?: any, selected?: any};
    attributes_changed: {color?: any, size?: any, sequence_index?: any, selected?: any};
    scale_defines: {};
    texture_loader: THREE.TextureLoader;
    textures: any;
    uniforms: any;
    geos: { diamond: THREE.SphereGeometry; box: THREE.BoxGeometry; arrow: THREE.CylinderGeometry;
        cylinder: THREE.CylinderGeometry; cylinder_hr: THREE.CylinderGeometry; sphere: THREE.SphereGeometry;
        cat: THREE.Geometry; square_2d: THREE.PlaneGeometry; point_2d: THREE.PlaneGeometry; circle_2d: THREE.CircleGeometry;
        triangle_2d: THREE.CircleGeometry; };
    material: any;
    material_rgb: any;
    material_depth: any;
    line_material: any;
    line_material_rgb: any;
    materials: any[];
    texture_video: HTMLVideoElement;
    line_segments: any;
    mesh: any;
    lighting_model : any;

    render() {

        this.renderer = this.options.parent;
        this.previous_values = {};
        this.attributes_changed = {};
        (window as any).last_scatter = this;

        this.texture_loader = new THREE.TextureLoader();
        this.textures = null;
        if (this.model.get("texture")) {
            this._load_textures();
        }

        const geo_diamond = new THREE.SphereGeometry(1, 2, 2);
        const geo_sphere = new THREE.SphereGeometry(0.5, 12, 12);
        const geo_box = new THREE.BoxGeometry(1, 1, 1);
        const geo_cat = new THREE.Geometry();
        for (const vertex of cat_data.vertices) {
            const v = new THREE.Vector3( vertex[1], vertex[2], vertex[0]);
            geo_cat.vertices.push(v);
        }
        let i = 0;
        while (i < cat_data.indices.length ) {
            const indices = [];
            let length = 0;
            let done = false;
            while (!done) {
                indices.push(cat_data.indices[i]);
                length++;
                if (cat_data.indices[i] < 0) {
                    done = true;
                }
                i++;
            }
            indices[length - 1] = -1 - indices[length - 1]; // indicates end, so swap sign
            for (let j = 0; j < indices.length - 2; j++) {
            // for(var j = 0; j < 1; j++) {
                const face = new THREE.Face3( indices[0], indices[1 + j], indices[2 + j]);
                geo_cat.faces.push(face);
            }
        }
        const geo_square_2d = new THREE.PlaneGeometry(2, 2, 1, 1);
        const geo_point_2d = new THREE.PlaneGeometry(0.1, 0.1, 1, 1);
        const geo_triangle_2d = new THREE.CircleGeometry(1, 3, Math.PI / 2);
        const geo_circle_2d = new THREE.CircleGeometry(1, 32, Math.PI / 2);

        // this.geo = new THREE.ConeGeometry(0.2, 1)
        const geo_arrow = new THREE.CylinderGeometry(0, 0.2, 1);
        const geo_cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1.0);
        const geo_cylinder_hr = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 100);
        this.geos = {
            diamond: geo_diamond,
            box: geo_box,
            arrow: geo_arrow,
            cylinder: geo_cylinder,
            cylinder_hr: geo_cylinder_hr,
            sphere: geo_sphere,
            cat: geo_cat,
            square_2d: geo_square_2d,
            point_2d: geo_point_2d,
            circle_2d: geo_circle_2d,
            triangle_2d: geo_triangle_2d,
        };

        this.uniforms = {
                domain_x : { type: "2f", value: [0., 1.] },
                domain_y : { type: "2f", value: [0., 1.] },
                domain_z : { type: "2f", value: [0., 1.] },
                domain_size_x : { type: "2f", value: [0., 1.] },
                domain_size_y : { type: "2f", value: [0., 1.] },
                domain_size_z : { type: "2f", value: [0., 1.] },
                domain_aux : { type: "2f", value: [0., 1.] },
                domain_color : { type: "2f", value: [0., 1.] },
                animation_time_x : { type: "f", value: 1. },
                animation_time_y : { type: "f", value: 1. },
                animation_time_z : { type: "f", value: 1. },
                animation_time_aux : { type: "f", value: 1. },
                animation_time_vx : { type: "f", value: 1. },
                animation_time_vy : { type: "f", value: 1. },
                animation_time_vz : { type: "f", value: 1. },
                animation_time_size : { type: "f", value: 1. },
                animation_time_color : { type: "f", value: 1. },
                geo_matrix : { type: "mat4", value: this.model.get('geo_matrix')},
                texture: { type: "t", value: null },
                texture_previous: { type: "t", value: null },
                colormap: {type: "t", value: null},
                ...THREE.UniformsUtils.merge([THREE.UniformsLib["common"], THREE.UniformsLib["lights"]])
            };
        const get_material = (name)  => {
            if (this.model.get(name)) {
                return this.model.get(name).obj.clone();
            } else {
                return new THREE.ShaderMaterial();
            }
        };
        this.material = get_material("material");
        this.material_rgb = get_material("material");
        this.line_material = get_material("line_material");
        this.line_material_rgb = get_material("line_material");
        this.materials = [this.material, this.material_rgb, this.line_material, this.line_material_rgb];

        this._update_materials();
        if (this.model.get("material")) {
            this.model.get("material").on("change", () => {
                this._update_materials();
            });
        }
        if (this.model.get("line_material")) {
            this.model.get("line_material").on("change", () => {
                this._update_materials();
            });
        }
        this.model.on("change:geo_matrix", () => {
            this.uniforms.geo_matrix.value = this.model.get('geo_matrix');
            this._update_materials();
            this.renderer.update();
        });
        this.model.on("change:shader_snippets", () => {
            this._update_materials();
            this.renderer.update();
        });

        this._update_color_scale();
        this.create_mesh();
        this.add_to_scene();
        this.model.on("change:size change:size_selected change:color change:color_selected change:sequence_index change:x change:y change:z change:aux change:selected change:vx change:vy change:vz",
            this.on_change, this);
        this.model.on("change:geo change:connected", this.update_, this);
        this.model.on("change:color_scale", this._update_color_scale, this);
        this.model.on("change:texture", this._load_textures, this);
        this.model.on("change:visible", this._update_materials, this);
        this.model.on("change:geo", () => {
            this._update_materials();
        });
        const update_scale = (name) => {
            const scale_name = name + "_scale";
            const uniform_name = "domain_" + name;
            const update_scale_domain = () => {
                const scale = this.model.get(scale_name);
                let min = 0;
                let max = 100;
                if (scale) {
                    if (scale.min !== null) {
                        min = scale.min;
                    }
                    if (scale.max !== null) {
                        max = scale.max;
                    }
                }
                this.uniforms[uniform_name].value = [min, max];
                if(this.mesh) {
                    this.renderer.update();
                }
            }
            update_scale_domain();
            return () => {
                const scale_previous = this.model.previous(scale_name);
                const scale = this.model.get(scale_name);
                if (scale_previous) {
                    scale_previous.off("domain_changed", update_scale_domain);
                }
                const new_scale_defines = {...this.scale_defines};
                // if no scale, default to linear
                new_scale_defines[`SCALE_TYPE_${name}`] = scaleTypeMap[scale ? scale.type : 'linear'];
                const scale_types_changed = !isEqual(this.scale_defines, new_scale_defines);
                this.scale_defines = new_scale_defines;
                if ((!scale_previous && scale) || (scale_previous && !scale_previous) || scale_types_changed) {
                    // this will toggle a preprocessor variable
                    this._update_materials();
                }
                if (scale) {
                    scale.on("domain_changed", update_scale_domain, this);
                    update_scale_domain();
                    this.renderer.update();
                }
                // if (this.mesh) { // we don't need to do so on initialization
                //     this.update_();
                // }
            }
        }
        ["size_x", "size_y", "size_z", "aux"].forEach((name) => {
            const updater = update_scale(name);
            updater();
            this.model.on(`change:${name}_scale`, updater, this);
        });

        this.model.on("change:material change:cast_shadow change:receive_shadow", this._update_materials, this);
    }

    _load_textures() {
        const texture = this.model.get("texture");
        if (texture.stream) { // instanceof media.MediaStreamModel) {
            this.textures = null;
            this.texture_video = document.createElement("video");
            texture.stream.then((stream) => {
                this.texture_video.src = window.URL.createObjectURL(stream);
                const threejs_texture = new THREE.VideoTexture(this.texture_video);
                // texture.wrapS = THREE.RepeatWrapping;
                // texture.wrapT = THREE.RepeatWrapping;
                threejs_texture.minFilter = THREE.LinearFilter;
                // texture.wrapT = THREE.RepeatWrapping;
                this.textures = [texture];
                this.update_();
            });
        } else {
            this.textures = this.model.get("texture").map((texture_url) =>
                this.texture_loader.load(texture_url, (threejs_texture) => {
                    threejs_texture.wrapS = THREE.RepeatWrapping;
                    threejs_texture.wrapT = THREE.RepeatWrapping;
                    this.update_();
                }),
            );
        }
    }

    set_scales(scales) {
        const new_scale_defines = {...this.scale_defines};
        for (const key of Object.keys(scales)) {
            this.uniforms[`domain_${key}`].value = scales[key].domain;
            new_scale_defines[`SCALE_TYPE_${key}`] = scaleTypeMap[scales[key].type];
        }
        if (!isEqual(this.scale_defines, new_scale_defines) ) {
            this.scale_defines = new_scale_defines;
            this._update_materials();
        }
    }
    add_to_scene() {
        this.renderer.scene_scatter.add(this.mesh);
        if (this.line_segments) {
            this.renderer.scene_scatter.add(this.line_segments);
        }
    }
    remove_from_scene() {
        if (this.renderer.scene_scatter.children.indexOf(this.mesh) === -1) {
            console.warn("trying to removing scatter mesh from scene that does not include it");
        }
        this.renderer.scene_scatter.remove(this.mesh);
        this.mesh.geometry.dispose();
        if (this.line_segments) {
            this.renderer.scene_scatter.remove(this.line_segments);
            this.line_segments.geometry.dispose();
        }
    }
    on_change() {
        for (const key of Object.keys(this.model.changedAttributes())) {
            this.previous_values[key] = this.model.previous(key);
            // attributes_changed keys will say what needs to be animated, it's values are the properties in
            // this.previous_values that need to be removed when the animation is done
            // we treat changes in _selected attributes the same
            const key_animation = key.replace("_selected", "");
            if (key_animation === "sequence_index") {
                const animated_by_sequence = ["x", "y", "z", "aux", "vx", "vy", "vz", "size", "color"];
                animated_by_sequence.forEach((name) => {
                    if (isArray(this.model.get(name))) {
                        this.attributes_changed[name] = [name, "sequence_index"];
                    }
                });
            } else if (key_animation === "geo") {
                // direct change, no animation
            } else if (key_animation === "selected") { // and no explicit animation on this one
                this.attributes_changed.color = [key];
                this.attributes_changed.size = [];
            } else {
                this.attributes_changed[key_animation] = [key];
                // animate the size as well on x y z changes
                if (["x", "y", "z", "aux", "vx", "vy", "vz", "color"].indexOf(key_animation) !== -1) {
                    // console.log("adding size to list of changed attributes")
                    this.attributes_changed.size = [];
                }

            }
        }
        this.update_();
    }
    update_() {
        this.remove_from_scene();
        this.create_mesh();
        this.add_to_scene();
        this.renderer.update();
    }
    _get_value(value, index, default_value) {
        if (!value) {
            return default_value;
        }
        // it is either an array of typed arrays, or a list of numbers coming from the javascript world
        if (isArray(value) && !isNumber(value[0])) {
            return value[index % value.length];
        } else {
            return value;
        }
    }
    get_next(name, index, default_value) {
        return this._get_value(this.model.get(name), index, default_value);
    }
    get_previous(name, index, default_value) {
        return this._get_value(this.previous_values[name] || this.model.get(name), index, default_value);
    }
    _get_value_vec3(value, index, default_value) {
        if (!value) {
            return default_value;
        }
        if (isArray(value)) {
            return value[index % value.length];
        } else {
            return value;
        }
    }
    get_next_vec3(name, index, default_value) {
        return this._get_value_vec3(this.model.get(name), index, default_value);
    }
    get_previous_vec3(name, index, default_value) {
        return this._get_value_vec3(this.previous_values[name] || this.model.get(name), index, default_value);
    }
    _update_color_scale() {
        const color_scale_previous = this.model.previous("color_scale");
        const color_scale = this.model.get("color_scale");
        if (color_scale_previous) {
            color_scale_previous.off("domain_changed", this._update_color_scale_domain);
            color_scale_previous.off("colors_changed", this._update_color_scale_texture);
        }
        if ((!color_scale_previous && color_scale) || (color_scale_previous && !color_scale_previous)) {
            // this will toggle a preprocessor variable
            this._update_materials();
        }
        if (color_scale) {
            color_scale.on("domain_changed", this._update_color_scale_domain, this);
            color_scale.on("colors_changed", this._update_color_scale_texture, this);
            this._update_color_scale_texture();
            this._update_color_scale_domain();
            this.renderer.update();
        }
        if (this.mesh) { // we don't need to do so on initialization
            this.update_();
        }
    }
    _update_color_scale_texture() {
        const color_scale = this.model.get("color_scale");
        this.uniforms.colormap.value = createColormap(color_scale);
        this.renderer.update();
    }
    _update_color_scale_domain() {
        const color_scale = this.model.get("color_scale");
        const color = this.model.get("color");
        if (color) {
            let min;
            let max;
            if (color_scale.min !== null) {
                min = color_scale.min;
            } else {
                min = Math.min(...color);
            }
            if (color_scale.max !== null) {
                max = color_scale.max;
            } else {
                max = Math.max(...color);
            }
            this.uniforms.domain_color.value = [min, max];
        } else {
            if (color_scale.min !== null && color_scale.max !== null) {
                this.uniforms.domain_color.value = [color_scale.min, color_scale.max];
            } else {
                console.warn("no color set, and color scale does not have a min or max");
            }

        }
        this.renderer.update();
    }
     _update_materials() {

        if (this.model.get("material")) {
            this.material.copy(this.model.get("material").obj);
        }
        if (this.model.get("material")) {
            this.material_rgb.copy(this.model.get("material").obj);
        }
        if (this.model.get("line_material")) {
            this.line_material.copy(this.model.get("line_material").obj);
        }
        if (this.model.get("line_material")) {
            this.line_material_rgb.copy(this.model.get("line_material").obj);
            // not present on .copy.. bug?
            this.line_material_rgb.linewidth = this.line_material.linewidth = this.model.get("line_material").obj.linewidth;
        }

        // TODO: lighting_model for lines could be different
        this.lighting_model = materialToLightingModel(this.material)
        const shader_snippets = this.model.get('shader_snippets');
        const snippet_defines = {};
        for (const key of Object.keys(shader_snippets)) {
            snippet_defines["SHADER_SNIPPET_" + key.toUpperCase()] = shader_snippets[key];
        }
        this.material.defines = {USE_COLOR: true, USE_COLORMAP: this.model.get("color_scale") !== null, ...this.scale_defines, ...snippet_defines};
        this.material.defines[`AS_${this.lighting_model}`] = true;
        this.material.extensions = {derivatives: true};
        this.material_rgb.defines = {AS_COORDINATE: true, USE_COLOR: true, ...this.scale_defines, ...snippet_defines};
        this.material_rgb.extensions = {derivatives: true};
        this.line_material.defines = {IS_LINE: true, USE_COLOR: true, ...this.scale_defines,  ...snippet_defines};
        this.line_material.defines[`AS_${this.lighting_model}`] = true;
        this.line_material_rgb.defines = {AS_COORDINATE: true, IS_LINE: true, USE_COLOR: true};
        // locally and the visible with this object's visible trait
        this.material.visible = this.material.visible && this.model.get("visible");
        this.material_rgb.visible = this.material.visible && this.model.get("visible");
        this.line_material.visible = this.line_material.visible && this.model.get("visible");
        this.line_material_rgb.visible = this.line_material.visible && this.model.get("visible");



        this.materials.forEach((material) => {
            material.onBeforeCompile = (shader) => {
                shader.vertexShader = vertexShader;
                shader.fragmentShader = fragmentShader;
                shader.uniforms = {...shader.uniforms, ...this.uniforms};
                patchShader(shader);
            };
            material.needsUpdate = true;
            material.lights = true;
        });

        const geo = this.model.get("geo");
        const sprite = geo.endsWith("2d");
        if (sprite) {
            this.material.defines.USE_SPRITE = true;
            this.material_rgb.defines.USE_SPRITE = true;
        }
        if (sprite) {
            const texture = this.model.get("texture");
            if (texture && this.textures) {
                this.material.defines.USE_TEXTURE = true;
            }
        }
        this.material.needsUpdate = true;
        this.material_rgb.needsUpdate = true;
        this.line_material.needsUpdate = true;
        this.line_material_rgb.needsUpdate = true;

        this.renderer.update();
    }
    create_mesh() {
        let geo = this.model.get("geo");
        // console.log(geo)
        if (!geo) {
            geo = "diamond";
        }
        const sprite = geo.endsWith("2d");
        const buffer_geo = new THREE.BufferGeometry().fromGeometry(this.geos[geo]);
        const instanced_geo = new THREE.InstancedBufferGeometry();

        const vertices = (buffer_geo.attributes.position as any).clone();
        instanced_geo.addAttribute("position", vertices);

        const sequence_index = this.model.get("sequence_index");
        let sequence_index_previous = this.previous_values.sequence_index;
        if (typeof sequence_index_previous === "undefined") {
            sequence_index_previous = sequence_index;
        }
        const scalar_names = ["x", "y", "z", "aux", "vx", "vy", "vz", "size", "size_selected"];
        const vector4_names = [];
        if (this.model.get("color_scale")) {
            scalar_names.push("color", "color_selected");
        } else {
            vector4_names.push("color", "color_selected");
        }
        const next  = new values.Values(scalar_names, [], this.get_next.bind(this), sequence_index, vector4_names);
        const previous = new values.Values(scalar_names, [], this.get_previous.bind(this), sequence_index_previous, vector4_names);

        const length = Math.max(next.length, previous.length);
        if (length === 0) {
            console.error("no single member is an array, not supported (yet?)");
        }

        next.trim(next.length); // make sure all arrays are of equal length
        previous.trim(previous.length);
        const previous_length = previous.length;
        const next_length = next.length;
        if (this.model.get("selected") || this.previous_values.selected) {
            // upgrade size and size_previous to an array if they were not already
            next.ensure_array(["size", "size_selected", "color", "color_selected"]);
            previous.ensure_array(["size", "size_selected", "color", "color_selected"]);
            let selected = this.get_next("selected", sequence_index, []);
            next.select(selected);
            selected = this.get_previous("selected", sequence_index_previous, []);
            previous.select(selected);
        }
        // if we have a change in length, we use size to fade in/out particles, so make sure they are arrays
        if (next.length !== previous.length) {
            next.ensure_array("size");
            previous.ensure_array("size");
        }
        if (next.length > previous.length) { // grow..
            previous.pad(next);
            (previous.array.size as any).fill(0, previous_length); // this will make them smoothly fade in
        } else if (next.length < previous.length) { // shrink..
            next.pad(previous);
            (next.array.size as any).fill(0, next_length); // this will make them smoothly fade out
        }
        // we are only guaranteed to have 16 attributes for the shader, so better merge some into single vectors
        next.merge_to_vec3(["vx", "vy", "vz"], "v");
        previous.merge_to_vec3(["vx", "vy", "vz"], "v");

        // we don't want to send these to the shader, these are handled at the js side
        next.pop(["size_selected", "color_selected"]);
        previous.pop(["size_selected", "color_selected"]);

        // add attributes to the geometry, this makes them available to the shader
        next.add_attributes(instanced_geo, "_next");
        previous.add_attributes(instanced_geo, "_previous");
        if (sprite) {
            const texture = this.model.get("texture");
            if (texture && this.textures) {
                // TODO: this should prolly go into _update_materiuals
                this.material.uniforms.texture.value = this.textures[sequence_index % this.textures.length]; // TODO/BUG: there could
                this.material.uniforms.texture_previous.value = this.textures[sequence_index_previous % this.textures.length];
            }
        }
        instanced_geo.computeVertexNormals();
        this.mesh = new THREE.Mesh(instanced_geo, this.material);
        this.mesh.castShadow = this.model.get("cast_shadow");
        this.mesh.receiveShadow = this.model.get("receive_shadow");
        // We use the approach used in https://codepen.io/Fyrestar/pen/JqqGZQ
        // see also https://discourse.threejs.org/t/shadow-for-instances/7947/7
        // or https://jsfiddle.net/mikatalk/4fn1oqz9/

        this.mesh.customDepthMaterial = new MeshDepthMaterialCustom(() => {
            const defines = {...this.material.defines};
            delete defines[`AS_${this.lighting_model}`];
            const as_sprite = this.model.get("geo").endsWith("2d");
            if (as_sprite) {
                defines.AS_SPRITE = true;
            }
            return {AS_DEPTH: true, ...defines};
        }, this.uniforms, vertexShader, fragmentShader, {
            depthPacking: THREE.RGBADepthPacking,
            alphaTest: 0.5,
        });
        this.mesh.customDistanceMaterial = new MeshDistanceMaterialCustom(() => {
            const defines = {...this.material.defines};
            delete defines[`AS_${this.lighting_model}`];
            const as_sprite = this.model.get("geo").endsWith("2d");
            if (as_sprite) {
                defines.AS_SPRITE = true;
            }
            return {AS_DISTANCE: true, ...defines};
        }, this.uniforms, vertexShader, fragmentShader, {});
        this.mesh.material_rgb = this.material_rgb;
        this.mesh.material_normal = this.material;

        if (this.model.get("connected")) {
            const geometry = new THREE.BufferGeometry();

            next.merge_to_vec3(["x", "y", "z"], "vertices");
            previous.merge_to_vec3(["x", "y", "z"], "vertices");
            geometry.addAttribute("position", new THREE.BufferAttribute(next.array_vec3.vertices, 3));
            geometry.addAttribute("position_previous", new THREE.BufferAttribute(previous.array_vec3.vertices, 3));

            next.ensure_array(["color"]);
            previous.ensure_array(["color"]);
            if (this.model.get("color_scale")) {
                geometry.addAttribute("color_next", new THREE.BufferAttribute(next.array.color, 1));
                geometry.addAttribute("color_previous", new THREE.BufferAttribute(previous.array.color, 1));
            } else {
                geometry.addAttribute("color_next", new THREE.BufferAttribute(next.array_vec4.color, 4));
                geometry.addAttribute("color_previous", new THREE.BufferAttribute(previous.array_vec4.color, 4));
            }
            geometry.computeVertexNormals();

            this.line_segments = new THREE.Line(geometry, this.line_material);
            this.line_segments.frustumCulled = false;
            this.line_segments.castShadow = this.model.get("cast_shadow");
            this.line_segments.receiveShadow = this.model.get("receive_shadow");
        } else {
            this.line_segments = null;
        }

        for (const key of Object.keys(this.attributes_changed)) {
            const changed_properties = this.attributes_changed[key];
            const property = "animation_time_" + key;
            // console.log("animating", key)
            const done = () => {
                changed_properties.forEach((prop) => {
                    delete this.previous_values[prop]; // may happen multiple times, that is ok
                });
            };
            // all materials share the same uniforms
            const set = (value) => {
                this.uniforms[property].value = value;
            };
            this.renderer.transition(set, done, this);
        }
        this.attributes_changed = {};
    }
}

export
class ScatterModel extends widgets.WidgetModel {
    static serializers = {
        ...widgets.WidgetModel.serializers,
        x: serialize.array_or_json,
        y: serialize.array_or_json,
        z: serialize.array_or_json,
        aux: serialize.array_or_json,
        aux_scale: { deserialize: widgets.unpack_models },
        vx: serialize.array_or_json,
        vy: serialize.array_or_json,
        vz: serialize.array_or_json,
        selected: serialize.array_or_json,
        size: serialize.array_or_json,
        size_selected: serialize.array_or_json,
        size_x_scale: { deserialize: widgets.unpack_models },
        size_y_scale: { deserialize: widgets.unpack_models },
        size_z_scale: { deserialize: widgets.unpack_models },
        color: serialize.color_or_json,
        color_scale: { deserialize: widgets.unpack_models },
        color_selected: serialize.color_or_json,
        texture: serialize.texture,
        material: { deserialize: widgets.unpack_models },
        line_material: { deserialize: widgets.unpack_models },
    };

    defaults() {
        return {...super.defaults(),
            _model_name : "ScatterModel",
            _view_name : "ScatterView",
            _model_module : "ipyvolume",
            _view_module : "ipyvolume",
            _model_module_version: semver_range,
             _view_module_version: semver_range,
            size: 5,
            size_selected: 7,
            color: "red",
            color_scale: null,
            color_selected: "white",
            geo: "diamond",
            geo_matrix: [1, 0, 0, 0,   0, 1, 0, 0,   0, 0, 1, 0,  0, 0, 0, 1],
            sequence_index: 0,
            connected: false,
            visible: true,
            selected: null,
            shader_snippets: {size: '\n'},
            cast_shadow : true,
            receive_shadow : true,
        };
    }
}
