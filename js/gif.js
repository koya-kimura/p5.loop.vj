function gif(imageArray, progress, tex, alpha=255) {
    const index = floor(max(progress * imageArray.length - 0.01, 0));
    const img = imageArray[index];

    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    let imgWidth, imgHeight;
    if (canvasAspect > imgAspect) {
        imgWidth = width;
        imgHeight = width / imgAspect;
    } else {
        imgWidth = height * imgAspect;
        imgHeight = height;
    }

    if (tex == undefined) {
        push();
        tint(alpha);
        imageMode(CENTER);
        image(img, 0, 0, imgWidth, imgHeight);
        pop();
    } else {
        tex.push();
        tex.tint(alpha);
        tex.imageMode(CENTER);
        tex.image(img, width/2, height/2, imgWidth, imgHeight);
        tex.pop();
    }
}