import {Component, OnInit, provide, ViewChild, ComponentRef, AfterViewInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from "angular2/router";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import {WagetypeService} from "../../../../framework/data/wagetype";


import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../framework/forms";

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [provide(WagetypeService, {useClass: WagetypeService})],
    directives: [UniComponentLoader]
})
export class WagetypeDetail implements OnInit{
    wageType; 
    layout;
    
    
    
    form: UniFormBuilder = new UniFormBuilder();
    formInstance: UniForm;
    
    @ViewChild(UniComponentLoader)  uniCompLoader: UniComponentLoader;
    
    constructor(private _routeparams: RouteParams, private _wagetypeService : WagetypeService) {               
    }

    ngOnInit() {    
        
        
        let ID = +this._routeparams.get("id");
                
        Observable.forkJoin(
            this._wagetypeService.get(ID),
            this._wagetypeService.layout("")
        ).subscribe((response: any) => {
            let [wt, lt] = response;
            this.wageType = wt;
            this.layout = lt;        
        
            this.form = new UniFormLayoutBuilder().build(this.layout, this.wageType);            
            this.form.hideSubmitButton();
            
            console.log("wagetype", response);
            
            this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = this.form;
                    setTimeout(() => {
                        this.formInstance = cmp.instance;
                    }, 103);
                });
        
        }, error => console.log(error));
    }



}