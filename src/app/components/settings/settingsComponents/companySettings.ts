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
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;

        var headers = new Headers();
        headers.append('Client', 'client1');

        //Should get company from service (CompanyService) with the id from localstorage
        this.http.get('http://devapi.unieconomy.no:80/api/biz/companysettings/1?expand=Address,Emails,Phones ', { headers: headers })
            .map(res => res.json())
            .subscribe(data => this.dateIsReady(data))
    }

    //This method is not needed, but maybe we wanna do something when data returns??
    dateIsReady(data) {
        this.company = data;

        var name = new UniFieldBuilder()
            .setLabel('TESTING')
            .setModel(this.company)
            .setModelField('name')
            .setType('Text');

        console.log(this.company);

        for (var value in this.company) {
            if (typeof (this.company[value]) === 'object') {
                console.log(this.company[value]);
            } 
        }

        this.form.push(name);

    }
}