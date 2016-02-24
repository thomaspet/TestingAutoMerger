import {autocompleteDate} from '../controls/datepicker/datepicker';

declare var jQuery;

export class UniTableControls {

    dropdown(kendoOptions) {
        return function(container, options) {
            var dropdownElement = jQuery('<input data-bind="value:' + options.field + '"/>')
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
    
    datepicker(kendoOptions) {
        return function(container, options) {
            jQuery('<input data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDatePicker(jQuery.extend(kendoOptions, {
                
                parseFormats: [
                    "dd-MM-yyyy",
                    "dd/MM/yyyy",
                    "dd.MM.yyyy",
                    "ddMMyyyy",
                    "yyyy-MM-ddTHH:mm:ss"
                ],
                
                value: options.model[options.field],
                
                change: (event: kendo.ui.DatePickerChangeEvent) => {
                    var date = event.sender.value();
                    
                    // Autocomplete if date was given by text, not selected in the picker
                    if (date === null || date === undefined) {
                        var autocompleted = autocompleteDate(jQuery(event.sender.element).val());
                        
                        if (autocompleted) {
                            options.model[options.field] = autocompleted;
                            event.sender.value(autocompleted);
                        } else {
                            options.model[options.field] = "";
                        }
                    }
                }
            }));
        }
    }

}