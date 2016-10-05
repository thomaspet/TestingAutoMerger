import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {FormControl} from '@angular/forms';
import {AuthService} from '../../../../framework/core/authService';
import moment from 'moment';
declare var APP_VERSION;

@Component({
    selector: 'uni-feedback',
    templateUrl: 'app/components/common/feedback/feedback.html'
})
export class UniFeedback {
    private expanded: boolean = false;
    private busy: boolean = false;
    private error: boolean = false;
    private success: boolean = false;

    private headers: Headers;
    private titleControl: FormControl;
    private descriptionControl: FormControl;

    constructor(private http: Http, private authService: AuthService) {
        this.initForm();
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.authService.getToken());
        this.headers.append('CompanyKey', this.authService.getActiveCompany()['Key']);
    }

    private initForm() {
        this.titleControl = new FormControl('');
        this.descriptionControl = new FormControl('');
    }

    private toggle() {
        this.expanded = !this.expanded;

        if (this.expanded) {
            setTimeout(() => {
                document.getElementById('feedback_title').focus();
            });
        }
    }

    private close() {
        this.expanded = false;
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
            'https://devintegrations-unieconomy.azurewebsites.net/api/feedback',
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
