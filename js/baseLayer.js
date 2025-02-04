class baseLayer {
    draw(tex) {
        const sceneIndex = sceneManager.midiManager_.verticalRadioNums_[this.layerIndex - 1];
        const alpha = sceneManager.midiManager_.faderValues_[this.layerIndex - 1] * 255;
        if (0 < alpha) {
            this[`draw${sceneIndex + 1}`](tex, alpha);
        }
    }
}