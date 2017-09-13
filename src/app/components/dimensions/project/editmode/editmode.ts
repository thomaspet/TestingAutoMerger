import {Component, ViewChild} from '@angular/core';
import {UniModalService, UniAddressModal} from '../../../../../framework/uniModal/barrel';
import {UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {IUniSearchConfig} from '../../../../../framework/ui/unisearch/index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ProjectResponsibility} from '../../../../models/models';
import {Observable} from 'rxjs/Observable';
import {
    Project,
    Customer,
    Address,
    ProjectResource,
    User
} from '../../../../unientities';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    ProjectService,
    ErrorService,
    UniSearchCustomerConfig,
    AddressService,
    UserService
} from '../../../../services/services';

declare var _;

@Component({
    selector: 'project-editmode',
    templateUrl: './editmode.html'
})

export class ProjectEditmode {
    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private project$: BehaviorSubject<Project> = new BehaviorSubject(null);
    private actionLabel: string = '';
    private uniSearchConfig: IUniSearchConfig;
    private addressChanged: any;
    private customerExpandOptions: Array<string> = ['Info.Name'];
    private STATUS = [
        { ID: 42201, Name: 'Registrert' },
        { ID: 42202, Name: 'Tilbudsfase' },
        { ID: 42203, Name: 'Pågår' },
        { ID: 42204, Name: 'Avsluttet' },
        { ID: 42205, Name: 'Slettet' },
    ];

    private tableConfig: UniTableConfig;
    private project: Project;
    private users: User[] = [];

    constructor(
        private projectService: ProjectService,
        private errorService: ErrorService,
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private addressService: AddressService,
        private userService: UserService,
        private modalService: UniModalService
    ) {
        this.setupTable();
    }

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

                this.project = this.project$.getValue();
            });
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();

        this.uniSearchConfig = this.uniSearchCustomerConfig
            .generate(this.customerExpandOptions);

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
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address(),
                    header: 'Arbeidssted'
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };
    }

    public onRowChanged(event) {
        let row = event.rowModel;

        // Map reponsibility
        if (row['_Responsibility']) {
            row['Responsibility'] = row['_Responsibility'].ID;
        }

        if (row['User']) {
            row['UserID'] = row['User'].ID;
        }

        // Make sure new rows have a createguid
        if (!row.ID && !row._createguid) {
            row.ProjectID = this.project.ID;
            row._createguid = this.projectService.getNewGuid();
        }

        // New project?
        if (!this.project.ProjectResources) {
            this.project.ProjectResources = [];
        }

        this.project.ProjectResources[row._originalIndex] = _.cloneDeep(row);
        this.projectService.currentProject.next(this.project);
        this.projectService.isDirty = true;
    }

    public onRowDeleted(event) {
        let row = event.rowModel;

        if (row.ID) {
            this.project.ProjectResources[row._originalIndex].Deleted = true;
        } else {
            this.project.ProjectResources.splice(row._originalIndex, 1);
        }

        this.projectService.currentProject.next(this.project);
        this.projectService.isDirty = true;
   }

    private setupTable() {
        this.userService.GetAll('').subscribe(users => {
            this.users = users;
            this.tableConfig = new UniTableConfig('sales.project.editmode.users', true, true, 5)
                .setDeleteButton(true)
                .setSearchable(false)
                .setAutoAddNewRow(true)
                .setDefaultRowData({Name: '', User: null, Responsibility: -1})
                .setColumns([
                    new UniTableColumn('Name', 'Ressurs', UniTableColumnType.Text),
                    new UniTableColumn('User', 'Bruker', UniTableColumnType.Lookup)
                        .setTemplate((row) => {
                            let user = row['User'] ? row['User'] : this.users.find(x => x.ID == row['UserID']);
                            return user ? user.DisplayName : '';
                        })
                        .setEditorOptions({
                            itemTemplate: (item) => item.DisplayName || item.Email,
                            lookupFunction: (searchValue) => {
                                return Observable.from([this.users.filter(x => x.DisplayName.startsWith(searchValue))]);
                            }
                        }),
                    new UniTableColumn('_Responsibility', 'Ansvar', UniTableColumnType.Lookup)
                        .setTemplate((row) => {
                            let responsibility = row['_Responsibility'] ? row['_Responsibility'] : ProjectResponsibility.find(x => x.ID == row['Responsibility']);
                            return responsibility ? responsibility.Title : '';
                        })
                        .setEditorOptions({
                            itemTemplate: (item) => item.Title,
                            lookupFunction: (searchValue) => {
                                return Observable.from([ProjectResponsibility.filter((x => x.Title.startsWith(searchValue)))]);
                            }
                        })
                ]);
        });
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
                FieldSetColumn: 1,
                ReadOnly: true
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
                Label: 'Pris',
                Property: 'Price',
                FieldSet: 6,
                FieldSetColumn: 1,
                Legend: 'Budsjett'
            },
            <any>{
                FieldType: FieldType.NUMERIC,
                Label: 'Kostpris',
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
            }
        ];
    }
}
