var sumDec,
    hexValue;

function generateCheckSum(data) {
  sumDec = 0;
  for (var i = 0; i < data.length; i++) {
    sumDec = sumDec + data.charAt(i).charCodeAt(0);
  }
  
  if (sumDec > 256){
  	sumDec = sumDec - 256;
  }

  hexValue = sumDec.toString(16).toUpperCase();
  return hexValue;
}

exports.generateCheckSum = generateCheckSum;