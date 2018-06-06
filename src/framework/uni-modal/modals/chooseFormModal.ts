import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniModalService} from '../modalService';
import {IUniModal, IModalOptions, ConfirmActions} from '../interfaces';
import {ReportService, ErrorService, BrowserStorageService, ReportDefinitionParameterService} from '../../../app/services/services';
import {UniPreviewModal} from '../../../app/components/reports/modals/preview/previewModal';
import {ReportDefinition} from '@uni-entities';

@Component({
    selector: 'choose-form-modal',
    template: `
     <section role="dialog" class="uni-modal">
            <header>
                <h1 class="new">{{options.data.name}}</h1>
            </header>

            <article>
                <div class="formSelectContainer">
                    <h3>Velg blankett-formular</h3>
                    <div class="formList">
                        <ul>
                            <li *ngFor="let form of formList; let i = index">
                                <input
                                    type="radio"
                                    name="selectOrderGroup"
                                    [value]="form.Name"
                                    [checked]="i === index"
                                    (change)="selectForm(form, i)">

                                <span class="formName">{{form.Description}}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="infoContainer">
                    <h3>{{options.data.name}}parametere</h3>
                    <span class="fromNr">
                        {{inputFromLabel}}<input type="number" [(ngModel)]="fromNr">
                    </span>
                    <span *ngIf="inputType.secondInputType">
                        {{inputToLabel}}<input class="toNrInput" type="number" [(ngModel)]="toNr">
                    </span>
                </div>
            </article>

            <footer>
                <button class="previewButton" type="button" id="preview_button" (click)="preview()">
                    Forhåndsvis
                </button>

                <button class="good" id="good_button_ok" (click)="acceptAndSendEmail()">
                    Send e-post
                </button>

                <button class="good" id="good_button_ok" (click)="acceptAndPrintOut()">
                    Skriv ut
                </button>

                <button class="cancel" (click)="cancel()">
                    Avbryt
                </button>
            </footer>
        </section>
    `
})

export class UniChooseFormModal implements IUniModal {
    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<any> = new EventEmitter();

    public fromNr: number;
    public toNr: number;
    public formList: ReportDefinition[];
    public lastSelectedForm: any;
    public index: number = 0;
    public inputFromLabel: string;
    public inputToLabel: string;
    public inputType: any = {name: 'nr', secondInputType: null};
    private selectedForm: any;

    constructor(
        private reportService: ReportService,
        private errorService: ErrorService,
        private browserStorageService: BrowserStorageService,
        private modalService: UniModalService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
    ) {}

    ngOnInit() {
        this.lastSelectedForm = JSON.parse(this.browserStorageService.getItem('lastChosenForm' + this.options.data.type));
        this.reportService.chooseFormType(this.options.data.type).subscribe(
            res => {
                this.formList = res;
                if (this.lastSelectedForm) {
                    const lastUsed = this.formList.find((form, i) => {
                        this.index = i;
                        return form.Name === this.lastSelectedForm.Name;
                    });
                    this.selectForm(lastUsed, this.index);
                } else {
                    this.selectForm(this.formList[0], 0);
                }
            },
            err => this.errorService.handle(err)
        );
    }

    ngAfterViewInit() {
        if (document.getElementById('preview_button')) {
            document.getElementById('preview_button').focus();
        }
    }

    public selectForm(form: ReportDefinition, i: number) {
        this.index = i;
        this.selectedForm = form;
        this.getReportParameters(form.ID);
    }

    public getReportParameters(id: number) {
        this.reportDefinitionParameterService.GetAll('filter=ReportDefinitionId eq ' + id).subscribe(
            res => {
                const name = res[0].Name.includes('Number') ? 'nr' : res[0].Name.toLowerCase();
                const form = this.selectedForm;
                this.inputType.name = res[0].Name;
                this.inputType.secondInputType = null;

                this.fromNr = res[0].Name.includes('Id')
                    ? this.options.data.entity.ID
                    : this.options.data.entity[this.options.data.typeName + 'Number'];

                this.toNr = this.fromNr;

                this.inputFromLabel = res.length > 1
                    ? `Fra ${this.options.data.name.toLowerCase()} ${name}`
                    : `${this.options.data.name} ${name}`;

                this.inputToLabel = `Til ${this.options.data.name.toLowerCase()} ${name}`;

                this.selectedForm.parameters = [{
                    Name: res[0].Name,
                    value: this.fromNr
                }];
                if (res[1]) {
                    this.inputType.secondName = res[1].Name;
                    this.inputType.secondInputType = res[1].Type;
                    this.selectedForm.parameters = [{
                        Name: res[1].Name,
                        value: this.fromNr
                    }, {
                        Name: this.inputType.secondName,
                        value: this.toNr
                    }];
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public acceptAndSendEmail() {
        this.browserStorageService.setItem('lastChosenForm' + this.options.data.type, JSON.stringify(this.selectedForm));

        this.onClose.emit({
            action: 'email',
            form: this.selectedForm,
            entity: this.options.data.entity,
            entityTypeName: this.options.data.typeName,
            name: this.options.data.name
        });
    }

    public acceptAndPrintOut() {
        this.browserStorageService.setItem('lastChosenForm' + this.options.data.type, JSON.stringify(this.selectedForm));
        this.onClose.emit({
            action: 'print',
            form: this.selectedForm,
        });
    }

    public preview() {
        return this.modalService.open(UniPreviewModal, {
            data: this.selectedForm
        });
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

}
