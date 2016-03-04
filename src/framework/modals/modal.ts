import {Component} from "angular2/core";
import {Input} from "angular2/core";
import {Type} from "angular2/core";
import {AfterViewInit} from "angular2/core";
import {UniComponentLoader} from "../core/componentLoader";
import {ViewChild} from "angular2/core";
import {ComponentRef} from "angular2/core";

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
        this.unicmploader.load(this.componentType).then((cmp: ComponentRef) => {
            this.component = new Promise((resolve) => {
                cmp.instance.config = self.config;
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
