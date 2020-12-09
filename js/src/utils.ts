import isTypedArray from "is-typedarray";

// same strategy as: ipywidgets/jupyter-js-widgets/src/widget_core.ts, except we use ~
// so that N.M.x is allowed (we don't care about x, but we assume 0.2.x is not compatible with 0.3.x
export const semver_range = require('../package.json').version;

export
function is_typedarray(obj) {
    return isTypedArray(obj);
}

export
function is_arraybuffer(obj) {
    return ArrayBuffer.isView(obj);
}

export
function get_array_dimension(array) {
    let dimension = 0;
    while (typeof array[0] !== "undefined") {
        array = array[0];
        dimension += 1;
    }
    return dimension;
}

export
function download_image(data) {
    const a = document.createElement("a");
    a.download = "ipyvolume.png";
    a.href = data;
    // see https://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas
    if (document.createEvent) {
        const e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null);

        a.dispatchEvent(e);
    } else if ((a as any).fireEvent) {
        (a as any).fireEvent("onclick");
    }
}

export
function select_text(element) {
    const doc = document;
    if ((doc.body as any).createTextRange) {
        const range = (document.body as any).createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export
function copy_image_to_clipboard(data) {
    // https://stackoverflow.com/questions/27863617/is-it-possible-to-copy-a-canvas-image-to-the-clipboard
    const img = document.createElement("img");
    img.contentEditable = "true";
    img.src = data;

    const div = document.createElement("div");
    div.contentEditable = "true";
    div.appendChild(img);
    document.body.appendChild(div);

    // do copy
    select_text(img);
    document.execCommand("Copy");
    document.body.removeChild(div);
}

export
function materialToLightingModel(material) {
    if (material.type === "MeshPhysicalMaterial") {
        return "PHYSICAL";
    } else if (material.type === "MeshLambertMaterial") {
        return "LAMBERT";
    } else if (material.type === "MeshPhongMaterial") {
        return "PHONG";
    }
    return "DEFAULT";
}
