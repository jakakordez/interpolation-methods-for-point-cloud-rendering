import * as RC from '../src/RenderCore.js'
import {FRONT_SIDE} from '../src/constants.js';
import {Texture} from '../src/textures/Texture.js';
import * as SCENE from './sceneSetup.js';

class App {

	constructor(canvas) {
		window.RC = RC;
		window.App = this;
		window.App.timings = []
		window.addEventListener("resize", () => {this.resize();}, false);

		this.canvas = canvas;

		this.renderer = new RC.MeshRenderer(this.canvas, RC.WEBGL2, {antialias: true});
		this.renderer.clearColor = '#00000000';
		this.renderer.addShaderLoaderUrls('../../src/shaders');
    	this.renderer.addShaderLoaderUrls("../common/shaders");

		var scene = new RC.Scene();
		this.scene = scene;
		this.camera = new RC.PerspectiveCamera(60, this.canvas.width/this.canvas.height, 1.0, 1000.0);
		this.camera.position = SCENE.POSITION;
		this.camera.rotation
		var camera = this.camera;

		let points = [];
		let colors = [];
		var objects = [];
		this.objects = objects;

		let pointCloudMaterial = new RC.CustomShaderMaterial("pointcloud", {"paraboloidSlope": 0.0});
        pointCloudMaterial.color = new RC.Color(0x110044);
        pointCloudMaterial.flags.push("DISTANCE_OPACITY");
		pointCloudMaterial.useVertexColors = true;
		pointCloudMaterial.side = FRONT_SIDE;
		pointCloudMaterial.usePoints = true;
		pointCloudMaterial.pointSize = 1000.0;
		pointCloudMaterial.depthTest = false;
		pointCloudMaterial.blending = true;
		pointCloudMaterial.blendFunction = this.renderer.gl.FUNC_ADD;
		pointCloudMaterial.blendSrcRGB = this.renderer.gl.ONE;
		pointCloudMaterial.blendDstRGB = this.renderer.gl.ONE;
		pointCloudMaterial.blendSrcA = this.renderer.gl.ONE;
		pointCloudMaterial.blendDstA = this.renderer.gl.ONE;
		this.pointCloudMaterial = pointCloudMaterial;

		this.loadingManager = new RC.LoadingManager();
		let LAS = new RC.LASLoader(this.loadingManager, "arraybuffer", true, 1024*1024*128);
		LAS.load(
			//url
			"./models/" + SCENE.FILENAME,
			//set
			[RC.LASLoader.PDRFormat2.Keys.X, RC.LASLoader.PDRFormat2.Keys.Y, RC.LASLoader.PDRFormat2.Keys.Z, RC.LASLoader.PDRFormat2.Keys.RED, RC.LASLoader.PDRFormat2.Keys.GREEN, RC.LASLoader.PDRFormat2.Keys.BLUE],
			//on load complete
			function(data){
				console.log("LAS load complete.");

				points = [];
				colors = [];
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
			(data)=>{
				//console.log(data);

				let pointCloudGeometry = new RC.Geometry();
				console.log(data);
				for(let i = 0; i < data.X.length; i++){
					points[i*3 + 0] = data.X[i];
					points[i*3 + 1] = data.Y[i];
					points[i*3 + 2] = data.Z[i];
					

					colors[i*4 + 0] = data.RED[i] / 255.0;
					colors[i*4 + 1] = data.GREEN[i] / 255.0;
					colors[i*4 + 2] = data.BLUE[i] / 255.0;
					colors[i*4 + 3] = 1.0;
				}

				pointCloudGeometry.vertices = RC.Float32Attribute(points, 3);
				pointCloudGeometry.vertColor = RC.Float32Attribute(colors, 4);
				//pointCloudGeometry.indices = Uint32Attribute(Array.from(Array(points.length/3).keys()), 1);

				pointCloudGeometry.computeVertexNormals();

				let pointCloudObject = new RC.PointCloud(null, null, pointCloudGeometry, pointCloudMaterial);

				//pointCloudObject.rotateX(-Math.PI / 2);
				pointCloudObject.usePoints = true;
				pointCloudObject.visible = true;

				scene.add(pointCloudObject);
				objects.push(pointCloudObject);

				this.initRenderQueue();
			}
		);
	}

	initRenderQueue() {
		var camera = this.camera;
		var scene = this.scene;
		const imageWidth = 1280;
		const imageHeight = 720;

		const textureSettings = {wrapS: Texture.ClampToEdgeWrapping,
			wrapT: Texture.MirroredRepeatWrapping,
			minFilter: Texture.NearestFilter,
			magFilter: Texture.NearestFilter,
			internalFormat: Texture.RGBA32F,
			format: Texture.RGBA,
			type: Texture.FLOAT};
		
        var renderPass = new RC.RenderPass(
            // Rendering pass type
            RC.RenderPass.BASIC,
            // Initialize function
            function() { },
            // Preprocess function
            (textureMap, additionalData) => {
				/*scene.children[0].material = this.pointCloudMaterial;
				if(scene.children[0].children[0]) scene.children[0].children[0].material = this.pointCloudMaterial;*/
                return {scene: scene, camera: camera};
            },
            RC.RenderPass.TEXTURE,
            {width: imageWidth, height: imageHeight},
            "depth",
            [{id: "diffuse", textureConfig: textureSettings},
                {id: "positions", textureConfig: RC.RenderPass.FULL_FLOAT_RGB_NEAREST_TEXTURE_CONFIG},
				{id: "normals", textureConfig: RC.RenderPass.FLOAT_RGB_TEXTURE_CONFIG}]
		);

		this.renderQueue = new RC.RenderQueue(this.renderer);
        this.renderQueue.pushRenderPass(renderPass);

		var weightedDistanceMaterial = new RC.CustomShaderMaterial("weightedDistanceSplats", {imageHeight: imageHeight, imageWidth: imageWidth});
		weightedDistanceMaterial.lights = false;
		var processPass = new RC.RenderPass(
			// Rendering pass type
			RC.RenderPass.POSTPROCESS,
			// Initialize function
			function(textureMap, additionalData) {},
			// Preprocess function
			function (textureMap, additionalData) {
				return {material: weightedDistanceMaterial, textures: [textureMap['positions'], textureMap['diffuse']]};
			},
			// Target
			RC.RenderPass.SCREEN,
			{width: imageWidth, height: imageHeight},
		);
		this.renderQueue.pushRenderPass(processPass);

		this.resize();		

		window.requestAnimationFrame(() => {
			this.render();
		});

		const rc = this.renderQueue;
		let screenShot = false
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
			if (pressedKeys.has(39)) keyboardTranslation.x += +0.1; // RIGHT - Right
			if (pressedKeys.has(37)) keyboardTranslation.x += -0.1; // LEFT - Left
			if (pressedKeys.has(40)) keyboardTranslation.z += +0.1; // DOWN - Backward
			if (pressedKeys.has(38)) keyboardTranslation.z += -0.1; // UP - Forward
			if (pressedKeys.has(82)) keyboardTranslation.y += +0.1; // R - Upward
			if (pressedKeys.has(70)) keyboardTranslation.y += -0.1; // F - Downward

			if (pressedKeys.has(80) && !screenShot) { // P - download texture
				rc.downloadTexture("diffuse"); 
				screenShot = true;
			}

			camera.position.x = keyboardTranslation.x;
			camera.position.y = keyboardTranslation.y;
			camera.position.z = keyboardTranslation.z;

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
	}

	render() {
        //this.renderer.render(this.scene, this.camera);
		var t0 = performance.now()
		this.renderQueue.render();
		var t1 = performance.now()
		window.App.timing = t1 - t0;
		this.keyboardInput.update();
		
		window.requestAnimationFrame(() => {
			this.render()
        });
	}

	resize() {
		// Make the canvas the same size
		this.canvas.width  = window.innerWidth;
		this.canvas.height = window.innerHeight;

		// Update camera aspect ratio and renderer viewport
		this.camera.aspect = this.canvas.width / this.canvas.height;
		this.renderer.updateViewport(this.canvas.width, this.canvas.height);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.querySelector('canvas');
	const app = window.app = new App(canvas);
});