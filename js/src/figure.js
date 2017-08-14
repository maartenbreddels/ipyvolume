widgets = require("@jupyter-widgets/base")
_ = require("underscore")
THREE = require("three")
THREEtext2d = require("three-text2d")
glm = require("gl-matrix")
d3 = require("d3")
screenfull = require("screenfull")
require('style!css!./style.css')

// same strategy as: ipywidgets/jupyter-js-widgets/src/widget_core.ts, except we use ~
// so that N.M.x is allowed (we don't care about x, but we assume 0.2.x is not compatible with 0.3.x
var semver_range = require('./utils.js').semver_range;
var axis_names = ['x', 'y', 'z']
var styles = require('../data/style.json')

var scatter = require('./scatter.js')
var mesh = require('./mesh.js')
//
window.THREE = THREE;
//window.THREEx = {};
require("./three/OrbitControls.js")
require("./three/TrackballControls.js")
require("./three/DeviceOrientationControls.js")
require("./three/StereoEffect.js")
require("./three/THREEx.FullScreen.js")
require("./three/CombinedCamera.js")
ndarray = require('ndarray')

function is_ndarray(obj) {
    // not sure how to approach this, this will do for the moment
    return (typeof obj.shape != "undefined") && (typeof obj.data != "undefined")
}

var shaders = {}
shaders["cube_fragment"] = require('../glsl/cube-fragment.glsl');
shaders["cube_vertex"] = require('../glsl/cube-vertex.glsl');
shaders["box_fragment"] = require('../glsl/box-fragment.glsl');
shaders["box_vertex"] = require('../glsl/box-vertex.glsl');
shaders["texture_fragment"] = require('../glsl/texture-fragment.glsl');
shaders["texture_vertex"] = require('../glsl/texture-vertex.glsl');
shaders["volr_fragment"] = require('../glsl/volr-fragment.glsl');
shaders["volr_vertex"] = require('../glsl/volr-vertex.glsl');
shaders["screen_fragment"] = require('../glsl/screen-fragment.glsl');
shaders["screen_vertex"] = require('../glsl/screen-vertex.glsl');



function to_rgb(color) {
    color = new THREE.Color(color)
    return [color.r, color.g, color.b]
}

// similar to _.bind, except it
// puts this as first argument to f, followed be other arguments, and make context f's this
function bind_d3(f, context) {
    return function() {
        var args  = [this].concat([].slice.call(arguments)) // convert argument to array
        f.apply(context, args)
    }
}

var download_image = function(data) {
    var a = document.createElement('a')
    a.download = 'ipyvolume.png'
    a.href = data
    // see https://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
    if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0, false, false, false,
                         false, 0, null);

        a.dispatchEvent(e);
    } else if (lnk.fireEvent) {
        a.fireEvent("onclick");
    }
}
function SelectText(element) {
    var doc = document;
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
var copy_image_to_clipboard = function(data) {
    // https://stackoverflow.com/questions/27863617/is-it-possible-to-copy-a-canvas-image-to-the-clipboard
    var img = document.createElement('img');
    img.contentEditable = true;
    img.src = data

    var div = document.createElement('div');
    div.contentEditable = true;
    div.appendChild(img);
    document.body.appendChild(div);

    // do copy
    SelectText(img);
    document.execCommand('Copy');
    document.body.removeChild(div);
}

ToolIcon = function(className, parent) {
    this.a = document.createElement('a')
    this.a.className = 'ipyvolume-toolicon'
    this.a.setAttribute('href', '#')
    this.li = document.createElement('li')
    this.li.className = 'fa ' + className
    this.a.appendChild(this.li)
    parent.appendChild(this.a)
    this.active = (state) => {
        if(state)
            this.li.classList.remove('fa-inactive')
        else
            this.li.classList.add('fa-inactive')
    }
}

var FigureView = widgets.DOMWidgetView.extend( {
    render: function() {
        this.transitions = []
        this._update_requested = false
        this.update_counter = 0
        var width = this.model.get("width");
        var height = this.model.get("height");

        this.toolbar_div = document.createElement('div')
        this.el.appendChild(this.toolbar_div)

        var keydown = _.bind(this._special_keys_down, this);
        var keyup = _.bind(this._special_keys_up, this)
        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);
        this.once('remove', () => {
            console.log('remove key listeners')
            document.removeEventListener('keydown', keydown)
            document.removeEventListener('keyup', keyup)
        })
        // set up fullscreen button
        // this is per view, so it's not exposed on the python side
        // which is ok, since it can only be triggered from a UI action
        this.fullscreen_icon = new ToolIcon('fa-arrows-alt', this.toolbar_div)
        this.fullscreen_icon.a.title = 'Fullscreen'
        this.fullscreen_icon.a.onclick = _.bind(function() {
            var el = this.renderer.domElement
            var old_width = el.style.width
            var old_height = el.style.height
            var restore = _.bind(function() {
                if(!screenfull.isFullscreen) {
                    console.log('is not fullscreen')
                    console.log('restore and detach')
                    el.style.width = old_width;
                    el.style.height = old_height
                    screenfull.off('change', restore)
                } else {
                    console.log('is fullscreen')
                    el.style.width = '100vw'
                    el.style.height = '100vh'
                }
                this.update_size()
            }, this)
            screenfull.onchange(restore)
            screenfull.request(el);
        }, this);

        this.stereo_icon = new ToolIcon('fa-eye', this.toolbar_div)
        this.stereo_icon.a.title = 'Stereoscopic view'
        this.stereo_icon.a.onclick = _.bind(function() {
            this.model.set('stereo', !this.model.get('stereo'))
            this.model.save_changes()
        }, this)
        this.stereo_icon.active(this.model.get('stereo'))
        this.model.on('change:stereo', () => {
            this.stereo_icon.active(this.model.get('stereo'))
        })

        this.screenshot_icon = new ToolIcon('fa-picture-o', this.toolbar_div)
        this.screenshot_icon.a.title = 'Make screensot (hold shift to copy to clipboard)'
        this.screenshot_icon.a.onclick = (event) =>  {
            console.log(event.ctrlKey)
            try {
                var data = this.screenshot()
                if(event.shiftKey) {
                    copy_image_to_clipboard(data)
                } else {
                    download_image(data)
                }
            } finally { // make sure we don't open a new window when we hold shift
                event.preventDefault()
                return false;
            }
        }

        this.camera_control_icon = new ToolIcon('fa-arrow-up', this.toolbar_div)
        this.camera_control_icon.a.title = 'Camera locked to \'up\' axis (orbit), instead of trackball mode'
        this.camera_control_icon.a.onclick = () => {
            var mode = this.model.get('camera_control')
            if(mode == 'trackball') {
                var mode = this.model.get('camera_control')
                this.model.set('camera_control', 'orbit')
                this.camera_control_icon.active(true)
                console.log('orbit')
            } else {
                this.model.set('camera_control', 'trackball')
                this.camera_control_icon.active(false)
                console.log('trackball')
            }
            this.model.save_changes()
        }
        this.camera_control_icon.active(false)

        this.select_icon = new ToolIcon('fa-pencil-square-o', this.toolbar_div)
        this.select_icon.a.title = 'Select mode (auto when control key is pressed)'
        this.select_icon.a.onclick = () => {
        }
        this.select_icon.active(false)

        this.reset_icon = new ToolIcon('fa-refresh', this.toolbar_div)
        this.reset_icon.a.title = 'Reset view'
        var initial_angle_x = this.model.get('anglex')
        var initial_angle_y = this.model.get('angley')
        var initial_angle_z = this.model.get('anglez')
        var initial_fov = this.model.get("camera_fov")
        this.reset_icon.a.onclick = () => {
            this.model.set({anglex: initial_angle_x,
                            angley: initial_angle_y,
                            anglez: initial_angle_z,
                            camera_fov: initial_fov})
            this.model.save_changes()
        }

        // set up WebGL using threejs
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.el.classList.add("jupyter-widgets");
        this.el.appendChild(this.renderer.domElement);
        this.el.setAttribute('tabindex', '1') // make sure we can have focus

        // el_mirror is a 'mirror' dom tree that d3 needs
        // we use it to attach axes and tickmarks to the dom
        // which reflect the objects in the scene
        this.el_mirror = document.createElement("div")
        this.el.appendChild(this.el_mirror);
        this.el_axes = document.createElement("div")
        this.el_mirror.appendChild(this.el_axes);

        //const VIEW_ANGLE = this.model.get("camera_fov");
        //const aspect = width / height;
        const NEAR = 0.01;
        const FAR = 10000;
        const orthoNEAR = -500;
        const orthoFAR = 1000;
        this.camera = new THREE.CombinedCamera(
            window.innerWidth/2,
            window.innerHeight/2,
            this.model.get("camera_fov"),
            //aspect,
            NEAR,
            FAR,
            orthoNEAR,
            orthoFAR
        );
        //this.camera.toOrthographic()
        this.camera_stereo = new THREE.StereoCamera()
        this.renderer.setSize(width, height);

        this.renderer_stereo = new THREE.StereoEffect(this.renderer);
        this.renderer_selected = this.renderer_stereo;

        this.box_geo = new THREE.BoxBufferGeometry(1, 1, 1)
        //this.box_material = new THREE.MeshLambertMaterial({color: 0xCC0000});
        this.box_material = new THREE.ShaderMaterial({
            fragmentShader: shaders["box_fragment"],
            vertexShader: shaders["box_vertex"],
            side: THREE.BackSide
        });
        this.box_mesh = new THREE.Mesh(this.box_geo, this.box_material)
        //this.box_mesh.position.z = -5;
        this.box_mesh.updateMatrix()
        this.box_mesh.matrixAutoUpdate = true

        this.box_geo_edges = new THREE.EdgesGeometry( this.box_geo )
        this.box_material_wire = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1. } );
        this.box_mesh_wire = new THREE.LineSegments(this.box_geo, this.box_material)

        var make_line = function(x1, y1, z1, x2, y2, z2, material) {
            //var linewidth = 2;
            //var material = new THREE.LineBasicMaterial({color: color, linewidth: linewidth});
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3( x1, y1, z1 ), new THREE.Vector3( x2, y2, z2));
            return new THREE.Line( geometry, material );
        }
        var make_axis = function(x, y, z, material) {
            return make_line(-0.5, -0.5, -0.5 ,  -0.5+x, -0.5+y, -0.5+z, material)
        }
        var linewidth = 1;
        this.axes_material = new THREE.LineBasicMaterial({color: "cyan", linewidth: linewidth});
        this.xaxes_material = new THREE.LineBasicMaterial({color: "red", linewidth: linewidth});
        this.yaxes_material = new THREE.LineBasicMaterial({color: "green", linewidth: linewidth});
        this.zaxes_material = new THREE.LineBasicMaterial({color: "blue", linewidth: linewidth});
        this.x_axis = make_axis(1, 0, 0, this.xaxes_material)
        this.y_axis = make_axis(0, 1, 0, this.yaxes_material)
        this.z_axis = make_axis(0, 0, 1, this.zaxes_material)
        this.axes = new THREE.Object3D()
        this.axes.add(this.x_axis)
        this.axes.add(this.y_axis)
        this.axes.add(this.z_axis)

        this.wire_box = new THREE.Object3D()
        var grey = 0xCCccCC;
        //this.wire_box.add(make_line(-0.5, -0.5, -0.5, -0.5+1, -0.5, -0.5, grey))
        this.wire_box.add(make_line(-0.5, -0.5+1, -0.5, -0.5+1, -0.5+1, -0.5, this.axes_material))
        this.wire_box.add(make_line(-0.5, -0.5, -0.5+1, -0.5+1, -0.5, -0.5+1, this.axes_material))
        this.wire_box.add(make_line(-0.5, -0.5+1, -0.5+1, -0.5+1, -0.5+1, -0.5+1, this.axes_material))

        //this.wire_box.add(make_line(-0.5, -0.5, -0.5, -0.5, -0.5+1, -0.5, this.axes_material))
        this.wire_box.add(make_line(-0.5+1, -0.5, -0.5, -0.5+1, -0.5+1, -0.5, this.axes_material))
        this.wire_box.add(make_line(-0.5, -0.5, -0.5+1, -0.5, -0.5+1, -0.5+1, this.axes_material))
        this.wire_box.add(make_line(-0.5+1, -0.5, -0.5+1, -0.5+1, -0.5+1, -0.5+1, this.axes_material))

        //this.wire_box.add(make_line(-0.5, -0.5, -0.5, -0.5, -0.5, -0.5+1, this.axes_material))
        this.wire_box.add(make_line(-0.5+1, -0.5, -0.5, -0.5+1, -0.5, -0.5+1, this.axes_material))
        this.wire_box.add(make_line(-0.5, -0.5+1, -0.5, -0.5, -0.5+1, -0.5+1, this.axes_material))
        this.wire_box.add(make_line(-0.5+1, -0.5+1, -0.5, -0.5+1, -0.5+1, -0.5+1, this.axes_material))

        // set a good intial z for any fov angle
        // see maartenbreddels/ipyvolume#40 for explanation
        this.camera.position.z = 2 * this.getTanDeg(45/2) / this.getTanDeg(this.model.get("camera_fov")/2)


        // d3 data
        this.axes_data = [
                {name: 'x', label: 'x', object: null, object_label: null, translate: [ 0.0, -0.5, -0.5], rotate: [Math.PI/4, 0, 0], rotation_order: 'XYZ'},
                {name: 'y', label: 'y', object: null, object_label: null, translate: [-0.5,  0.0, -0.5], rotate: [Math.PI*3/4, 0, Math.PI/2], rotation_order: 'ZXY'},
                {name: 'z', label: 'z', object: null, object_label: null,translate: [-0.5, -0.5,  0.0], rotate: [-Math.PI/8, -Math.PI/2, 0], rotation_order: 'YZX'}
            ]

        this.ticks = 5; //hardcoded for now

        this.scene = new THREE.Scene();
        //this.scene.add(this.camera);
        this.scene.add(this.box_mesh)

        this.scene_scatter = new THREE.Scene();
        //this.scene_scatter.add(this.camera);

        this.scene_opaque = new THREE.Scene();
        //this.scene_opaque.add(this.camera);
        this.scene_opaque.add(this.wire_box)
        this.scene_opaque.add(this.axes)

        var render_width = width;
        var render_height = height;
        if(this.model.get("stereo"))
            render_width /= 2;
        render_width /= this.model.get("downscale")
        render_height /= this.model.get("downscale")

        this.back_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.front_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.volr_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

        this.screen_texture = this.volr_texture
        this.screen_scene = new THREE.Scene();
        this.screen_plane = new THREE.PlaneBufferGeometry( 1.0, 1.0 );
        this.screen_material = new THREE.ShaderMaterial( {
					uniforms: { tex: { type: 't', value: this.front_texture.texture } },
					vertexShader: shaders["screen_vertex"],
					fragmentShader: shaders["screen_fragment"],
					depthWrite: false

				} );

        this.screen_mesh = new THREE.Mesh(this.screen_plane, this.screen_material );
        this.screen_scene.add(this.screen_mesh)
        this.screen_camera = new THREE.OrthographicCamera( 1 / - 2, 1 / 2, 1 / 2, 1 / - 2, -10000, 10000 );
        this.screen_camera.position.z = 10;


        // we rely here on these events listeners to be executed before those of the controls
        // since we disable the controls, seems to work on chrome
        this.renderer.domElement.addEventListener('mousedown', _.bind(this._mouse_down, this), false);
        this.renderer.domElement.addEventListener('mousemove', _.bind(this._mouse_move, this), false);
        window.addEventListener('mouseup', _.bind(this._mouse_up, this), false);
        this.capture_mouse = false
        this.mouse_trail = [] // list of x, y positions


        this.control_trackball = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        this.control_orbit = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.control_trackball.noPan = true;
        this.control_orbit.enablePan = false;
        this.control_trackball.enabled = this.model.get('camera_control') == 'trackball'
        this.control_orbit.enabled = this.model.get('camera_control') == 'orbit'

        //this.controls_device = controls = new THREE.DeviceOrientationControls( this.box_mesh );
		window.addEventListener( 'deviceorientation', _.bind(this.on_orientationchange, this), false );
		//window.addEventListener( 'deviceorientation', _.bind(this.update, this), false );
        //this.controls.


        this.texture_loader = new THREE.TextureLoader()

        this.texture_tf = null;//new THREE.DataTexture(null, this.model.get("tf").get("rgba").length, 1, THREE.RGBAFormat, THREE.UnsignedByteType)

        this.box_material_volr = new THREE.ShaderMaterial({
            uniforms: {
                front: { type: 't', value: null },
                back : { type: 't', value: null },
                volume : { type: 't', value: null },
                transfer_function : { type: 't', value: this.texture_tf },
                brightness : { type: "f", value: 2. },
                data_min : { type: "f", value: 0. },
                data_max : { type: "f", value: 1. },
                volume_rows : { type: "f", value: 8. },
                volume_columns : { type: "f", value: 16. },
                volume_slices : { type: "f", value: 128. },
                volume_size : { type: "2f", value: [2048., 1024.] },
                volume_slice_size : { type: "2f", value: [128., 128.] },
                ambient_coefficient : { type: "f", value: this.model.get("ambient_coefficient") },
                diffuse_coefficient : { type: "f", value: this.model.get("diffuse_coefficient") },
                specular_coefficient : { type: "f", value: this.model.get("specular_coefficient") },
                specular_exponent : { type: "f", value: this.model.get("specular_exponent") },
                render_size : { type: "2f", value: [render_width, render_height] },
            },
            blending: THREE.CustomBlending,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            blendEquation: THREE.AddEquation,
            transparent: true,
            fragmentShader: shaders["volr_fragment"],
            vertexShader: shaders["volr_vertex"],
            side: THREE.BackSide
        });
        //this.volume_changed()
        this.update_size()
        this.tf_set()
        this.data_set()

        var that = this;
        //*
        this.el.addEventListener( 'change', _.bind(this.update, this) ); // remove when using animation loop

        this.model.on('change:xlabel change:ylabel change:zlabel change:camera_control', this.update, this);
        this.model.on('change:render_continuous', this.update, this)
        this.model.on('change:style', this.update, this);
        this.model.on('change:xlim change:ylim change:zlim ', this.update, this);
        this.model.on('change:xlim change:ylim change:zlim ', this._save_matrices, this);
        this.model.on('change:downscale', this.update_size, this);
        this.model.on('change:stereo', this.update_size, this);
        this.model.on('change:anglex change:angley change:anglez', this.update_current_control, this);
        this.model.on('change:angle_order', this.update_current_control, this)
        this.model.on('change:volume_data', this.data_set, this);
        this.model.on('change:eye_separation', this.update, this)

        this.model.on('change:camera_fov', this.update_current_control, this)

        this.model.on('change:width', this.update_size, this);
        this.model.on('change:height', this.update_size, this);

        this.model.on('change:ambient_coefficient', this.update_light, this);
        this.model.on('change:diffuse_coefficient', this.update_light, this);
        this.model.on('change:specular_coefficient', this.update_light, this);
        this.model.on('change:specular_exponent', this.update_light, this);

        this.model.on('change:tf', this.tf_set, this)
        this.listenTo(this.model, 'msg:custom', _.bind(this.custom_msg, this));

        this.control_trackball.addEventListener( 'end', _.bind(this.update_angles, this) );
        this.control_orbit.addEventListener( 'end', _.bind(this.update_angles, this) );
        this.control_trackball.addEventListener( 'change', _.bind(this.update, this) );
        this.control_orbit.addEventListener( 'change', _.bind(this.update, this) );

        this.renderer.domElement.addEventListener( 'resize', _.bind(this.on_canvas_resize, this), false );
        this.update()

        this.meshes = []
        this.scatters = [] /*new widgets.ViewList(_.bind(function add(model) {
                console.log("adding")
                console.log(model)
                scatter_view = new ScatterView()
                scatter_view.model = model
                scatter_view.options = _.pick(this.options, 'register_update', 'renderer_id')
                scatter_view.initialize({options:scatter_view.options})
                scatter_view.render()
                return scatter_view
                //this.model.widget_manager.
                var view_promise = this.create_child_view(model, _.pick(this.options, 'register_update', 'renderer_id'))
                console.log("view promise" +view_promise)
                return Promose.resolve()
                /*return view_promise.then(_.bind(function(view) {
                            console.log("added view")
                            console.log(view)
                            this.update();
                            return view;
                        }, this));
            }, this),
            _.bind(function remove(view) {
                console.log("removing scatter from scene")
                view.remove_from_scene()
                view.remove()
            }, this)

        )*/
         this.model.on('change:scatters', this.update_scatters, this)
         this.update_scatters()
         this.model.on('change:meshes', this.update_meshes, this)
         this.update_meshes()


        function onWindowResize(){

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        window.last_volume = this;
        //navigator.wakeLock.request("display")

        //ensure initial sync of view with figure model
        this.update_current_control();
        this.update_light();

        //this.el.addEventListener("mousedown", _.bind(this._special_keys_down, this));
        //this.el.addEventListener("keyup", _.bind(this._special_keys_up, this));
        var stream = this.renderer.domElement.captureStream()
        this.model.stream = Promise.resolve(stream)
        window.last_figure_stream = (stream)
        console.log('set this figure as last stream')
        // keep track over hover status manually
        this.renderer.domElement.onmouseover = () => {
            console.log('hover')
            this.hover = true
        }
        this.renderer.domElement.onmouseleave = () => {
            console.log('!hover')
            this.hover = false
        }
    },
    _mouse_down: function(e) {
        console.log('mouse down', e)
        window.last_event = e
        if(e.ctrlKey) {
            console.log('pressed ctrl and mouse down')
            this.capture_mouse = true
            this.control_trackball.enabled = false
            this.control_orbit.enabled = false
        }
    },
    _mouse_move: function(e) {
        if (!e)
        var e = event;
        var mouseX, mouseY;
        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
        if(this.capture_mouse)
            this.mouse_trail.push([mouseX, mouseY])
    },
    _mouse_up: function(e) {
        if(this.capture_mouse) {
            this.control_trackball.enabled = true
            this.control_orbit.enabled = true
            this.capture_mouse = false
            console.log('mouse trail', this.mouse_trail)
            var data = {}
            var canvas = this.renderer.domElement
            data['pixel'] = this.mouse_trail
            // gl's normalized device coordinates, [-1, 1]
            data['device'] = _.map(this.mouse_trail, function(xy) {
                return [xy[0] / canvas.clientWidth * 2 - 1, 1 - xy[1] / canvas.clientHeight * 2]
            }, this)
            this.send({event: 'lasso', data: data});
            // send event..
            this.mouse_trail = []
        }
        if(e.ctrlKey) {
            console.log('pressed ctrl')
        }
    },
    _special_keys_down: function(e) {
        var evtobj = window.event? event : e
        if(evtobj.altKey) {
            console.log('pressed alt', this.hover)
        }
        if(evtobj.keyCode == 17) {  // ctrl
            console.log('pressed ctrl', this.hover)
            if(this.hover) {
                this.select_icon.active(true)
            }
        }
    },
    _special_keys_up: function(e) {
        console.log('uppy', e, window.event)
        var evtobj = window.event? event : e
        if(evtobj.altKey) {
            console.log('released alt', this.hover)
        }
        if(evtobj.keyCode == 17) { // ctrl
            console.log('released ctrl', this.hover)
            this.select_icon.active(false)
        }
    },
    custom_msg: function(content) {
        console.log('content', content)
        if(content.msg == 'screenshot') {
            var data = this.screenshot(undefined, content.width, content.height)
            this.send({event: 'screenshot', data: data});
        }
    },
    screenshot: function(mime_type, width, height) {
        var resize = width && height
        try {
            if(resize)
                this._update_size(true, width, height)
            this._real_update()
            var data = this.renderer.domElement.toDataURL(mime_type || 'image/png');
            console.info("captured screenshot")
            return data
        } finally {
            if(resize)
                this._update_size(false)
        }
    },
    _d3_add_axis: function(node, d, i) {
        //console.log("add axis", d, i)
        var axis = new THREE.Object3D()
        axis.translateX(d.translate[0])
        axis.translateY(d.translate[1])
        axis.translateZ(d.translate[2])
        d3.select(node).attr("translate-x", d.translate[0])
        d3.select(node).attr("translate-y", d.translate[1])
        d3.select(node).attr("translate-z", d.translate[2])
        //this.axis_x.rotateY(Math.PI/2)
        axis.rotation.reorder(d.rotation_order)
        axis.rotation.x = d.rotate[0]
        axis.rotation.y = d.rotate[1]
        axis.rotation.z = d.rotate[2]
        this.axes.add(axis)

        var s = 0.01*0.4
        // TODO: puzzled by the align not working as expected..
        var aligns = {x: THREEtext2d.textAlign.topRight, y:THREEtext2d.textAlign.topRight, z:THREEtext2d.textAlign.center}
        var label = new THREEtext2d.SpriteText2D(d.label, { align: aligns[d.name], font: '30px Arial', fillStyle: '#00FF00', antialias: true })
        label.material.transparent = true
        label.material.alphaTest = 0.01
        label.scale.set(s,s,s)
        axis.add(label)
        d.object_label = label;
        d.object = axis;
        d.scale = d3.scaleLinear().domain(this.model.get(d.name + "lim")).range([-0.5, 0.5])
        d.ticks = null
    },
    _d3_update_axis: function(node, d, i) {
        //console.log("update axis", d, this.model.get(d.name + "lim"))
        d.object_label.text = d.label;
        d.object_label.fillStyle = d.fillStyle;
        var n = d.name // x, y or z
        d.object_label.fillStyle = this.get_style('axes.' +n +'.label.color axes.'   +n +'.color axes.label.color axes.color')
        d.object_label.visible = this.get_style(  'axes.' +n +'.label.visible axes.' +n +'.visible axes.label.visible axes.visible')
        d.scale = d3.scaleLinear().domain(this.model.get(d.name + "lim")).range([-0.5, 0.5])
    },
    _d3_add_axis_tick: function(node, d, i) {
        //console.log("add tick", d, node, d3.select(d3.select(node).node().parentNode))
        var parent_data = d3.select(d3.select(node).node().parentNode).datum(); // TODO: find the proper way to do so
        var scale = parent_data.scale;

        var tick_format = scale.tickFormat(this.ticks, ".1f");
        var tick_text = tick_format(d.value);

        // TODO: puzzled by the align not working as expected..
        var aligns = {x: THREEtext2d.textAlign.topRight, y:THREEtext2d.textAlign.topRight, z:THREEtext2d.textAlign.center}
        var sprite =  new THREEtext2d.SpriteText2D(tick_text, { align: aligns[parent_data.name], font: '30px Arial', fillStyle: '#00FF00', antialias: true })
        sprite.material.transparent = true
        //sprite.material.alphaTest = 0.1
        sprite.blending = THREE.CustomBlending
        sprite.blendSrc = THREE.SrcAlphaFactor
        sprite.blendDst = THREE.OneMinusSrcAlphaFactor
        sprite.blendEquation = THREE.AddEquation
        var s = 0.01*0.4*0.5;
        //sprite.position.x = scale(d.value)
        //sprite.scale.set(s,s,s)
        sprite.scale.multiplyScalar(s)
        var n = parent_data.name // x, y or z
        sprite.fillStyle = this.get_style('axes.' +n +'.ticklabel.color axes.ticklabel.color axes.' +n +'.color axes.color')
        parent_data.object.add(sprite)
        d.object_ticklabel = sprite;
        return sprite

        sprite.text = tick_text[i]
        sprite.fillStyle = this.model.get("style")[parent_data.name + 'axis.color']
    },
    _d3_update_axis_tick: function(node, d, i) {
        var parent_data = d3.select(d3.select(node).node().parentNode).datum(); // TODO: find the proper way to do so
        //console.log("update tick", d, i, parent_data)
        var scale = parent_data.scale;
        var tick_format = scale.tickFormat(this.ticks, ".1f");
        var tick_text = tick_format(d.value);
        d.object_ticklabel.text = tick_text
        d.object_ticklabel.position.x = scale(d.value)
        var n = parent_data.name // x, y or z
        d.object_ticklabel.fillStyle = this.get_style('axes.' +n +'.ticklabel.color axes.ticklabel.color axes.' +n +'.color axes.color')
        d.object_ticklabel.visible = this.get_style('axes.' +n +'.ticklabel.visible axes.' +n +'.visible axes.visible')
        //d.object_ticklabel.fillStyle = this.model.get("style")[parent_data.name + 'axis.color']
    },
    _d3_remove_axis_tick: function(node, d, i) {
        //console.log("remove tick", d, i)
        d.object_ticklabel.text = "" // TODO: removing and adding new tick marks will result in just many empty text sprites
    },
    update_scatters: function() {
        var scatters = this.model.get('scatters');
        console.log("update scatters")
        console.log(scatters)
        if(scatters) {
            //this.scatters.update(scatters);
            this.scatter_views = _.map(scatters, function(model) {
                var options = {parent: this}
                var scatter_view = new scatter.ScatterView({options: options, model: model})
                scatter_view.render()
                return scatter_view
            }, this)
         } else {
            scatter_views = []
         }
    },
    update_meshes: function() {
        var meshes = this.model.get('meshes');
        console.log("update meshes")
        console.log(meshes)
        if(meshes) {
            //this.meshes.update(meshes);
            this.mesh_views = _.map(meshes, function(model) {
                var options = {parent: this}
                var mesh_view = new mesh.MeshView({options: options, model: model})
                mesh_view.render()
                return mesh_view
            }, this)
         } else {
            mesh_views = []
         }
    },
    transition: function(f, on_done, context) {
        var that = this;
        var Transition = function() {
            //this.objects = []
            this.time_start = (new Date()).getTime();
            this.duration = that.model.get("animation");
            this.cancelled = false;
            this.called_on_done = false
            this.set = function(obj) {
                this.objects.push(obj)
            }
            this.is_done = function() {
                var dt = (new Date()).getTime() - this.time_start;
                return (dt >= this.duration) || this.cancelled
            }
            this.cancel = function() {
                this.cancelled = true;
            },
            this.update = function() {
                if(this.cancelled)
                    return
                var dt = ((new Date()).getTime() - this.time_start)/this.duration;

                var u = Math.min(1, dt);
                u = Math.pow(u, that.model.get("animation_exponent"))
                f.apply(context, [u]);
                if(dt >= 1 && !this.called_on_done) {
                    this.called_on_done = true
                    on_done.apply(context)
                }
            }
            that.transitions.push(this)
        }
        return new Transition()
    },
    on_orientationchange: function(e) {
        /*this.box_mesh.rotation.reorder( "ZXY" );
        this.box_mesh.rotation.y = -e.alpha * Math.PI / 180;
        this.box_mesh.rotation.x = -(e.gamma * Math.PI / 180 + Math.PI*2);
        this.box_mesh.rotation.z = -(e.beta * Math.PI / 180 + Math.PI*2);
        this.box_mesh.rotation.z = -((e.alpha-180) * Math.PI / 180);
        this.box_mesh.rotation.x = -(e.beta * Math.PI / 180 + Math.PI*2);
        this.box_mesh.rotation.y = -(e.gamma * Math.PI / 180 + Math.PI*2);*/

        _.each([this.scene, this.scene_opaque, this.scene_scatter], function(scene){
            scene.rotation.reorder( "XYZ" );
            scene.rotation.x = (e.gamma * Math.PI / 180 + Math.PI*2);
            scene.rotation.y = -(e.beta * Math.PI / 180 + Math.PI*2);
            scene.rotation.z = -((e.alpha) * Math.PI / 180);
        }, this)
        this.update()

    },
    on_canvas_resize: function(event) {
        console.log(event)
    },
    keypress: function(event) {
        console.log("key press")
        console.log(event)
        var code = event.keyCode || event.which;
        if (event.keyCode == 27) {
        }
        if (event.key == 'f') {
        }
    },
    update_angles: function() {
        console.log("camera", this.camera.rotation)
        var rotation = new THREE.Euler().setFromQuaternion(this.camera.quaternion, this.model.get('angle_order'));
        this.model.set({anglex: rotation.x, angley: rotation.y, anglez: rotation.z})
        this.model.save_changes()
        this._save_matrices()
        this.update()
    },
    _get_scale_matrix: function() {
        // go from [0, 1] to [-0.5, 0.5]
        var matrix = new THREE.Matrix4()
        matrix.makeTranslation(-0.5, -0.5, -0.5)

        var matrix_scale = new THREE.Matrix4()
        var x = this.model.get('xlim')
        var y = this.model.get('ylim')
        var z = this.model.get('zlim')
        var sx = 1/(x[1] - x[0])
        var sy = 1/(y[1] - y[0])
        var sz = 1/(z[1] - z[0])
        matrix_scale.makeScale(sx, sy, sz)
        var translation = new THREE.Matrix4()
        translation.makeTranslation(-x[0], -y[0], -z[0])
        matrix.multiply(matrix_scale)
        matrix.multiply(translation)
        return matrix;
    },
    _get_view_matrix() {
        // we don't really properly use the worldmatrix, rendering threejs's frustum culling
        // useless, we maybe should change this
        // https://github.com/mrdoob/three.js/issues/78#issuecomment-846917
        var view_matrix = this.camera.matrixWorldInverse.clone()
        view_matrix.multiply(this._get_scale_matrix().clone())
        return view_matrix;
    },
    _save_matrices: function() {
        this.model.set('matrix_projection', this.camera.projectionMatrix.elements.slice())
        this.model.set('matrix_world', this._get_view_matrix().elements.slice())
        console.log('setting matrices')
        this.model.save_changes()
    },
    getTanDeg: function(deg) {
      var rad = deg * Math.PI/180;
      return Math.tan(rad);
    },

    update_current_control: function() {
        var euler = new THREE.Euler(this.model.get('anglex'), this.model.get('angley'), this.model.get('anglez'), this.model.get('angle_order'))
        //console.log("updating camera", euler)
        var q = new THREE.Quaternion().setFromEuler(euler)
        //this.camera.quaternion = q

        var oldfov = this.camera.fov
        var newfov = this.model.get("camera_fov")
        this.camera.setFov(newfov);

        var target = new THREE.Vector3()
        var distance = this.camera.position.length()
        // change distance to account for new fov angle
        // see maartenbreddels/ipyvolume#40 for explanation
        var newdist = distance * this.getTanDeg(oldfov/2) / this.getTanDeg(newfov/2)

        var eye = new THREE.Vector3(0, 0, 1);
        var up = new THREE.Vector3(0, 1, 0);
        eye.applyQuaternion(q)
        eye.multiplyScalar(newdist)
        this.camera.position.copy(eye)
        this.camera.up = up
        this.camera.up.applyQuaternion(q)
        this.camera.lookAt(target);
        this.control_trackball.position0 = this.camera.position.clone()
        this.control_trackball.up0 = this.camera.up.clone()
        this.control_trackball.reset()
        //console.log("updating camera", q, this.camera, eye, distance, up, this.camera.position)
        this._save_matrices()
        this.update()
    },
    update: function() {
        // requestAnimationFrame stacks, so make sure multiple update calls only lead to 1 _real_update call
        if(!this._update_requested) {
           this._update_requested = true
            requestAnimationFrame(_.bind(this._real_update, this))
        }
    },
    _real_update: function() {
        //this.controls_device.update()
        this.control_trackball.handleResize()
        this.control_trackball.enabled = this.model.get('camera_control') == 'trackball'
        this.control_orbit.enabled = this.model.get('camera_control') == 'orbit'
        this._update_requested = false



        this.renderer.setClearColor(this.get_style_color('background-color'))
        this.x_axis.visible = this.get_style('axes.x.visible axes.visible')
        this.y_axis.visible = this.get_style('axes.y.visible axes.visible')
        this.z_axis.visible = this.get_style('axes.z.visible axes.visible')
        this.axes_material.color = this.get_style_color('axes.color')
        this.xaxes_material.color = this.get_style_color('axes.x.color axes.color')
        this.yaxes_material.color = this.get_style_color('axes.y.color axes.color')
        this.zaxes_material.color = this.get_style_color('axes.z.color axes.color')

        this.axes_data[0].fillStyle = this.get_style('axes.x.color axes.color')
        this.axes_data[1].fillStyle = this.get_style('axes.y.color axes.color')
        this.axes_data[2].fillStyle = this.get_style('axes.z.color axes.color')

        this.axes_data[0].label = this.model.get("xlabel")
        this.axes_data[1].label = this.model.get("ylabel")
        this.axes_data[2].label = this.model.get("zlabel")

        this.wire_box.visible = this.get_style('box.visible')

        d3.select(this.el_axes).selectAll(".ipyvol-axis")
                .data(this.axes_data)
                .each(bind_d3(this._d3_update_axis, this))
                .enter()
                .append("div")
                .attr("class", "ipyvol-axis")
                .each(bind_d3(this._d3_add_axis, this));

        var that = this;
        this.ticks = 5


        this.last_tick_selection = d3.select(this.el_axes).selectAll(".ipyvol-axis").data(this.axes_data).selectAll(".ipyvol-tick").data(
            function(d, i, node) {
                var child_data = d.ticks
                if(child_data) {
                    child_data = d.ticks = child_data.slice()
                    var ticks = d.scale.ticks(that.ticks)
                    while(child_data.length < ticks.length) // ticks may return a larger array, so grow child data
                        child_data.push({})
                    while(child_data.length > ticks.length) // ticks may return a smaller array, so pop child data
                        child_data.pop()
                    _.each(ticks, function(tick, i) {
                        child_data[i].value = tick;
                    });
                    return child_data
                } else {
                    var scale = d.scale;
                    var ticks = scale.ticks(that.ticks)
                    var child_data = _.map(ticks, function(value) { return {value: value}});
                    d.ticks = child_data;
                    return child_data;
                }
            })
        this.last_tick_selection
            .each(bind_d3(this._d3_update_axis_tick, this))
            .enter()
            .append("div")
            .attr("class", "ipyvol-tick")
            .each(bind_d3(this._d3_add_axis_tick, this))
        this.last_tick_selection
            .exit()
            .remove()
            .each(bind_d3(this._d3_remove_axis_tick, this))

        var transitions_todo = []
        for(var i = 0; i < this.transitions.length; i++) {
            var t = this.transitions[i];
            if(!t.is_done())
                transitions_todo.push(t)
            t.update()
        }

        this.renderer.clear()
        if(!this.model.get("stereo")) {
            this._render_eye(this.camera);
        } else {
            var size = this.renderer.getSize();
            if (this.camera.parent === null ) this.camera.updateMatrixWorld();
            this.camera_stereo.eyeSep = this.model.get('eye_separation')/100;
            this.camera.focus = this.camera.cameraP.focus
            this.camera_stereo.update(this.camera)

            // left eye
            this.renderer.setScissorTest( true );
            this.renderer.setScissor( 0, 0, size.width / 2, size.height );
            this.renderer.setViewport( 0, 0, size.width / 2, size.height );
            //this.renderer.render(this.scene, this.camera_stereo.cameraL );
            this._render_eye(this.camera_stereo.cameraL);

            // right eye
            this.renderer.setScissor( size.width / 2, 0, size.width / 2, size.height );
            this.renderer.setViewport( size.width / 2, 0, size.width / 2, size.height );
            //this.renderer.render(this.scene, this.camera_stereo.cameraR );
            this._render_eye(this.camera_stereo.cameraR);

            this.renderer.setScissorTest( false );
            this.renderer.setViewport( 0, 0, size.width, size.height );
        }
        this.transitions = transitions_todo;
        if(this.transitions.length > 0) {
            this.update()
        }
        if(this.model.get('render_continuous'))
            this.update()
    },
    get_style_color: function(name) {
        style = this.get_style(name)
        if(style) {
            return new THREE.Color(style)
        } else {
            console.error("could not find color for", name)
        }
    },
    get_style: function(name) {
        var value = [null]
        _.each(name.split(" "), function(property) {
            var value_found = _.reduce(property.split("."), function(object, property) {
                if(object != null && object[property] != undefined)
                    return object[property]
                else
                    return null
            }, this.model.get("style"), this)
            if(value_found != null && value[0] == null)
                value[0] = value_found
        }, this)

        return value[0]
    },
    _render_eye: function(camera) {
        if(this.model.get("volume_data")) {
            this.camera.updateMatrixWorld();
            // render the back coordinates
            // render the back coordinates of the box
            //camera.updateMatrixWorld();
            this.box_mesh.material = this.box_material;
            this.box_material.side = THREE.BackSide;
            this.renderer.clearTarget(this.back_texture, true, true, true)
            this.renderer.render(this.scene, camera, this.back_texture);

            // now render the opaque object, such that we limit the rays
            // set material to rgb
            _.each(this.scatter_views, function(scatter) {
                scatter.mesh.material = scatter.mesh.material_rgb
                scatter.set_limits(_.pick(this.model.attributes, 'xlim', 'ylim', 'zlim'))
            }, this)
            _.each(this.mesh_views, function(mesh) {
                mesh.set_limits(_.pick(this.model.attributes, 'xlim', 'ylim', 'zlim'))
                _.each(mesh.meshes, function(mesh) {
                    mesh.mesh.material = mesh.material_rgb
                }, this);
            }, this)
            this.renderer.autoClear = false;
            this.scene_opaque.overrideMaterial = this.box_material;
            this.renderer.render(this.scene_scatter, camera, this.back_texture);
            this.renderer.render(this.scene_opaque, camera, this.back_texture);
            this.renderer.autoClear = true;

            // restore materials
            _.each(this.scatter_views, function(scatter) {
                scatter.mesh.material = scatter.mesh.material_normal
            }, this)
            _.each(this.mesh_views, function(mesh) {
                _.each(mesh.meshes, function(mesh) {
                    mesh.material = mesh.mesh.material_normal
                }, this);
            }, this)


            // render the front coordinates
            this.box_material.side = THREE.FrontSide;
            this.renderer.autoClear = false;
            this.renderer.clearTarget(this.front_texture, true, true, true)
            this.renderer.render(this.scene, camera, this.front_texture);
            this.renderer.autoClear = true;

            // render the opaque objects with normal materials
            this.scene_opaque.overrideMaterial = null;
            this.renderer.autoClear = false;
            this.renderer.clearTarget(this.volr_texture, true, true, true)
            this.renderer.render(this.scene_scatter, camera, this.volr_texture);
            this.renderer.render(this.scene_opaque, camera, this.volr_texture);
            this.renderer.autoClear = true;

            // last pass, render the volume
            this.box_mesh.material = this.box_material_volr;
            this.renderer.autoClear = false;
            // clear depth buffer only
            this.renderer.clearTarget(this.volr_texture, false, true, false)
            this.renderer.render(this.scene, camera, this.volr_texture);
            this.renderer.autoClear = true;

            // render to screen
            this.screen_texture = {Volume:this.volr_texture, Back:this.back_texture, Front:this.front_texture}[this.model.get("show")]
            this.screen_material.uniforms.tex.value = this.screen_texture.texture
            //this.renderer.clearTarget(this.renderer, true, true, true)
            this.renderer.render(this.screen_scene, this.screen_camera);
         } else {
            this.camera.updateMatrixWorld();
            _.each(this.scatter_views, function(scatter) {
                scatter.mesh.material = scatter.mesh.material_normal
                scatter.set_limits(_.pick(this.model.attributes, 'xlim', 'ylim', 'zlim'))
            }, this)
            _.each(this.mesh_views, function(mesh) {
                mesh.set_limits(_.pick(this.model.attributes, 'xlim', 'ylim', 'zlim'))
                _.each(mesh.meshes, function(mesh) {
                    mesh.material = mesh.material_normal
                }, this);
            }, this)
            this.renderer.autoClear = false;
            this.renderer.clear()
            this.renderer.render(this.scene_scatter, camera);
            this.renderer.render(this.scene_opaque, camera);
            this.renderer.autoClear = true;
         }


    },

    update_light: function() {
        this.box_material_volr.uniforms.ambient_coefficient.value = this.model.get("ambient_coefficient")
        this.box_material_volr.uniforms.diffuse_coefficient.value = this.model.get("diffuse_coefficient")
        this.box_material_volr.uniforms.specular_coefficient.value = this.model.get("specular_coefficient")
        this.box_material_volr.uniforms.specular_exponent.value = this.model.get("specular_exponent")
        this.update()
    },
    update_size: function() {
        this._update_size()
    },
    _update_size: function(skip_update, custom_width, custom_height) {
        console.log("update size")
        var width;
        var height;
        var el = this.renderer.domElement
        if(this.is_fullscreen()) {
            width = custom_width || el.clientWidth
            height = custom_height || el.clientHeight;
        } else {
            width = custom_width || this.model.get("width");
            height = custom_height || this.model.get("height");
        }

        // the offscreen rendering can be of lower resolution
        var render_width = width;
        var render_height = height;
        if(this.is_fullscreen() && this.model.get("volume_data")) {
            // fullscreen volume rendering is slow, respect width and height
            render_width = custom_width || this.model.get("width");
            render_height = custom_height || this.model.get("height");
        }
        this.renderer.setSize(width, height, false);

        if(this.model.get("stereo")) {
            render_width /= 2;
        }
        render_width /= this.model.get("downscale")
        render_height /= this.model.get("downscale")

        var aspect = render_width / render_height;
        this.camera.aspect = aspect
        this.camera.updateProjectionMatrix();
        console.log("render size: ", width, height, render_width, render_height)
        this.back_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.front_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.volr_texture = new THREE.WebGLRenderTarget( render_width, render_height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.screen_texture = this.volr_texture
        this.box_material_volr.uniforms.back.value = this.back_texture.texture
        this.box_material_volr.uniforms.front.value = this.front_texture.texture
        this.box_material_volr.uniforms.render_size.value = [render_width, render_height]
        if(!skip_update)
            this.update()
    },
    data_set: function() {
        this.volume = this.model.get("volume_data")
        if(!this.volume) {
            this.update_size()
            return;
            //this.volume = {image_shape: [2048, 1024], slice_shape: [128, 128], rows: 8, columns:16, slices: 128, src:default_cube_url}
        }
        this.texture_volume = this.texture_loader.load(this.volume.src, _.bind(this.update, this));//, _.bind(this.update, this))
        this.texture_volume.magFilter = THREE.LinearFilter
        this.texture_volume.minFilter = THREE.LinearFilter
        this.box_material_volr.uniforms.volume_rows.value = this.volume.rows,
        this.box_material_volr.uniforms.volume_columns.value = this.volume.columns
        this.box_material_volr.uniforms.volume_slices.value = this.volume.slices
        this.box_material_volr.uniforms.volume_size.value = this.volume.image_shape
        this.box_material_volr.uniforms.volume_slice_size.value = this.volume.slice_shape
        this.box_material_volr.uniforms.volume.value = this.texture_volume
        if(this.model.previous("volume_data")) {
            this.update()
        } else {
            this.update_size() // could need a resize, see update_size
        }
    },
    tf_set: function() {
        // TODO: remove listeners from previous
        if(this.model.get("tf")) {
            this.model.get("tf").on('change:rgba', this.tf_changed, this);
            this.tf_changed()
        }
    },
    tf_changed: function() {
        var tf = this.model.get("tf")
        if(tf) {
            /*if(!this.texture_tf) {
                this.texture_tf = new THREE.DataTexture(tf.get_data_array(), tf.get("rgba").length, 1, THREE.RGBAFormat, THREE.UnsignedByteType)
            } else {
                this.texture_tf.image.data = tf.get_data_array()
                this.texture_tf.needsUpdate = true
            }*/
            this.texture_tf = new THREE.DataTexture(tf.get_data_array(), tf.get("rgba").length, 1, THREE.RGBAFormat, THREE.UnsignedByteType)
            this.texture_tf.needsUpdate = true // without this it doesn't seem to work
            this.box_material_volr.uniforms.transfer_function.value = this.texture_tf
            this.update()
        }
    },
    fullscreen: function() {
        screenfull.request(this.el)
    },
    is_fullscreen: function() {
        return screenfull.element === this.renderer.domElement
    }
});

var FigureModel = widgets.DOMWidgetModel.extend({
    defaults: function() {
        return _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
            _model_name : 'FigureModel',
            _view_name : 'FigureView',
            _model_module : 'ipyvolume',
            _view_module : 'ipyvolume',
            _model_module_version: semver_range,
             _view_module_version: semver_range,
            anglex: 0.0,
            angley: 0.0,
            anglez: 0.0,
            eye_separation: 6.4,
            angle_order: 'XYZ',
            ambient_coefficient: 0.5,
            diffuse_coefficient: 0.8,
            specular_coefficient: 0.5,
            specular_exponent: 5,
            stereo: false,
            camera_control: 'trackball',
            camera_fov: 45,
            width: 500,
            height: 400,
            downscale: 1,
            scatters: null,
            meshes: null,
            show: "Volume",
            xlim: [0., 1.],
            ylim: [0., 1.],
            zlim: [0., 1.],
            xlabel: 'x',
            ylabel: 'y',
            zlabel: 'z',
            animation: 1000,
            animation_exponent: 0.5,
            style: styles['light'],
            render_continuous: false,
        })
    }
}, {
    serializers: _.extend({
        tf: { deserialize: widgets.unpack_models },
        scatters: { deserialize: widgets.unpack_models },
        meshes: { deserialize: widgets.unpack_models },
    }, widgets.DOMWidgetModel.serializers)
});


var WidgetManagerHackModel = widgets.WidgetModel.extend({
    defaults: function() {
        return _.extend(widgets.WidgetModel.prototype.defaults(), {
            _model_name : 'WidgetManagerHack',
            _model_module : 'ipyvolume',
            _model_module_version: semver_range,
             _view_module_version: semver_range,
        })
    },
    initialize: function(attributes, options) {
        console.log(this)
        WidgetManagerHackModel.__super__.initialize.apply(this, arguments);
        console.info("get reference to widget manager")
        window.jupyter_widget_manager = this.widget_manager;
        window.jupyter_widgets = widgets
    }
});

module.exports = {
    WidgetManagerHackModel: WidgetManagerHackModel,
    FigureModel: FigureModel,
    FigureView: FigureView,
};


//////////////////
// WEBPACK FOOTER
// ./src/volume.js
// module id = 1
// module chunks = 0
