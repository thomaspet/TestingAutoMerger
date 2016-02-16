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
        <dialog class=“uniModal” [attr.open]="isOpen">
            <button (click)="close()">Close</button>
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

    component: any;

    constructor() {}

    ngAfterViewInit() {
        this.unicmploader.load(this.componentType,(cmp: ComponentRef) => {
            cmp.instance.config = this.config;
            setTimeout(()=>{
                this.component = cmp.instance;
            },100);
        });

        document.addEventListener("keyup", (e: any) => {
            if(e.keyCode === 27) {
                this.isOpen = false
            }
        });
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    getModal() {
        return this.component;
    }

}
