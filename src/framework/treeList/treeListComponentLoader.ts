import {Component, Input, DynamicComponentLoader, ViewContainerRef, OnInit} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {UniTable} from "unitable-ng2/main";
import {UniForm} from "../uniform/index";
import {TREE_LIST_TYPE} from "./treeList";

@Component({
    selector: 'tree-list-component-loader',
    template: '<div #content></div>',
    directives: [UniTable, UniForm]
})
export class TreeListComponentLoader implements OnInit {

    @Input()
    public componentConfig;

    public compRef;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public container: ViewContainerRef, public http: Http) {
    }

    public ngOnInit() {

        if (this.compRef) {
            this.compRef.dispose();
        }
        switch (this.componentConfig.type) {
            case TREE_LIST_TYPE.TABLE:
                this.dynamicComponentLoader.loadNextToLocation(UniTable, this.container)
                    .then((comp) => {
                        comp.instance.config = this.componentConfig.content;
                        this.compRef = comp;
                    });
                break;

            case TREE_LIST_TYPE.FORM:
                this.dynamicComponentLoader.loadNextToLocation(UniForm, this.container)
                    .then((comp) => {
                        this.compRef = comp;
                        comp.instance.fields = this.componentConfig.content.config();
                        comp.instance.uniFormSubmit.subscribe(this.componentConfig.formSubmitCallback);
                    });
                break;
            default:
                // should create an error component
                // load in error component if something went wrong
                console.log("Something went wrong in treeListComponentLoader");
                break;
        }
    }
}