import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from '@angular/core';
import {Control} from '@angular/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/FromEventObservable';

import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery; // $ is reserved for angular ElementFinder

@Component({
    selector: 'uni-combobox',
    template: InputTemplateString
})
export class UniCombobox implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;
    public control: Control;
    public nativeElement: any;
    public combobox: kendo.ui.ComboBox;
    
    constructor(private elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
        elementRef.nativeElement.addEventListener('keyup', (event) => {
           if (event.keyCode === 13) {
               this.combobox.open();
           } 
        });
    }

    public refresh(value: any) {
        value = value || '';
        this.combobox.value(value);
        this.combobox.trigger('select');
        this.combobox.trigger('change');
    }

    public setFocus() {
        this.combobox.focus();
        return this;
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;

        var control = this.config.control;
        var options = this.config.kOptions;
        var validSelection = false;

        // set validSelection to true. Select event only fires when input text is valid.
        options.select = function () {
            validSelection = true;
        };

        // store value in control if the selection was valid
        // (input matches an item in the dataSource);
        var self = this;
        options.change = function () {
            var newValue = (validSelection) ? this.value() : '';

            if (control) {
                control.updateValue(newValue, {});
            }

            if (validSelection && self.config.onSelect) {
                self.config.onSelect(newValue);
            }
        };

        var combobox = this.nativeElement
            .find('input')
            .first()
            .kendoComboBox(options)
            .data('kendoComboBox');
        this.combobox = combobox;

        // reset validSelection when the input text changes
        Observable.fromEvent(combobox.input, 'keyup').subscribe((event: any) => {
            if (validSelection && event.keyCode && event.keyCode === 13 && self.config.onEnter) {
                event.stopPropagation(); 
                self.config.onEnter();
            }
            
            if (event.keyCode && event.keyCode === 9 && self.config.onTab) {
                event.stopPropagation();
                self.config.onTab();
            }
            
            validSelection = false;            
        });
        
        if (control) {
            combobox.value(control.value);
        }
        this.config.ready.emit(this);
    }


    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
