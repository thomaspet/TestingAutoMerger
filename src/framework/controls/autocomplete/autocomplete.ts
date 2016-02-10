import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

import {InputTemplateString} from '../inputTemplateString';

declare var jQuery;

export interface AutocompleteConfig {
    control?: Control;
    onSelect?: Function;
    clearOnSelect?: boolean;
    kOptions: kendo.ui.AutoCompleteOptions;
}

@Component({
    selector: 'uni-autocomplete',
    template: InputTemplateString
})
export class UniAutocomplete implements AfterViewInit, OnDestroy {
    @Input() config:AutocompleteConfig;
    nativeElement;

    constructor(public elementRef:ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    ngAfterViewInit() {
        var self = this;
        var control = this.config.control;
        var options:kendo.ui.AutoCompleteOptions = this.config.kOptions;

        options.highlightFirst = true; // This setting is important! Forcing only valid inputs wont work without it.
        var validSelection = false;

        // Reset validSelection when input changes
        Observable.fromEvent(this.nativeElement, 'keyup').subscribe((event) => {
            validSelection = false;
        });

        // Update control value and set validSelection to true. Select event only fires when input text is valid.
        options.select = function (event:kendo.ui.AutoCompleteSelectEvent) {
            var item:any = event.item;
            var dataItem = event.sender.dataItem(item.index());

            if (control) {
                control.updateValue(dataItem.toJSON(),{});
            }

            if (self.config.onSelect) {
                self.config.onSelect(event, dataItem);
            }

            validSelection = true;
        };

        // Reset the fields on change events (blur, enter, ...) if input was invalid
        options.change = function (event:kendo.ui.AutoCompleteChangeEvent) {
            if (!validSelection || self.config.clearOnSelect) {
                event.sender.value('');
                if (control) {
                    control.updateValue(undefined,{});
                }
            }
        };

        var autocomplete = this.nativeElement.find('input').first().kendoAutoComplete(options).data('kendoAutoComplete');
        autocomplete.value(control.value[this.config.kOptions.dataTextField]);
    }

    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}