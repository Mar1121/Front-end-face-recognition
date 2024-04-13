/*
 * @Author: imc-明安瑞
 * @LastEditors: imc-Mar
 * @Description: 有问题请联系我 tel:13562850362
 * 一川烟草，满城风絮，梅子黄时雨。
 */
const imageUpload = document.getElementById('imageUpload');


Promise.all([
    //  face-api.js初始化过程。用于加载 face-api.js 库提供的预训练模型
    // 用于识别人脸的特征。
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // 用于检测人脸的 68 个关键点。
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // 基于 SSD（Single Shot MultiBox Detector）的轻量级移动端模型，用于检测人脸
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start)


async function start() {

    // 覆盖在人脸面部的容器
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labelFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labelFaceDescriptors, .5)
    let image
    let canvas
    // 获取文档主体
    console.log('加载完成后');
    // 配置文件加载完成后的显示
    document.body.append('loaded');
    // 监听图片文件的改变
    imageUpload.addEventListener('change', async () => {
        if (image) {
            image.remove()
        }
        if (canvas) {
            canvas.remove()
        }
        // faceapi.bufferToImage(buffer) 方法会将这个 ArrayBuffer 对象转换成一个 HTMLImageElement 对象，存储在 image 变量中，你可以在后续的代码中使用这个 image 对象进行处理。
        // 本质上将这个图片或者视频转换成了实际的dom元素
        image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)
        // 
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)


        // console.log('image--', image);
        // detectAllFaces 方法，用于检测图像中的所有人脸
        // withFaceLandmarks 方法，用于指定在检测到的人脸中获取人脸的关键点（landmarks）。这些关键点包括眼睛、眉毛、鼻子、嘴巴等位置的坐标。
        // withFaceDescriptors 方法，用于指定在检测到的人脸中获取人脸的特征向量（face descriptors）。这些特征向量可以用于人脸识别和聚类等任务。
        const detections = await faceapi.detectAllFaces(image)
            .withFaceLandmarks().withFaceDescriptors()
        // console.log('detections--', detections);
        // 根据我们传递的尺寸将我们检测的所有框调整为正确的尺寸
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        // console.log('results--', results);

        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            console.log(results);
            drawBox.draw(canvas)
        })


    })
}


function loadLabeledImages() {
    const labels = ['明安瑞', '文慧', '夏雨荷', '慌慌', '郭增印']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`http://127.0.0.1:5500/labeled_images/${label}/${i}.jpg`)
                // console.log('img--', img);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                // console.log('detections--', detections);
                descriptions.push(detections.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}