const LearnPackError = function(message){
    this.details = message;
};

function getParams(opts){
  const urlParams = new URLSearchParams(window.location.search);
  let obj = {};
  for(let key in opts) obj[key] = urlParams.get(key);
}

function deepMerge(...sources) {
  let acc = {};
  for (const source of sources) {
    if (Array.isArray(source)) {
      if (!(Array.isArray(acc))) {
        acc = [];
      }
      acc = [...source];
    } else if (source instanceof Object) {
      for (let [key, value] of Object.entries(source)) {
        if (value instanceof Object && key in acc) {
          value = deepMerge(acc[key], value);
        }
        if(value != undefined){
          acc = Object.assign(acc, { [key]: value });
        } 
      }
    }
  }
  return acc;
}

export default { LearnPackError, deepMerge, getParams };