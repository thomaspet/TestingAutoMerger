import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Control} from '@angular/common';
import {AuthService} from '../../../../framework/core/authService';

@Component({
    selector: 'uni-feedback',
    templateUrl: 'app/components/common/feedback/feedback.html',
})
export class UniFeedback {
    private expanded: boolean = false;
    private busy: boolean = false;
    private error: boolean = false;

    private headers: Headers;
    private titleControl: Control;
    private descriptionControl: Control;
    
    constructor(private http: Http, private authService: AuthService) {
        this.initForm();
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.authService.getToken());
        this.headers.append('CompanyKey', this.authService.getActiveCompany()['Key']);
    }

    private initForm() {
        this.titleControl = new Control('');
        this.descriptionControl = new Control('');
    }

    private toggle() {
        this.expanded = !this.expanded;
    }

    private submit() {
        let modules;
        if (window.location.hash.length === 0) {
            modules = ['Dashboard'];
        } else {
            modules = window.location.hash.split('/').filter((item) => {
                // skip # and id params
                return (item !== '#' && isNaN(parseInt(item, 10))); 
            });
        }

        let body = {
            Title: this.titleControl.value,
            Description: this.descriptionControl.value,
            Modules: modules,
            Metadata: {
                AbsoluteUri: window.location.href
            }
        };

        this.busy = true;
        this.http.post(
            'http://devintegrations-unieconomy.azurewebsites.net/api/feedback',
            JSON.stringify(body),
            {headers: this.headers}
        ).subscribe(
            (success) => {
                this.initForm();
                this.expanded = false;
                this.error = false;
                this.busy = false;
            }, 
            (error) => {
                this.error = true;
                this.busy = false;
            }
        );

        // For testing styles: 
        // - comment out http call above
        // - use success or error timeout block below
        
        // Success
        // setTimeout(() => {
        //     this.initForm();
        //     this.error = false;
        //     this.busy = false;
        //     this.expanded = false;
        // }, 200);

        // Error
        // setTimeout(() => {
        //     this.error = true;
        //     this.busy = false;
        // }, 200);
    }
}
