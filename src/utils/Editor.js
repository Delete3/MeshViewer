import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import _ from 'lodash';
import ArcballControls from './function/view-control/ArcballControls';

class Editor {
    constructor() {
        /**@type {HTMLElement} */
        this.container = null;
        this.scene = null;
        this.renderer = null;
        this.effectComposer = null;
        this.renderPass = null;
        this.control = null;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.isAnimate = false;
        this.animateEvent = new CustomEvent('editorAnimate');
        this.requestAnimateList = [];
        this._stopRenderOnce = _.debounce(e => this.stopAnimate('renderOnce'), 50);
    }

    setEditor = container => {
        const setLight = () => {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

            const sceneGroup = new THREE.Group();
            sceneGroup.name = "sceneLight";
            sceneGroup.add(ambientLight);
            this.scene.add(sceneGroup);
        }

        this.container = container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6ffed);
        this.control = new ArcballControls(this.container);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = this.id;

        this.effectComposer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.control.camera);
        this.effectComposer.addPass(this.renderPass);

        setLight();

        this.handleWindowResize();
        window.addEventListener("resize", _.debounce(e => this.handleWindowResize(), 500));
    }

    /**
     * @param {string} name 
     */
    startAnimate = name => {
        if (!name) return;
        if (this.requestAnimateList.includes(name)) return;
        this.requestAnimateList.push(name);

        if (this.isAnimate) return;
        this.isAnimate = true;
        window.requestAnimationFrame(this.alwaysAnimate)
    }

    alwaysAnimate = () => {
        if (!this.isAnimate) return;
        console.log('alwaysAnimate')

        document.dispatchEvent(this.animateEvent);
        this.effectComposer.render();
        window.requestAnimationFrame(this.alwaysAnimate)
    }

    /**
     * @param {string} name 
     */
    stopAnimate = name => {
        if (!name) return;
        const index = this.requestAnimateList.findIndex(i => i == name);
        this.requestAnimateList.splice(index, 1);

        if (this.requestAnimateList.length == 0) {
            this.isAnimate = false;
        }
    }

    renderOnce = () => {
        this.startAnimate('renderOnce');
        this._stopRenderOnce();
    }

    handleWindowResize = () => {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.control.onWindowResize();
        this.renderer.setSize(this.width, this.height);
        this.effectComposer.setSize(this.width, this.height);
        this.renderOnce();
    }
}

export default new Editor();