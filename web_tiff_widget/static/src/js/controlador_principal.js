var $canv;
var $ctx;          
var lienzo;      // Es el espacio donde se crearan los objetos seleccionables
var controlZoom; // Este objeto contiene las funciones de zoom y movimiento del canvas // se lo inicializa en el archivo jquery.panzoom.js
setTextColor=function(color){
    if (lienzo.funcionActual=='Texto'){
        
        lienzo.selection.fill='#'+color
        lienzo.valid=false
    }
}
function TifWIdget(tipo,id){
    Tiff.initialize({TOTAL_MEMORY: 16777216 * 5});
    var s = new openerp.init();
    url = s.session.url('/web_tiff_widget/BinaryTiff/tiff', {
                                        model: "rbs.documento.mercantil."+tipo,
                                        id: id,
                                        field: "filedata",
                                        t: (new Date().getTime()),});


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    var lenTiff = 0;
    var cursorTiff =  0;
    var tiffs = [];
    $canv = $('#imagenCanvas')
    $ctx = $canv[0].getContext("2d");
    lienzo = new CanvasState($('#figurasCanvas')[0],$('#borradorCanvas')[0]);
    xhr.onload = function (e) {
            var tiff;    
            var buffer = xhr.response;
            //console.log((buffer))
            tiff = new Tiff({buffer: buffer});
            lenTiff =  tiff.countDirectory();
            for (var i = 0, len = tiff.countDirectory(); i < len; ++i) {
                tiffs.push(new tifClass(tiff,i));
                //console.log("Asdasd"+i);
            }
            // setInterval(function() { on_change(); cursorTiff++; console.log(cursorTiff)}, 1000);
            on_change();
            new openerp.web.Model('rbs.documento.mercantil.'+tipo).call('read',[[id],['compania_nombres','fecha_inscripcion']])
                .then(function(result){
                    $('#tipo').html(tipo)
                    $('#propietario').html(result[0].compania_nombres)
                    $('#fecha').html(result[0].fecha_inscripcion)
                })
                
    }


    xhr.send();


    function tifClass(TIfforiginal, index){ 
        this.saved= true
        this.TIfforiginal = TIfforiginal;
        this.canvasOriginal
        this.width;
        this.height;
        this.index = index;
        this.versiones = [];
        this.verActual = -1;
        this.texture;
        this.canv = null;
        this.shapes = [];

        this.getShapes = function(){
            return this.shapes;
        }

        this.setShapes = function(s){
            this.shapes = s;
        }

        this.setOriginal = function(){
            this.versiones = [];
            this.verActual = -1;       
            this.shapes = [];
            this.TIfforiginal.setDirectory(index);
            this.imagen = this.TIfforiginal.toImage();
            this.width = this.imagen.width;
            this.height = this.imagen.height;
            var imageData = $ctx.createImageData(this.width, this.height);
            (imageData).data.set(this.imagen.image);


            this.setTif(imageData);
            return this.getTif();
        }

        this.getTif = function (){ 
            if(this.versiones.length == 0){
                this.TIfforiginal.setDirectory(index);
                this.imagen = this.TIfforiginal.toImage();
                this.width = this.imagen.width;
                this.height = this.imagen.height;
                //ctx = this.canvasOriginal.getContext("2d")
                //console.log(this.imagen)

                var imageData = $ctx.createImageData(this.width, this.height);
                (imageData).data.set(this.imagen.image);


                this.setTif(imageData);
                return this.getTif();
            }else{

                return this.versiones[this.verActual]
            }
        }
        this.setTifUndo = function (){ 
            if(this.verActual<=0){
                alert("no ha habido ningun cambio")
            }else{
                this.verActual--;   
                this.saved = false 

            }
        }
        this.setTifRepeat = function (){ 
            if(this.verActual==this.versiones.length-1){
                alert("no ha habido ningun cambio")
            }else{
                this.verActual++; 
                this.saved = false   
            }
        }
        this.setTif = function (src){ 
            //this.canv = canvas
            if(this.verActual == -1){
                this.versiones.push(src)
                this.verActual++;
            }else{
                l = this.versiones.length
                this.versiones.splice(this.verActual+1,l-(this.verActual+1));
                this.versiones.push(src)
                this.verActual++;
                this.saved = false
            }
            
        }
        this.guardarImagen = function(){
            var canvas = document.createElement('canvas');
            context = canvas.getContext( '2d' )
            imagenData = this.getTif();
            canvas.width = imagenData.width;
            canvas.height = imagenData.height;
            context.putImageData(imagenData, 0, 0);
            for (var i = this.shapes.length - 1; i >= 0; i--) {
                if(this.shapes[i].type!='Texto'){                   
                    this.shapes[i].draw(context);
                }                
            }
            for (var i = this.shapes.length - 1; i >= 0; i--) {
                if(this.shapes[i].type=='Texto'){                   
                    this.shapes[i].draw(context);
                }                
            }

            var link = window.document.createElement( 'a' ),
                url = canvas.toDataURL(),
                filename = 'screenshot.png';
                console.log(url)
         
            link.setAttribute( 'href', url );
            link.setAttribute( 'download', filename );
            link.style.visibility = 'hidden';
            window.document.body.appendChild( link );
            link.click();
            window.document.body.removeChild( link );
        }

        

        this.isSaved = function(){
            return this.saved;
        }
        this.save = function(){
            this.saved = true;
            this.setShapes(lienzo.shapes)
        }
        var accion
    }

    on_change = function(){
        //console.log($canv)
        // var image = new Image();
        // image.onload = function() {
        //     var width = image.naturalWidth; // this will be 300
        //     var height = image.naturalHeight; // this will be 400
        //     $canv.attr('width',width);
        //     $canv.attr('height',height);
        //     $ctx.drawImage(image, 0, 0, width, height);
        //     //$canv.css("width", "75%");
        // };
        //console.log(tiffs[cursorTiff].getTif());


        $(".pagina_actual").val(cursorTiff+1)      
        $(".pagina_final").val(lenTiff)
        lienzo.shapes=tiffs[cursorTiff].getShapes()
        imagenData = tiffs[cursorTiff].getTif()
        width = imagenData.width;
        height = imagenData.height;
        $canv[0].width = width;
        $canv[0].height = height;
        //canvas.width = canvas.width
      //this.canvas.setAttribute("width", this.width);
      //this.canvas.setAttribute("height", this.height);
      
        $ctx.putImageData(imagenData, 0, 0);
        lienzo.valid=false
        lienzo.setSize(width,height);
         //lienzo.addShape(new Shape(40,40,50,50));
        //image.src = tiffs[cursorTiff].getTif();
    }

    $("#fuentesLetras").change(function(){        
       if (lienzo.funcionActual=='Texto'){       
        lienzo.selection.font_family= $("#fuentesLetras").val()
        lienzo.valid=false
    }   
    })



    $("#tamTexto").change(function(){        
       if (lienzo.funcionActual=='Texto'){       
        lienzo.selection.font_size= $("#tamTexto").val()
        lienzo.valid=false
    }   
    })

    $(".btnAddText").click(function(){        
        lienzo.addShape(new ShapeText(10,40,"Escriba","bold", 54,"verdana",null,'rgba(12, 240, 22, .5)'));      
    })

    $(".guardarimg").click(function(){
        tiffs[cursorTiff].guardarImagen();

    })

    $(".btnBorrar").click(function(){
        lienzo.setFuncionActual("BorradorXseleccion");
    })

    $(".btnBorrarDeslizar").click(function(){
        lienzo.setFuncionActual("BorradorXarrastre");
    })
    
    $(".pagina_actual").keypress(function(e){
    if(e.keyCode == 13){
        nueva_pagina=$(".pagina_actual").val()-1
        if (nueva_pagina<lenTiff && nueva_pagina>=0){
            if(tiffs[cursorTiff].isSaved()){
                cursorTiff=nueva_pagina;
                on_change();
            }else{
                alert("Para cambiar de imagen primero almacene la actual")
            }
        }
        else {
            $(".pagina_actual").val(cursorTiff+1) 
        }
    }}    
    );

    // Eventos 
    $('.button-back').click(function(){
        if(cursorTiff!=0){
            if(tiffs[cursorTiff].isSaved()){
                cursorTiff--;
                on_change();

            }else{
                alert("Para cambiar de imagen primero almacene la actual")
            }
        }
    });
    $('.button-next').click(function(){
        if(cursorTiff!=lenTiff-1){
            if(tiffs[cursorTiff].isSaved()){
                cursorTiff++;
                on_change()

            }else{
                alert("Para cambiar de imagen primero almacene la actual")
            }
        }
    })

    $('.button-original').click(function(){
        tiffs[cursorTiff].setOriginal();
        on_change()
    })

    $('.btnDisenoPrueba').click(function(){
        app.filters.invert()
    })
    var contraste = 0 ;
    $('.contraste-range').on("input change", function() {
        valor = this.value - contraste;
        //console.log("contraste :"+ valor)
        if(valor!=0){
            app.filters.contrast(valor)    
        }
        
        contraste = this.value;
    });
    var brightness = 0 ;
    $('.brightness-range').on("input change", function() {
        valor = this.value - brightness;
        //console.log("contraste :"+ valor)
        if(valor!=0){
            app.filters.brightness(valor)    
        }
        
        brightness = this.value;
    });

    $('.contraste').mousedown(function() {
     //console.log('inicio')
    });

    $('.btnDisenoPrueba2').click(function(){

    })

    $('.button-undo').click(function(){
        tiffs[cursorTiff].setTifUndo();
        onchange()
    })
    $('.sepia').click(function(){
        app.filters.sepia();
    })

    $('.bw').click(function(){
        app.filters.bw();
    })

    $('.invertirColor').click(function(){
        app.filters.invert();
    })

    $('.button-repeat').click(function(){
        tiffs[cursorTiff].setTifRepeat();
        onchange()
    })
    $('.button-save').click(function(){
        tiffs[cursorTiff].save();
    })
    $('.multitiff').click(function(){
        instance.web.blockUI();
        var c = instance.webclient.crashmanager;
        //alert(tiffs[cursorTiff])
        self.session.get_file({
            url: '/web/binary/multitiff',
            data: {
                data: JSON.stringify({
                    model: tiffs[cursorTiff].getTif().toDataURL()
                })},
            complete: instance.web.unblockUI,
            error: c.rpc_error.bind(c)
        });


    })
   

}


    
