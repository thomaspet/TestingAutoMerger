import {Component, OnInit} from 'angular2/core';
import {NgFor, NgIf} from 'angular2/common';
import {RouteParams} from 'angular2/router';
import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
    selector: 'company-settings',
    templateUrl: 'app/components/companySettings/companySettings.html',
    directives: [NgFor, NgIf]
})

export class CompanySettings implements OnInit {

    id: any;
    company: any;

    constructor(public routeParam: RouteParams, public http: Http) {
        this.company = {};
    }

    ngOnInit() {
        this.id = this.routeParam.get('id');

        var headers = new Headers();
        headers.append('Client', 'client1');

        //Should get company from service (CompanyService) with the id from RouteParams
        this.http.get('http://devapi.unieconomy.no:80/api/biz/companysettings/1?expand=Address,Emails,Phones ', { headers: headers })
            .map(res => res.json())
            .subscribe(data => this.dateIsReady(data))
    }

    //This method is not needed, but maybe we wanna do something when data returns??
    dateIsReady(data){
        this.company = data;
    }
   
    //Adds a new field in the company object
    addFieldToCompany(field) {
        var tempObject = {};
        for (var value in this.company[field][0]) {
            if (this.company[field][0].hasOwnProperty(value)) {
                tempObject[value] = '';
            }
        }
        this.company[field].push(tempObject);
    }

    //Removes a field from the company object
    removeFieldFromCompany(field, index) {
        this.company[field].splice(index, 1);
    }

    //Should save the changes in the company settings object
    //NOT IMPLEMENTED
    saveCompanySettings() {
        console.log(this.company);
        //TODO.. PUT? POST? Or implement service?
    }

}