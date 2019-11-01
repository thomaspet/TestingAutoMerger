import {Component, Input} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {AuthService} from '@app/authService';
import {InitService} from '../../init.service';
import {ErrorService} from '@app/services/services';

@Component({
    selector: 'init-new-demo',
    templateUrl: './new-demo.html',
    styleUrls: ['./new-demo.sass']
})
export class NewDemo {
    @Input() contractID: number;

    missingTemplate: boolean;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private initService: InitService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.busy = true;
        this.initService.getTemplates().subscribe(templates => {
            const template = templates.find(t => t.IsTest);
            if (template) {
                this.createTestCompany(template);
            } else {
                // TODO: Missing template handler
            }
        });
    }

    createTestCompany(template) {
        this.initService.createCompany({
            ContractID: this.contractID,
            TemplateCompanyKey: template.Key,
            CompanyName: 'Demobedrift'
        }).subscribe(
            () => this.checkCreationStatus(),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private checkCreationStatus() {
        this.initService.getCompanies().subscribe(
            companies => {
                if (companies && companies.length) {
                    this.busy = false;
                    this.authService.setActiveCompany(companies[0], '/');
                } else {
                    setTimeout(() => {
                        this.checkCreationStatus();
                    }, 3000);
                }
            },
            () => {
                setTimeout(() => {
                    this.checkCreationStatus();
                }, 3000);
            }
        );
    }
}
