
openerp.web_pdf_widget = function (instance)
{   
	//alert('asd');
	var instance = openerp;
	var _t = instance.web._t,
	_lt = instance.web._lt;
	var QWeb = instance.web.qweb;  

    instance.web.form.FieldBinaryPdf = instance.web.form.FieldBinary.extend({

        template: 'FieldBinaryPdf',
        placeholder: "/web/static/src/img/placeholder.png",
        init: function(field_manager, node) {
            var self = this;
            this._super(field_manager, node);
            this.binary_value = false;
            this.useFileAPI = !!window.FileReader;
            this.max_upload_size = 500 * 1024 * 1024; // 25Mo
            if (!this.useFileAPI) {
                this.fileupload_id = _.uniqueId('oe_fileupload');
                $(window).on(this.fileupload_id, function() {
                    var args = [].slice.call(arguments).slice(1);
                    self.on_file_uploaded.apply(self, args);
                });
            }
        },
        render_value: function() {
            var self = this;
            var url;
            if (this.get('value') && !instance.web.form.is_bin_size(this.get('value'))) {
                url = 'data:application/pdf;base64,' + this.get('value');
                //alert('adas');
            } else if (this.get('value')) {
            	//alert('adas2');
                var id = JSON.stringify(this.view.datarecord.id || null);
                var field = this.name;
                if (this.options.preview_image)
                    field = this.options.preview_image;
                url = this.session.url('/web_pdf_widget/BinaryPdf/pdf', {
                                            model: this.view.dataset.model,
                                            id: id,
                                            field: field,
                                            t: (new Date().getTime()),
                });
            } else {
                url = this.placeholder;
            }
            var $img = $(QWeb.render("FieldBinaryPdf-img", { widget: this, url: url }));
            	$img.css("width", "" + self.options.size[0] + "px");
                $img.css("height", "" + self.options.size[1] + "px");
            $($img).click(function(e) {
                if(self.view.get("actual_mode") == "view") {
                    var $button = $(".oe_form_button_edit");
                    $button.openerpBounce();
                    e.stopPropagation();
                }
            });
            this.$el.find('> iframe').remove();
            this.$el.prepend($img);
            $img.load(function() {
                if (! self.options.size)
                    return;
                $img.css("width", "" + self.options.size[0] + "px");
                $img.css("height", "" + self.options.size[1] + "px");
            });
            $img.on('error', function() {
                $img.attr('src', self.placeholder);
                instance.webclient.notification.warn(_t("Pdf"), _t("No se puede visualizar el PDF seleccionado"));
            });
        },
        on_file_uploaded_and_valid: function(size, name, content_type, file_base64) {
            this.internal_set_value(file_base64);
            this.binary_value = true;
            this.render_value();
            this.set_filename(name);
        },
        on_clear: function() {
            this._super.apply(this, arguments);
            this.render_value();
            this.set_filename('');
        },
        set_value: function(value_){
            var changed = value_ !== this.get_value();
            this._super.apply(this, arguments);
            // By default, on binary images read, the server returns the binary size
            // This is possible that two images have the exact same size
            // Therefore we trigger the change in case the image value hasn't changed
            // So the image is re-rendered correctly
            if (!changed){
                this.trigger("change:value", this, {
                    oldValue: value_,
                    newValue: value_
                });
            }
        }
});

instance.web.form.FieldUrlPdf = instance.web.form.FieldChar.extend({
    template: 'FieldUrlPdf',
    initialize_content: function() {
        this._super();
        var $button = this.$el.find('button');
        $button.click(this.on_button_clicked);
        this.setupFocus($button);
    },
    render_value: function() {
        var show_value = this.format_value(this.get('value'), '');
        
        
        if (!this.get("effective_readonly")) {
            this.$el.find('input').val(show_value);
        } else {
            if (this.password) {
                show_value = new Array(show_value.length + 1).join('*');
            }
            this.$(".oe_form_char_content").text(show_value);
            //alert(show_value);
            this.$el.find('iframe')
                    .attr('src',this.get('value'))
                    .css("width", "" + this.options.size[0] + "px")
                    .css("height", "" + this.options.size[1] + "px")

        }




            
    },
    on_button_clicked: function() {
        if (!this.get('value') || !this.is_syntax_valid()) {
            this.do_warn(_t("E-mail Error"), _t("Can't send email to invalid e-mail address"));
        } else {
            location.href = 'mailto:' + this.get('value');
        }
    }
});
    instance.web.form.widgets.add('FieldUrlPdf', 'instance.web.form.FieldUrlPdf');
    instance.web.form.widgets.add('FieldBinaryPdf', 'instance.web.form.FieldBinaryPdf');
}

