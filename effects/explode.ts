/**
 * Copyright (c) 2017 Jean-Marc VIGLINO, 
 * released under the CeCILL license (http://www.cecill.info/).
 * see original at https://github.com/Viglino/ol3-games/blob/master/featureanimation/explodeanimation.js 
 * see also, https://github.com/Viglino/ol3-ext/blob/gh-pages/featureanimation/featureanimation.js
 * creates an explosion animation
 */

import * as ol from "openlayers";

/** 
 * Animate feature on a vector layer 
 */
export function animateFeature(layer: ol.layer.Vector, feature: ol.Feature, fanim: FeatureAnimation[]) {

    let listenerKey: any;

    // Save style
    if (!fanim) return;
    if (!(fanim instanceof Array)) fanim = [fanim];
    if (!fanim.length) return;

    let style = feature.getStyle();
    let flashStyle = style || (layer.getStyleFunction ? layer.getStyleFunction()(feature, 0) : null);
    if (!flashStyle) flashStyle = [];
    if (!(flashStyle instanceof Array)) flashStyle = <any>[flashStyle];

    // Hide feature while animating
    feature.setStyle((fanim[0].options.hiddenStyle) || []);

    // Structure pass for animating
    var event = {
        vectorContext: null,
        frameState: null,
        start: 0,
        time: 0,
        elapsed: 0,
        extent: false,
        // Feature information
        feature: feature,
        geom: feature.getGeometry(),
        typeGeom: feature.getGeometry().getType(),
        bbox: feature.getGeometry().getExtent(),
        coord: ol.extent.getCenter(feature.getGeometry().getExtent()),
        style: flashStyle,
        context: null,
    };

    // Remove null animations
    for (var i = fanim.length - 1; i >= 0; i--) {
        if (fanim[i].options.duration === 0) fanim.splice(i, 1);
    }

    let nb = 0, step = 0;

    function animate(e: any) {
        event.vectorContext = e.vectorContext;
        event.frameState = e.frameState;
        if (!event.extent) {
            event.extent = e.frameState.extent;
            event.start = e.frameState.time;
            event.context = e.context;
        }
        event.time = e.frameState.time - event.start;
        event.elapsed = event.time / (fanim[step].options.duration || 1);
        if (event.elapsed > 1) event.elapsed = 1;

        // Stop animation?
        if (!fanim[step].animate(event)) {
            nb++;
            // Repeat animation
            if (nb < (fanim[step].options.repeat || 0)) {
                event.extent = false;
            }
            // newt step
            else if (step < fanim.length - 1) {
                fanim[step].dispatchEvent({ type: 'animationend', feature: feature });
                step++;
                nb = 0;
                event.extent = false;
            }
            // the end
            else {
                stop(null);
            }

        }

        // tell OL3 to continue postcompose animation
        e.frameState.animate = true;
    }

    // Stop animation
    function stop(options: any) {
        ol.Observable.unByKey(listenerKey);
        listenerKey = null;
        feature.setStyle(style);
        // Send event
        var event: any = { type: 'animationend', feature: feature };
        if (options) {
            for (var i in options) if (options.hasOwnProperty(i)) {
                event[i] = options[i];
            }
        }
        fanim[step].dispatchEvent(event);
        layer.dispatchEvent(event);
    }

    // Launch animation
    function start(options: any) {
        if (fanim.length && !listenerKey) {
            listenerKey = layer.on('postcompose', (e: any) => animate(e));
            layer.changed();
            // Send event
            var event: any = { type: 'animationstart', feature: feature };
            if (options) {
                for (var i in options) if (options.hasOwnProperty(i)) {
                    event[i] = options[i];
                }
            }
            fanim[step].dispatchEvent(event);
            layer.dispatchEvent(event);
        }
    }
    start(null);

    // Return animation controler
    return {
        start: start,
        stop: stop,
        isPlaying: function () { return (!!listenerKey); }
    };
};

export type FeatureAnimationOptions = {
    duration?: number;
    fade?: Function | null;
    repeat?: number;
    easing?: Function;
    hiddenStyle?: ol.style.Style;
    revers?: boolean;
};

export class FeatureAnimation extends ol.Object {

    constructor(public options: FeatureAnimationOptions) {
        super();
        options = options || {};

        options.duration = typeof (options.duration) == 'number' ? (options.duration >= 0 ? options.duration : 0) : 1000;
        options.fade = typeof (options.fade) == 'function' ? options.fade : null;
        options.repeat = options.repeat || 0;

        let easing = typeof (options.easing) == 'function' ? options.easing : ol.easing.linear;
        options.easing = options.revers ? (t: number) => 1 - easing(t) : easing;
    }

    /** Draw a geometry 
    */
    drawGeom_(e: any, geom: ol.geom.Geometry, shadow: ol.geom.Geometry) {
        if (this.options.fade) {
            e.context.globalAlpha = this.options.fade(1 - e.elapsed);
        }
        let style = e.style;
        for (let i = 0; i < style.length; i++) {
            let sc = 0;
            // OL < v4.3 : setImageStyle doesn't check retina
            let imgs = ol.Map.prototype.getFeaturesAtPixel ? false : style[i].getImage();
            if (imgs) {
                sc = imgs.getScale();
                imgs.setScale(e.frameState.pixelRatio * sc);
            }
            // Prevent crach if the style is not ready (image not loaded)
            try {
                e.vectorContext.setStyle(style[i]);
                if (style[i].getZIndex() < 0) e.vectorContext.drawGeometry(shadow || geom);
                else e.vectorContext.drawGeometry(geom);
            } catch (e) { };
            if (imgs) imgs.setScale(sc);
        }
    }

    animate(e: any) {
        return false;
    }
}

export type ExplodeAnimationOptions = {
    radius?: number;
    length?: number;
    dispersion?: number;
    color?: string;
}

/** Explosion animation: show an explosion with a blast effect
* @param {ol.featureAnimationExplodeOptions} options
*	- radius {number} blast radius (in pixel), default 50
*	- length {number} number of particles to use, default 12
*	- dispersion {number} radius of dispersion from the center of the blast, default radius/2
*	- color {ol.colorLike} color of the explosion, default: #ebb
*/
export class ExplodeAnimation extends FeatureAnimation {

    private gradient: any;

    private particules: {
        tmin: number;
        dt: number;
        radius: number;
        x: number;
        y: number;
    }[];

    constructor(public options: ExplodeAnimationOptions & FeatureAnimationOptions) {

        super(options);

        let dr = options.radius = options.radius || 30;
        options.length = options.length || 12;
        options.color = options.color || "#e55";

        let c = document.createElement('canvas');
        c.width = c.height = 10;
        let ctx = c.getContext("2d");
        if (!ctx) return;

        let gradient = this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, options.radius);

        let mask = (value: number, mask: number) => ((value * mask / 255) | 0);

        let color = ol.color.asArray(options.color);

        let [r, g, b, a] = color;

        var dispersion = options.dispersion || (options.radius / 2);
        this.particules = [{
            tmin: 0,
            dt: 1,
            radius: options.radius,
            x: 0,
            y: 0
        }];

        gradient.addColorStop(0, 'rgba(' + [mask(r, 255), mask(g, 255), mask(b, 255), a] + ')');

        for (var i = 0; i < options.length; i++) {
            gradient.addColorStop(i / options.length, `rgba(${mask(r, 255 - Math.random() * 100)}, ${mask(g, 255 - Math.random() * 200)}, ${mask(b, 255 - Math.random() * 100)}, ${1 - i / options.length})`);
        }

        for (var i = 0; i < options.length; i++) {
            this.particules.push(
                {
                    tmin: Math.random() * 0.4,
                    dt: 0.3 + Math.random() * 0.3,
                    radius: options.radius * (0.5 + Math.random() * 0.5),
                    x: dispersion * (Math.random() - 0.5),
                    y: dispersion * (Math.random() - 0.5)
                });
        }
    }

    animate(e: any) {
        var sc = this.options.easing && this.options.easing(e.elapsed);
        if (sc) {
            e.context.save();
            var ratio = e.frameState.pixelRatio;
            var m = e.frameState.coordinateToPixelTransform;
            var dx = m[0] * e.coord[0] + m[1] * e.coord[1] + m[4];
            var dy = m[2] * e.coord[0] + m[3] * e.coord[1] + m[5];

            e.context.globalCompositeOperation = "lighter";
            e.context.fillStyle = this.gradient;
            e.context.scale(ratio, ratio);

            var ds, r;
            for (var i = 0, p; p = this.particules[i]; i++) {
                ds = (sc - p.tmin) / p.dt;
                if (ds > 0 && ds <= 1) {
                    e.context.save();
                    e.context.translate(dx + p.x, dy + p.y);
                    r = ds * p.radius / (this.options.radius || 1);
                    e.context.scale(r, r);
                    e.context.globalAlpha = 1 - ds;
                    e.context.fillRect(-p.radius, -p.radius, 2 * p.radius, 2 * p.radius);
                    e.context.restore();
                }
            }

            e.context.restore();
        }

        return (e.time <= (this.options.duration || 0));
    }
}


// Show an explosion at coord
export function explode(layer: ol.layer.Vector, coord: ol.Coordinate) {
    var f = new ol.Feature(new ol.geom.Point(coord));
    var anim = new ExplodeAnimation({
        duration: 3000,
        easing: ol.easing.easeOut
    });
    animateFeature(layer, f, [anim]);
}
