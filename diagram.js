/*
Diagram - A simple HTML canvas that you can draw stuff on.
Copyright (c) Cliff Earl, Antix Development, 2023.
MIT "plus" License.
*/

let 

// 
// Functions
// 

_nothing = e => { }, // an empty function

_clamp = (v, min, max) => (v < min ? min : v > max ? max : v), // Constrain given value within given range.

// 
// Variables.
// 

_PI2 = Math.PI * 2,

// Dimensions.
_x,
_y,
_width,
_height,

// HTML canvas.
_canvas,
_ctx,

// Pointer.
_pointerX = 0,
_pointerY = 0,
_oldPointerX,
_oldPointerY,
_pointerDragging,
_pointerDragX,
_pointerDragY,
_pointerButtons = [0, 0, 0, 0, 0],

_onPointerUp = _nothing,
_onPointerDown = _nothing,
_onPointerClick = _nothing,
_onPointerMove = _nothing,
_onPointerEnter = _nothing,
_onPointerOut = _nothing,

// Keyboard.
_keyMatrix = [],
_shiftHeld,
_ctrlHeld,
_altHeld,

_onKeyDown = _nothing,
_onKeyUp = _nothing,

// Font.
_fontName,
_fontHeight,
_fontAscent,

// 
// Initialisation.
// 

// Create a new diagram at the given coordinates using the given dimensions.
diagram = (x, y, width, height) => {
  // Cache position and dimensions.
  _x = x,
  _y = y;
  _width = width;
  _height = height;

  // Initiate canvas.
  _canvas = document.createElement('canvas');
  _ctx = _canvas.getContext('2d');
  _canvas.width = width;
  _canvas.height = height;
  _canvas.style.position = 'absolute';
  _canvas.style.left = `${x}px`;
  _canvas.style.top = `${y}px`;
  _canvas.style.zIndex = 1e9;
  document.body.prepend(_canvas);

  // Set default font.
  setFont('Courier New', 14);

  // Install keyboard event handlers. We ADD these because the document can have multiple keyboard event handlers.
  document.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase(); // Update internal vars.
    _keyMatrix[`_${key}`] = true;
    _shiftHeld = e.shiftKey;
    _ctrlHeld = e.ctrlKey;
    _altHeld = e.altKey;
    _onKeyDown(e); // Call user code.
  });
  
  document.addEventListener('keyup', (e) => {
    _onKeyUp(e); // Call user code.
    let key = e.key.toLowerCase(); // Update internal vars.
    _keyMatrix[`_${key}`] = false;
    _shiftHeld = false;
    _ctrlHeld = false;
    _altHeld = false;
  });

  // Install pointer event handlers. We SET these because the canvas should only have one of each mouse event handler.
  _canvas.onpointermove = (e) => {
    _oldPointerX = _pointerX; // Update internal vars.
    _oldPointerY = _pointerY;
    _pointerX = _clamp(e.offsetX, 0, _width - 1); // Mouse position is ALWAYS reported as inside the canvas area.
    _pointerY = _clamp(e.offsetY, 0, _height - 1);
    if (_pointerDragging) {
      _pointerDragX = _pointerX - _oldPointerX;
      _pointerDragY = _pointerY - _oldPointerY;
    }
    _onPointerMove(e); // Call user code.
  };

  _canvas.onpointerdown = (e) => {
    let button = e.button; // Update internal vars.
    _pointerButtons[button] = true;
    if (button === 0) _pointerDragging = true;
    _onPointerDown(e); // Call user code.
  };

  _canvas.onpointerup = (e) => {
    _onPointerUp(e); // Call user code.
    let button = e.button; // Update internal vars.
    if (button === 0) _pointerDragging = false;
    _pointerButtons[button] = false;
  }

  _canvas.onpointerclick = (e) => _onPointerClick(e);
  _canvas.onpointerenter = (e) => _onPointerEnter(e);
  _canvas.onpointerout = (e) => _onPointerOut(e);
},

// 
// Methods.
// 

// Set diagram drawing context fill color to the given color.
setFill = (color) => _ctx.fillStyle = `#${color}`,

// Set diagram drawing context stroke color to the given color.
setStroke = (color) => _ctx.strokeStyle = `#${color}`,

// Clear the entire diagram using the given color.
clear = (color = '111') => {
  setFill(color);
  _ctx.fillRect(0, 0, _width, _height)
},

// Draw a line between the two given coordinate pairs, using the given color, line width, and pattern.
drawLine = (x1, y1, x2, y2, color = 'ccc', lineWidth = 1, pattern = []) => {
  x1 += .5;
  y1 += .5;
  x2 += .5;
  y2 += .5;
  setStroke(color);
  _ctx.lineWidth = lineWidth
  _ctx.setLineDash(pattern);
  _ctx.beginPath();
  _ctx.moveTo(x1, y1);
  _ctx.lineTo(x2, y2);
  _ctx.stroke();
},

// Draw an outlined rectangle using the given coordinates, dimensions, color, line width, and pattern.
drawRect = (x, y, width, height, strokeColor = 'ce9', lineWidth = 1, pattern = []) => {
  x += .5;
  y += .5;
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  _ctx.strokeRect(x, y, width, height);
},

// Draw a filled rectangle using the given coordinates, dimensions, and color.
fillRect = (x, y, width, height, color = '563') => {
  setFill(color);
  _ctx.fillRect(x, y, width, height);
},

// Draw a filled AND outlined rectangle at the given coordinates, using the given dimensions, colors, line width, and pattern.
outlineRect = (x, y, width, height, fillColor = '563', strokeColor = 'ce9', lineWidth = 1, pattern = []) => {
  fillRect(x, y, width, height, fillColor);
  x += .5;
  y += .5;
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  _ctx.strokeRect(x, y, width, height);
},

// Plot a single pixel at the given coordinates, using the given color.
plotPixel = (x, y, color = 'ddd') => fillRect(x, y, 1, 1, color),

// Create an arc at the given coordinates, using the given radius.
setArc = (x, y, radius) => {
  x += .5;
  y += .5;
  _ctx.beginPath();
  _ctx.arc(x, y, radius, 0, _PI2);
},

// Draw an outlined circle at the given coordinates, using the given radius, color, line width, and pattern.
drawCircle = (x, y, radius, strokeColor = '8bd', lineWidth = 1, pattern = []) => {
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  setArc(x, y, radius);
  _ctx.stroke();
},

// Draw a filled circle at the given coordinates, using the given radius and color.
fillCircle = (x, y, radius, fillColor = '578') => {
  setFill(fillColor);
  setArc(x, y, radius);
  _ctx.fill();
},

// Draw a filled AND outlined circle at the given coordinates, using the given radius, colors, line width, and pattern.
outlineCircle = (x, y, radius, fillColor = '578', strokeColor = '8bd', lineWidth = 1, pattern = []) => {
  fillCircle(x, y, radius, fillColor);
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  _ctx.stroke();
},

// Draw an outlined ellipse at the given coordinates, using the given radii, color, line width, and pattern.
drawEllipse = (x, y, radiusX, radiusY, strokeColor = 'ddd', lineWidth = 1, pattern = []) => {
  x += .5;
  y += .5;
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  _ctx.beginPath();
  _ctx.ellipse(x, y, radiusX, radiusY, 0, 0, _PI2);
  _ctx.stroke();
},

// Draw a filled ellipse at the given coordinates, using the given radii and color.
fillEllipse = (x, y, radiusX, radiusY, fillColor = '777') => {
  x += .5;
  y += .5;
  setFill(fillColor);
  _ctx.beginPath();
  _ctx.ellipse(x, y, radiusX, radiusY, 0, 0, _PI2);
  _ctx.fill();
},

// Draw a filled AND outlined ellipse at the given coordinates, using the given radii, color, line width, and pattern.
outlineEllipse = (x, y, radiusX, radiusY, fillColor = '777', strokeColor = 'ddd', lineWidth = 1, pattern = []) => {
  fillEllipse(x, y, radiusX, radiusY, fillColor);
  setStroke(strokeColor);
  _ctx.lineWidth = lineWidth;
  _ctx.setLineDash(pattern);
  _ctx.stroke();
},

// Create a path using the given path coordinate pairs.
buildPath = (path) => {
  _ctx.beginPath();
  _ctx.moveTo(path[0], path[1]);
  for (let i = 2; i < path.length;) _ctx.lineTo(path[i++] + .5, path[i++] + .5);
  _ctx.closePath();
},

// Draw an outlined polygon using the given vertices, color, line width, and pattern.
drawPoly = (vertices, strokeColor = 'f9e', lineWidth = 1, pattern = []) => {
  _ctx.lineWidth = lineWidth;
  setStroke(strokeColor);
  _ctx.setLineDash(pattern);
  buildPath(vertices);
  _ctx.stroke();
},

// Draw an outlined polygon using the given vertices, color, line width, and pattern.
fillPoly = (vertices, fillColor = '857') => {
  setFill(fillColor);
  buildPath(vertices);
  _ctx.fill();
},

// Draw an outlined polygon using the given vertices, color, line width, and pattern.
outlinePoly = (vertices, fillColor = '857', strokeColor = 'f9e', lineWidth = 1, pattern = []) => {
  fillPoly(vertices, fillColor);
  _ctx.lineWidth = lineWidth;
  setStroke(strokeColor);
  _ctx.setLineDash(pattern);
  _ctx.stroke();
},

// Set the font using the given name, height, and style.
setFont = (name, height, style = 'normal') => {
  _ctx.font = `${style} ${height}px ${name}`;
  _fontName = name;
  _fontHeight = height;
 _fontAscent = Math.round(_ctx.measureText('|').actualBoundingBoxAscent); // For correct placement of text.
},

// Draw the given text (outlined) at the given coordinates, using the given color, line width, and pattern.
drawText = (text, x, y, color = 'ddd', lineWidth = 1, pattern = []) => {
  _ctx.lineWidth = lineWidth;
  setStroke(color);
  _ctx.setLineDash(pattern);
  _ctx.strokeText(text, x, y + _fontAscent);
},

// Draw the given text (filled) at the given coordinates in the given color.
fillText = (text, x, y, color = 'ddd') => {
  setFill(color);
  _ctx.fillText(text, x, y + _fontAscent);
},

// Draw the given text (filled AND outlined) at the given coordinates, using the given colors, line width, and pattern.
outlineText = (text, x, y, fillColor = 'ddd', strokeColor = 'fff', lineWidth = 1, pattern = []) => {
  fillText(text, x, y, fillColor);
  drawText(text, x, y, strokeColor, lineWidth, pattern);
},

// Draw a grid over the diagram using the given vector which contains the width and height of each grid cell, using the given color, and pattern.
overlayGrid = (cellWidth, cellHeight, color = '444', pattern = []) => {
  _ctx.setLineDash(pattern);
  for (let y = cellHeight; y < _height; y += cellHeight) drawLine(0, y, _width, y, color);
  for (let x = cellWidth; x < _width; x += cellWidth) drawLine(x, 0, x, _height, color);
},

// Set keyboard event handler.
handleKeyDown = f => _onKeyDown = f,
handleKeyUp = f => _onKeyUp = f,

// Getters for key states.
keyHeld = (key) => (_keyMatrix[`_${key}`]),
shiftHeld = () => (_shiftHeld),
ctrlHeld = () => (_ctrlHeld),
altHeld = () => (_altHeld),

// Set pointer event handler.
handlePointerMove = f => _onPointerMove = f,
handlePointerUp = f => _onPointerUp = f,
handlePointerDown = f => _onPointerDown = f,
handlePointerClick = f => _onPointerClick = f,
handlePointerEnter = f => _onPointerEnter = f,
handlePointerLeave = f => _onPointerLeave = f,

// Getters for pointer buttons and position.
getMouseX = () => (_pointerX),
getMouseY = () => (_pointerY),
getMousePosition = () => (vf2d(_pointerX, _pointerY)),
buttonHeld = (button) => (_pointerButtons[button]),

// 
// 2d vector.
// 

// Create a new floating point vector, using the given coordinates.
vf2d = (x = 0, y = 0) => ({ x, y }),

// Create a new integer vector, using the given coordinates.
vi2d = (x = 0, y = 0) => (vf2d(Math.round(x), Math.round(y))), // Integer vector.

// Get magnitude of the given vector.
vmag = (v) => Math.sqrt(v.x * v.x + v.y * v.y),

// Normalize the given vector.
vnorm = (v) => {
  let len = vmag(v);
  if (len > 0) len = 1 / len;
  return vf2d(v.x * len, v.y * len);
},

// Get angle (in radians) between the two given vectors.
vangle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x),

// Add the two given vectors.
vadd = (a, b) => (vf2d(a.x + b.x, a.y + b.y)), // Add.

// Subtract the given vector (b) from the given vector (a).
vsubtract = (a, b) => (vf2d(a.x - b.x, a.y - b.y)),

// Multiply the given vector by the given multiplier.
vmultiply = (v, m) => (vf2d(v.x * m, v.y * m)),

// Divide the given vector by the given divisor.
vdivide = (v, d) => (vf2d(v.x / d, v.y / d)),

// Calculate the dot product of the two given vectors.
vdot = (a, b) => (a.x * b.x + a.y * b.y),

// Calculate the cross product of the two given vectors.
vcross = (a, b) => (a.x * b.y - a.y - b.x),

// Get the distance between the two given vectors.
vdistance = (a, b) => {
  let 
  x = a.x - b.x,
  y = a.y - b.y;
  return Math.sqrt(x * x + y * y);
};
