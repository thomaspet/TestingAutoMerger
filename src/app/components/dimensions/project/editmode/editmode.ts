import {Component, ViewChild} from '@angular/core';
import {UniModalService, UniAddressModal} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {IUniSearchConfig} from '@uni-framework/ui/unisearch';
import {Observable, BehaviorSubject} from 'rxjs';
import {ProjectResponsibility} from '../../../../models/models';
import {Project, Address, User} from '@app/unientities';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '@uni-framework/ui/unitable';
import {
    ProjectService,
    ErrorService,
    UniSearchCustomerConfig,
    AddressService,
    UserService
} from '@app/services/services';

declare var _;

@Component({
    selector: 'project-editmode',
    templateUrl: './editmode.html'
})

export class ProjectEditmode {
    @ViewChild(AgGridWrapper) public table: AgGridWrapper;

    public config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public project$: BehaviorSubject<Project> = new BehaviorSubject(null);
    public actionLabel: string = '';
    public uniSearchConfig: IUniSearchConfig;
    public addressChanged: any;
    private customerExpandOptions: Array<string> = ['Info.Name'];
    private STATUS: any = [
        { ID: 42201, Name: 'Registrert' },
        { ID: 42202, Name: 'Tilbudsfase' },
        { ID: 42203, Name: 'Pågår' },
        { ID: 42204, Name: 'Avsluttet' },
        { ID: 42205, Name: 'Slettet' },
    ];

    public tableConfig: UniTableConfig;
    public project: Project;
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
        this.projectService.currentProject.subscribe(currentProject => {
            const project = currentProject || <any> {};
            if (!project.ProjectResources) {
                project.ProjectResources = [];
            }

            this.actionLabel = project && project.ID
                ? 'Rediger prosjekt - '
                + project.Name + ':' : 'Nytt prosjekt:';

            this.project$.next(project);
            this.project = project;
            this.extendFormConfig();
        });
    }

    public onTableChange() {
        this.projectService.isDirty = true;
        this.projectService.currentProject.next(this.project);
    }

    private extendFormConfig() {
        const fields = this.fields$.getValue();

        this.uniSearchConfig = this.uniSearchCustomerConfig
            .generate(this.customerExpandOptions);

        const status: UniFieldLayout = fields[2];
        status.Options = {
            source: this.STATUS,
            valueProperty: 'ID',
            displayProperty: 'Name',
            template: (obj: any) => obj ? obj.Name : '',
            debounceTime: 200
        };

        const customer: UniFieldLayout = fields[5];
        customer.Options = {
            uniSearchConfig: this.uniSearchConfig,
            valueProperty: 'ID'
        };

        const invoiceaddress: UniFieldLayout = fields[6];

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

    public onMoveOutOfForm(event) {
        if (event && event.movingForward && this.table) {
            this.table.focusRow(0);
        }
    }

    private setupTable() {
        this.userService.GetAll('').subscribe(users => {
            this.users = users;
            this.tableConfig = new UniTableConfig('sales.project.editmode.users', true, true, 5)
                .setDeleteButton(true)
                .setSearchable(false)
                .setAutoAddNewRow(true)
                .setDefaultRowData({Name: '', User: null, Responsibility: -1})
                .setChangeCallback(change => {
                    const row = change.rowModel;

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

                    return row;
                })
                .setColumns([
                    new UniTableColumn('Name', 'Ressurs', UniTableColumnType.Text),
                    new UniTableColumn('User', 'Bruker', UniTableColumnType.Lookup)
                        .setTemplate((row) => {
                            const user = row['User'] ? row['User'] : this.users.find(x => x.ID === row['UserID']);
                            return user ? user.DisplayName : '';
                        })
                        .setOptions({
                            itemTemplate: (item) => item.DisplayName || item.Email,
                            lookupFunction: (searchValue) => {
                                return Observable.from(
                                    [this.users.filter(x => x.DisplayName.startsWith(searchValue))]
                                );
                            }
                        }),
                    new UniTableColumn('_Responsibility', 'Ansvar', UniTableColumnType.Lookup)
                        .setTemplate((row) => {
                            const responsibility = row['_Responsibility']
                                ? row['_Responsibility']
                                : ProjectResponsibility.find(x => x.ID === row['Responsibility']);
                            return responsibility ? responsibility.Title : '';
                        })
                        .setOptions({
                            itemTemplate: (item) => item.Title,
                            lookupFunction: (searchValue) => {
                                return Observable.from(
                                    [ProjectResponsibility.filter((x => x.Title.startsWith(searchValue)))]
                                );
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
