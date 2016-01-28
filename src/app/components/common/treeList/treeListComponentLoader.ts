import {Component, Input, DynamicComponentLoader, ElementRef, OnInit} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {UniTable} from '../../../../framework/uniTable';
import {UniForm} from '../../../../framework/forms/uniForm';
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

    //Loads a component into the view based on type variable in data input
    ngOnInit() {

        if (this.compRef) {
            this.compRef.dispose();
        }
        switch (this.data.type) {
            case TREE_LIST_TYPE.TABLE:
                this.dynamicComponentLoader.loadIntoLocation(UniTable, this.elementRef, 'content')
                    .then((comp) => {
                        comp.instance.config = this.data.config;
                        this.compRef = comp;
                    });
                break;

            case TREE_LIST_TYPE.FORM:
                this.dynamicComponentLoader.loadIntoLocation(UniForm, this.elementRef, 'content')
                    .then((comp) => {
                        this.compRef = comp;
                        comp.instance.fields = this.data.config.config();
                        comp.instance.uniFormSubmit.subscribe((value) => {
                            this.formSubmit(value);
                        })
                    })
                break;
        }
    }

    formSubmit(value) {
        var headers = new Headers();
        headers.append('Client', 'client1');

        //Check that all needed data is present
        if (!value || !this.data.url) {
            window.alert('Missing data or URL');
            return;
        }

        //This could be PUT too?
        this.http.post(
            this.data.url,
            JSON.stringify(value._value),
            { headers: headers })
            .map(res => console.log(res))
            //Subscribe not needed?
            .subscribe(
            data => console.log(data),
            err => console.log(err))
    }
}