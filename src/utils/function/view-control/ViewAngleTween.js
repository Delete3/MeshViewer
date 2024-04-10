import { Quaternion, Vector3, Clock, MathUtils } from 'three';
import Editor from '../../Editor';

const singleAlpha = 0.07; //插值每次增加的量
const animateInterval = 0.01;

class ViewAngleTween {
    constructor() {
        this.clock = new Clock(false);
        this.totalDelta = 0;
        this.totalAlpha = 0;

        this.orignalDistance = 0;
        this.finalDistance = 0;
        this.orignalCameraQuaternion = null;
        this.finalCameraQuaternion = null;
    }

    startTweening = () => {
        const { control } = Editor;

        this.totalAlpha = 0;
        this.totalDelta = 0;
        control.enabled = false;
        control.isCameraMoving = true;
        Editor.startAnimate('viewAngleTransfer');
        this.clock.start();
        document.addEventListener('editorAnimate', this.tweenint);
    }

    tweenint = () => {
        this.totalDelta += this.clock.getDelta();
        if (this.totalDelta < animateInterval) return;
        this.totalDelta = 0;

        this.totalAlpha += singleAlpha;
        if (this.totalAlpha > 1) {
            this.stopTweening();
            return;
        }
        if (this.totalAlpha + singleAlpha > 1) {
            this.totalAlpha = 1
        }

        this.updateCameraPosition();
    }

    stopTweening = () => {
        const { control } = Editor;

        document.removeEventListener('editorAnimate', this.tweenint);
        Editor.stopAnimate('viewAngleTransfer');
        control.enabled = true;
        control.isCameraMoving = false;
        this.clock.stop();
    }

    updateCameraPosition = () => {
        const { control } = Editor;
        const { camera } = control;

        //先旋轉相機
        const currentCameraQuaternion = new Quaternion().slerpQuaternions(this.orignalCameraQuaternion, this.finalCameraQuaternion, this.totalAlpha);
        camera.quaternion.set(currentCameraQuaternion.x, currentCameraQuaternion.y, currentCameraQuaternion.z, currentCameraQuaternion.w);

        //後移動相機使視野對準物體
        const currentCameraDistance = MathUtils.lerp(this.orignalDistance, this.finalDistance, this.totalAlpha);

        const cameraDirection = new Vector3();
        camera.getWorldDirection(cameraDirection);
        const cameraVector = cameraDirection.negate().setLength(currentCameraDistance);
        const cameraPosition = new Vector3().addVectors(control.target, cameraVector);

        camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        camera.updateProjectionMatrix();
    }
}

export default new ViewAngleTween();