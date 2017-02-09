import {Component, ViewContainerRef, ComponentFactory, ElementRef} from '@angular/core';
import {Input, Output, EventEmitter} from '@angular/core';
import {Type} from '@angular/core';
import {AfterViewInit} from '@angular/core';
import {ViewChild} from '@angular/core';
import {ComponentCreator} from '../core/dynamic/UniComponentCreator';


@Component({
    selector: 'uni-modal',
    template: `
        <dialog class='uniModal' [attr.open]='isOpen'>
            <article class="uniModal_bounds">
                <button (click)='close()' class='closeBtn'></button>
                <div #modalContainer></div>
            </article>
        </dialog>
    `
})
export class UniModal implements AfterViewInit {

    @Output('close') public closeEvent: EventEmitter<any> = new EventEmitter();
    @Input('config') public config: any;
    @Input('type') public componentType: Type<any>;
    @Input('destroyOnClose') public destroyOnClose: boolean;
    @ViewChild('modalContainer', {read: ViewContainerRef}) public container: ViewContainerRef;

    private isOpen: boolean = false;

    public component: Promise<any>;
    private componentResolver: (component: any) => void;
    private componentIsResolved: boolean = false;
    private factory: ComponentFactory<any>;

    constructor(public creator: ComponentCreator<any>, private elementRef: ElementRef) {
        document.addEventListener('keyup', (e: any) => {
            if (e.keyCode === 27) {
                this.isOpen = false;
                this.closeEvent.emit();
            }
        });

        this.component = new Promise(resolve => this.componentResolver = resolve);
    }

    public ngAfterViewInit() {
        // compile the component
        this.factory = this.creator.compileComponent<any>(this.componentType);
    }



    public createContent() {
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
        this.componentResolver(modal.instance);
        this.componentIsResolved = true;
    }

    public open() {
        this.createContent();
        this.isOpen = true;
        setTimeout(() => {
            const el = this.elementRef.nativeElement.querySelector('input,textarea,select');
            if (el) {
                el.focus();
            }
        });
    }

    public close() {
        this.isOpen = false;
        this.closeEvent.emit();
        this.container.clear();
        this.componentIsResolved = false;
    }

    public getContent() {
        return this.component;
    }
}
