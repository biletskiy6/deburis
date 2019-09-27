import * as THREE from 'three';
var OBJLoader = require("three-obj-loader");
OBJLoader(THREE);
import { TimelineMax } from 'gsap';
var OrbitControls = require('three-orbit-controls')(THREE);

import * as dat from 'dat.gui';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

export default class Sketch {
    constructor(selector) {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerWidth);

        this.container = document.getElementById("container");
        this.container.appendChild(this.renderer.domElement);


        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);

        this.camera.position.set(0, 0, -4);
        this.camera.lookAt(0, 0, 0);
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;
        this.loader = new THREE.OBJLoader();

        this.speed = 0;
        this.position = 0;

        document.addEventListener("wheel", (e) => {
            this.speed += e.deltaY * 0.0002
        });

        this.mouse();
        this.settings();
        this.setupResize();

        this.resize();
        this.addObjects();
        this.animate();

    }

    settings() {
        this.settings = {
            progress: 0
        }

        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'progress', 0, 1, 0.01);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        var w = window.innerWidth;
        var h = window.innerHeight;

        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // Посмотреть все ajax.
    // Вывести все упорядочить 
    //     

    addObjects() {

        this.textures = [
            new THREE.TextureLoader().setCrossOrigin('anonymous').load('img/1.jpg'),
            new THREE.TextureLoader().setCrossOrigin('anonymous').load('img/2.jpg'),
            new THREE.TextureLoader().setCrossOrigin('anonymous').load('img/3.jpg'),
        ];

        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable',
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: 'f', value: 0 },
                resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                cameraRotation: { type: 'v2', value: new THREE.Vector2(0, 0) },
                accel: { type: 'v2', value: new THREE.Vector2(0.5, 2) },
                progress: { type: 'f', value: 0 },
                texture1: {
                    value: this.textures[2]
                },
                texture2: {
                    value: this.textures[0]
                },
                tMatCap: {
                    type: 't',
                    // value: THREE.ImageUtils.loadTexture('/img/matcap1.jpg')
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                },
            },
            // wireframe: true,
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });
        this.geometry = new THREE.CylinderBufferGeometry(10, 10, 30, 30, 1, 1, 0, Math.PI);

        this.plane = new THREE.Mesh(this.geometry, this.material);

        this.plane.rotation.y = -Math.PI / 2;
        this.scene.add(this.plane);


    }
    mouse() {
        let Hwidth = window.innerWidth / 2;
        let Hheight = window.innerHeight / 2;

        this.currentX = 0;
        this.currentY = 0;
        this.destX = 0;
        this.destY = 0;
        let that = this;

        document.addEventListener('mousemove', function (e) {
            that.mouseX = (event.clientX - Hwidth) / Hwidth;
            that.mouseY = (event.clientY - Hheight) / Hheight;

            that.destX = that.mouseX / 10.;
            that.destY = that.mouseY / 10.;
        });
    }

    tao() {

        this.position += this.speed;
        this.speed *= 0.7;

        let i = Math.round(this.position);
        let dif = i - this.position;

        this.position += dif * 0.035;
        if (Math.abs(i - this.position) < 0.001) {
            this.position = i;
        }

        let l = this.textures.length;
        this.curSlide = ((Math.floor(this.position) - 1) % l + l) % l;
        this.nextSlide = ((this.curSlide + 1) % l + l) % l;
        console.log(this.curSlide, this.nextSlide)
    }

    animate() {
        this.time += 0.05;
        this.tao();

        this.currentX -= (this.currentX - this.destX) * 0.02;
        this.currentY -= (this.currentY - this.destY) * 0.02;

        this.material.uniforms.progress.value = this.settings.progress;
        this.material.uniforms.progress.value = this.position;
        this.material.uniforms.cameraRotation.value.x = this.currentX;
        this.material.uniforms.cameraRotation.value.y = this.currentY;

        this.material.uniforms.texture1.value = this.textures[this.curSlide];
        this.material.uniforms.texture2.value = this.textures[this.nextSlide];

        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }
}
new Sketch('container')
