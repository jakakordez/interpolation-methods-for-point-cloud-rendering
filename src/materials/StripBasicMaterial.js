import {CustomShaderMaterial} from "./CustomShaderMaterial.js";
import {Color} from "../math/Color.js";


export class StripBasicMaterial extends CustomShaderMaterial {
    constructor(){
        super();

        this.type = "StripBasicMaterial";
        this.programName = "basic_strip";
        this._color = new Color(Math.random() * 0xffffff);
        this._lineWidth = 1.0;
    }


    get lineWidth() { return this._lineWidth; }
    set lineWidth(val) {
        if (val !== this._lineWidth) {
            this._lineWidth = val;

            // Notify onChange subscriber
            if (this._onChangeListener) {
                var update = {uuid: this._uuid, changes: {lineWidth: this._lineWidth}};
                this._onChangeListener.materialUpdate(update)
            }
        }
    }
    get color() { return this._color; }
    set color(val) {
        this._color = val;

        // Notify onChange subscriber
        if (this._onChangeListener) {
            var update = {uuid: this._uuid, changes: {color: this._color.getHex()}};
            this._onChangeListener.materialUpdate(update)
        }
    }


    update(data) {
        super.update(data);

        for (let prop in data) {
            switch (prop) {
                case "color":
                    this._color = data.color;
                    delete data.color;
                    break;
                case "lineWidth":
                    this._lineWidth = data.lineWidth;
                    delete data.lineWidth;
                    break;
            }
        }
    }
}