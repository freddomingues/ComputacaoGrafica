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

//RGB to Gray scale with Mean
let grayScaleMean = function() {
    //load();
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i+=4) {
        var red = data[i];
        var green = data[i+1];
        var blue = data[i+2];
        var gray = (red + green + blue) / 3; 
        data[i] = data[i+1] = data[i+2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

//RGB to Gray scale with NTSC
let grayScaleNTSC = function() {
    //load();
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

//Mean Suavization function
let meanSuavization = function() {
    //load();
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

//HSL to RGB function
function HSLToRGB(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;
  
      if (0 <= h && h < 60) {
          r = c; g = x; b = 0;  
      } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
    }
  
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return new Array(r, g, b);
}
  
//RGB to HSL function
function rgbToHsl(c) {
    var r = c[0]/255, g = c[1]/255, b = c[2]/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return new Array(h * 360, s * 100, l * 100);
}

// Median Suavization
let medianSuavization = function() {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    
    for (var i = 1; i < img.width+1; i++) {        
        for (var j = 1; j < img.height+1; j++) {   

            var px = Array();
            px.push(rgbToHsl(img.getPixelArray(i-1,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i-1,j)));
            px.push(rgbToHsl(img.getPixelArray(i-1,j+1)));

            px.push(rgbToHsl(img.getPixelArray(i,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i,j)));
            px.push(rgbToHsl(img.getPixelArray(i,j+1)));

            px.push(rgbToHsl(img.getPixelArray(i+1,j-1)));
            px.push(rgbToHsl(img.getPixelArray(i+1,j)));
            px.push(rgbToHsl(img.getPixelArray(i+1,j-1)));

            var h = Array();
            var s = Array();
            var l = Array();

            for (let index = 0; index < px.length; index++) {
                h.push(px[index][0]);
                s.push(px[index][1]); 
                l.push(px[index][2]); 
            }

            function sortfunction(a, b){
                return (a - b)
            }

            h.sort(sortfunction);
            s.sort(sortfunction);
            l.sort(sortfunction);

            var rgb = HSLToRGB(h[4],s[4],l[4]);

            var red = rgb[0];
            var green = rgb[1];
            var blue = rgb[2];
            img.setPixel(i, j, new RGBColor(red, green, blue));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

// Gaussian Blur
let gaussianBlur = function() {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    let px = imageData.data;
    let tempPx = new Uint8ClampedArray(px.length);
    tempPx.set(px);

    for(i = 0; i < px.length; i++){
        if(i % 2 ===3 ){ continue;}

        px[i] = (tempPx[i] + 
                 (tempPx[i - 4]) + 
                 (tempPx[i + 4]) + 
                 (tempPx[i - 4 * imageData.width]) + 
                 (tempPx[i + 4 * imageData.width]) + 
                 (tempPx[i - 4 * imageData.width - 4]) +
                 (tempPx[i + 4 * imageData.width + 4]) +
                 (tempPx[i + 4 * imageData.width - 4]) +
                 (tempPx[i - 4 * imageData.width + 4]) 
                 ) / 9;
    }

    context.putImageData(imageData, 0, 0);
}

// Limiarização Binária
let threshBinaryManual = function(){
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    let maxValue = 255;
    let thresh = 40;
    for (var i = 0; i < img.width; i++) {        
        for (var j = 0; j < img.height; j++) {   

            var red = img.getPixel(i,j).red;
            var green = img.getPixel(i,j).green;
            var blue = img.getPixel(i,j).blue;
            var meanPixel = ( red + green + blue ) / 3;

            if(meanPixel < thresh){
                img.setPixel(i,j, new RGBColor(maxValue, maxValue, maxValue));
            }else{
                img.setPixel(i,j, new RGBColor(0, 0, 0));
            }
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

//rotate90
let rotate90 = function(){
    //load();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    canvas.width = image.height;
    canvas.height = image.width;
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(Math.PI/2);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}

//Rotate 180
let rotate180 = function(){
    //load();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(180*Math.PI/180);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}

//Rotate 270
let rotate270 = function(){
    //load();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.save();
    canvas.width = image.height;
    canvas.height = image.width;
    context.translate(canvas.width/2,canvas.height/2);
    context.rotate(270*Math.PI/180);
    context.drawImage(image, -image.width/2, -image.height/2);
    context.restore();
}

//Redimensionamento 4X
let red4X = function () {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var maxWidth = imageData.width*4;
    var maxHeight = imageData.height*4;
    var width = imageData.width;
    var height = imageData.height;

    if (width > height) {
        if (width < maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    } else {
        if (height < maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);
}

//Redimensionamento 2X
let red2X = function () {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var maxWidth = imageData.width*2;
    var maxHeight = imageData.height*2;
    var width = imageData.width;
    var height = imageData.height;

    if (width > height) {
        if (width < maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    } else {
        if (height < maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);
}

//Redimensionamento 1/2
let red12 = function () {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var maxWidth = imageData.width*0.5;
    var maxHeight = imageData.height*0.5;
    var width = imageData.width;
    var height = imageData.height;

    if (width > height) {
        if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    } else {
        if (height < maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);
}

//Redimensionamento 1/4
let red14 = function () {
    //load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var maxWidth = imageData.width*0.25;
    var maxHeight = imageData.height*0.25;
    var width = imageData.width;
    var height = imageData.height;

    if (width > height) {
        if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
        }
    } else {
        if (height < maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);
}

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

    getPixelArray(x,y){
        let position = ((y * (this.width * 4)) + (x * 4));

        return new Array(
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

    setPixel2(x, y, color){
        let position = ((y * (this.width * 4)) + (x * 4));
        this.imageData[x][y].data[position] = color.red;
        this.imageData[x][y].data[position + 1] = color.green;
        this.imageData[x][y].data[position + 2] = color.blue;
        //image.data[x][y].red = color.red;
        //image.data[x][y].green = color.green;
        //image.data[x][y].blue = color.blue;
        //return image;
    }
}

document.getElementById('btnLoad').addEventListener('click', load);
document.getElementById('btnGrayScaleMean').addEventListener('click', grayScaleMean);
document.getElementById('btnGrayScaleNTSC').addEventListener('click', grayScaleNTSC);
document.getElementById('btnMeanSuavization').addEventListener('click', meanSuavization);
document.getElementById('btnMedianSuavization').addEventListener('click', medianSuavization);
document.getElementById('btnGaussian').addEventListener('click', gaussianBlur);
document.getElementById('btnthreshBinaryManual').addEventListener('click', threshBinaryManual);
document.getElementById('btnRotate90').addEventListener('click', rotate90);
document.getElementById('btnRotate180').addEventListener('click', rotate180);
document.getElementById('btnRotate270').addEventListener('click', rotate270);
document.getElementById('btnRed4X').addEventListener('click', red4X);
document.getElementById('btnRed2X').addEventListener('click', red2X);
document.getElementById('btnRed12').addEventListener('click', red12);
document.getElementById('btnRed14').addEventListener('click', red14);