class SceneManager {
    constructor() {
        this.midiManager_ = new APCMiniMK2Manager();

        this.layers_ = [];
        this.mainTex_ = null;
        this.frameTex_ = null;

        this.postShader_ = null;
    }

    loadPostShader(vertFilePath, fragFilePath) {
        this.postShader_ = loadShader(vertFilePath, fragFilePath);
    }

    setup() {
        this.mainTex_ = createGraphics(width, height);
        this.frameTex_ = createGraphics(width, height);

        this.layers_ = [
            new layer01(),
            new layer02(),
            new layer03(),
            new layer04(),
            new layer05(),
            new layer06(),
            new layer07(),
            new layer08(),
        ];
    }

    resize() {
        this.mainTex_.resizeCanvas(width, height);
        this.frameTex_.resizeCanvas(width, height);
    }

    update() {
        this.midiManager_.update();
    }

    draw() {
        this.mainTex_.background(0);

        this.mainTex_.blendMode(ADD);

        for (const layer of this.layers_) {
            layer.draw(this.mainTex_);
        }

        shader(this.postShader_);

        this.postShader_.setUniform("u_time", millis() * 0.001);
        this.postShader_.setUniform("u_mainTex", this.mainTex_);
        this.postShader_.setUniform("u_frameTex", this.frameTex_);

        for(let i in this.midiManager_.sideButtonToggleState_){
            this.postShader_.setUniform(`u_isEffect${i}`, this.midiManager_.sideButtonToggleState_[i]==1);
        }

        rect(0, 0, width, height);

        this.mainTex_.blendMode(BLEND);
    }
}