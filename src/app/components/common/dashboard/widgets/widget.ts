import {Component, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
import {WidgetDefinition} from '../models';

@Component({
    selector: 'widget',
    template: `<ng-container #componentSlot></ng-container>`
})
export class Widget {
    @ViewChild('componentSlot', {read: ViewContainerRef, static: true}) componentSlot: ViewContainerRef;

    @Input() widgetDefinition: WidgetDefinition;

    constructor(private factoryResolver: ComponentFactoryResolver) {}

    ngOnChanges(changes) {
        if (changes['widgetDefinition'] && this.widgetDefinition) {
            this.loadWidget();
        }
    }

    loadWidget() {
        if (!this.componentSlot) {
            console.error('componentSlot not found in widget.ts');
            return;
        }

        const componentFactory = this.factoryResolver.resolveComponentFactory(this.widgetDefinition.component);

        this.componentSlot.clear();
        const componentRef = this.componentSlot.createComponent(componentFactory);
        componentRef.instance['options'] = this.widgetDefinition.options;
    }
}
