import {Component, OnInit, provide, ViewChild, ComponentRef, AfterViewInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, RouteParams, ROUTER_DIRECTIVES} from "angular2/router";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import {WagetypeService} from "../../../../framework/data/wagetype";


import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder, UniFieldBuilder, UniSectionBuilder} from "../../../../framework/forms";


import {IWageType, StdWageType, LimitType, TaxType, RateTypeColumn, FieldType} from "../../../../framework/interfaces/interfaces";
import {UNI_CONTROL_DIRECTIVES} from "../../../../framework/controls";

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [provide(WagetypeService, {useClass: WagetypeService})],
    directives: [UniComponentLoader, UniForm]
})
export class WagetypeDetail implements OnInit{
    wageType: IWageType; 
    layout;
    formCfg : UniFormBuilder[];
    
    
    
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
            //this.buildFormConfig();
            this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = this.form;
                    setTimeout(() => {
                        this.formInstance = cmp.instance;
                    }, 103);
                });
        
        }, error => console.log(error));
    }


    buildFormConfig(){
        this.formCfg = [];
        
        this.formCfg.push(new UniFormBuilder()            
            .addUniElements(
              /*  new UniFieldBuilder()
                    .setLabel("Employment Tax")
                    .setModel(this.wageType)
                    .setModelField("StandardWageTypeFor")
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.COMBOBOX])                        
                    .setKendoOptions({
                        dataSource: this.stdWageType,
                        dataTextField: "Name",
                        dataValueField: "ID" 
                     }),*/
                new UniFieldBuilder()
                    .setLabel("JadiJai")
                    .setModel(this.wageType)
                    .setModelField("Description")
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]),
                new UniFieldBuilder()
                    .setLabel("label")
                    .setModel(this.wageType)
                    .setModelField("Description")
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER])
                ));
                
            this.formCfg[0].hideSubmitButton();
            
            
        //var formBldr = new UniFormBuilder();
        /*var sec = new UniSectionBuilder("VisMer")
            .openByDefault(true);*/           
            /*
        this.formCfg.push(new UniFormBuilder()
            .addUniElements(
                new UniFieldBuilder()
                    .setLabel("Employment Tax")
                    .setModel(this.wageType)
                    .setModelField("StandardWageTypeFor")
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.COMBOBOX])                        
                    .setKendoOptions({
                        dataSource: this.stdWageType,
                        dataTextField: "Name",
                        dataValueField: "ID" 
                     }))//,   
                // new UniFieldBuilder()
                //      .setLabel("JadiJai")
                //      .setModel(this.wageType)
                //      .setModelField("wagetypename")
                //      .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])           
            //)
            .hideSubmitButton()
            );
            */
    }


}