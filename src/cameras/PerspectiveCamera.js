/**
 * Created by Ziga & Primoz on 1.4.2016.
 */
import {Camera} from '../cameras/Camera.js';

export class PerspectiveCamera extends Camera {

		/**
		 * Create new PerspectiveCamera object.
		 *
		 * @param fov Vertical field of view given in degrees.
		 * @param aspect Aspect ratio (width / height).
		 * @param near Distance to the near clipping plane of the projection camera frustum.
		 * @param far Distance to the far clipping plane of the projection camera frustum.
		 */
	constructor(fov, aspect, near, far) {
		super(Camera);

		this.type = "PerspectiveCamera";

		this._fov = fov || 50;
		this._aspect = aspect || 1;
		this._near = near || 0.1;
		this._far = far || 1000;
		this.updateProjectionMatrix();
	}

		/**
		 * Update projection matrix based on current values of properties.
		 */
	updateProjectionMatrix() {
		let top = this._near * Math.tan((Math.PI/180) * 0.5 * this._fov),
			height = 2 * top,
			width = this._aspect * height,
			left = - 0.5 * width;

		this.projectionMatrix.makePerspective(left, left + width, top, top - height, this._near, this._far);
	}

		/**
		 * Get field of view.
		 *
		 * @returns Field of view.
		 */
	get fov() { return this._fov; }

		/**
		 * Get aspect ratio.
		 *
		 * @returns Aspect ratio.
		 */
	get aspect() { return this._aspect; }

		/**
		 * Get distance to the near clipping plane.
		 *
		 * @returns Distance to the near clipping plane.
		 */
	get near() { return this._near; }

		/**
		 * Get distance to the far clipping plane.
		 *
		 * @returns Distance to the far clipping plane.
		 */
	get far() { return this._far; }

		/**
		 * Set field of view.
		 *
		 * @param val Field of view to be set.
		 */
	set fov(val) {
				if (val !== this._fov) {
						this._fov = val;

						this.updateProjectionMatrix();

						// Notify onChange subscriber
						if (this._onChangeListener) {
								var update = {uuid: this._uuid, changes: {fov: this._fov}};
								this._onChangeListener.objectUpdate(update)
						}
				}
	}

		/**
		 * Set aspect ratio.
		 *
		 * @param val Aspect ratio to be set.
		 */
	set aspect(val) {
				if (val !== this._aspect) {
						this._aspect = val;

						this.updateProjectionMatrix();
				}
	}

		/**
		 * Set distance to the near clipping plane.
		 *
		 * @param val Distance to the near clipping plane to be set.
		 */
	set near(val) {
				if (val !== this._near) {
						this._near = val;

						this.updateProjectionMatrix();

						// Notify onChange subscriber
						if (this._onChangeListener) {
								var update = {uuid: this._uuid, changes: {near: this._near}};
								this._onChangeListener.objectUpdate(update)
						}
				}
	}

		/**
		 * Set distance to the far clipping plane.
		 *
		 * @param val Distance to the far clipping plane to be set.
		 */
	set far(val) {
				if (val !== this._far) {
						this._far = val;

						this.updateProjectionMatrix();

						// Notify onChange subscriber
						if (this._onChangeListener) {
								var update = {uuid: this._uuid, changes: {far: this._far}};
								this._onChangeListener.objectUpdate(update)
						}
				}
	}

		/**
		 * Serialize object to JSON.
		 *
		 * @returns JSON object.
		 */
	toJson() {
		// Export Object3D parameters
		var obj = super.toJson();

		// Export perspective camera parameters
		obj.fov = this._fov;
		obj.near = this._near;
		obj.far = this._far;

		return obj;
	}

	/**
	 * Create a new camera from the JSON data.
	 *
	 * @param data JSON data.
	 * @param aspect Aspect ratio.
	 */
	static fromJson(data, aspect) {
		// Create new object with the given camera parameters
		var camera = new PerspectiveCamera(data.fov, aspect, data.near, data.far);

		// Import underlying Object3D parameters
		return super.fromJson(data, camera);
	}

		/**
		 * Updates the camera with settings from data.
		 *
		 * @param data Update data.
		 */
	update(data) {
		super.update(data);

		// Check if there are any camera parameter updates
		var modified = false;
		for (var prop in data) {
			switch (prop) {
				case "fov":
					this._fov = data.fov;
					delete data.fov;
					modified = true;
					break;
				case "near":
					this._near = data.near;
					delete data.near;
					modified = true;
					break;
				case "far":
					this._far = data.far;
					delete data.far;
					modified = true;
					break;
			}
		}

		// If the camera parameters have been modified update the projection matrix
		if (modified) {
			this.updateProjectionMatrix();
		}
	}
};