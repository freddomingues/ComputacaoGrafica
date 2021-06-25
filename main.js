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
    load();
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

let grayScaleNTSC = function() {
    load();
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
    load();
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
    load();
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
/* Gaussian Blur
let gaussianBlur = function() {
    
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    //Define a intensidade do desfoque
    let radius = 3;
    //desvio padrão
    let sigma = Math.max((radius/2), 1);
    //tamanho do kernel
    let kernelWidth = (2*radius)+1;

    //inicialização do kernel com valores 0.0
    for(x = 0; x < kernelWidth; x++){
        for(y = 0; y < kernelWidth; y++){
            kernel[x][y] = 0.0;
        }
    }
    
    let sum = 0.0;

    //Preenchendo cada posição do kernel com o respectivo valor da Distribuição Gaussiana
    //X e Y representam a distância que estamos do pixel do centro.
    for(x = -radius; x < radius; x++) {
        for(y = -radius; y < radius; y++){

            //Definindo a fórmula da distribuição para encontrar o valor do kernel
            let exponentNumerator = (-(x*x+y*y));
            let exponentDenominator = (2 * sigma * sigma);

            let eExpression = Math.pow(exponentNumerator / exponentDenominator);
            let kernelValue = (eExpression / (2 * Math.PI * sigma * sigma));

            //Adicionamos radius aos índices para evitar problemas fora do limite 
            //porque x e y podem ser negativos
            kernel[x + radius][y + radius] = kernelValue;
            sum += kernelValue;
        }
    }

    //Normalização do kernel
    //Isso garante que todos os valores do kernel somem 1
    for(x = 0; x < kernelWidth; x++){
        for(y = 0; y < kernelWidth; y++){
            kernel[x][y] /= sum;
        }
    }

    // Ignorando as bordas para facilitar a implementação
    // Isso fará com que uma borda fina ao redor da imagem não seja processada
    for (var x = radius; x < (img.width - radius); x++) {
        for (var y = radius; y < (img.height - radius); y++) {
        
            var redValue = 0.0;
            var greenValue = 0.0;
            var blueValue = 0.0;

            // Esta é a etapa de convolução
            // Executamos o kernel sobre este agrupamento de pixels centralizado em torno do pixel em (x, y)
            for(kernelX = -radius; kernelX < radius; kernelX++){
                for(kernelY = -radius; kernelY < radius; kernelY++){

                    // Carrega o peso para este pixel da matriz de convolução
                    var kernelValue = kernel[kernelX + radius][kernelY + radius];

                    // Multiplica cada canal pelo peso do pixel conforme especificado pelo kernel
                    redValue += (img.getPixel(x - kernelX, y - kernelY).red) * kernelValue;
                    greenValue += (img.getPixel(x - kernelX, y - kernelY).green) * kernelValue;
                    blueValue += (img.getPixel(x - kernelX, y - kernelY).blue) * kernelValue;
                }
            }
    
            img.setPixel(x, y, new RGBColor(redValue, greenValue, blueValue));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}
*/

let threshBinaryManual = function(){
    load();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    let maxValue = 255;
    let thresh = 121;
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

/* rotate90
let rotate90 = function(){
    load2();
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    
    var b = img.width - 1;

    for(i = 0; i < img.width; i++){             
        for(j = 0; j < img.height; j++){        
            var red = img.getPixel(i,j).red;
            var green = img.getPixel(i,j).green;
            var blue = img.getPixel(i,j).blue;
            img.setPixel(j,b,new RGBColor(red, green, blue));
        }
        b--;
    }
    context.putImageData(img.imageData, 0, 0);
}
*/

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
//document.getElementById('btnGaussian').addEventListener('click', gaussianBlur);
document.getElementById('btnthreshBinaryManual').addEventListener('click', threshBinaryManual);
document.getElementById('btnRotate90').addEventListener('click', rotate90);

