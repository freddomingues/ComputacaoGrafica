var fileLoader = document.getElementById('fileLoader');
var image = document.getElementById('image');
var canvas = document.getElementById('image-canvas');
var context = null;

let loadFromFile = function(){
    fileLoader.click();
    fileLoader.addEventListener('input', ()=>{
        image.src = fileLoader.files[0].name;
    });
}

let load = function (){
    
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}

let grayScaleMean = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            pixel.push(img.getPixel(i-1,j-1).red);
            pixel.push(img.getPixel(i-1,j).red);
            pixel.push(img.getPixel(i-1,j+1).red);
            pixel.push(img.getPixel(i,j-1).red);
            pixel.push(img.getPixel(i,j).red);
            pixel.push(img.getPixel(i,j+1).red);
            pixel.push(img.getPixel(i+1,j-1).red);
            pixel.push(img.getPixel(i+1,j).red);
            pixel.push(img.getPixel(i+1,j+1).red);
            var gray = pixel.reduce((a, b) => a + b, 0) / 9;
    
            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let grayScaleNTSC = function() {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i+=4) {
        var red = data[i];
        var green = data[i+1];
        var blue = data[i+2];
        var gray = (0.299*red) + (0.587*green) + (0.114*blue); 
        data[i] = data[i+1] = data[i+2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

let meanSuavization = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {        
        for (var j = 0; j < img.height; j++) {   
            var pixel = Array();
            //pegando os pixels do kernel e colocando no array pixel
            pixel.push(img.getPixel(i-1,j-1));
            pixel.push(img.getPixel(i-1,j));
            pixel.push(img.getPixel(i-1,j+1));
            pixel.push(img.getPixel(i,j-1));
            pixel.push(img.getPixel(i,j));
            pixel.push(img.getPixel(i,j+1));
            pixel.push(img.getPixel(i+1,j-1));
            pixel.push(img.getPixel(i+1,j));
            pixel.push(img.getPixel(i+1,j-1));

            var reds = Array();
            var greens = Array();
            var blues = Array();

            for( x = 0; x < pixel.length; x++){
                reds.push(pixel[x].red);
                greens.push(pixel[x].green);
                blues.push(pixel[x].blue);
            }

            var redMean = reds.reduce((a,b) => a + b) / reds.length;
            var greenMean = greens.reduce((a,b) => a + b) / greens.length;
            var blueMean = blues.reduce((a,b) => a + b) / blues.length;

            img.setPixel(i, j, new RGBColor(redMean, greenMean, blueMean));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let medianSuavization = function() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            //pegando os pixels do kernel e colocando no array pixel
            pixel.push(img.getPixel(i-1,j-1));
            pixel.push(img.getPixel(i-1,j));
            pixel.push(img.getPixel(i-1,j+1));
            pixel.push(img.getPixel(i,j-1));
            pixel.push(img.getPixel(i,j));
            pixel.push(img.getPixel(i,j+1));
            pixel.push(img.getPixel(i+1,j-1));
            pixel.push(img.getPixel(i+1,j));
            pixel.push(img.getPixel(i+1,j-1));

            var reds = Array();
            var greens = Array();
            var blues = Array();

            for( x = 0; x < pixel.length; x++){
                reds.push(pixel[x].red);
                greens.push(pixel[x].green);
                blues.push(pixel[x].blue);
            }

            reds.sort();
            greens.sort();
            blues.sort();

            var redMedian = reds[4];
            var greenMedian = greens[4];
            var blueMedian = blues[4];
    
            img.setPixel(i, j, new RGBColor(redMedian, greenMedian, blueMedian));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}
/*
let gaussianBlur = function() {
    
    let radius = 3;
    let sigma = 1.5;
    let kernelWidth = 9;

    var kernel = [[0.0,0.0,0.0]
                  [0.0,0.0,0.0]
                  [0.0,0.0,0.0]];
    
    let sum = 0.0;

    for(x = 0; x < radius; x++) {
        for(y = 0; y < radius; y++){
            let exponentNumerator = (-(x*x+y*y));
            let exponentDenominator = (2 * sigma * sigma);

            let eExpression = Math.pow(exponentNumerator /exponentDenominator);
            let kernelValue = (eExpression / (2 * Math.PI * sigma * sigma));

            kernel[x + radius][y + radius] = kernelValue;
            sum += kernelValue;
        }
    }

    for(x = 0; x < kernelWidth; x++){
        for(y = 0; y < kernelWidth; y++){
            kernel[x][y] /= sum;
        }
    }

    for(x = 0; x < radius; x++){
        for(y = 0; y < radius; y++){
            var redValue = 0.0;
            var greenValue = 0.0;
            var blueValue = 0.0;
        }
    }

    
    
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            pixel.push(img.getPixel(i-1,j-1).red);
            pixel.push(img.getPixel(i-1,j).red);
            pixel.push(img.getPixel(i,j-1).red);
            pixel.push(img.getPixel(i+1,j-1).red);
            pixel.push(img.getPixel(i,j).red);
            pixel.push(img.getPixel(i-1,j+1).red);
            pixel.push(img.getPixel(i,j+1).red);
            pixel.push(img.getPixel(i+1,j).red);
            pixel.push(img.getPixel(i+1,j+1).red);
            pixel.sort();
            var gray = pixel[4];
    
            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}*/

class RGBColor {
    constructor(r, g, b) {
      this.red = r;
      this.green = g; 
      this.blue = b;
    }
}

class MatrixImage {
    constructor(imageData) {
      this.imageData = imageData;
      this.height = imageData.height; 
      this.width = imageData.width;
    }

    getPixel(x, y) {
        let position = ((y * (this.width * 4)) + (x * 4));

        return new RGBColor(
             this.imageData.data[position],   //red
             this.imageData.data[position+1], //green
             this.imageData.data[position+2], //blue
        );
    }

    setPixel(x, y, color) {
        let position = ((y * (this.width * 4)) + (x * 4));
        this.imageData.data[position] = color.red;
        this.imageData.data[position+1] = color.green;
        this.imageData.data[position+2] = color.blue;
    }
}

document.getElementById('btnLoad').addEventListener('click', load);
document.getElementById('btnGrayScaleMean').addEventListener('click', grayScaleMean);
document.getElementById('btnGrayScaleNTSC').addEventListener('click', grayScaleNTSC);
document.getElementById('btnMeanSuavization').addEventListener('click', meanSuavization);
document.getElementById('btnMedianSuavization').addEventListener('click', medianSuavization);
document.getElementById('btnGaussian').addEventListener('click', gaussianBlur);
