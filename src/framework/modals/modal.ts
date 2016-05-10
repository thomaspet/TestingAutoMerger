import {Component} from "@angular/core";
import {Input} from "@angular/core";
import {Type} from "@angular/core";
import {AfterViewInit} from "@angular/core";
import {UniComponentLoader} from "../core/componentLoader";
import {ViewChild} from "@angular/core";
import {ComponentRef} from "@angular/core";

@Component({
    selector: "uni-modal",
    directives: [UniComponentLoader],
    template:`
        <dialog class="uniModal" [attr.open]="isOpen">
            <button (click)="close()" class="closeBtn"></button>
            <uni-component-loader></uni-component-loader>
        </dialog>
    `
})
export class UniModal implements AfterViewInit {

    @Input('config')
    config: any;

    @Input('type')
    componentType: Type;

    @ViewChild(UniComponentLoader)
    unicmploader: UniComponentLoader;

    isOpen: boolean = false;

    component: Promise<any>;

    constructor() {
        document.addEventListener("keyup", (e: any) => {
            if(e.keyCode === 27) {
                this.isOpen = false;
            }
        });
    }

    ngAfterViewInit() {
        var self = this;
        this.unicmploader.load(this.componentType).then((cmp: ComponentRef<any>) => {
            this.component = new Promise((resolve) => {
                cmp.instance.config = self.config;
                self.isOpen = self.config.isOpen || false;
                resolve(cmp.instance);
            });
        });
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    getContent() {
        return this.component;
    }

}
