var sumDec,
    hexValue;

//Funcion para generar el checksum de una cadena de caracteres
function generateCheckSum(data) {
  sumDec = 0;
  for (var i = 0; i < data.length; i++) {
    sumDec = sumDec + data.charAt(i).charCodeAt(0);
  }

  if (sumDec > 256){
  	//sumDec = sumDec - 256;
    //Se le quitan los 256 tantas veces como hayan en el valor
    sumDec = sumDec - (256 * Math.floor(sumDec / 256))
  }

  hexValue = sumDec.toString(16).toUpperCase();
  return hexValue;
}

exports.generateCheckSum = generateCheckSum;