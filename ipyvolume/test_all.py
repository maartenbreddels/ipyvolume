from __future__ import absolute_import

import os
import shutil
import json
import contextlib
import math

import numpy as np
import pytest

import ipyvolume
import ipyvolume.pylab as p3
import ipyvolume as ipv
import ipyvolume.examples
import ipyvolume.datasets
import ipyvolume.utils
import ipyvolume.serialize


@contextlib.contextmanager
def shim_savefig():
    previous = ipyvolume.pylab.savefig
    ipyvolume.pylab.savefig = lambda *x, **y: None
    try:
        yield
    finally:
        ipyvolume.pylab.savefig = previous


# helpful to remove previous test results for development
if os.path.exists("tmp"):
    shutil.rmtree("tmp")
os.makedirs("tmp")


def test_serialize():
    assert ipyvolume.serialize.array_sequence_to_binary_or_json(1) == 1
    assert ipyvolume.serialize.array_sequence_to_binary_or_json([]) == []
    empty_array = np.array([])
    assert ipyvolume.serialize.array_sequence_to_binary_or_json(empty_array) == []
    assert type(ipyvolume.serialize.array_sequence_to_binary_or_json(empty_array)) == list

    value = np.asarray(5)
    assert ipyvolume.serialize.array_sequence_to_binary_or_json(value) == 5

    value = np.asarray(5)
    assert ipyvolume.serialize.array_sequence_to_binary_or_json(value) == 5


def test_serialize_cube():
    cube = np.zeros((100, 200, 300))
    tiles, _tile_shape, _rows, _columns, _slices = ipv.serialize._cube_to_tiles(cube, 0, 1)
    assert len(tiles.shape) == 3  # should be 2d + 1d for channels
    f = ipv.serialize.StringIO()
    ipv.serialize.cube_to_png(cube, 0, 1, f)
    assert len(f.getvalue()) > 0


def test_tile_size():
    rows, columns, image_width, image_height = ipyvolume.serialize._compute_tile_size((256, 256, 256))
    # expect 16x16,
    assert rows == 16
    assert columns == 16
    assert image_width == 256 * 16
    assert image_height == 256 * 16

    rows, columns, image_width, image_height = ipyvolume.serialize._compute_tile_size((254, 254, 254))
    # expect the same, everything upscaled to a power of 2
    assert rows == 16
    assert columns == 16
    assert image_width == 256 * 16
    assert image_height == 256 * 16

    ipyvolume.serialize.max_texture_width = 256 * 8
    rows, columns, image_width, image_height = ipyvolume.serialize._compute_tile_size((254, 254, 254))
    assert rows == 32
    assert columns == 8
    assert image_width == 256 * 8
    assert image_height == 256 * 32

    ipyvolume.serialize.min_texture_width = 16 * 8
    rows, columns, image_width, image_height = ipyvolume.serialize._compute_tile_size((16, 16, 16))
    assert rows == 2
    assert columns == 8
    assert image_width == 128
    assert image_height == 128  # this is the min texture size

    ipyvolume.serialize.min_texture_width = 16 * 8
    rows, columns, image_width, image_height = ipyvolume.serialize._compute_tile_size((15, 15, 15))
    assert rows == 2
    assert columns == 8
    assert image_width == 128
    assert image_height == 128  # this is the min texture size


def test_figure():
    f1 = p3.figure()
    f2 = p3.figure(2)
    f3 = p3.figure()
    f4 = p3.figure(2)
    f5 = p3.gcf()
    p3.clear()
    f6 = p3.gcf()

    assert f1 != f2
    assert f2 != f3
    assert f3 != f4
    assert f2 == f2
    assert f4 == f5
    assert f5 != f6

    f7 = p3.figure('f7')
    f8 = p3.figure()
    f9 = p3.figure('f7')
    f10 = p3.figure(f8)
    f11 = p3.gcf()
    f12 = p3.current.figure
    f13 = p3.figure('f7')
    f14 = p3.current.figures['f7']

    assert f7 == f9
    assert f8 == f10
    assert f10 == f11
    assert f11 == f12
    assert f13 == f14

    for controls in [True, False]:
        for debug in [True, False]:
            for controls_light in [True, False]:
                p3.figure(debug=debug, controls=controls, controls_light=controls_light)


def test_context():
    f1 = ipv.figure(1)
    f2 = ipv.figure(2)
    f3 = ipv.figure(2)

    assert ipv.gcf() is f3
    with f2:  # pylint: disable=not-context-manager
        assert ipv.gcf() is f2
    assert ipv.gcf() is f3
    # test nested
    with f2:  # pylint: disable=not-context-manager
        assert ipv.gcf() is f2
        with f1:  # pylint: disable=not-context-manager
            assert ipv.gcf() is f1
        assert ipv.gcf() is f2
    assert ipv.gcf() is f3


def test_movie():
    fractions = []

    def f(fig, i, fraction):
        fractions.append(fraction)

    ipv.figure()
    with shim_savefig():
        ipv.movie(function=f, frames=2)
    assert fractions == [0, 0.5]


def test_view():
    ipv.figure()
    az0, el0, r0 = ipv.view()
    ipv.view(azimuth=az0 + 42)
    az, el, r = ipv.view()
    assert az == pytest.approx(az0 + 42)
    assert el == el0
    assert r == r0

    ipv.view(elevation=el0 + 42)
    az, el, r = ipv.view()
    assert az == pytest.approx(az0 + 42)
    assert el == pytest.approx(el0 + 42)
    assert r == r0

    ipv.view(distance=r0 + 42)
    az, el, r = ipv.view()
    assert az == pytest.approx(az0 + 42)
    assert el == pytest.approx(el0 + 42)
    assert r == pytest.approx(r0 + 42)

    ipv.view(42, 42, 42)
    az, el, r = ipv.view()
    assert az == pytest.approx(42)
    assert el == pytest.approx(42)
    assert r == pytest.approx(42)


def test_limits():
    f = p3.figure()
    p3.xlim(-10, 11)
    assert f.xlim[0] == -10
    assert f.xlim[1] == 11

    p3.ylim(-12, 13)
    assert f.ylim[0] == -12
    assert f.ylim[1] == 13

    p3.zlim(-14, 15)
    assert f.zlim[0] == -14
    assert f.zlim[1] == 15

    p3.xyzlim(-17, 17)
    assert f.xlim[0] == -17
    assert f.xlim[1] == 17
    assert f.ylim[0] == -17
    assert f.ylim[1] == 17
    assert f.zlim[0] == -17
    assert f.zlim[1] == 17

    # TODO: actually, default xlim should be None, and the limits should
    # then now grow, but 'move' around the new point
    f = ipv.figure()
    assert f.xlim == (0, 1)
    ipv.ylim(0, 10)
    ipv.zlim(-10, 0)
    ipv.scatter(3, 4, 5)
    assert f.xlim == (0, 3)
    assert f.ylim == (0, 10)
    assert f.zlim == (-10, 5)

    f = ipv.figure()
    ipv.volshow(np.random.rand(5, 5, 5), extent=[[0.1, 0.9], [0.5, 2], [-2, 5]])
    assert f.xlim == (0, 1)
    assert f.ylim == (0, 2)
    assert f.zlim == (-2, 5)


def test_style():
    f = ipv.figure()
    ipv.style.use('nobox')
    assert f.style['box']['visible'] is False
    ipv.style.use(['nobox', {'box': {'visible': True}}])
    assert f.style['box']['visible'] is True
    ipv.style.use({'box': {'visible': False}})
    assert f.style['box']['visible'] is False
    ipv.style.use({'axes': {'visible': False}})
    assert f.style['axes']['visible'] is False

    ipv.style.axes_off()
    assert f.style['axes']['visible'] is False
    ipv.style.axes_on()
    assert f.style['axes']['visible'] is True

    ipv.style.box_off()
    assert f.style['box']['visible'] is False
    ipv.style.box_on()
    assert f.style['box']['visible'] is True

    ipv.style.set_style_light()  # pylint: disable=no-member
    assert f.style['background-color'] == 'white'
    ipv.style.box_off()
    assert f.style['box']['visible'] is False
    assert f.style['background-color'] == 'white'  # keep old style settings


def test_labels():
    f = p3.figure()
    p3.xlabel("x1")
    p3.ylabel("y1")
    p3.zlabel("z1")
    assert f.xlabel == "x1"
    assert f.ylabel == "y1"
    assert f.zlabel == "z1"
    p3.xyzlabel("x2", "y2", "z2")
    assert f.xlabel == "x2"
    assert f.ylabel == "y2"
    assert f.zlabel == "z2"


def test_scatter():
    x, y, z = np.random.random((3, 100))
    p3.scatter(x, y, z)
    p3.save("tmp/ipyolume_scatter.html")


def test_plot():
    x, y, z = np.random.random((3, 100))
    p3.plot(x, y, z)
    p3.save("tmp/ipyolume_plot.html")


def test_quiver():
    x, y, z, u, v, w = np.random.random((6, 100))
    p3.quiver(x, y, z, u, v, w)
    p3.save("tmp/ipyolume_quiver.html")


def test_quiver_exception():
    x, y, z, u, v, w = np.random.random((6, 100))
    with pytest.raises(KeyError):
        p3.quiver(x, y, z, u, v, w, vx=u)


def test_volshow():
    x, y, z = ipyvolume.examples.xyz()
    p3.volshow(x * y * z)
    p3.volshow(x * y * z, level=1)
    p3.volshow(x * y * z, opacity=1)
    p3.volshow(x * y * z, level_width=1)
    p3.save("tmp/ipyolume_volume.html")


def test_volshow_max_shape():
    x, y, z = ipyvolume.examples.xyz(shape=32)
    Im = x * y * z
    v = p3.volshow(Im, max_shape=16, extent=[[0, 32]] * 3)
    assert v.data.shape == (16, 16, 16)
    p3.xlim(0, 16)
    # assert np.all(v.volume_data == I[::2,::2,0:16])


def test_bokeh():
    from bokeh.plotting import figure
    import ipyvolume.bokeh

    x, y, z = np.random.random((3, 100))

    p3.figure()
    scatter = p3.scatter(x, y, z)

    tools = "wheel_zoom,box_zoom,box_select,lasso_select,help,reset,"
    p = figure(title="E Lz space", tools=tools, width=500, height=500)
    r = p.circle(x, y, color="navy", alpha=0.2)
    ipyvolume.bokeh.link_data_source_selection_to_widget(r.data_source, scatter, 'selected')

    from bokeh.resources import CDN
    from bokeh.embed import components

    script, div = components(p)
    template_options = dict(
        extra_script_head=script + CDN.render_js() + CDN.render_css(),
        body_pre="<h2>Do selections in 2d (bokeh)<h2>" + div + "<h2>And see the selection in ipyvolume<h2>",
    )
    ipyvolume.embed.embed_html(
        "tmp/bokeh.html", [p3.gcc(), ipyvolume.bokeh.wmh], all_states=True, template_options=template_options
    )


def test_quick():
    x, y, z = ipyvolume.examples.xyz()
    p3.volshow(x * y * z)
    ipyvolume.quickvolshow(x * y * z, lighting=True)
    ipyvolume.quickvolshow(x * y * z, lighting=True, level=1, opacity=1, level_width=1)

    x, y, z, u, v, w = np.random.random((6, 100))
    ipyvolume.quickscatter(x, y, z)
    ipyvolume.quickquiver(x, y, z, u, v, w)


def test_download():
    url = "https://github.com/maartenbreddels/ipyvolume/raw/master/datasets/hdz2000.npy.bz2"
    ipyvolume.utils.download_to_file(url, "tmp/test_download.npy.bz2", chunk_size=None)
    assert os.path.exists("tmp/test_download.npy.bz2")
    ipyvolume.utils.download_to_file(url, "tmp/test_download2.npy.bz2", chunk_size=1000)
    assert os.path.exists("tmp/test_download2.npy.bz2")
    filesize = os.path.getsize("tmp/test_download.npy.bz2")
    content, _encoding = ipyvolume.utils.download_to_bytes(url, chunk_size=None)
    assert len(content) == filesize
    content, _encoding = ipyvolume.utils.download_to_bytes(url, chunk_size=1000)
    assert len(content) == filesize
    byte_list = list(ipyvolume.utils.download_yield_bytes(url, chunk_size=1000))
    # write the first chunk of the url to file then attempt to resume the download
    with open("tmp/test_download3.npy.bz2", 'wb') as f:
        f.write(byte_list[0])
    ipyvolume.utils.download_to_file(url, "tmp/test_download3.npy.bz2", resume=True)


def test_embed():
    p3.clear()
    x, y, z = np.random.random((3, 100))
    p3.scatter(x, y, z)
    p3.save("tmp/ipyolume_scatter_online.html", offline=False, devmode=True)
    assert os.path.getsize("tmp/ipyolume_scatter_online.html") > 0
    p3.save("tmp/ipyolume_scatter_offline.html", offline=True, scripts_path='js/subdir', devmode=True)
    assert os.path.getsize("tmp/ipyolume_scatter_offline.html") > 0


def test_threejs_version():
    # a quick check, as a reminder to change if threejs version is updated
    configpath = os.path.join(os.path.abspath(ipyvolume.__path__[0]), "..", "js", "package.json")
    with open(configpath) as f:
        config = json.load(f)
    major, minor = ipyvolume._version.__version_threejs__.split(".")
    major_js, minor_js, _patch_js = config['dependencies']['three'][1:].split(".")
    version_msg = "version in python and js side for three js conflect: %s vs %s" % (
        ipyvolume._version.__version_threejs__,
        config['dependencies']['three'],
    )
    assert (major == major_js) and (minor == minor_js), version_msg


def test_animation_control():
    ipv.figure()
    n_points = 3
    n_frames = 4
    ar = np.zeros(n_points)
    ar_frames = np.zeros((n_frames, n_points))
    colors_frames = np.zeros((n_frames, n_points, 3))
    scalar = 2

    s = ipv.scatter(x=scalar, y=scalar, z=scalar)
    with pytest.raises(ValueError):  # no animation present
        slider = ipv.animation_control(s, add=False).children[1]

    s = ipv.scatter(x=ar, y=scalar, z=scalar)
    slider = ipv.animation_control(s, add=False).children[1]
    assert slider.max == n_points - 1

    s = ipv.scatter(x=ar_frames, y=scalar, z=scalar)
    slider = ipv.animation_control(s, add=False).children[1]
    assert slider.max == n_frames - 1

    s = ipv.scatter(x=scalar, y=scalar, z=scalar, color=colors_frames)
    slider = ipv.animation_control(s, add=False).children[1]
    assert slider.max == n_frames - 1

    Nx, Ny = 10, 7
    x = np.arange(Nx)
    y = np.arange(Ny)
    x, y = np.meshgrid(x, y)
    z = x + y
    m = ipv.plot_surface(x, y, z)
    with pytest.raises(ValueError):  # no animation present
        slider = ipv.animation_control(m, add=False).children[1]

    z = [x + y * k for k in range(n_frames)]
    m = ipv.plot_surface(x, y, z)
    slider = ipv.animation_control(m, add=False).children[1]
    assert slider.max == n_frames - 1


# just cover and call
def test_example_head():
    ipyvolume.examples.head()


def test_example_ball():
    ipyvolume.examples.ball()


def test_example_ylm():
    ipyvolume.examples.example_ylm()


def test_datasets():
    ipyvolume.datasets.aquariusA2.fetch()
    ipyvolume.datasets.hdz2000.fetch()
    ipyvolume.datasets.zeldovich.fetch()


def test_mesh_material():
    def test_material_components(mesh=None, is_scatter=False):
        assert mesh.lighting_model == 'DEFAULT'
        assert mesh.opacity == 1
        assert mesh.specular_color == 'white'
        assert mesh.shininess == 1
        assert mesh.emissive_color == 'black'
        assert mesh.emissive_intensity == 1
        assert mesh.roughness == 0
        assert mesh.metalness == 0
        if is_scatter == False:
            assert mesh.cast_shadow == False
            assert mesh.receive_shadow == False

        mesh.lighting_model = 'PHYSICAL'
        mesh.opacity = 0
        mesh.specular_color = 'blue'
        mesh.shininess = 10
        mesh.emissive_color = 'red'
        mesh.emissive_intensity = 2
        mesh.roughness = 1
        mesh.metalness = 5
        if is_scatter == False:
            mesh.cast_shadow = True
            mesh.receive_shadow = True

        assert mesh.lighting_model == 'PHYSICAL'
        assert mesh.opacity == 0
        assert mesh.specular_color == 'blue'
        assert mesh.shininess == 10
        assert mesh.emissive_color == 'red'
        assert mesh.emissive_intensity == 2
        assert mesh.roughness == 1
        assert mesh.metalness == 5
        if is_scatter == False:
            assert mesh.cast_shadow == True
            assert mesh.receive_shadow == True

    x, y, z, u, v = ipyvolume.examples.klein_bottle(draw=False)

    ipyvolume.figure()
    mesh = ipyvolume.plot_mesh( x, y, z)
    test_material_components(mesh)

    k = 20
    h = -15
    tx = np.array([k, -k, -k, k])
    tz = np.array([k, k, -k, -k])
    ty = np.array([h, h, h, h])
    
    tri = [(0, 1, 2), (0, 2, 3)]
    trisurf = ipyvolume.plot_trisurf(tx, ty, tz, triangles=tri)
    test_material_components(trisurf)

    X = np.arange(-10, 10, 0.25*1)-10
    Y = np.arange(-10, 10, 0.25*1)
    X, Y = np.meshgrid(X, Y)
    R = np.sqrt(X**2 + Y**2)
    Z = np.sin(R)

    surf = ipyvolume.plot_surface(X, Z, Y)
    test_material_components(surf)

    x, y, z = np.random.random((3, 10000))
    scatter = ipyvolume.scatter(x, y, z, size=1, marker="sphere")
    test_material_components(scatter, True)


def test_light_components():
    ambient = ipyvolume.ambient_light()
    assert ambient.light_type == 'AMBIENT'
    assert ambient.light_color == 'white'
    assert ambient.intensity == 1
    assert ambient.cast_shadow == False

    ambient.light_color = 'blue'
    ambient.intensity = 2

    ambient.light_color == 'blue'
    assert ambient.intensity == 2
    #
    hemisphere = ipyvolume.hemisphere_light()
    assert hemisphere.light_color == 'white' 
    assert hemisphere.light_color2 == 'red' 
    assert hemisphere.intensity == 1
    assert hemisphere.position_x == 0
    assert hemisphere.position_y == 1
    assert hemisphere.position_z == 0
    assert hemisphere.cast_shadow == False

    hemisphere.light_color = 'orange' 
    hemisphere.light_color2 = 'green' 
    hemisphere.intensity = 0.5
    hemisphere.position_x = 100
    hemisphere.position_y = 100
    hemisphere.position_z = -100

    assert hemisphere.light_color == 'orange' 
    assert hemisphere.light_color2 == 'green' 
    assert hemisphere.intensity == 0.5
    assert hemisphere.position_x == 100
    assert hemisphere.position_y == 100
    assert hemisphere.position_z == -100
    #
    directional = ipyvolume.directional_light()
    assert directional.light_color == 'white' 
    assert directional.intensity == 1
    assert directional.position_x == 0
    assert directional.position_y == 1
    assert directional.position_z == 0
    assert directional.target_x == 0
    assert directional.target_y == 0
    assert directional.target_z == 0
    assert directional.cast_shadow==False
    assert directional.shadow_map_size==512
    assert directional.shadow_bias==-0.0005
    assert directional.shadow_radius==1
    assert directional.shadow_camera_near==0.5
    assert directional.shadow_camera_far==500
    assert directional.shadow_camera_orthographic_size==100
    assert directional.shadow_map_type=='PCF_SOFT'
    
    directional.light_color = 'black' 
    directional.intensity = 0
    directional.position_x = 50.5
    directional.position_y = 50.5
    directional.position_z = 50.5
    directional.target_x = 0.2
    directional.target_y = -0.2
    directional.target_z = 0.8
    directional.cast_shadow=True
    directional.shadow_map_size=1024
    directional.shadow_bias=-0.0009
    directional.shadow_radius=6
    directional.shadow_camera_near=0.1
    directional.shadow_camera_far=5000
    directional.shadow_camera_orthographic_size=200
    directional.shadow_map_type='BASIC'

    assert directional.light_color == 'black' 
    assert directional.intensity == 0
    assert directional.position_x == 50.5
    assert directional.position_y == 50.5
    assert directional.position_z == 50.5
    assert directional.target_x == 0.2
    assert directional.target_y == -0.2
    assert directional.target_z == 0.8
    assert directional.cast_shadow==True
    assert directional.shadow_map_size==1024
    assert directional.shadow_bias==-0.0009
    assert directional.shadow_radius==6
    assert directional.shadow_camera_near==0.1
    assert directional.shadow_camera_far==5000
    assert directional.shadow_camera_orthographic_size==200
    assert directional.shadow_map_type=='BASIC'
    #
    point = ipyvolume.point_light()
    assert point.light_color == 'white' 
    assert point.intensity == 1
    assert point.position_x == 0
    assert point.position_y == 1
    assert point.position_z == 0
    assert point.angle==math.pi/3 
    assert point.distance==0
    assert point.decay==1
    assert point.cast_shadow==False
    assert point.shadow_map_size==512
    assert point.shadow_bias==-0.0005
    assert point.shadow_radius==1
    assert point.shadow_camera_near==0.5
    assert point.shadow_camera_far==500
    assert point.shadow_map_type=='PCF_SOFT'

    point.light_color = 'grey' 
    point.intensity = 10
    point.position_x = 50.50
    point.position_y = -50.50
    point.position_z = 10.10
    point.angle=math.pi/6 
    point.distance=70
    point.decay=10
    point.cast_shadow=True
    point.shadow_map_size=256
    point.shadow_bias=0
    point.shadow_radius=10
    point.shadow_camera_near=2
    point.shadow_camera_far=10000
    point.shadow_map_type='PCF'

    assert point.light_color == 'grey' 
    assert point.intensity == 10
    assert point.position_x == 50.50
    assert point.position_y == -50.50
    assert point.position_z == 10.10
    assert point.angle==math.pi/6 
    assert point.distance==70
    assert point.decay==10
    assert point.cast_shadow==True
    assert point.shadow_map_size==256
    assert point.shadow_bias==0
    assert point.shadow_radius==10
    assert point.shadow_camera_near==2
    assert point.shadow_camera_far==10000
    assert point.shadow_map_type=='PCF'
    #
    spot = ipyvolume.spot_light()
    assert spot.light_color == 'white' 
    assert spot.intensity == 1
    assert spot.position_x == 0
    assert spot.position_y == 1
    assert spot.position_z == 0
    assert spot.target_x == 0
    assert spot.target_y == 0
    assert spot.target_z == 0
    assert spot.angle==math.pi/3 
    assert spot.distance==0
    assert spot.decay==1
    assert spot.penumbra==0
    assert spot.cast_shadow==False
    assert spot.shadow_map_size==512
    assert spot.shadow_bias==-0.0005
    assert spot.shadow_radius==1
    assert spot.shadow_camera_near==0.5
    assert spot.shadow_camera_far==500
    assert spot.shadow_camera_perspective_fov==50
    assert spot.shadow_camera_perspective_aspect==1
    assert spot.shadow_map_type=='PCF_SOFT'

    spot.light_color = 'red' 
    spot.intensity = 100.45
    spot.position_x = -5.1
    spot.position_y = -5.01
    spot.position_z = -5.001
    spot.target_x = 1.1
    spot.target_y = 1.001
    spot.target_z = 1.0001
    spot.angle=math.pi/20 
    spot.distance=5.5
    spot.decay=6.7
    spot.penumbra=3.1
    spot.cast_shadow=True
    spot.shadow_map_size=2001
    spot.shadow_bias=-0.000005
    spot.shadow_radius=6.6
    spot.shadow_camera_near=0.509
    spot.shadow_camera_far=500.03
    spot.shadow_camera_perspective_fov=50.56
    spot.shadow_camera_perspective_aspect=1
    spot.shadow_map_type='PCF'

    assert spot.light_color == 'red' 
    assert spot.intensity == 100.45
    assert spot.position_x == -5.1
    assert spot.position_y == -5.01
    assert spot.position_z == -5.001
    assert spot.target_x == 1.1
    assert spot.target_y == 1.001
    assert spot.target_z == 1.0001
    assert spot.angle==math.pi/20 
    assert spot.distance==5.5
    assert spot.decay==6.7
    assert spot.penumbra==3.1
    assert spot.cast_shadow==True
    assert spot.shadow_map_size==2001
    assert spot.shadow_bias==-0.000005
    assert spot.shadow_radius==6.6
    assert spot.shadow_camera_near==0.509
    assert spot.shadow_camera_far==500.03
    assert spot.shadow_camera_perspective_fov==50.56
    assert spot.shadow_camera_perspective_aspect==1
    assert spot.shadow_map_type=='PCF'
