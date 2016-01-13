import {Component, Injector} from 'angular2/core';
import {RouteParams} from 'angular2/router';

import {UniForm} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';

import {UniFormBuilder} from '../../../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../../../framework/forms/uniFieldBuilder';
import {UniFieldsetBuilder} from '../../../../../framework/forms/uniFieldsetBuilder';
import {UniGroupBuilder} from '../../../../../framework/forms/uniGroupBuilder';

import {EmployeeDS} from '../../../../../framework/data/employee';

@Component({
    selector: 'employee-personal-details',
    directives:[UniForm],
    providers: [EmployeeDS],
    template: `
    <div class="application employee">
        <button (click)="toggleMode()">Toogle edit mode</button>
        <uni-form (uniFormSubmit)='onSubmit($event)' [fields]='form.config()'></uni-form>
    </div>
    `
})
export class PersonalDetails {
    form;
    employee;
    dataIsReady;
    constructor(private injector: Injector, employeeDS:EmployeeDS) {
        var routeParams = injector.parent.parent.get(RouteParams);//Any way to get that in an easy way????
        employeeDS.get(routeParams.get('id'))
            .subscribe(response => this.employee = response,error => console.log(error));
        
        employeeDS.getModel().subscribe(response => console.log(response));
        employeeDS.getValidation().subscribe(response => console.log(response));
        
        var formBuilder = new UniFormBuilder();
        
        var model = {};
        
        var name = new UniFieldBuilder();
        name.setLabel('Fornavn')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)
        
        var middleName = new UniFieldBuilder();
        middleName.setLabel('Mellomnavn')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)
        
        var lastName = new UniFieldBuilder();
        lastName.setLabel('Etternavn')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)
        
        var DNumber = new UniFieldBuilder();
        DNumber.setLabel('Person- eller D-nummer')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var address = new UniFieldsetBuilder();
        var street = new UniFieldBuilder();
        street.setLabel('Adresse')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var postNumber = new UniFieldBuilder();
        postNumber.setLabel('Post Sted')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var place = new UniFieldBuilder();
        place.setLabel('Sted')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        address.addFields(street, postNumber, place);
        
        var email = new UniFieldBuilder();
        email.setLabel('Privat epost')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var phone = new UniFieldBuilder();
        phone.setLabel('Telefon')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var employeeNumber = new UniFieldBuilder();
        employeeNumber.setLabel('Ansattnummer')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var account = new UniFieldBuilder();
        account.setLabel('Kontonummer')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var gender = new UniFieldBuilder();
        gender.setLabel('Kjønn')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var birthdate = new UniFieldBuilder();
        birthdate.setLabel('Fodseldato')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.DATEPICKER)//Validation or specific field
        .setKendoOptions({})
        
        var department = new UniFieldBuilder();
        department.setLabel('Avdelinger')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var superior = new UniFieldBuilder();
        superior.setLabel('overordenet')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var workplace = new UniFieldBuilder();
        workplace.setLabel('arbeidsted')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var internationalPoster = new UniGroupBuilder("INTERNASJONALE POSTER")
        var internationalID = new UniFieldsetBuilder("Internasjonal ID");
        var internationalNumber = new UniFieldBuilder();
        internationalNumber.setLabel('Nummer')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        var internationalType = new UniFieldBuilder();
        internationalType.setLabel('Type')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.DROPDOWN)//Validation or specific field
        .setKendoOptions({
            dataSource: [
                'Passnummer',
                'Social Security Number', 
                'Tax Identification Nummer', 
                'VAT Nummer'
            ]
        });
        
        var internationalCountry = new UniFieldBuilder();
        internationalCountry.setLabel('Utstedelsesland')
        .setModel(model)
        .setModelField('name')
        .setType(UNI_CONTROL_TYPES.TEXT)//Validation or specific field
        
        internationalID.addFields(internationalNumber,internationalType,internationalCountry);
        internationalPoster.addFields(internationalID);
        formBuilder.addFields(
            name,
            middleName,
            lastName,
            DNumber,
            address,
            email,
            phone,
            employeeNumber,
            account,
            gender,
            birthdate,
            department,
            superior,
            workplace,
            internationalPoster
        );
        
        
        
        this.form = formBuilder;   
    }
    
    toggleMode() {
        this.form.isEditable() ? this.form.readmode(): this.form.editmode();
    }
    
    onSubmit(event) {
        console.log(event);
    }
}