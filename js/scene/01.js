class layer01 extends baseLayer {
    constructor() {
        super();
        this.layerIndex = 1;
    }

    draw1(tex, alpha) {
        gif(IMAGES["river"], lvm.zigzagEase(4), tex, alpha);
    }

    draw2(tex, alpha) {
        gif(IMAGES["game"], lvm.zigzagEase(4), tex, alpha);
    }

    draw3(tex, alpha) {
    }

    draw4(tex, alpha) {
    }

    draw5(tex, alpha) {
    }

    draw6(tex, alpha) {
    }

    draw7(tex, alpha) {
    }

    draw8(tex, alpha) {
    }
}