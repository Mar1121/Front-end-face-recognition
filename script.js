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


function start() {

    // 覆盖在人脸面部的容器
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)

    // 获取文档主体
    console.log('加载完成后');
    // 配置文件加载完成后的显示
    document.body.append('loaded');
    // 监听图片文件的改变
    imageUpload.addEventListener('change', async () => {
        // faceapi.bufferToImage(buffer) 方法会将这个 ArrayBuffer 对象转换成一个 HTMLImageElement 对象，存储在 image 变量中，你可以在后续的代码中使用这个 image 对象进行处理。
        // 本质上将这个图片或者视频转换成了实际的dom元素
        const image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)
        // 
        const canvas = faceapi.createCanvasFromMedia(image)
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

        resizedDetections.forEach(detections => {
            const box = detections.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' })
            drawBox.draw(canvas)
        })


    })
}


function loadLabeledImages() {
    const labels = ['明安瑞']
    return Promise.all(
        labels.map(async label => {
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(``)
            }
        })
    )
}