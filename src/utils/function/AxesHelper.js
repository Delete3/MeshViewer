import * as THREE from 'three';
import Editor from '../Editor';

class AxesHelper {
    constructor() {
        this._enableAxesHelper = false;
        this.axesHelperMesh = null;
    }

    /**
     * @param {boolean} visible
     */
    set enableAxesHelper(visible) {
        if (this._enableAxesHelper == visible) return;

        this._enableAxesHelper = visible;

        visible ? this.showAxesHelper() : this.closeAxesHelper();
    }

    get enableAxesHelper() {
        return this._enableAxesHelper;
    }

    createAxesHelper = () => {
        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.name = 'axesHelper';
        axesHelper.visible = false;

        this.axesHelperMesh = axesHelper;
        Editor.scene.add(axesHelper);
    }

    showAxesHelper = () => {
        if (!this.axesHelperMesh) {
            this.createAxesHelper();
            this.showAxesHelper();
            return;
        }

        this.axesHelperMesh.visible = true;
        Editor.renderOnce();
    }

    closeAxesHelper = () => {
        if (!this.axesHelperMesh) return;

        this.axesHelperMesh.visible = false;
        Editor.renderOnce();
    }
}

export default new AxesHelper();