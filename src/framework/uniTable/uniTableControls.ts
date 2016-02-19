declare var jQuery;

export class UniTableControls {

    dropdown(kendoOptions) {
        return function(container, options) {
            jQuery('<input data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDropDownList(jQuery.extend(kendoOptions, {
                // Initialize to model value
                value: options.model[options.field],
            }));
        }
    }
    
    combobox(kendoOptions) {
        // todo
    }
    
    autocomplete(kendoOptions) {
        // todo
    }
    
    

}