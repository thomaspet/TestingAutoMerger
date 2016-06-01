import {Component, OnInit, ViewChild} from '@angular/core';
import {UniFormBuilder, UniForm, UniFormLayoutBuilder} from '../../../../framework/forms';
import {AltinnService} from '../../../services/services';
import {Altinn} from '../../../unientities';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'altinn-settings',
    templateUrl: 'app/components/settings/altinnSettings/altinnSettings.html',
    providers: [AltinnService],
    directives: [UniForm]
})
export class AltinnSettings implements OnInit {
    private formConfig: UniFormBuilder = null;
    private altinn: Altinn;
    
    @ViewChild(UniForm) private formInstance: UniForm;
    
    public loginErr: string;

    constructor(private _altinnService: AltinnService) {
           this.loginErr = '';
    }

    public ngOnInit() {
        this.getData();
    }

    public check()    {
        alert('hei');   
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
            this._altinnService.Put(this.altinn.ID, this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        } else {
            this._altinnService.Post(this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        }
    }
}
