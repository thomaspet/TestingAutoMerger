import {Component, Input, DynamicComponentLoader, ElementRef, EventEmitter, OnInit} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {UniTable} from '../uniTable';
import {UniForm} from '../forms/uniForm';
import {TREE_LIST_TYPE} from './treeList';

@Component({
    selector: 'tree-list-component-loader',
    template: '<div #content></div>',
    directives: [UniTable, UniForm]
})

//This could just be a component loader for reuse??
export class TreeListComponentLoader implements OnInit {
    
    @Input() data;
    compRef;

    constructor(public dynamicComponentLoader: DynamicComponentLoader, public elementRef: ElementRef, public http: Http) { }

    ngOnInit() {

        if (this.compRef) {
            this.compRef.dispose();
        }
        switch (this.data.type) {
            case TREE_LIST_TYPE.TABLE:
                this.dynamicComponentLoader.loadIntoLocation(UniTable, this.elementRef, 'content')
                    .then((comp) => {
                        comp.instance.config = this.data.content;
                        this.compRef = comp;
                    });
                break;

            case TREE_LIST_TYPE.FORM:
                this.dynamicComponentLoader.loadIntoLocation(UniForm, this.elementRef, 'content')
                    .then((comp) => {
                        this.compRef = comp;
                        comp.instance.fields = this.data.content.config();
                        comp.instance.uniFormSubmit.subscribe(this.data.formFunction);

                    });
                break;
            default:
                //Should create an error component
                //Load in error component if something went wrong
                console.log('Something went wrong in treeListComponentLoader');
                break;
        }
    }
}