import {Component} from "angular2/core";
import {Input} from "angular2/core";
import {Type} from "angular2/core";
import {OnInit} from "angular2/core";
import {UniComponentLoader} from "../core/componentLoader";
import {ViewChild} from "angular2/core";
import {ComponentRef} from "angular2/core";

@Component({
    selector: 'UniModal',
    directives: [UniComponentLoader],
    template:`
        <dialog class=“uniModal” [attr.open]="isOpen()">
            <uni-component-loader></uni-component-loader>
        </dialog>
    `
})
export class UniModal implements OnInit {

    @Input()
    config: any;

    @Input()
    componentType: Type;

    @ViewChild(UniComponentLoader)
    unicmploader: UniComponentLoader;

    isOpen: boolean = false;

    component: any;

    constructor() {

    }

    ngOnInit() {
        this.unicmploader.load(this.componentType,(cmp: ComponentRef) => {
            cmp.instance.config = this.config;
            setTimeout(()=>{
                this.component = cmp.instance;
            },100);
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
