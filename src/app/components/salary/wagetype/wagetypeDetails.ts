import {Component, provide, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {WageTypeService} from "../../../services/services";

import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../framework/forms";
import {UniFieldBuilder} from '../../../../framework/forms/builders/uniFieldBuilder';

import {WageType} from "../../../unientities";

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [WageTypeService],
    directives: [UniComponentLoader, UniForm]
})
export class WagetypeDetail {
    wageType: WageType;
    layout;
    formCfg: UniFormBuilder[];

    form: UniFormBuilder = new UniFormBuilder();
    whenFormInstance: Promise<UniForm>;

    @ViewChild(UniComponentLoader)  uniCompLoader: UniComponentLoader;

    constructor(private routeparams: RouteParams, private router: Router, private wageService: WageTypeService) {
    }

    ngOnInit() {
        let ID: number = +this.routeparams.get('id');
        
        this.wageService.getLayout('mock').subscribe((response: any) => {
            this.layout = response;
            this.wageService.getWageType(ID).subscribe((response : WageType) => {
                console.log(response);
                this.wageType = response;
                
                if(this.wageType.ID === 0){
                    this.wageType.WageTypeId = null;
                    this.wageType.AccountNumber = null;
                }
                this.form = new UniFormLayoutBuilder().build(this.layout, this.wageType);
                if(this.wageType.ID == 0){
                    this.form.find('WageTypeId').readonly = false;
                }
                
                this.loadForm();
            });
        });
    }
    
    loadForm(){
        this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = this.form;
            cmp.instance.getEventEmitter().subscribe(this.onSubmit(this));
            this.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
        });
    }

    onSubmit(context: WagetypeDetail) {
        return () => {
            context.wageService.setRelativeUrl('wagetypes');
            if (context.wageType.ID) {
                context.wageService.Put(context.wageType.ID, context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = data;
                            context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.wageType));
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Put: ', error)
                    );
            } else {
                console.log("we are now Posting");
                context.wageService.Post(context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = data;
                            this.router.navigateByUrl("/salary/wagetypes/" + context.wageType.ID);
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Post: ', error)
                    );
            }
        };
    }
}