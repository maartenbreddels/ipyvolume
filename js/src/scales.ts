import * as d3 from "d3";
import { range } from "lodash";
import { Material, ShaderMaterial } from "three";

// We also do this in bqplot, does that make sense?
// tslint:disable-next-line: no-var-requires
const shader_scales = (require("raw-loader!../glsl/scales.glsl") as any).default;
const shader_scales_mod = (require("raw-loader!../glsl/scales.glsl") as any);

export
const scaleTypeMap = {
    linear: 1,
    log: 2,
};

export
function patchMaterial(material: any) {
    material.onBeforeCompile = (shader) => {
        patchShader(shader);
    };
}

export
function patchShader(shader: any) {
    shader.vertexShader = // this is the fragment program string in the template format
    shader.vertexShader.replace( // we have to transform the string
        "#include <scales>", // we will swap out this chunk
        shader_scales,
    );
}

export
function createD3Scale(scale) {
    if (scale.type === "linear") {
        return d3.scaleLinear().domain(scale.domain);
    } else if (scale.type === "log") {
        return d3.scaleLog().domain(scale.domain);
    } else {
        throw new Error("Scale not supported: " + scale);
    }
}

export
function createColormap(scale) {
    // convert the d3 color scale to a texture
    const colors = scale ? scale.color_range : ["#ff0000", "#ff0000"];
    const color_scale = d3.scaleLinear()
                          .range(colors)
                          .domain(range(colors.length).map((i) => i / (colors.length - 1)));
    const colormap_array = [];
    const N = 256;
    for (let i = 0; i < N; i++) {
        const index = i / (N - 1);
        const rgb = d3.color(String(color_scale(index))).hex();
        const rgb_str = String(rgb);
        const rgb_arr = [parseInt("0x" + rgb_str.substring(1, 3), 16),
                         parseInt("0x" + rgb_str.substring(3, 5), 16),
                         parseInt("0x" + rgb_str.substring(5, 7), 16)];
        colormap_array.push(rgb_arr[0], rgb_arr[1], rgb_arr[2]);
    }
    const colormap_arr = new Uint8Array(colormap_array);
    const colormap_texture = new THREE.DataTexture(colormap_arr, N, 1, THREE.RGBFormat, THREE.UnsignedByteType);
    colormap_texture.needsUpdate = true;

    return colormap_texture;
}
