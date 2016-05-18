import {Component, OnInit, ChangeDetectionStrategy, ViewChild, ComponentRef} from '@angular/core';
import {UniFieldBuilder, UniFormBuilder, UniForm, UniFormLayoutBuilder} from '../../../../framework/forms';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {AltinnService} from '../../../services/services';
import { FieldType, Altinn, ComponentLayout} from '../../../unientities';
import {UniComponentLoader} from '../../../../framework/core';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'altinn-settings',
    templateUrl: 'app/components/settings/altinnSettings/altinnSettings.html',
    providers: [AltinnService],
    directives: [UniForm]
})
export class AltinnSettings implements OnInit {
    private formConfig: UniFormBuilder = null;
    private altinn: Altinn;
    //private whenFormInstance: Promise<UniForm>;
    //private formInstance: UniForm;

    //@ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    @ViewChild(UniForm) private formInstance: UniForm;

    constructor(private _altinnService: AltinnService) {

    }

    public ngOnInit() {
        this.getData();
        /*this.formInstance.ready.subscribe(() => {
            this.formInstance.submit.subscribe((event) => {
                this.saveAltinn(event);
            });
        });*/
    }

    private getData() {
        Observable.forkJoin(
            this._altinnService.GetAll(''),
            this._altinnService.getLayout()).subscribe((response: any) => {
                let [altinn, layout] = response;
                if (altinn.length !== 0) {
                    this.altinn = altinn[0];
                    this.setFormConfig(layout);
                } else {
                    this._altinnService.GetNewEntity().subscribe((newAltinn: Altinn) => {
                        this.altinn = new Altinn();
                        console.log('altinn: ' + JSON.stringify(this.altinn));
                        if (this.formConfig !== null) {
                            this.formConfig.setModel(this.altinn);
                        } else {
                            this.setFormConfig(layout);
                        }
                    });
                }
            });
    }

    private setFormConfig(layout) {
        this.formConfig = new UniFormLayoutBuilder().build(layout, this.altinn);
        this.formConfig.hideSubmitButton();
    }

    public saveAltinn(event) {
        this.formInstance.sync();
        if (this.altinn.ID) {
            console.log('put');
            this._altinnService.Put(this.altinn.ID, this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        } else {
            console.log('Post');
            this._altinnService.Post(this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        }
    }
}
