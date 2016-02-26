import {autocompleteDate} from '../controls/datepicker/datepicker';

declare var jQuery;

export class UniTableControls {
    
    // Gets the model for the row we're currently editing
    private getRowModel(container: any) {
        var table = jQuery(container).closest('table').data('kendoGrid');
        var row = jQuery(container).closest('.k-grid-edit-row');
        return table.dataItem(row);
    }

    public dropdown(kendoOptions, changeCallback?: (item: any, rowModel: any) => any) {
        
        return (container, options) => {            
            jQuery('<input data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoDropDownList(jQuery.extend(kendoOptions, {
                value: options.model[options.field],
                
                // Call changeCallback on kendo select event
                select: (event: kendo.ui.DropDownListSelectEvent) => {
                    if (changeCallback) {
                        var selectedItem = event.sender.dataItem(jQuery(event.item).index());
                        changeCallback(selectedItem, this.getRowModel(container));
                    }
                }
            }));
        }
    }

    public combobox(kendoOptions, changeCallback?: (item: any, rowModel: any) => any) {
        
        return (container, options) => {
            var element = jQuery('<input data-bind="value:' + options.field + '"/>')
            .appendTo(container)
            .kendoComboBox(jQuery.extend(kendoOptions, {
                value: options.model[options.field],
                delay: kendoOptions.delay || 50,
                
                select: (event: kendo.ui.ComboBoxSelectEvent) => { 
                    var selectedItem = event.sender.dataItem(jQuery(event.item).index());
                    if (changeCallback) {
                        changeCallback(selectedItem, this.getRowModel(container));
                    }
                },
            }));
               
        }
    }


    public datepicker(kendoOptions, changeCallback?: (item: any, rowModel: any) => any) {
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