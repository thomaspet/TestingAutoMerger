import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from '@angular/core';
import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';
declare var jQuery;

@Component({
    selector: 'uni-dropdown',
    template: InputTemplateString
})
export class UniDropdown implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;

    public nativeElement;
    public dropdown: kendo.ui.DropDownList;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public refresh(value: any): void {
        this.dropdown.value(value);
        this.dropdown.trigger('change');
    }

    public setFocus() {
        this.dropdown.focus();
        return this;
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;
        var vm = this;
        var dropdown: kendo.ui.DropDownList;

        this.config.kOptions.change = function (event: kendo.ui.DropDownListChangeEvent) {
            vm.config.control.updateValue(this.value(), {});
            if (vm.config.onChange) {
                vm.config.onChange(event, this.value());
            }
        };

        dropdown = this.nativeElement
            .find('input')
            .first()
            .kendoDropDownList(this.config.kOptions)
            .data('kendoDropDownList');

        dropdown.value(vm.config.control.value); // init to control

        this.dropdown = dropdown;
        this.config.ready.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
