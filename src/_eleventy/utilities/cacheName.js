let newName = () => {

  // declare all characters
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < 7; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  };

  result.toString();
  // there are leading spaces in the hash string, who knows why but get rid of them
  let resultOne = result.trimStart();
  
  let cacheName = 'disckeeperCache-' + resultOne;
  return cacheName
};


module.exports = newName();