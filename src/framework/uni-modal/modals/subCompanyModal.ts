import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ErrorService } from '@app/services/services';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { UniHttp } from '@uni-framework/core/http/http';

@Component({
    selector: 'uni-subcompany-modal',
    template: `
        <section role="dialog" class="uni-modal">

            <header>Opprett selskap i lokalt kunderegister</header>

            <article [attr.aria-busy]="busy" *ngIf="subCompany === undefined">
                <h3>Opprette ny kunde: {{options?.data?.Name}}</h3>
            </article>

            <article *ngIf="subCompany">
                <h3>Allerede knyttet mot kundenr. {{subCompany?.CustomerNumber}} - {{subCompany?.Name}}</h3>
            </article>

            <footer>
                <button [disabled]="subCompany || busy" (click)="onCloseAction('ok')" class="good">OK</button>
                <button (click)="onCloseAction('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})
export class SubCompanyModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    public busy = false;

    public get subCompany(): { ID: number, Name: string, CompanyKey: string } {
        return this.options.data ? this.options.data.SubCompany : undefined;
    }

    public get company(): { Name: string, Key: string } {
        return this.options.data ? this.options.data : undefined;
    }

    constructor(
        private errorService: ErrorService,
        private http: UniHttp
    ) {}

    public onCloseAction(src: 'ok' | 'cancel') {

        if (src === 'ok') {
            this.busy = true;
            this.createCustomerWithSubCompany()
                .finally( () => this.busy = false )
                .subscribe( customer => {
                    this.onClose.emit(true);
                }, err => this.errorService.handle(err));
            return;
        }

        this.onClose.emit(false);
    }

    public close() {
        this.onClose.emit(false);
    }

    private createCustomerWithSubCompany() {
        const company = this.company;
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody({
                Info: {
                    Name: company.Name
                },
                Companies: [{
                    CompanyKey: company.Key,
                    CompanyName: company.Name
                }]
            })
            .withEndPoint('customers')
            .send()
            .map(response => response.body);
    }
}

class ICustomer {
    ID?: number;
    Info: IINfo;
    Companies: ISubCompany[];
}

class IINfo {
    ID?: number;
    Name: string;
}

class ISubCompany {
    ID?: number;
    CustomerID?: number;
    CompanyKey: string;
    CompanyName: string;
}

