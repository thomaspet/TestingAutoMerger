import {Component, provide, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams} from "angular2/router";

import { Observable } from "rxjs/Observable";

import {WagetypeService} from "../../../data/wagetype";
import {WageTypeService} from "../../../services/services";

import {UniComponentLoader} from "../../../../framework/core";
import {UniForm} from "../../../../framework/forms/uniForm";
import {UniFormBuilder, UniFormLayoutBuilder} from "../../../../framework/forms";

import {IWageType} from "../../../interfaces";

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [provide(WagetypeService, {useClass: WagetypeService}), WageTypeService],
    directives: [UniComponentLoader, UniForm]
})
export class WagetypeDetail {
    wageType: IWageType;
    layout;
    formCfg: UniFormBuilder[];

    form: UniFormBuilder = new UniFormBuilder();
    formInstance: UniForm;

    @ViewChild(UniComponentLoader)  uniCompLoader: UniComponentLoader;

    constructor(private _routeparams: RouteParams, private _wagetypeService: WagetypeService, private _wageService: WageTypeService) {
    }

    ngOnInit() {

        var self = this;
        let ID = +self._routeparams.get("id");

        Observable.forkJoin(
            self._wagetypeService.get(ID),
            self._wagetypeService.layout("")
        ).subscribe((response: any) => {
            let [wt, lt] = response;
            self.wageType = wt;
            self.layout = lt;

            self.form = new UniFormLayoutBuilder().build(self.layout, self.wageType);

            self.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
                cmp.instance.config = self.form;
                cmp.instance.getEventEmitter().subscribe(self.onSubmit());
                setTimeout(() => {
                    self.formInstance = cmp.instance;
                }, 103);
            });

        }, error => console.log(error));
    }

    onSubmit() {
        /*return() => {
            this._wagetypeService.update(this.wageType).subscribe((response) => {
                console.log(response);
            });
        };*/
        return () => {
            console.log(this);
            if (this.wageType.ID > 0) {
                this._wageService.Put(this.wageType.ID, this.wageType)
                    .subscribe(
                        data => {
                            console.log("It worked, here is the data: " + JSON.stringify(data));
                            this.wageType = data
                        },
                        error => console.log("error in wagetypedetails.onSubmit: ", error)
                    );
            }
            else {
                this._wageService.Post(this.wageType)
                    .subscribe(
                        data => this.wageType = data,
                        error => console.log("error in wagetypedetails.onSubmit: ", error)
                    );
            }
        }

    }

}