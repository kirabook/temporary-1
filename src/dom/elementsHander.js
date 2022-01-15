export function createDOMElement(scene, type = 'div', id = null, classLst = null, inner = '') {
  const elem = document.createElement(type);
  if (id) elem.id = id;
  if (classLst) elem.classList.add(classLst);
  elem.innerHTML = inner;

  var domElement = scene.add.dom(0, 0, elem);
  return domElement;
}

export function createElement(type = 'div', id = null, classLst = null, inner = '') {
  const elem = document.createElement(type);
  if (id) elem.id = id;
  if (classLst) elem.classList.add(classLst);
  elem.innerHTML = inner;
  return elem;
}

export function getElement(id) {
  const element = document.getElementById(id);
  return element;
}

export function querySelector(id) {
  const element = document.querySelector(id);
  return element;
}

export function querySelectorAll(id) {
  const element = document.querySelectorAll(id);
  return element;
}

export function setInner(elem, str) {
  elem.innerHTML = str;
}

export function addToInner(elem, str) {
  elem.innerHTML += str;
}

export function addToClass(elem, clss) {
  elem.classList.add(clss);
}

export function setToClass(elem, clss) {
  elem.classList.value = clss;
}

export function removeToClass(elem, clss) {
  elem.classList.remove(clss);
}

export function setClickListener(elem, funct) {
  elem.addEventListener('click', funct);
}

export function setEnterListener(elem, funct) {
  elem.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
      funct();
    }
  });
}

export function setAttribute(elem, attr, val) {
  elem.setAttribute(attr, val); 
}

export function getAttribute(elem, attr) {
  const attrValue = elem.getAttribute(attr); 
  return attrValue;
}

export function setValue(elem, val) {
  elem.value = val;
}

export function prependChild(elem, child) {
  elem.prependChild(child);
}

export function appendChild(elem, child) {
  elem.appendChild(child);
}

export function prependToBody(child) {
  document.body.prependChild(child);
}

export function appendToBody(child) {
  document.body.appendChild(child);
}

export function appendChildren(elem, children) {
  children.forEach(child => elem.appendChild(child));
}