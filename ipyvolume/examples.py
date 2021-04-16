"""Some examples for quick testing/demonstrations.

All function accept `show` and `draw` arguments

  * If `draw` is `True` it will return the widgets (Scatter, Volume, Mesh)
  * If `draw` is `False`, it will return the data
  * if `show` is `False`, `ipv.show()` will not be called.
"""

import warnings
import numpy as np
from numpy import cos, sin, pi, linspace, meshgrid

try:
    import scipy.ndimage
    import scipy.special
except:
    pass  # it's ok, it's not crucial
# __all__ = ["example_ylm"]


def xyz(shape=128, limits=[-3, 3], spherical=False, sparse=True, centers=False):
    dim = 3
    try:
        shape[0]
    except:
        shape = [shape] * dim
    try:
        limits[0][0]  # pylint: disable=unsubscriptable-object
    except:
        limits = [limits] * dim
    if centers:
        v = [
            slice(vmin + (vmax - vmin) / float(N) / 2, vmax - (vmax - vmin) / float(N) / 4, (vmax - vmin) / float(N))
            for (vmin, vmax), N in zip(limits, shape)
        ]
    else:
        v = [
            slice(vmin, vmax + (vmax - vmin) / float(N) / 2, (vmax - vmin) / float(N - 1))
            for (vmin, vmax), N in zip(limits, shape)
        ]
    if sparse:
        x, y, z = np.ogrid.__getitem__(v)
    else:
        x, y, z = np.mgrid.__getitem__(v)
    if spherical:
        r = np.linalg.norm([x, y, z])
        theta = np.arctan2(y, x)
        phi = np.arccos(z / r)
        return x, y, z, r, theta, phi
    else:
        return x, y, z


def example_ylm(m=0, n=2, shape=128, limits=[-4, 4], draw=True, show=True, **kwargs):
    """Show a spherical harmonic."""
    import ipyvolume.pylab as p3

    __, __, __, r, theta, phi = xyz(shape=shape, limits=limits, spherical=True)
    radial = np.exp(-(r - 2) ** 2)
    data = np.abs(scipy.special.sph_harm(m, n, theta, phi) ** 2) * radial  # pylint: disable=no-member
    if draw:
        vol = p3.volshow(data=data, **kwargs)
        if show:
            p3.show()
        return vol
    else:
        return data
    # return ipyvolume.volshow(data=data.T, **kwargs)


def ball(rmax=3, rmin=0, shape=128, limits=[-4, 4], draw=True, show=True, **kwargs):
    """Show a ball."""
    import ipyvolume.pylab as p3

    __, __, __, r, _theta, _phi = xyz(shape=shape, limits=limits, spherical=True)
    data = r * 0
    data[(r < rmax) & (r >= rmin)] = 0.5
    if "data_min" not in kwargs:
        kwargs["data_min"] = 0
    if "data_max" not in kwargs:
        kwargs["data_max"] = 1
    data = data.T
    if draw:
        vol = p3.volshow(data=data, **kwargs)
        if show:
            p3.show()
        return vol
    else:
        return data


# http://graphics.stanford.edu/data/voldata/


def klein_bottle(
    draw=True,
    show=True,
    figure8=False,
    endpoint=True,
    uv=True,
    wireframe=False,
    texture=None,
    both=False,
    interval=1000,
):
    """Show one or two Klein bottles."""
    import ipyvolume.pylab as p3

    # http://paulbourke.net/geometry/klein/
    u = np.linspace(0, 2 * pi, num=40, endpoint=endpoint)
    v = np.linspace(0, 2 * pi, num=40, endpoint=endpoint)
    u, v = np.meshgrid(u, v)
    if both:
        x1, y1, z1, _u1, _v1 = klein_bottle(endpoint=endpoint, draw=False, show=False)
        x2, y2, z2, _u2, _v2 = klein_bottle(endpoint=endpoint, draw=False, show=False, figure8=True)
        x = [x1, x2]
        y = [y1, y2]
        z = [z1, z2]
    else:
        if figure8:
            # u -= np.pi
            # v -= np.pi
            a = 2
            s = 5
            x = s * (a + cos(u / 2) * sin(v) - sin(u / 2) * sin(2 * v) / 2) * cos(u)
            y = s * (a + cos(u / 2) * sin(v) - sin(u / 2) * sin(2 * v) / 2) * sin(u)
            z = s * (sin(u / 2) * sin(v) + cos(u / 2) * sin(2 * v) / 2)
        else:
            r = 4 * (1 - cos(u) / 2)
            x = 6 * cos(u) * (1 + sin(u)) + r * cos(u) * cos(v) * (u < pi) + r * cos(v + pi) * (u >= pi)
            y = 16 * sin(u) + r * sin(u) * cos(v) * (u < pi)
            z = r * sin(v)
    if draw:
        if texture:
            uv = True
        if uv:
            mesh = p3.plot_mesh(
                x,
                y,
                z,
                wrapx=not endpoint,
                wrapy=not endpoint,
                u=u / (2 * np.pi),
                v=v / (2 * np.pi),
                wireframe=wireframe,
                texture=texture,
            )
        else:
            mesh = p3.plot_mesh(x, y, z, wrapx=not endpoint, wrapy=not endpoint, wireframe=wireframe, texture=texture)
        if show:
            if both:
                p3.animation_control(mesh, interval=interval)
            p3.squarelim()
            p3.show()
        return mesh
    else:
        return x, y, z, u, v


def brain(
    draw=True, show=True, fiducial=True, flat=True, inflated=True, subject='S1', interval=1000, uv=True, color=None
):
    """Show a human brain model.

    Requirement:

        $ pip install https://github.com/gallantlab/pycortex
    """
    import ipyvolume as ipv

    try:
        import cortex
    except:
        warnings.warn("it seems pycortex is not installed, which is needed for this example")
        raise
    xlist, ylist, zlist = [], [], []
    polys_list = []

    def add(pts, polys):
        xlist.append(pts[:, 0])
        ylist.append(pts[:, 1])
        zlist.append(pts[:, 2])
        polys_list.append(polys)

    def n(x):
        return (x - x.min()) / x.ptp()

    if fiducial or color is True:
        pts, polys = cortex.db.get_surf('S1', 'fiducial', merge=True)
        x, y, z = pts.T
        r = n(x)
        g = n(y)
        b = n(z)
        if color is True:
            color = np.array([r, g, b]).T.copy()
        else:
            color = None
        if fiducial:
            add(pts, polys)
    else:
        if color is False:
            color = None
    if inflated:
        add(*cortex.db.get_surf('S1', 'inflated', merge=True, nudge=True))
    u = v = None
    if flat or uv:
        pts, polys = cortex.db.get_surf('S1', 'flat', merge=True, nudge=True)
        x, y, z = pts.T
        u = n(x)
        v = n(y)
        if flat:
            add(pts, polys)

    polys_list.sort(key=lambda x: len(x))
    polys = polys_list[0]
    if draw:
        if color is None:
            mesh = ipv.plot_trisurf(xlist, ylist, zlist, polys, u=u, v=v)
        else:
            mesh = ipv.plot_trisurf(xlist, ylist, zlist, polys, color=color, u=u, v=v)
        if show:
            if len(x) > 1:
                ipv.animation_control(mesh, interval=interval)
            ipv.squarelim()
            ipv.show()
        return mesh
    else:
        return xlist, ylist, zlist, polys


def head(draw=True, show=True, max_shape=256):
    """Show a volumetric rendering of a human male head."""
    # inspired by http://graphicsrunner.blogspot.com/2009/01/volume-rendering-102-transfer-functions.html
    import ipyvolume as ipv
    from scipy.interpolate import interp1d

    # First part is a simpler version of setting up the transfer function. Interpolation with higher order
    # splines does not work well, the original must do sth different
    colors = [[0.91, 0.7, 0.61, 0.0], [0.91, 0.7, 0.61, 80.0], [1.0, 1.0, 0.85, 82.0], [1.0, 1.0, 0.85, 256]]
    x = np.array([k[-1] for k in colors])
    rgb = np.array([k[:3] for k in colors])
    N = 256
    xnew = np.linspace(0, 256, N)
    tf_data = np.zeros((N, 4))
    kind = 'linear'
    for channel in range(3):
        f = interp1d(x, rgb[:, channel], kind=kind)
        ynew = f(xnew)
        tf_data[:, channel] = ynew
    alphas = [[0, 0], [0, 40], [0.2, 60], [0.05, 63], [0, 80], [0.9, 82], [1.0, 256]]
    x = np.array([k[1] * 1.0 for k in alphas])
    y = np.array([k[0] * 1.0 for k in alphas])
    f = interp1d(x, y, kind=kind)
    ynew = f(xnew)
    tf_data[:, 3] = ynew
    tf = ipv.TransferFunction(rgba=tf_data.astype(np.float32))

    head_data = ipv.datasets.head.fetch().data
    if draw:
        vol = ipv.volshow(head_data, tf=tf, max_shape=max_shape)
        if show:
            ipv.show()
        return vol
    else:
        return head_data


def gaussian(N=1000, draw=True, show=True, seed=42, color=None, marker='sphere'):
    """Show N random gaussian distributed points using a scatter plot."""
    import ipyvolume as ipv

    rng = np.random.RandomState(seed)  # pylint: disable=no-member
    x, y, z = rng.normal(size=(3, N))

    if draw:
        if color:
            mesh = ipv.scatter(x, y, z, marker=marker, color=color)
        else:
            mesh = ipv.scatter(x, y, z, marker=marker)
        if show:
            # ipv.squarelim()
            ipv.show()
        return mesh
    else:
        return x, y, z


def moebius(draw=True, show=True, num=40, endpoint=True,
           uv=True, wireframe=False, texture=None):
    """Show Möbius strip."""
    # http://paulbourke.net/geometry/toroidal

    import ipyvolume.pylab as p3
    u = linspace(0, 2 * pi, num=num, endpoint=endpoint)
    v = linspace(-0.4, 0.4, num=num, endpoint=endpoint)
    u, v = meshgrid(u, v)
    x = cos(u) + v * cos(u / 2) * cos(u)
    y = sin(u) + v * cos(u / 2) * sin(u)
    z = v * sin(u / 2)
    if draw:
        if texture:
            uv = True
        kwargs = dict(wrapx=not endpoint, wrapy=not endpoint,
                      wireframe=wireframe, texture=texture)
        if uv:
            kwargs.update(dict(u=u/(2*pi), v=v/(2*pi)))
        mesh = p3.plot_mesh(x, y, z, **kwargs)
        if show:
            p3.squarelim()
            p3.show()
        return mesh
    else:
        return x, y, z, u, v
