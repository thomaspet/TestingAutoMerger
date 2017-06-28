import { Component, ViewChild } from '@angular/core';
import {
    ProjectService,
    ErrorService,
    UniSearchConfigGeneratorService,
    AddressService
} from '../../../../services/services';
import { Project, Customer, Address } from '../../../../unientities';
import { AddressModal } from '../../../common/modals/modals';
import { UniFieldLayout } from '../../../../../framework/ui/uniform/index';
import { FieldType } from '../../../../../framework/ui/uniform/index';
import { IUniSearchConfig } from '../../../../../framework/ui/unisearch/index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
    selector: 'project-editmode',
    templateUrl: './editmode.html'
})

export class ProjectEditmode {

    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private project$: BehaviorSubject<Project> = new BehaviorSubject(null);
    private actionLabel: string = '';
    private STATUS = [{ ID: 42201, Name: 'Registrert' }, { ID: 2, Name: 'Aktivt' }, { ID: 3, Name: 'Avsluttet'}];
    private uniSearchConfig: IUniSearchConfig;
    private addressChanged: any;

    @ViewChild(AddressModal) public addressModal: AddressModal;

    private customerExpandOptions: Array<string> = ['Info.Name'];

    constructor(
        private projectService: ProjectService,
        private errorService: ErrorService,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService,
        private addressService: AddressService) { }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());
        this.projectService.currentProject.subscribe(
            (project) => {
                if (project) {
                    this.project$.next(project);
                } else {
                    this.project$.next(new Project);
                    this.projectService.currentProject.next(this.project$.getValue());
                }
                this.actionLabel = project && project.ID ? 'Rediger prosjekt - '
                    + project.Name + ':' : 'Nytt prosjekt:';
                this.extendFormConfig();
            });
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();

        this.uniSearchConfig = this.uniSearchConfigGeneratorService
            .generate(Customer, <[string]>this.customerExpandOptions);

        let status: UniFieldLayout = fields[2];
        status.Options = {
            source: this.STATUS,
            valueProperty: 'ID',
            displayProperty: 'Name',
            template: (obj: any) => obj ? obj.Name : '',
            debounceTime: 200
        };

        let customer: UniFieldLayout = fields[5];
        customer.Options = {
            uniSearchConfig: this.uniSearchConfig,
            valueProperty: 'ID'
        };

        let invoiceaddress: UniFieldLayout = fields[6];

        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'WorkPlaceAddressID',
            storeIdInProperty: 'WorkPlaceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektnummer',
                Property: 'ProjectNumber',
                Placeholder: 'Autogenerert hvis blank',
                Section: 0,
                FieldSet: 1,
                FieldSetColumn: 1,  
                Legend: 'Prosjektdetaljer'

            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name',
                Section: 0,
                FieldSet: 1,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.DROPDOWN,
                Label: 'Status',
                Property: 'StatusCode',
                Section: 0,
                FieldSet: 1,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Prosjektleder',
                Property: 'ProjectLeadName',
                Section: 0,
                FieldSet: 1,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Section: 0,
                FieldSet: 2,
                FieldSetColumn: 1,
                Legend: 'Prosjektbeskrivelse'
            },
            <any>{
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Kunde',
                Property: 'ProjectCustomerID',
                Section: 0,
                FieldSet: 3,
                FieldSetColumn: 1,
                Legend: 'Kunde'
            },
            <any>{
                FieldType: FieldType.MULTIVALUE,
                Label: 'Arbeidssted',
                Property: 'WorkPlaceAddressID',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
                Legend: 'Lokasjon'
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forventet startdato',
                Property: 'PlannedStartdate',
                FieldSet: 5,
                FieldSetColumn: 1,
                Legend: 'Prosjektdatoer'
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Forventet sluttdato',
                Property: 'PlannedEnddate',
                FieldSet: 5,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Startdato',
                Property: 'Startdate',
                FieldSet: 5,
                FieldSetColumn: 1

            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Sluttdato',
                Property: 'Enddate',
                FieldSet: 5,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Opprettet',
                Property: 'CreatedAt',
                ReadOnly: true,
                FieldSet: 5,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Price',
                Property: 'Price',
                FieldSet: 6,
                FieldSetColumn: 1,
                Legend: 'Budsjett'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'CostPrice',
                Property: 'CostPrice',
                FieldSet: 6,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Total',
                Property: 'Total',
                FieldSet: 6,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Navn',
                Property: '',
                FieldSet: 7,
                FieldSetColumn: 1,
                Legend: 'Ressurser'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Ansvar',
                Property: '',
                FieldSet: 7,
                FieldSetColumn: 1
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Type',
                Property: '',
                FieldSet: 7,
                FieldSetColumn: 1
            },
            
        ];
    }
}