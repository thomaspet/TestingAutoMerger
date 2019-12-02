import {Component, Input} from '@angular/core';
import {AuthService} from '@app/authService';
import {ErrorService, InitService} from '@app/services/services';

@Component({
    selector: 'init-new-demo',
    templateUrl: './new-demo.html',
    styleUrls: ['./new-demo.sass']
})
export class NewDemo {
    @Input() contractID: number;

    creatingCompany: boolean;
    template;
    error: boolean;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private initService: InitService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.initService.getTemplates().subscribe(templates => {
            this.template = templates.find(t => t.IsTest);
            this.createTestCompany();
        });
    }

    createTestCompany() {
        this.busy = true;

        this.initService.createCompany({
            ContractID: this.contractID,
            TemplateCompanyKey: this.template && this.template.Key,
        }).subscribe(
            () => {
                this.error = false;
                this.busy = false;
                this.creatingCompany = true;
                this.checkCreationStatus();
            },
            err => {
                this.errorService.handle(err);
                this.error = true;
                this.busy = false;
            }
        );
    }

    private checkCreationStatus() {
        this.initService.getCompanies().subscribe(
            companies => {
                if (companies && companies.length) {
                    this.authService.setActiveCompany(companies[0], '/');
                } else {
                    setTimeout(() => this.checkCreationStatus(), 3000);
                }
            },
            () => setTimeout(() => this.checkCreationStatus(), 3000)
        );
    }
}
