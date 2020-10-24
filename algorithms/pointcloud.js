import * as SCENE from './sceneSetup.js';
import * as RC from '../src/RenderCore.js'
import {FRONT_SIDE} from '../src/constants.js';

class App {

	constructor(canvas) {
		window.RC = RC;
		window.App = this;
		window.App.timings = []
		window.addEventListener("resize", () => {this.resize();}, false);

		this.canvas = canvas;

		this.renderer = new RC.MeshRenderer(this.canvas, RC.WEBGL2, {antialias: true});
		this.renderer.clearColor = '#000000ff';
		this.renderer.addShaderLoaderUrls('../../src/shaders');

		this.scene = new RC.Scene();
		var scene = this.scene;

		let points = [];
		let colors = [];
		let normals = [];

		this.loadingManager = new RC.LoadingManager();
		let LAS = new RC.LASLoader(this.loadingManager, "arraybuffer", true, 1024*1024*128);
		LAS.load(
			//url
			"./models/" + SCENE.FILENAME,
			//set
			[
				RC.LASLoader.PDRFormat2.Keys.X, RC.LASLoader.PDRFormat2.Keys.Y, RC.LASLoader.PDRFormat2.Keys.Z, 
				RC.LASLoader.PDRFormat2.Keys.RED, RC.LASLoader.PDRFormat2.Keys.GREEN, RC.LASLoader.PDRFormat2.Keys.BLUE,
				RC.LASLoader.PDRFormat2.Keys.NX, RC.LASLoader.PDRFormat2.Keys.NY, RC.LASLoader.PDRFormat2.Keys.NZ
			],
			//on load complete
			function(data){
				console.log("LAS load complete.");

				points = [];
				colors = [];
				normals = [];
			},
			//on progress
			function(xhr){
				//console.log("LAS " + (xhr.loaded / xhr.total * 100) + "% loaded.");
				console.log("LAS " + ((LAS.LASLoaded + xhr.loaded) / LAS.LASSize * 100) + "% loaded.");
			},
			//on error
			function(err){
				console.error("LAS load error.");
			},
			//on abort
			function(){
				console.error("LAS load abort.");
			},
			//on header load
			function(data){
				console.log("The size of LAS is: " + data.size + " " + data.type + ".");
			},
			//on chunk load
			function(data){
				//console.log(data);

				let pointCloudGeometry = new RC.Geometry();

				for(let i = 0; i < data.X.length; i++){
					points[i*3 + 0] = data.X[i];
					points[i*3 + 1] = data.Y[i];
					points[i*3 + 2] = data.Z[i];

					colors[i*4 + 0] = data.RED[i] / 255.0;
					colors[i*4 + 1] = data.GREEN[i] / 255.0;
					colors[i*4 + 2] = data.BLUE[i] / 255.0;
					colors[i*4 + 3] = 1.0;

					normals[i*3 + 0] = (data.NX[i] / 128.0) - 1.0;
					normals[i*3 + 1] = (data.NY[i] / 128.0) - 1.0;
					normals[i*3 + 2] = (data.NZ[i] / 128.0) - 1.0;
/*
					if(normals[i*3+1] < 0.5){
						normals[i*3 + 0] = 1.0 - normals[i*3 + 0];
						normals[i*3 + 1] = 1.0 - normals[i*3 + 1];
						normals[i*3 + 2] = 1.0 - normals[i*3 + 2];
					}*/
				}

				pointCloudGeometry.vertices = RC.Float32Attribute(points, 3);
				pointCloudGeometry.vertColor = RC.Float32Attribute(colors, 4);
				pointCloudGeometry.normals = RC.Float32Attribute(normals, 3);
				//pointCloudGeometry.indices = Uint32Attribute(Array.from(Array(points.length/3).keys()), 1);

				//pointCloudGeometry.computeVertexNormals();

				let pointCloudMaterial = new RC.CustomShaderMaterial("pointcloud", {"paraboloidSlope": 0.0});
				pointCloudMaterial.color = new RC.Color(0x110044);
				pointCloudMaterial.useVertexColors = true;
				pointCloudMaterial.side = FRONT_SIDE;
				pointCloudMaterial.usePoints = true;
				pointCloudMaterial.pointSize = 3400.0;

				let pointCloudObject = new RC.PointCloud(null, null, pointCloudGeometry, pointCloudMaterial);

				//pointCloudObject.rotateX(-Math.PI / 2);
				pointCloudObject.usePoints = true;
				pointCloudObject.visible = true;

				scene.add(pointCloudObject);
			}
		);

		this.camera = new RC.PerspectiveCamera(60, this.canvas.width/this.canvas.height, 0.1, 1000.0);
		this.camera.position = SCENE.POSITION;
		var camera = this.camera;
		
		var keyboardRotation = {x: SCENE.ROTATIONX, y: SCENE.ROTATIONY, z: SCENE.ROTATIONZ, reset: function() { this.x = 0; this.y = 0; this.z = 0; }};
		var keyboardTranslation = {x: camera.position.x, y: camera.position.y, z: camera.position.z, reset: function() { this.x = 0; this.y = 0; this.z = 0; }};
		this.keyboardInput = RC.KeyboardInput.instance;
		this.keyboardInput.addListener(function (pressedKeys) {
			
			// ROTATIONS
			if (pressedKeys.has(65)) keyboardRotation.y += 0.01; // A
			if (pressedKeys.has(68)) keyboardRotation.y += -0.01; // D
			if (pressedKeys.has(87)) keyboardRotation.x += 0.01; // W
			if (pressedKeys.has(83)) keyboardRotation.x += -0.01; // S
			if (pressedKeys.has(81)) keyboardRotation.z += 0.01; // Q
			if (pressedKeys.has(69)) keyboardRotation.z += -0.01; // R

			// TRANSLATIONS
			if (pressedKeys.has(39)) keyboardTranslation.x += +0.5; // RIGHT - Right
			if (pressedKeys.has(37)) keyboardTranslation.x += -0.5; // LEFT - Left
			if (pressedKeys.has(40)) keyboardTranslation.z += +0.5; // DOWN - Backward
			if (pressedKeys.has(38)) keyboardTranslation.z += -0.5; // UP - Forward
			if (pressedKeys.has(82)) keyboardTranslation.y += +0.5; // R - Upward
			if (pressedKeys.has(70)) keyboardTranslation.y += -0.5; // F - Downward

			camera.position.x = keyboardTranslation.x;
			camera.position.y = keyboardTranslation.y;
			camera.position.z = keyboardTranslation.z;

			camera.rotation.x = keyboardRotation.x;
			camera.rotation.y = keyboardRotation.y;
			camera.rotation.z = keyboardRotation.z;
			
			if(pressedKeys.has(84)){ // T - reset view
				keyboardRotation.x = camera.rotation.x = SCENE.ROTATIONX;
				keyboardRotation.y = camera.rotation.y = SCENE.ROTATIONY;
				keyboardRotation.z = camera.rotation.z = SCENE.ROTATIONZ;
				keyboardTranslation = camera.position = SCENE.POSITION;

				window.App.timings.push(window.App.timing);
				while(window.App.timings.length > 50) window.App.timings.shift();
				var sum = 0.0;
				for(var i = 0; i < window.App.timings.length; i++){
					sum += window.App.timings[i];
				}
				console.log(sum / window.App.timings.length)
			}
		});

		this.resize();
		window.requestAnimationFrame(() => {
            this.render()
        });
	}

	render() {
		var t0 = performance.now()
		this.renderer.render(this.scene, this.camera);
		var t1 = performance.now()
		window.App.timing = t1 - t0;
		this.keyboardInput.update();
		window.requestAnimationFrame(() => {
            this.render()
        });
	}

	resize() {
		// Make the canvas the same size
		this.canvas.width  = 1280;
		this.canvas.height = 720;

		// Update camera aspect ratio and renderer viewport
		this.camera.aspect = this.canvas.width / this.canvas.height;
		this.renderer.updateViewport(this.canvas.width, this.canvas.height);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.querySelector('canvas');
	const app = window.app = new App(canvas);
});