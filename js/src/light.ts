import * as widgets from "@jupyter-widgets/base";
import { isArray, isNumber } from "lodash";
import * as THREE from "three";
import { FigureView } from "./figure";
import * as serialize from "./serialize.js";
import { semver_range } from "./utils";
import * as values from "./values.js";
import { randomBates } from "d3";


export
class LightView extends widgets.WidgetView {

    renderer: FigureView;
    lights: any; 
    current_light: any;
    LIGHT_TYPES: any;
    SHADOW_MAP_TYPES: any;
    light_type: any;
    shadow_map_type: any;

    light_color: any;
    light_color2: any;
    intensity: any;
    position: any;
    target: any;
    angle: any; 
    distance: any;
    decay: any;
    penumbra: any;
    cast_shadow: any;
    shadow_map_size: any;
    shadow_bias: any;
    shadow_radius: any;
    shadow_camera_near: any;
    shadow_camera_far: any;
    shadow_camera_perspective_fov: any;
    shadow_camera_perspective_aspect: any;
    shadow_camera_orthographic_size: any;
    
    render() {

        this.LIGHT_TYPES = {
            AMBIENT: 'AMBIENT',
            DIRECTIONAL: 'DIRECTIONAL',
            SPOT: 'SPOT',
            POINT: 'POINT',
            HEMISPHERE: 'HEMISPHERE'
        };

        this.SHADOW_MAP_TYPES = {
            BASIC: 'BASIC',
            PCF: 'PCF',
            PCF_SOFT: 'PCF_SOFT',
        };

        this.renderer = this.options.parent;

        this.model.on("change:light_color change:light_color2 change:intensity change:shadow_map_type change:cast_shadow change:position_x change:position_y change:position_z change:target_x change:target_y change:target_z change:distance change:angle change:decay change:penumbra change:shadow_map_size change:shadow_bias change:shadow_radius change:shadow_camera_near change:shadow_camera_far change:shadow_camera_perspective_fov change:shadow_camera_perspective_aspect change:shadow_camera_orthographic_size",
        this.on_change, this);
        this.create_light(true);
        this.add_to_scene();
    }

    on_change(attribute) {
        this.cast_shadow = this.model.get("cast_shadow");
        this.renderer.renderer.shadowMap.enabled = this.cast_shadow;
        this.create_light(false);
        this.renderer.update();
    }

    add_to_scene() {
        this.lights.forEach((light) => {
            this.renderer.scene_scatter.add(light);
        });
    }

    remove_from_scene() {
        this.renderer.scene_scatter.remove(this.target);
        this.lights.forEach((light) => {
            this.renderer.scene_scatter.remove(light);
        });
    }

    create_light(instantiate=true) {
        //force meshes light model update
        for (let mesh_key in this.renderer.mesh_views) {
            this.renderer.mesh_views[mesh_key].force_lighting_model();
        }
        for (let scatter_key in this.renderer.scatter_views) {
            this.renderer.scatter_views[scatter_key].force_lighting_model();
        }
        
        this.lights = [];

        this.light_color = this.model.get("light_color");
        this.intensity = this.model.get("intensity");
        if(instantiate === true){
            this.light_type = this.model.get("light_type");
        }

        this.cast_shadow = this.model.get("cast_shadow");
        this.renderer.renderer.shadowMap.enabled = this.cast_shadow;
        
        //no shadow support
        if(this.light_type === this.LIGHT_TYPES.AMBIENT){
            if(instantiate === true){
                this.current_light = new THREE.AmbientLight(this.light_color, this.intensity);
                this.lights.push(this.current_light);
            }
            else{
                this.current_light.color.set(this.light_color);
                this.current_light.intensity = this.intensity;
            }
        }
        else{
            this.position = new THREE.Vector3(this.model.get("position_x"), this.model.get("position_y"), this.model.get("position_z"));
            
            // no shadow support
            if(this.light_type === this.LIGHT_TYPES.HEMISPHERE) {
                this.light_color2 = this.model.get("light_color2");
                if(instantiate === true){
                    this.current_light = new THREE.HemisphereLight(this.light_color, this.light_color2, this.intensity);
                }
                else{
                    this.current_light.color.set(this.light_color);
                    this.current_light.groundColor.set(this.light_color2);
                    this.current_light.intensity = this.intensity;
                }
                this.current_light.position.set(this.position.x, this.position.y, this.position.z);
                if(instantiate === true){
                    this.lights.push(this.current_light);
                }
            }
            // with shadow support
            else {
                this.distance = this.model.get("distance");
                this.decay = this.model.get("decay");
                this.shadow_map_size = this.model.get("shadow_map_size");
                this.shadow_bias = this.model.get("shadow_bias");
                this.shadow_radius = this.model.get("shadow_radius");
                this.shadow_camera_near = this.model.get("shadow_camera_near");
                this.shadow_camera_far = this.model.get("shadow_camera_far");

                if(this.cast_shadow === true) {
                    this.shadow_map_type = this.model.get("shadow_map_type");

                    if(this.shadow_map_type === this.SHADOW_MAP_TYPES.BASIC) {
                        this.renderer.renderer.shadowMap.type = THREE.BasicShadowMap;
                    }
                    else if(this.shadow_map_type === this.SHADOW_MAP_TYPES.PCF) {
                        this.renderer.renderer.shadowMap.type = THREE.PCFShadowMap;
                    }
                    else if(this.shadow_map_type === this.SHADOW_MAP_TYPES.PCF_SOFT) {
                        this.renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    }
                }

                if(this.light_type === this.LIGHT_TYPES.POINT) { 
                    if(instantiate === true){
                        this.current_light = new THREE.PointLight(this.light_color, this.intensity);
                    }
                    else {
                        this.current_light.color.set(this.light_color);
                        this.current_light.intensity = this.intensity;
                    }
                    
                    this.current_light.position.set(this.position.x, this.position.y, this.position.z);
                    this.current_light.distance = this.distance;
                    this.current_light.decay = this.decay;
                    this.current_light.castShadow = this.cast_shadow;
                    
                    this.current_light.shadow.mapSize.width = this.shadow_map_size;
                    this.current_light.shadow.mapSize.height = this.shadow_map_size;
                    this.current_light.shadow.bias = this.shadow_bias; // prevent shadow acne
                    this.current_light.shadow.radius = this.shadow_radius;

                    this.current_light.shadow.camera.position.set(this.position.x, this.position.y, this.position.z);
                    this.current_light.shadow.camera.near = this.shadow_camera_near;
                    this.current_light.shadow.camera.far =  this.shadow_camera_far;
                    
                    if(instantiate === true){
                        this.lights.push(this.current_light);
                    }
                }
                else {
                    if(instantiate === true) {
                        this.target = new THREE.Object3D();
                    }
                    this.target.position.set(this.model.get("target_x"), this.model.get("target_y"), this.model.get("target_z"));
                    this.target.updateMatrixWorld();
                    if(instantiate === true) {
                        this.renderer.scene_scatter.add(this.target);
                    }
                    if(this.light_type === this.LIGHT_TYPES.DIRECTIONAL) {

                        this.shadow_camera_orthographic_size = this.model.get("shadow_camera_orthographic_size");
                        if(instantiate === true) {
                            this.current_light = new THREE.DirectionalLight(this.light_color, this.intensity);
                        }
                        else {
                            this.current_light.color.set(this.light_color);
                            this.current_light.intensity = this.intensity;
                        }
                        this.current_light.position.set(this.position.x, this.position.y, this.position.z);
                        this.current_light.target = this.target;
                        this.current_light.castShadow = this.cast_shadow;
            
                        this.current_light.shadow.mapSize.width = this.shadow_map_size;
                        this.current_light.shadow.mapSize.height = this.shadow_map_size;
                        this.current_light.shadow.bias = this.shadow_bias; // prevent shadow acne
                        this.current_light.shadow.radius = this.shadow_radius;
                        
                        this.current_light.shadow.camera = new THREE.OrthographicCamera( -this.shadow_camera_orthographic_size/2,
                                                                                        this.shadow_camera_orthographic_size/2, 
                                                                                        this.shadow_camera_orthographic_size/2, 
                                                                                        -this.shadow_camera_orthographic_size/2, 
                                                                                        this.shadow_camera_near, 
                                                                                        this.shadow_camera_far );
                        this.current_light.shadow.camera.position.set(this.position.x, this.position.y, this.position.z);

                        this.current_light.castShadow = this.cast_shadow;
                        if(instantiate === true) {
                            this.lights.push(this.current_light);
                        }
                    }
                    else if(this.light_type === this.LIGHT_TYPES.SPOT) {
                            
                            this.angle = this.model.get("angle");
                            this.penumbra = this.model.get("penumbra");

                            this.shadow_camera_perspective_fov = this.model.get("shadow_camera_perspective_fov");
                            this.shadow_camera_perspective_aspect = this.model.get("shadow_camera_perspective_aspect");
                            if(instantiate === true) {
                                this.current_light = new THREE.SpotLight(this.light_color, this.intensity);
                            }
                            else {
                                this.current_light.color.set(this.light_color);
                                this.current_light.intensity = this.intensity;
                            }
                            this.current_light.position.set(this.position.x, this.position.y, this.position.z);
                            this.current_light.target = this.target;
                            this.current_light.angle = this.angle;
                            this.current_light.distance = this.distance;
                            this.current_light.decay = this.decay;
                            this.current_light.penumbra = this.penumbra;
                            this.current_light.castShadow = this.cast_shadow;
                            
                            this.current_light.shadow.mapSize.width = this.shadow_map_size;
                            this.current_light.shadow.mapSize.height = this.shadow_map_size;
                            this.current_light.shadow.bias = this.shadow_bias; // prevent shadow acne
                            this.current_light.shadow.radius = this.shadow_radius;

                            this.current_light.shadow.camera = new THREE.PerspectiveCamera(this.shadow_camera_perspective_fov,
                                this.shadow_camera_perspective_aspect, 
                                this.shadow_camera_near,
                                this.shadow_camera_far);

                            this.current_light.shadow.camera.position.set(this.position.x, this.position.y, this.position.z);
                            
                            if(instantiate === true) {
                                this.lights.push(this.current_light);
                            }
                           
                    }
                       
                }

            }
        } 

        
    }
}

export
class LightModel extends widgets.WidgetModel {
    static serializers = {
        ...widgets.WidgetModel.serializers,
        light_color: serialize.color_or_json,
        light_color2: serialize.color_or_json,
        intensity: serialize.array_or_json,
        position_x: serialize.array_or_json,
        position_y: serialize.array_or_json,
        position_z: serialize.array_or_json,
        target_x: serialize.array_or_json,
        target_y: serialize.array_or_json,
        target_z: serialize.array_or_json,
        angle: serialize.array_or_json, 
        distance: serialize.array_or_json,
        decay: serialize.array_or_json,
        penumbra: serialize.array_or_json,
        shadow_map_size: serialize.array_or_json,
        shadow_bias: serialize.array_or_json,
        shadow_radius: serialize.array_or_json,
        shadow_camera_near: serialize.array_or_json,
        shadow_camera_far: serialize.array_or_json,
        shadow_camera_perspective_fov: serialize.array_or_json,
        shadow_camera_perspective_aspect: serialize.array_or_json,
        shadow_camera_orthographic_size: serialize.array_or_json,
    };
    defaults() {
        return {
            ...super.defaults(),
            _model_name : "LightModel",
            _view_name : "LightView",
            _model_module : "ipyvolume",
            _view_module : "ipyvolume",
            _model_module_version: semver_range,
            _view_module_version: semver_range,
            light_type: 'AMBIENT',
            shadow_map_type: 'PCF_SOFT',
            light_color: "red",
            light_color2: "white",
            intensity: 1,
            position_x: 0,
            position_y: 1,
            position_z: 0,
            target_x: 0,
            target_y: 0,
            target_z: 0,
            angle: Math.PI/3, 
            distance: 0,
            decay: 1,
            penumbra: 0,
            cast_shadow: false,
            shadow_map_size: 512,
            shadow_bias: -0.0005,
            shadow_radius: 1,
            shadow_camera_near: 0.5,
            shadow_camera_far: 500,
            shadow_camera_perspective_fov: 50,
            shadow_camera_perspective_aspect: 1,
            shadow_camera_orthographic_size: 5
        };
    }
}
