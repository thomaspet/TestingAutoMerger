import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/FromEventObservable';

declare var jQuery;

@Component({
    selector: 'uni-numeric',
    template: InputTemplateString
})
export class UniNumericInput implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;

    public nativeElement: any;
    public numericInput: kendo.ui.NumericTextBox;
    
    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
        
        elementRef.nativeElement.addEventListener('keydown', (event) => {
            if (!event.shiftKey && event.keyCode === 9 && this.config.onTab) {
                event.preventDefault();
                event.stopPropagation();
                this.config.onTab();
            }
            
            if (event.shiftKey && event.keyCode === 9 && this.config.onUnTab) {
                event.preventDefault();
                event.stopPropagation();
                this.config.onUnTab();                
            }
        });
    }

    public setFocus() {
        this.numericInput.focus();
        return this;
    }

    public refresh(value: any) {
        value = value || 0;
        this.numericInput.value(value);
        this.numericInput.trigger('change');
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;
    
        var control: Control = this.config.control;
        var options: kendo.ui.NumericTextBoxOptions = this.config.kOptions;

        var self = this;
        options.change = function () {
            control.updateValue(this.value(), {});
            
            if (self.config.onEnter) {
                self.config.onEnter();
            }
        };

        var numericInput = this.nativeElement
            .find('input')
            .first()
            .kendoNumericTextBox(options)
            .data('kendoNumericTextBox');
        this.numericInput = numericInput;
                
        numericInput.value(control.value);
        this.config.ready.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
