import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Control} from '@angular/common';
import {AuthService} from '../../../../framework/core/authService';
declare var APP_VERSION;
declare var moment;

@Component({
    selector: 'uni-feedback',
    templateUrl: 'app/components/common/feedback/feedback.html',
})
export class UniFeedback {
    private expanded: boolean = false;
    private busy: boolean = false;
    private error: boolean = false;
    private success: boolean = false;

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

        if (this.expanded) {
            setTimeout(() => {
                document.getElementById('feedback_title').focus();
            });
        }
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
                AbsoluteUri: window.location.href,
                LocalTime: moment(new Date()).format('DD.MM.YYYY HH:mm'),
                GitRev: 'https://github.com/unimicro/AppFrontend/commit/' + APP_VERSION
            }
        };
        let setSuccessClass = () => {
            this.success = true;
            setTimeout(() => {
                this.success = false;
                this.expanded = false;
            }, 4000);
        };

        this.busy = true;
        this.http.post(
            'http://devintegrations-unieconomy.azurewebsites.net/api/feedback',
            JSON.stringify(body),
            {headers: this.headers}
        ).subscribe(
            (success) => {
                this.initForm();
                this.error = false;
                this.busy = false;
                setSuccessClass();
            },
            (error) => {
                this.error = true;
                this.busy = false;
            }
        );
    }
}
