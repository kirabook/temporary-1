export function getPercentage(value1,value2) {
  const percentage = Math.min(value1, 1 - ((value1 - value2) / value1));
  return percentage;
}
export function getPercentageChance(value) {
  return Math.floor(Math.random() * Math.floor(value));
}
export function getOption(value) {
  var option = value[Math.floor(Math.random()*value.length)];
  return option;
}
export function pathSpeed(value, min, max, newMin, newMax) {
  return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
};
export function getClosest(elem,selector) {
  // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };
  }

  // Get closest match
  for ( ; elem && elem !== document; elem = elem.parentNode ) {
    if ( elem.matches( selector ) ) return elem;
  }
  return null;
};