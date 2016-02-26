import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from "angular2/core";
import {Control} from "angular2/common";
import { Observable } from "rxjs/Observable";
import "rxjs/observable/FromEvent";

import {InputTemplateString} from "../inputTemplateString";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

declare var jQuery; // $ is reserved for angular ElementFinder

@Component({
    selector: "uni-combobox",
    template: InputTemplateString
})
export class UniCombobox implements AfterViewInit, OnDestroy {
    @Input()
    config: UniFieldBuilder;

    control: Control;
    nativeElement: any;
    combobox: kendo.ui.ComboBox;

    constructor(private elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value: any) {
        this.combobox.value(value);
        this.combobox.trigger("select");
        this.combobox.trigger("change");
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;

        var control = this.config.control;
        var options = this.config.kOptions;
        var validSelection = false;

        // set validSelection to true. Select event only fires when input text is valid.
        options.select = function () {
            validSelection = true;
        };

        // store value in control if the selection was valid (input matches an item in the dataSource);
        var self = this;
        options.change = function () {
            var newValue = (validSelection) ? this.value() : "";

            if (control) {
                control.updateValue(newValue, {});
            }

            if (self.config.onSelect) {
                self.config.onSelect(newValue);
            }

        };

        var combobox = this.nativeElement.find("input").first().kendoComboBox(options).data("kendoComboBox");
        this.combobox = combobox;

        // reset validSelection when the input text changes
        Observable.fromEvent(combobox.input, "keyup").subscribe(() => {
            validSelection = false;
        });

        if (control) {
            combobox.value(control.value);
        }
    }


    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
