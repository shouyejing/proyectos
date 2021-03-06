// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, w, h, fill) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.type = 'Rectangulo';
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Width) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}
var ctxAuxiliar = document.createElement("canvas").getContext("2d"); // usado para determinar el tamaño de un texto

function ShapeText (x, y,text,weight,size,family,font,fill) {
  this.font = function(){
    return this.font_weight +' '+ this.font_size +'px '+ this.font_family;
  }
  this.font_weight = weight || "bold";
  this.font_size = size || 24;
  this.font_family = family || "verdana";
  this.text = text || "escribir...";
  ctxAuxiliar.font = this.font(); 
  d = ctxAuxiliar.measureText(text);
  w = d.width;
  h = parseInt(this.font_size);
  
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#AAAAAA';
  this.type = 'Texto'
  this.AumentarSize = function(){
    if(this.font_size>200)return
    this.font_size++;
  }
  this.DisminuirSize = function(){
    if(this.font_size<=1)return
    this.font_size--;
  }
}
ShapeText.prototype = new Shape;
ShapeText.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.font = this.font();
  ctx.textBaseline = "top"
  this.w = ctx.measureText(this.text).width;
  this.h = parseInt(this.font_size);
  ctx.fillText(this.text,this.x, this.y);
}
function ShapeBorradorXseleccion (x, y, w, h, fill){
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;
  this.fill = fill || '#FFFFFF';
  this.type = 'BorradorXseleccion'
}
ShapeBorradorXseleccion.prototype = new Shape;
function ShapeBorradorXarrastre (puntos, size, fill){
  this.size = size || 24;
  this.fill = fill || '#48484C';
  this.type = 'BorradorXarrastre'
  this.puntos = puntos;
}
ShapeBorradorXarrastre.prototype = new Shape;
ShapeBorradorXarrastre.prototype.draw = function(ctx) {
  ctx.beginPath();
  
  //console.log("ctx.beginPath();")
  //console.log("ctx.strokeStyle ="+ this.fill)
  ctx.strokeStyle = this.fill;
  //console.log("ctx.lineWidth ="+ this.size)
  ctx.lineWidth=this.size;
  //console.log("ctx.moveTo("+this.puntos[0].x+", "+this.puntos[0].y+");")
  ctx.moveTo(this.puntos[0].x, this.puntos[0].y);
  for(var i in this.puntos) {
    //console.log("ctx.lineTo("+i.x+", "+i.y+");")
        ctx.lineTo(this.puntos[i].x, this.puntos[i].y);  // ubicamos el cursor en la posicion (10,10)

  }
  //console.log("ctx.stroke();")
  ctx.stroke()
  
}
function CanvasState(figurasCanvas,borradorCanvas) {
  // **** First some setup! ****
  this.canvas = figurasCanvas;
  this.width = figurasCanvas.naturalWidth;
  this.height = figurasCanvas.naturalHeight;
  this.ctx = figurasCanvas.getContext('2d');
  this.canvas_borrador = borradorCanvas
  this.ctx_borrador = borradorCanvas.getContext('2d');
  this.defaultColor = '#FFFFFF'; // para borrar, y para texto
  this.defaultWidth = 20;        
  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  // **** Keep track of state! ****
  
  this.valid = false;     //Cuando se establece en false, el lienzo volverá a dibujar todo
  this.fondo = false; //Imagen a colocar en el fondo
  this.shapes = [];       //La colección de cosas a dibujar
  this.dragging = false;  //Seguimiento de cuando estamos arrastrando
  //El objeto seleccionado actual. En el futuro podríamos convertir esto en una matriz para la selección múltiple
  this.selection = null;
  this.BorradorXseleccion = null;
  this.BorradorXarrastre = null;
  this.dragoffx = 0;      //Ver eventos de mousedown y mousemove para explicación
  this.dragoffy = 0;
  // **** ¡Entonces eventos! ****
  // Este es un ejemplo de un cierre!
  // Aqui "this" significa el CanvasState. Pero estamos haciendo eventos en la propia lona,
  // y cuando los eventos son disparados en el lienzo la variable "this" va a significar el lienzo!
  // Debido a que todavía queremos usar este CanvasState en particular en los eventos tenemos que guardar una referencia a él.
  // Esta es nuestra referencia!
  var myState = this;
  
  //corrige un problema cuando un doble clic hace que el texto se seleccione en el lienzo
  this.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  // Arriba, abajo y mover son para arrastrar 
  
    
  this.setFuncionActual = function(funcion){
    switch(funcion) {
      case "BorradorXseleccion":
        this.BorradorXseleccion = "listo";
        this.BorradorXarrastre = null;
        break;
      case "BorradorXarrastre":
        this.BorradorXseleccion = null;
        this.BorradorXarrastre = "listo";
        break;
      case "Texto":
        break;
      default:
          return true;
    }
    this.funcionActual = funcion;
  }



  document.onkeypress = function(e){
    //funcion para que solo acepte letras
    function soloLetras(e) {
      key = e.keyCode || e.which;
      tecla = String.fromCharCode(key).toString();
      letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789,.()\"/$%&#@!¡¿?";//Se define todo el abecedario que se quiere que se muestre.
      especiales = [8, 37, 39, 46, 6]; //Es la validación del KeyCodes, que teclas recibe el campo de texto.

      tecla_especial = false
      for(var i in especiales) {
          if(key == especiales[i]) {
              tecla_especial = true;
              break;
          }
      }

      if(letras.indexOf(tecla) == -1 && !tecla_especial){
        //alert('Tecla no aceptada');
          return false;
        }
        return true;
    }

    if(e.target.tagName!="INPUT"){
    e.stopPropagation();
    e.preventDefault();
    if(myState.selection != null){ // comprobamos que haya un elemento seleccionado
      if(myState.selection.type =='Texto'){ //Si el elemento seleccionado es de tipo texto
        if(soloLetras(e)){
          myState.selection.text = myState.selection.text+String.fromCharCode(e.which).toString();  
          myState.valid = false;  
        }
        if(e.keyCode == 8){  // evento borrar

          var t = myState.selection.text
          myState.selection.text =t.substring(0,t.length-2); 
          myState.valid = false;
        }
        if(e.keyCode == 45 || e.which == 45){ // evento tecla menos numpad 
          myState.selection.DisminuirSize();
          myState.valid = false;
        }
        if(e.keyCode == 43 ||  e.which == 43){ // evento tecla mas numpad 
          myState.selection.AumentarSize();
          myState.valid = false;
        }
        
      }
      if(e.keyCode == 46){
          var shapes = myState.shapes;
          var index = shapes.indexOf(myState.selection);
          shapes.splice(index, 1);
          myState.selection = null;
          myState.valid = false;
        }

    }
    
  }
}
  this.canvas.addEventListener('mousedown', function(e) {
    if (e.button!=0)return
    myState.selection = null;
      myState.valid = false;
    }, true);
  this.canvas.addEventListener('mousedown', function(e) {
    if (e.button!=0)return
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
      if (shapes[i].contains(mx, my)) {   
        if(shapes[i].type != 'BorradorXseleccion' && shapes[i].type != 'BorradorXarrastre'){ 
          var mySel = shapes[i];// Mantener un registro del lugar en el que hicimos clic
                                // Para que podamos moverlo sin problemas (ver mousemove) 
          myState.dragoffx = mx - mySel.x;
          myState.dragoffy = my - mySel.y;
          myState.dragging = true;
          myState.selection = mySel;

          if (mySel.type== 'Texto'){
            myState.setFuncionActual('Texto')
            $("#fuentesLetras").val(mySel.font_family)
            $("#tamTexto").val(mySel.font_size)
            $('#color').css("background-color", mySel.fill)
          }
          myState.valid = false;
          return;
        }
        
      }
    }
    // Si no han retornado significa que no hemos podido seleccionar nada.
    // Si hubo un objeto seleccionado, lo deseleccionamos
    if (myState.selection) {
      myState.selection = null;
      myState.valid = false; // Necesidad de borrar el borde de selección antiguo
    }

    if (myState.BorradorXseleccion=="listo") {
      myState.BorradorXseleccion = {x:mx,y:my}
      //myState.valid = false; // Necesidad de borrar el borde de selección antiguo
    }
    if (myState.BorradorXarrastre=="listo") {
      myState.ctx_borrador.strokeStyle = myState.defaultColor;
      myState.ctx_borrador.lineWidth =  myState.defaultWidth;
      myState.ctx_borrador.lineCap = "round";
      myState.ctx_borrador.moveTo(mx, my)
      myState.BorradorXarrastre = [{x:mx,y:my}]
      myState.ctx_borrador.lineTo(mx, my);
      myState.ctx_borrador.stroke();
      //myState.valid = false; // Necesidad de borrar el borde de selección antiguo
    }
  }, true);
  document.addEventListener('mousemove', function(e) {
    
    if (myState.dragging){
      var mouse = myState.getMouse(e);
      //No queremos arrastrar el objeto por su esquina superior izquierda, queremos arrastrarlo
      // de donde hicimos clic. Por eso ahorramos el offset y lo usamos aquí
      myState.selection.x = mouse.x - myState.dragoffx;
      myState.selection.y = mouse.y - myState.dragoffy;   
      myState.valid = false; // Algo está arrastrando así que debemos redibujar
    }
    if (myState.BorradorXseleccion != null && myState.BorradorXseleccion != "listo"){
      var mouse = myState.getMouse(e);
      myState.BorradorXseleccion.w = mouse.x - myState.BorradorXseleccion.x;
      myState.BorradorXseleccion.h = mouse.y - myState.BorradorXseleccion.y;
      myState.valid = false;
      //console.log("asd")
    }
    if (myState.BorradorXarrastre!=null && myState.BorradorXarrastre != "listo") {
      var mouse = myState.getMouse(e);
      myState.ctx_borrador.lineTo(mouse.x , mouse.y)
      myState.BorradorXarrastre.push({x:mouse.x,y:mouse.y})
      myState.ctx_borrador.stroke();
      //myState.valid = false;
    }
  }, true);
  this.canvas.addEventListener('mouseup', function(e) {
    if (e.button!=0)return
    //console.log("mouse arriba")
    myState.dragging = false;
    if(myState.BorradorXseleccion!=null){
      //controlZoom.bloquearMovimiento(false);
      var x = myState.BorradorXseleccion.x;
      var y = myState.BorradorXseleccion.y;
      var w = myState.BorradorXseleccion.w;
      var h = myState.BorradorXseleccion.h;
      //console.log(x+' - '+y+' - '+w+' - '+h);
      if(w<0){
        myState.BorradorXseleccion.x = x+w; myState.BorradorXseleccion.w = w*-1;
      }
      if(h<0){
        myState.BorradorXseleccion.y = y+h; myState.BorradorXseleccion.h = h*-1;
      }
      myState.addShape(new ShapeBorradorXseleccion(myState.BorradorXseleccion.x,myState.BorradorXseleccion.y,myState.BorradorXseleccion.w,myState.BorradorXseleccion.h))
      myState.setFuncionActual("BorradorXseleccion");
      myState.drawBorrador();
    }
    if(myState.BorradorXarrastre!=null){
      a = new ShapeBorradorXarrastre(myState.BorradorXarrastre,myState.defaultWidth,myState.defaultColor)
      myState.addShape(a)
      myState.setFuncionActual("BorradorXarrastre");
      myState.drawBorrador();

    }
    myState.valid = false;

  }, true);
  // doble clic para crear nuevas formas
  this.canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);
    //console.log(mouse)
    myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
  }, true);
  
  // **** Opciones! ****
  
  
  this.interval = 22;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
  if (shape.type== 'BorradorXseleccion') this.shapes.unshift(shape);
  else if (shape.type== 'BorradorXarrastre') this.shapes.unshift(shape);
  else{
    this.shapes.push(shape);
    this.shapes.sort(function (f, s){
                        var a , b;
                        if(f.type == 'Rectangulo')a = 1;
                        else if(f.type == 'Texto')a = 2;
                        else a=0;
                        if(s.type == 'Rectangulo')b = 1;
                        else if(s.type == 'Texto')b = 2;
                        else b=0;
                        
                        //console.log(a +" : "+b)
                        return a-b;
                      });
    this.valid = false;
  }
  
  
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

//Mientras el draw es llamado tan a menudo como la variable INTERVAL exige,
//Sólo hace algo si el lienzo se invalida por nuestro código
CanvasState.prototype.draw = function() {
  // Si nuestro estado no es válido, vuelve a dibujar y validar!
  if (!this.valid) {
    console.log("draw")
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();

    
    //Dibuja todas las formas
    var l = shapes.length;  
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      if(shapes[i].type != 'BorradorXseleccion' && shapes[i].type != 'BorradorXarrastre') {
        shapes[i].draw(ctx);  
      }
        
    }
    
    // dibujar la selección
    // en este momento esto es sólo un golpe a lo largo del borde de la forma seleccionada
    ctx.save()
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }

    if (this.BorradorXseleccion != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.BorradorXseleccion;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
    ctx.restore()
    //ctx.stroke();
    
    // ** Añadir cosas que desea dibujar en la parte superior todo el tiempo aquí **
    
    this.valid = true;
  }
}
CanvasState.prototype.drawBorrador = function() {
  console.log("drawBorrador")
    var ctx = this.ctx_borrador;
    var shapes = this.shapes;
    ctx.clearRect(0, 0, this.width, this.height);

    
    //Dibuja las formas para borrar
    var l = shapes.length;  
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      //if (shape.x > this.width || shape.y > this.height ||
      //    shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      if(shapes[i].type == 'BorradorXseleccion' || shapes[i].type == 'BorradorXarrastre') {
        //console.log(ctx);
        shapes[i].draw(ctx);  
      }
        
    }
}
CanvasState.prototype.setSize = function(width,height){
  // console.log(height +' - '+width);
  // console.log(srcFondo);

  
  this.canvas_borrador.setAttribute("width", width);
  this.canvas_borrador.setAttribute("height", height);
  this.width = width; 
  this.height = height;
  this.canvas.setAttribute("width", width);
  this.canvas.setAttribute("height", height);
  //this.valid = false;
  //this.fondo = srcFondo

  // s = this; //s representa el objeto CanvasState 
  // var fondo = new Image();
  //   fondo.onload = function() {
      
  //     s.width = fondo.naturalWidth; 
  //     s.height = fondo.naturalHeight;
  //     //s.valid = false;
  //     s.fondo = fondo
  //     s.valid = false;
  //   }
  //   fondo.src = srcFondo;
}
CanvasState.prototype.setShapes = function(shapes) {
  // Cambiar los objetos que se muestran
  this.shapes = shapes;
  this.valid = false;
}
CanvasState.prototype.getShapes = function() {
  // Cambiar los objetos que se muestran
  return this.shapes;
}


// Crea un objeto con 'x' y 'y' definidas, establecidas en la posición del ratón en relación con el lienzo del estado
// Si quieres ser super-correcto esto puede ser complicado, tenemos que preocuparnos por el relleno y las fronteras
CanvasState.prototype.getMouse = function(e) {
  mx = e.clientX;
  my = e.clientY;
  var rect = this.canvas.getBoundingClientRect();
  mx = this.width * (mx - rect.left)/(rect.width);
  my = this.height * (my - rect.top)/(rect.height) ;
  return {x: mx, y: my};
}

//  Si no quieres usar <body onLoad = 'init ()'>
// Puede descomentar esta referencia init () y colocar la referencia del script dentro de la etiqueta body
// init();
// s = false;
// function init() {
//   s = new CanvasState(document.getElementById('canvas1'));
  
//   asd = new ShapeText(10,40,"bold 24px verdana",null,'rgba(12, 25, 212, .5)')
//   s.addShape(asd); 
  
//   s.addShape(new Shape(40,40,50,50)); // The default is gray
//   s.addShape(new Shape(60,140,40,60, 'lightskyblue'));
//   // Lets make some partially transparent
//   s.addShape(new Shape(80,150,60,30, 'rgba(127, 255, 212, .5)'));
//   s.addShape(new Shape(125,80,30,80, 'rgba(245, 222, 179, .7)'));
//   s.setFondo('https://ratticatte.files.wordpress.com/2008/05/imagen-original3.jpg');
// }

// Now go make something amazing!
