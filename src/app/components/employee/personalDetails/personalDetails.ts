import {Validators} from 'angular2/common';
import {Component, Injector, ViewChild, DynamicComponentLoader, ElementRef, ComponentRef, Type} from 'angular2/core';
import {RouteParams} from 'angular2/router';

import {UniForm} from '../../../../framework/forms/uniForm';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {UniFormBuilder} from '../../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../../framework/forms/uniFieldBuilder';
import {UniFieldsetBuilder} from '../../../../framework/forms/uniFieldsetBuilder';
import {UniGroupBuilder} from '../../../../framework/forms/uniGroupBuilder';

import {EmployeeDS} from '../../../../framework/data/employee';
import {EmployeeModel} from '../../../../framework/models/employee';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    template: `
    <div class="application employee">
        <button (click)="toggleMode()">Toogle edit mode</button>
        <uni-component-loader></uni-component-loader>
    </div>
    `
})
export class PersonalDetails {

    form:UniFormBuilder = new UniFormBuilder();
    layout;
    employee;
    @ViewChild(UniComponentLoader) ucl: UniComponentLoader;
    EmployeeID;

    constructor(public injector:Injector, public employeeDS:EmployeeDS) {
        var routeParams = this.injector.parent.parent.get(RouteParams);//Any way to get that in an easy way????
        this.EmployeeID = routeParams.get('id');
    }
    ngAfterViewInit() {

        var self = this;
        Observable.zip(
            self.employeeDS.get(this.EmployeeID),
            self.employeeDS.layout('EmployeePersonalDetailsForm')
        ).subscribe(
            response => {
                self.employee = EmployeeModel.createFromObject(response[0]);

                self.form = self.buildLayout(response[1]);

                self.ucl.load(UniForm,(cmp: ComponentRef)=>{
                    cmp.instance.uniFormSubmit.subscribe(self.onSubmit);
                    cmp.instance.fields = self.form.config();
                });
            },
            error => console.error(error)
        );
    }
    buildLayout(layout) {
        var INPUT_TYPES = UNI_CONTROL_DIRECTIVES.values();
        var formBuilder = new UniFormBuilder();

        var model = {};

        var name = new UniFieldBuilder();
        name.setLabel('Fornavn')
            .setModel(model)
            .setModelField('name')
            .addSyncValidator("required", Validators.required, "Name is required")
            .setType(UNI_CONTROL_DIRECTIVES[10])
        var middleName = new UniFieldBuilder();
        middleName.setLabel('Mellomnavn')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])

        var lastName = new UniFieldBuilder();
        lastName.setLabel('Etternavn')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])

        var DNumber = new UniFieldBuilder();
        DNumber.setLabel('Person- eller D-nummer')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var address = new UniFieldsetBuilder();
        var street = new UniFieldBuilder();
        street.setLabel('Adresse')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var postNumber = new UniFieldBuilder();
        postNumber.setLabel('Post Sted')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var place = new UniFieldBuilder();
        place.setLabel('Sted')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        address.addFields(street, postNumber, place);

        var email = new UniFieldBuilder();
        email.setLabel('Privat epost')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[11])//Validation or specific field

        var phone = new UniFieldBuilder();
        phone.setLabel('Telefon')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var employeeNumber = new UniFieldBuilder();
        employeeNumber.setLabel('Ansattnummer')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var account = new UniFieldBuilder();
        account.setLabel('Kontonummer')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var gender = new UniFieldBuilder();
        gender.setLabel('Kjønn')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var birthdate = new UniFieldBuilder();
        birthdate.setLabel('Fodseldato')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[2])//Validation or specific field
            .setKendoOptions({})

        var department = new UniFieldBuilder();
        department.setLabel('Avdelinger')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var superior = new UniFieldBuilder();
        superior.setLabel('overordenet')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var workplace = new UniFieldBuilder();
        workplace.setLabel('arbeidsted')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var internationalPoster = new UniGroupBuilder("INTERNASJONALE POSTER")
        var internationalID = new UniFieldsetBuilder("Internasjonal ID");
        var internationalNumber = new UniFieldBuilder();
        internationalNumber.setLabel('Nummer')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        var internationalType = new UniFieldBuilder();
        internationalType.setLabel('Type')
            .setModel(model)
            .setModelField('name')
            .setType(UNI_CONTROL_DIRECTIVES[3])//Validation or specific field
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
            .setType(UNI_CONTROL_DIRECTIVES[10])//Validation or specific field

        internationalID.addFields(internationalNumber, internationalType, internationalCountry);
        internationalPoster.addFields(internationalID);
        internationalPoster.openByDefault(true);
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

        return formBuilder;
    }

    toggleMode() {
        this.form.isEditable() ? this.form.readmode() : this.form.editmode();
    }

    onSubmit(event) {
        console.log(event);
    }
}