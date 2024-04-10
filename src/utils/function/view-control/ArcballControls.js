import * as THREE from 'three';
import { ArcballControls as ThreeArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import PerspectiveCamera from './PerspectiveCamera';
import OrthographicCamera from './OrthographicCamera';
import Editor from '../../Editor';
import ViewAngleTween from './ViewAngleTween';
import ViewRerender from '../ViewRerender';
import _ from 'lodash';

class ArcballControls extends ThreeArcballControls {
    /**
     * @param {HTMLElement} domElement 
     */
    constructor(domElement) {
        const orthographicCamera = new OrthographicCamera(domElement);
        const perspectiveCamera = new PerspectiveCamera(domElement);
        super(orthographicCamera, domElement, Editor.scene);

        /**@type {OrthographicCamera & PerspectiveCamera} */
        this.camera = orthographicCamera;

        /**@type {PerspectiveCamera} */
        this.perspectiveCamera = perspectiveCamera;
        this.scene.add(this.perspectiveCamera);

        /**@type {OrthographicCamera} */
        this.orthographicCamera = orthographicCamera;
        this.scene.add(this.orthographicCamera);

        this._isPerspectiveCamera = false;
        this.setLight();
        this.enableAnimations = false;
        this.radiusFactor = 0.8;
        this.maxDistance = 500;
        this.maxZoom = 8;
        this.minZoom = 0.4;
        this.enablePan = true;
        this.target.set(0, 0, 0);
        this.camera.up.set(0, 0, 1)
        this.setGizmosVisible(true);
        this.unsetMouseAction(0);
        this.setMouseAction('PAN', 1);
        this.setMouseAction('ZOOM', 'WHEEL');
        this.setMouseAction('ROTATE', 2);
        this.update();

        this.isCameraMoving = false;
        this.addEventListener('start', e => {
            this.isCameraMoving = true;
            Editor.startAnimate('arcballControl');
        });
        this.addEventListener('end', e => this.stopAnimateDebounceFunction());
        this.stopAnimateDebounceFunction = _.debounce(e => {
            Editor.stopAnimate('arcballControl');
            this.isCameraMoving = false;
        }, 100);
    }

    /**
     * @param {boolean} boolean
     */
    set isPerspectiveCamera(toPerspectiveCamera) {
        if (this._isPerspectiveCamera == toPerspectiveCamera) return;

        this._isPerspectiveCamera = toPerspectiveCamera;

        this.switchCamera(toPerspectiveCamera);
        // ViewRerender.all.basicFunctionSwitch.forceRerender();
    }

    get isPerspectiveCamera() {
        return this._isPerspectiveCamera;
    }

    setLight = () => {
        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 0, 0);
        pointLight1.position.set(0, 5, 0);
        pointLight1.castShadow = true;

        const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 0, 0);
        pointLight2.position.set(0, -5, 0);

        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);

        const cameraGroup = new THREE.Group();
        cameraGroup.name = "cameraLight";
        cameraGroup.add(pointLight1, pointLight2, hemisphereLight);
        this.camera.add(cameraGroup);
    }

    onWindowResize = () => {
        this.perspectiveCamera.onWindowResize();
        this.orthographicCamera.onWindowResize();
    }

    /**
     * @param {boolean} toPerspectiveCamera 
     */
    switchCamera = toPerspectiveCamera => {
        if (toPerspectiveCamera && this.camera.isPerspectiveCamera) return;
        if (!toPerspectiveCamera && this.camera.isOrthographicCamera) return;

        const originCamera = this.camera;
        const finalCamera = toPerspectiveCamera ? this.perspectiveCamera : this.orthographicCamera;

        const position = originCamera.position.clone();
        const quaternion = originCamera.quaternion.clone();
        const zoom = originCamera.zoom;

        //setCamera後quaternion會跑掉，所以先setCamera再還原相機參數
        this.setCamera(finalCamera);
        finalCamera.position.copy(position);
        finalCamera.quaternion.copy(quaternion);
        finalCamera.zoom = zoom;

        //交接children，裡面有相機燈光
        finalCamera.add(...originCamera.children);
        finalCamera.updateProjectionMatrix();

        Editor.renderPass.camera = this.camera;
        Editor.renderOnce();
    }

    toView = view => {
        this._gizmos.position.copy(this.target);

        const { camera } = this;
        ViewAngleTween.finalDistance = camera.defaultCameraDistance;

        if (view == viewAngle.Maxil) {
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        }
        else if (view == viewAngle.Right) {
            const quaternion1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / -2)
            const quaternion2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / -2)
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().multiply(quaternion1).multiply(quaternion2);
        }
        else if (view == viewAngle.Front) {
            const quaternion1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
            const quaternion2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().multiply(quaternion1).multiply(quaternion2);
        }
        else if (view == viewAngle.Mandi) {
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
        }
        else if (view == viewAngle.Left) {
            const quaternion1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
            const quaternion2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().multiply(quaternion1).multiply(quaternion2);
        }
        else if (view == viewAngle.Back) {
            ViewAngleTween.finalCameraQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        }
        else return;

        ViewAngleTween.orignalDistance = new THREE.Vector3().subVectors(camera.position, this.target).length();
        ViewAngleTween.orignalCameraQuaternion = camera.quaternion.clone();
        ViewAngleTween.startTweening();
    }
}

export default ArcballControls;
export const viewAngle = {
    Maxil: 0,
    Right: 1,
    Front: 2,
    Mandi: 3,
    Left: 4,
    Back: 5,
}