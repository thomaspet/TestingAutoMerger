import {Component, Input} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {Company} from '@uni-entities';
import {AuthService} from '@app/authService';

@Component({
    selector: 'init-new-demo',
    templateUrl: './new-demo.html',
    styleUrls: ['./new-demo.sass']
})
export class NewDemo {
    @Input() contractID: number;

    companyName: string;
    templates: any[];
    selectedTemplate: any;
    busy: boolean;

    constructor(
        private uniHttp: UniHttp,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('template-companies')
            .send()
            .map(res => res.body)
            .subscribe(
                res => {
                    this.templates = res || [];
                    this.selectedTemplate = this.templates[0];
                },
                err => console.error(err)
            );
    }

    createTestCompany() {
        this.busy = true;
        this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint('create-company')
            .withBody({
                CompanyName: this.companyName,
                ContractID: this.contractID,
                TemplateCompanyKey: this.selectedTemplate.Key,
            })
            .send()
            .map(res => res.body)
            .subscribe(
                () => {
                    this.checkIfCompanyIsCreated();
                    /* this.signalRservice.pushMessage$.subscribe(companyDone => {
                        console.log(companyDone);
                        if (companyDone) {
                            console.log(companyDone);
                            this.creatingCompany = false;
                            this.checkIfCompanyIsCreated();
                        }
                    }); */
                },
                err => {
                    console.error(err);
                    this.busy = false;
                }
            );
    }

    checkIfCompanyIsCreated() {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .subscribe(
                res => {
                    const company = res.body;
                    if (!company || !company.length) {
                        setTimeout(() => {
                            this.checkIfCompanyIsCreated();
                        }, 3000);
                    } else {
                        this.busy = false;
                        this.authService.setActiveCompany(company[0], '/');
                    }
                },
                () => {
                    setTimeout(() => {
                        this.checkIfCompanyIsCreated();
                    }, 3000);
                }
            );
    }

}
