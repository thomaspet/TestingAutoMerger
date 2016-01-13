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
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settingsComponents/companySettings.html',
    directives: [NgFor, NgIf, UniForm]
})

export class CompanySettings implements OnInit {

    id: any;
    form: any;
    headers: Headers;
    company: any;
    activeCompany: any;

    constructor(public http: Http) { }

    ngOnInit() {

        //ID of active company used to GET company settings
        this.id = JSON.parse(localStorage.getItem('activeCompany')).id;

        //Dummy method before real companies is fetched! REMOVE!!
        //if (this.id !== 1) {
        //    this.id = 1;
        //}

        this.headers = new Headers();
        this.headers.append('Client', 'client1');

        var url = 'http://devapi.unieconomy.no:80/api/biz/companysettings/' + this.id + '?expand=Address,Emails,Phones';

        //Gets settings for the company currently active
        this.http.get(url, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => this.dataReady(data));

    }

    //Called when data is returned from the API
    dataReady(data) {
        this.company = data;

        console.log(this.company);
        
        var formBuilder = new UniFormBuilder();

        for (var value in this.company) {

            if (typeof (this.company[value]) === 'object') {
                //Loops through array 
                for (var val in this.company[value]) {
                    var tempFieldset = new UniFieldsetBuilder();
                    for (var v in this.company[value][val]) {
                        if (v.slice(-2) !== 'ID') {
                            var temp = new UniFieldBuilder();
                            temp.setLabel(v)
                                .setModel(this.company[value][val])
                                .setModelField(v)
                                .setType(UNI_CONTROL_TYPES.TEXT);
                            
                            tempFieldset.addField(temp);
                        }
                    }
                    formBuilder.addField(tempFieldset);
                }
            } else {
                if (value.slice(-2) !== 'ID') {
                    var temp = new UniFieldBuilder();
                    temp.setLabel(value)
                        .setModel(this.company)
                        .setModelField(value)
                        .setType(UNI_CONTROL_TYPES.TEXT);
                    
                    formBuilder.addField(temp);
                }
            } 
        }
        console.log(formBuilder);

        this.form = formBuilder;
    }

    submitForm() {
        console.log(this.company);
        this.http.put(
            'http://devapi.unieconomy.no:80/api/biz/companysettings',
            JSON.stringify(this.company),
            { headers: this.headers })
            .map(res => console.log(res.json()))
    }
}