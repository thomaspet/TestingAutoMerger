import {Component, OnInit} from 'angular2/core';
import {NgFor, NgIf, Validators, Control, FormBuilder} from 'angular2/common';
import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';

import {UniForm, FIELD_TYPES} from '../../../../framework/forms/uniForm';
import {UniFormBuilder} from "../../../../framework/forms/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../framework/forms/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../../framework/forms/uniFieldBuilder";

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settingsComponents/companySettings.html',
    directives: [NgFor, NgIf, UniForm]
})

export class CompanySettings implements OnInit {

    id: any;
    form: any;
    company: any;
    activeCompany: any;

    constructor(public http: Http, public formBuilder: FormBuilder) {
        this.company = {};
        this.form = [];
    }

    ngOnInit() {

        //ID of active company used to GET company settings
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;

        //Dummy method for dev. REMOVE!!
        if (this.id !== 1) {
            this.id = 1;
        }

        var headers = new Headers();
        headers.append('Client', 'client1');

        var url = 'http://devapi.unieconomy.no:80/api/biz/companysettings/' + this.id + '?expand=Address,Emails,Phones';

        //Gets settings for the company currently active
        this.http.get(url, { headers: headers })
            .map(res => res.json())
            .subscribe(data => this.dateIsReady(data))
    }

    //Called when data is returned from the API
    dateIsReady(data) {
        this.company = data;

        var model = {};

        var formBuilder = new FormBuilder()

        var name = new UniFieldBuilder()
            .setLabel('TESTING')
            .setModel(model)
            .setModelField('name')
            .setType('Text');

        this.formBuilder.addFields(name);

        var organizationNumber = new UniFieldBuilder()
            .setLabel('ORG-NUMBER')
            .setModel(model)
            .setModelField('name')
            .setType('TEXT')

        this.formBuilder.addFields(organizationNumber);

        console.log(this.company);

        for (var value in this.company) {
            //Finds arrays inside object
            if (typeof (this.company[value]) === 'object') {
                //Loops through array 
                for (var val in this.company[value]) {
                    console.log(this.company[value][val]);
                }
            } 
        }
    }
}