import {Component, OnInit, ChangeDetectionStrategy, ViewChild, ComponentRef} from '@angular/core';
import {UniFieldBuilder, UniFormBuilder, UniForm, UniFormLayoutBuilder} from '../../../../framework/forms';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {AltinnService} from '../../../services/services';
import { FieldType, Altinn, ComponentLayout} from '../../../unientities';
import {UniComponentLoader} from '../../../../framework/core';

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
    
    constructor(private _altinnService: AltinnService) {
        
    }
    
    public ngOnInit() {
        this.getData();
    }
    
    private getData() {
        this._altinnService.GetAll('').subscribe((response: Altinn[]) => {
            console.log('response: ' + JSON.stringify(response));
            if (response.length !== 0) {
                this.altinn = response[0];
                this.setFormConfig();
            }else {
                this._altinnService.GetNewEntity().subscribe((newAltinn: Altinn) => {
                    this.altinn = newAltinn;
                    console.log('altinn: ' + JSON.stringify(this.altinn));
                    if (this.formConfig !== null) {
                        this.formConfig.setModel(this.altinn);
                    }else {
                        this.setFormConfig();
                    }
                });
            }
            
        });
    }
    
    private setFormConfig() {
        var view: ComponentLayout = {
            StatusCode: 0,
            Name: 'Altinn',
            BaseEntity: 'Altinn',
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'SystemID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'ID fra Altinn',
                    Description: 'Description',
                    HelpText: 'HelpText',
                    FieldSet: 0,
                    Section: 0,
                    Legend: 'Legend',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null,
                    hasLineBreak: true
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'SystemPw',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.PASSWORD,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Passord',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null,
                    hasLineBreak: true
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Altinn',
                    Property: 'Language',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Foretrukket språk',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null,
                    kendoOptions: {
                        dataSource: this._altinnService.languages,
                        dataTextField: 'text',
                        dataValueField: 'ID'
                    },
                    hasLineBreak: true
                }
            ]               
        };   
        
        this.formConfig = new UniFormLayoutBuilder().build(view, this.altinn);
        console.log('set form config: ' + JSON.stringify(this.formConfig));
    }
    
    public onSubmit(event) {
        console.log('submitting');
        if (this.altinn.ID) {
            this._altinnService.Put(this.altinn.ID, this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        }else {
            this._altinnService.Post(this.altinn).subscribe((response: Altinn) => {
                this.altinn = response;
            }, error => console.log(error));
        }
    }
}
