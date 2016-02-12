import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';

import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
declare var jQuery;

export interface DropdownConfig extends UniFieldBuilder {
    control: Control;
    kOptions: kendo.ui.DropDownListOptions;
    onChange: (event:kendo.ui.DropDownListChangeEvent, item:any) => any;
}

@Component({
    selector: 'uni-dropdown',
    template: InputTemplateString
})
export class UniDropdown implements AfterViewInit, OnDestroy {
    @Input()
    config:DropdownConfig;

    nativeElement;
    dropdown;

    constructor(public elementRef:ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value) {
        this.dropdown.value(value);
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;
        var vm = this;
        var dropdown;

        this.config.kOptions.change = function (event) {
            vm.config.control.updateValue(this.value(), {});
            if (vm.config.onChange) {
                vm.config.onChange(event, this.value());
            }
        }

        dropdown = this.nativeElement.find('input').first().kendoDropDownList(this.config.kOptions).data('kendoDropDownList');
        dropdown.value(vm.config.control.value); // init to control
        this.dropdown = dropdown;
    }

    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
