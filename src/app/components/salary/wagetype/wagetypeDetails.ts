import {Component, provide, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {WageTypeService} from "../../../services/services";

import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../framework/forms";
import {UniFieldBuilder} from '../../../../framework/forms/builders/uniFieldBuilder';

import {WageType} from "../../../unientities";
import {WageTypeModel} from "../../../models/wagetype"

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [WageTypeService],
    directives: [UniComponentLoader, UniForm]
})
export class WagetypeDetail {
    wageType: WageTypeModel;
    layout;
    formCfg: UniFormBuilder[];

    form: UniFormBuilder = new UniFormBuilder();
    whenFormInstance: Promise<UniForm>;

    @ViewChild(UniComponentLoader)  uniCompLoader: UniComponentLoader;

    constructor(private _routeparams: RouteParams, private _router: Router, private _wageService: WageTypeService) {
    }

    ngOnInit() {

        var self: WagetypeDetail = this;
        let ID: number = +self._routeparams.get('id');
        
        this._wageService.GetLayout('mock').subscribe((response: any) => {
            self.layout = response;
            if(ID == 0){
                this._wageService.GetNewEntity().subscribe((newEntity: WageType) => {
                    self.wageType = new WageTypeModel();
                    self.buildForm();
                    self.extendForm(false);
                    self.loadForm();
                });
            }
            else{
                this._wageService.Get(ID).subscribe((response: any) => {
                    self.wageType = response;
                
                    self.buildForm();
                    self.extendForm(true);
                    self.loadForm();
                });
            }
            
        });
        /*
        this._wageService.GetLayoutAndEntity('mock', ID).subscribe((response: any) => {
            let [layout, entity] = response;
            self.wageType = entity;
            self.layout = layout;

            self.form = new UniFormLayoutBuilder().build(self.layout, self.wageType);
            self.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                cmp.instance.config = self.form;
                cmp.instance.getEventEmitter().subscribe(self.onSubmit(self));
                self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
            });
        });*/
    }
    
    buildForm(){
        var self: WagetypeDetail = this;
        self.form = new UniFormLayoutBuilder().build(self.layout, self.wageType);
    }
    
    extendForm(readOnly : boolean){
        var field : UniFieldBuilder = this.form.find('WageTypeId');
        field.readonly = readOnly;
    }
    
    loadForm(){
        var self: WagetypeDetail = this;
        self.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = self.form;
            cmp.instance.getEventEmitter().subscribe(self.onSubmit(self));
            self.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
        });
    }

    onSubmit(context: WagetypeDetail) {
        return () => {
            if (context.wageType.ID) {
                context._wageService.Put(context.wageType.ID, context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = WageTypeModel.createFromObject(data);
                            context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.wageType));
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Put: ', error)
                    );
            } else {
                console.log("we are now Posting");
                context._wageService.Post(context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = WageTypeModel.createFromObject(data);
                            //context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.wageType));
                            this._router.navigateByUrl("/salary/wagetypes/" + context.wageType.ID);
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Post: ', error)
                    );
            }
        };
    }
}