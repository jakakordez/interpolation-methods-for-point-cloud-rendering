/**
 * Created by Primoz on 3.4.2016.
 */
import {BACK_SIDE, FRONT_AND_BACK_SIDE} from '../constants.js';

import {Object3D} from '../core/Object3D.js';
import {Geometry} from './Geometry.js';

import {MeshBasicMaterial} from '../materials/MeshBasicMaterial.js';
import {PickingShaderMaterial} from "../materials/PickingShaderMaterial.js";

import {Matrix4} from '../math/Matrix4.js';
import {Matrix3} from '../math/Matrix3.js';
import {Vector3} from '../math/Vector3.js';
import {Ray} from '../math/Ray.js';
import {Sphere} from '../math/Sphere.js';
import {Color} from "../RenderCore.js";
import {Outline} from "../RenderCore.js";
import {VertexNormal} from "../RenderCore.js";
import {OutlineBasicMaterial} from "../materials/OutlineBasicMaterial.js";


export class Mesh extends Object3D {

	/**
	 * Create new Mesh object.
	 *
	 * @param geometry Geometry of the mesh.
	 * @param material Material of the mesh.
	 */
	constructor(geometry, material, pickingMaterial, outlineMaterial) {
		super(Object3D);


		this.type = "Mesh";


		// Each mesh defines geometry and its material
		this._geometry = geometry !== undefined ? geometry : new Geometry();
		this._material = material !== undefined ? material : new MeshBasicMaterial( { color: Math.random() * 0xffffff } );
		this._pickingMaterial = pickingMaterial !== undefined ? pickingMaterial : new PickingShaderMaterial("TRIANGLES");
		this._outlineMaterial = outlineMaterial !== undefined ? outlineMaterial : new OutlineBasicMaterial();

		this.raycast = _raycast;
		this._colorID = new Color(Math.random(), Math.random(), Math.random());


		//OUTLINE
		this._useOutline = false; //outline object visibility

		this._outline = new Outline(this._geometry, this._outlineMaterial, this._pickingMaterial);	//outline object
		this._outline.visible = this._useOutline;
		this._outline.material.offset = 0.1;

		this.add(this._outline);
	}

	/**
	 * Add on change listener to mesh material and geometry.
	 *
	 * @param listener Listener to be added.
	 * @param recurse Also add listener to all submeshes in the hierarchy.
	 */
	addOnChangeListener(listener, recurse) {
		this._material.onChangeListener = listener;
		this._geometry.onChangeListener = listener;

		super.addOnChangeListener(listener, recurse);
	}

	// region GETTERS
	/**
	 * Get material of the mesh.
	 *
	 * @returns Material of the mesh.
	 */
	get material() { return this._material; }
	get pickingMaterial() { return this._pickingMaterial; }

	/**
	 * Get geometry of the mesh.
	 *
	 * @returns Geometry of the mesh.
	 */
	get geometry() { return this._geometry; }
	get colorID() { return this._colorID; }
	get outline() { return this._outline; }
	get useOutline() { return this._useOutline; }
	/*get outlineGeometry() { return this._outlineGeometry; }
	get outlineSize() { return this._outlineSize; }
	get outlineMaterial() { return this._outlineMaterial; }*/
	// endregion

	// region SETTERS
	// TODO (Primoz): Figure out what to do when material or geometry is changed
	/**
	 * Set material of the mesh.
	 *
	 * @param mat Material to be set.
	 */
	set material(mat) { 
		this._material = mat;
		/**
		 * Added by Sebastien
		 */
		this._staticStateDirty = true;
	}
    set pickingMaterial(pickingMaterial) { this._pickingMaterial = pickingMaterial; }

	/**
	 * Set geometry of the mesh.
	 *
	 * @param geom Geometry to be set.
	 */
	set geometry(geom) { this._geometry = geom; }

	/**
	 * Add on change listener to mesh material and geometry.
	 *
	 * @param listener Listener to be added.
	 */
	set onChangeListener(listener) {
		super.onChangeListener = listener;
		this._geometry.onChangeListener = listener;
		this._material.onChangeListener = listener;
	}

	set colorID(colorID){ this._colorID = colorID; }
	set outline(outline) {
		this.remove(this._outline);	//remove current outline
		this._outline = outline;
		this._outline.visible = this._useOutline;
		this.add(outline);		//add new outline
	}
	set useOutline(useOutline) {
		this._useOutline = useOutline;
		this._outline.visible = useOutline;
	}
	/*set outlineGeometry(outlineGeometry) {
		this._outlineGeometry = outlineGeometry;
		this._outline.geometry = outlineGeometry;
	}
	set outlineSize(outlineSize) {
		this._outlineSize = outlineSize;
		this._outline.size = outlineSize;
	}
	set outlineMaterial(outlineMaterial) {
		this._outlineMaterial = outlineMaterial;
		this._outline.material = outlineMaterial;
	}*/
	// endregion


	// region EXPORT/IMPORT
	/**
	 * Serialize object to JSON.
	 *
	 * @returns JSON object.
	 */
	toJson() {
		var obj = super.toJson();

		// Add reference to geometry and material
		obj.geometryUuid = this._geometry._uuid;
		obj.materialUuid = this._material._uuid;

		return obj;
	}

	/**
	 * Create a mesh object from the JSON data.
	 *
	 * @param data JSON data.
	 * @param geometry Geometry of the mesh.
	 * @param material Material of the mesh.
	 * @param object
	 * @returns Mesh object.
	 */
	static fromJson(data, geometry, material, object) {
		// Create mesh object
		if (!object) {
			var object = new Mesh(geometry, material);
		}

		// Import Object3D parameters
		object = super.fromJson(data, object);

		return object;
	}
	// endregion
};


let _raycast = (function () {

    let vA = new Vector3();
    let vB = new Vector3();
    let vC = new Vector3();

    let inverseMatrix = new Matrix4();
    let ray = new Ray();
    let sphere = new Sphere();

	// Intersection points
    let intersectionPoint = new Vector3();
    let intersectionPointWorld = new Vector3();

	function checkTriangleIntersection( object, raycaster, ray, vertices, a, b, c ) {

		// Fetch triangle vertices
		vA.fromArray(vertices.array, a * 3);
		vB.fromArray(vertices.array, b * 3);
		vC.fromArray(vertices.array, c * 3);

        let intersect;
        let material = object.material;

		// Check triangle intersection
		if (material.side === BACK_SIDE) {
			intersect = ray.intersectTriangle(vC, vB, vA, true, intersectionPoint);
		}
		else {
			intersect = ray.intersectTriangle(vA, vB, vC, material.side !== FRONT_AND_BACK_SIDE, intersectionPoint);
		}

		// Fallback if no intersection
		if (intersect === null)
			return null;

		// Calculate intersection world position
		intersectionPointWorld.copy(intersectionPoint);
		intersectionPointWorld.applyMatrix4(object.matrixWorld);

		// Get distance to intersection point
        let distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);

		// Check if the distance is out of bounds
		if (distance < raycaster.near || distance > raycaster.far)
			return null;

		// Return intersection object
		return {
			distance: distance,
			point: intersectionPointWorld.clone(),
			triangle: [vA.applyMatrix4(object.matrixWorld).clone(), vB.applyMatrix4(object.matrixWorld).clone(), vC.applyMatrix4(object.matrixWorld).clone()],
			object: object
		};
	}

	return function raycast(raycaster, intersects) {
        let geometry = this.geometry;
        let material = this.material;
        let matrixWorld = this.matrixWorld;

		// Check if object has material
		if (material === undefined || geometry === undefined)
			return;

		// Test bounding sphere
		if (geometry.boundingSphere === null)
			geometry.computeBoundingSphere();

		sphere.copy(geometry.boundingSphere);
		sphere.applyMatrix4(matrixWorld);

		if (raycaster.ray.intersectsSphere(sphere) === false)
			return;


		inverseMatrix.getInverse(matrixWorld);
		ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

		// Test bounding box
		if (geometry.boundingBox !== null) {
			if (ray.intersectsBox(geometry.boundingBox) === false)
				return;
		}


        let intersection;
        let a, b, c;
        let indices = geometry.indices;
        let vertices = geometry.vertices;

		// Geometry is indexed
		if (indices !== null) {
			for (let i = 0; i < indices.array.length; i += 3) {

				// Triangle indices
				a = indices[i];
				b = indices[i + 1];
				c = indices[i + 2];

				// Test ray intersection with triangle
				intersection = checkTriangleIntersection(this, raycaster, ray, vertices, a, b, c);

				if (intersection) {
					intersection.faceIndex = Math.floor(i / 3); // triangle number in indices buffer semantics
					intersects.push(intersection);
				}
			}
		}
		// Non indexed geometry
		else {
			for (let i = 0; i < geometry.vertices.array.length; i += 9) {

				// Triangle indices
				a = i / 3;
				b = a + 1;
				c = a + 2;

				// Test ray intersection with triangle
				intersection = checkTriangleIntersection(this, raycaster, ray, vertices, a, b, c);

				if (intersection) {
					intersection.index = a; // triangle number in positions buffer semantics
					intersects.push(intersection);
				}
			}
		}
	}
})();