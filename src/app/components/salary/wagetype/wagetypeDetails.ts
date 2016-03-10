import {Component, provide, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {WageTypeService} from "../../../services/services";

import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../framework/forms";

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
    formInstance: Promise<UniForm>;

    @ViewChild(UniComponentLoader)  uniCompLoader: UniComponentLoader;

    constructor(private _routeparams: RouteParams, private _wageService: WageTypeService) {
    }

    ngOnInit() {

        var self: WagetypeDetail = this;
        let ID: number = +self._routeparams.get('id');

        this._wageService.GetLayoutAndEntity('mock', ID).subscribe((response: any) => {
            let [layout, entity] = response;
            self.wageType = entity;
            self.layout = layout;

            self.form = new UniFormLayoutBuilder().build(self.layout, self.wageType);
            self.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                cmp.instance.config = self.form;
                cmp.instance.getEventEmitter().subscribe(self.onSubmit(self));
                self.formInstance = new Promise((resolve: Function) => resolve(cmp.instance));
            });
        });
    }

    onSubmit(context: WagetypeDetail) {
        return () => {
            if (context.wageType.ID > 0) {
                context._wageService.Put(context.wageType.ID, context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = data;
                            context.formInstance.then((instance: UniForm) => instance.refresh(context.wageType));
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Put: ', error)
                    );
            } else {
                context._wageService.Post(context.wageType)
                    .subscribe(
                        (data: WageType) => {
                            context.wageType = data;
                            context.formInstance.then((instance: UniForm) => instance.refresh(context.wageType));
                        },
                        (error: Error) => console.error('error in wagetypedetails.onSubmit - Post: ', error)
                    );
            }
        };
    }

}