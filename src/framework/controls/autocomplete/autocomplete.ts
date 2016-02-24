import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from "angular2/core";
// import { Control } from "angular2/common";
import { Observable } from "rxjs/Observable";
import "rxjs/observable/FromEventObservable";

import {InputTemplateString} from "../inputTemplateString";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

declare var jQuery;

@Component({
    selector: "uni-autocomplete" ,
    template: InputTemplateString
})
export class UniAutocomplete implements AfterViewInit, OnDestroy {
    @Input()
    config: UniFieldBuilder;

    nativeElement;
    autocomplete;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value: any) {
        value = value[this.config.kOptions.dataTextField] || value;
        this.autocomplete.value(value);
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;
        var self = this;
        var control = this.config.control;
        var options: kendo.ui.AutoCompleteOptions = this.config.kOptions;

        options.highlightFirst = true; // this setting is important! Forcing only valid inputs wont work without it.
        var validSelection = false;

        // reset validSelection when input changes
        Observable.fromEvent(this.nativeElement , "keyup").subscribe(() => {
            validSelection = false;
        });

        // update control value and set validSelection to true. Select event only fires when input text is valid.
        options.select = function (event: kendo.ui.AutoCompleteSelectEvent) {
            var item: any = event.item;
            var dataItem = event.sender.dataItem(item.index());

            if (control) {
                control.updateValue(dataItem.toJSON() , {});
            }

            if (self.config.onSelect) {
                self.config.onSelect(event , dataItem);
            }

            validSelection = true;
        };

        // reset the fields on change events (blur, enter, ...) if input was invalid
        options.change = function (event: kendo.ui.AutoCompleteChangeEvent) {
            if (!validSelection || self.config.clearOnSelect) {
                event.sender.value("");
                if (control) {
                    control.updateValue(undefined , {});
                }
            }
        };

        var autocomplete = this.nativeElement.find("input").first().kendoAutoComplete(options).data("kendoAutoComplete");
        autocomplete.value(control.value[this.config.kOptions.dataTextField]);
        this.autocomplete = autocomplete;
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
