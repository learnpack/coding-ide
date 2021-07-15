export const LearnPackError = function(message){
    this.details = message;
};

export function getParams(opts){
  if(!Array.isArray(opts)) opts = [opts];
  const urlParams = new URLSearchParams(window.location.search);
  let obj = {};
  opts.forEach(name => obj[name] = urlParams.get(name));
  return opts.length == 1 ? obj[opts[0]] : obj;
}

export function deepMerge(...sources) {
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
