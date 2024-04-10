import * as THREE from 'three';

class PerspectiveCamera extends THREE.PerspectiveCamera {
    constructor(container) {
        super();
        this.container = container;
        this.name = 'camera';
        this.defaultCameraDistance = 195;
        this.defaultFov = 25;

        this.position.set(1.31, this.defaultCameraDistance, 0);
        this.fov = this.defaultFov;
        this.near = 1;
        this.far = 2000;
        this.onWindowResize();
    }

    onWindowResize = () => {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.aspect = width / height;
        this.updateProjectionMatrix();
    }
}

export default PerspectiveCamera;