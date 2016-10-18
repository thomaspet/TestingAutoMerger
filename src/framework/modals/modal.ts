import {Component, ViewContainerRef, ComponentFactory, ElementRef} from '@angular/core';
import {Input} from '@angular/core';
import {Type} from '@angular/core';
import {AfterViewInit} from '@angular/core';
import {ViewChild} from '@angular/core';
import {ComponentCreator} from '../core/dynamic/UniComponentCreator';


@Component({
    selector: 'uni-modal',
    template:`
        <dialog class='uniModal' [attr.open]='isOpen'>
            <button (click)='close()' class='closeBtn'></button>
            <div #modalContainer></div>
        </dialog>
    `
})
export class UniModal implements AfterViewInit {

    @Input('config')
    config: any;

    @Input('type')
    componentType: Type<any>;

    @ViewChild('modalContainer', {read: ViewContainerRef})
    container: ViewContainerRef;

    isOpen: boolean = false;

    component: Promise<any>;
    factory:ComponentFactory<any>

    constructor(public creator: ComponentCreator<any>, private elementRef: ElementRef) {
        document.addEventListener('keyup', (e: any) => {
            if(e.keyCode === 27) {
                this.isOpen = false;
            }
        });
    }

    ngAfterViewInit() {
        // compile the component
        this.factory = this.creator.compileComponent<any>(this.componentType);
    }

    createContent() {
        let self = this;
        let config = self.config || {};
        if (!this.factory)  {
            this.factory = this.creator.compileComponent<any>(this.componentType);
        }
        let modal = this.creator.attachComponentTo(this.container, this.factory, {
            inputs: {
                config: config,
                isOpen: config.isOpen || false
            }
        });
        this.component = new Promise(resolve => resolve(modal.instance));
    }

    open() {
        if (!this.component) {
            this.createContent();
        }
        this.isOpen = true;
        setTimeout(() => {
            const el = this.elementRef.nativeElement.querySelector('input,textarea,select');
            if (el) {
                el.focus();
            }
        });
    }

    close() {
        this.isOpen = false;
    }

    getContent() {
        return this.component;
    }

}
