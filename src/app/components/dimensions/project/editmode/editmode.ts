import {Component, ViewChild, SimpleChange} from '@angular/core';
import {UniModalService} from '@uni-framework/uni-modal';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {IUniSearchConfig} from '@uni-framework/ui/unisearch';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ProjectResponsibility} from '@app/models';
import {Project, Address, User, Country} from '@app/unientities';
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
    UserService,
    CountryService,
    PostalCodeService,
} from '@app/services/services';
import {takeUntil} from 'rxjs/operators';

declare var _;

@Component({
    selector: 'project-editmode',
    templateUrl: './editmode.html'
})

export class ProjectEditmode {
    @ViewChild(AgGridWrapper, { static: false }) public table: AgGridWrapper;

    config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: true });
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    project$: BehaviorSubject<Project> = new BehaviorSubject(null);
    onDestroy$ = new Subject();

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
        private userService: UserService,
        private countryService: CountryService,
        private postalCodeService: PostalCodeService,
    ) {
        this.setupTable();
    }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());
        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(currentProject => {
            const project = currentProject || <any> {};
            if (!project.ProjectResources) {
                project.ProjectResources = [];
            }

            project.WorkPlaceAddress = project.WorkPlaceAddress || new Address();
            project.WorkPlaceAddress.ID = project.WorkPlaceAddressID || 0;

            this.project$.next(project);
            this.project = project;
            this.extendFormConfig();
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.config$.complete();
        this.fields$.complete();
        this.project$.complete();
    }

    onFormChange(changes: SimpleChange) {
        if (changes['WorkPlaceAddress.PostalCode'] && changes['WorkPlaceAddress.PostalCode'].currentValue) {
            const project = this.project$.getValue();
            this.postalCodeService.GetAll(`filter=Code eq ${project.WorkPlaceAddress.PostalCode}&top=1`)
                .subscribe(
                    res => {
                        project.WorkPlaceAddress.City = (res.length) ? res[0].City : '';
                        this.project$.next(project);
                    },
                    err => this.errorService.handle(err)
                );
        }
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
             <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 1',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
                Legend: 'Lokasjon'
            },
            <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.AddressLine2',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 2',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
            },
            <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.AddressLine3',
                FieldType: FieldType.TEXT,
                Label: 'Adresselinje 3',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
            },
            <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.PostalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr.',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
            },
            <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.City',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
            },
            <any> {
                EntityType: 'Address',
                Property: 'WorkPlaceAddress.Country',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Land',
                Section: 0,
                FieldSet: 4,
                FieldSetColumn: 1,
                Options: {
                    search: (query) => {
                        const filter = query && query.length
                            ? `filter=startswith(Name,'${query}')&top=20`
                            : 'top=20';

                        return this.countryService.GetAll(filter);
                    },
                    events: {
                        select: (model: Address, selectedItem: Country) => {
                            model.Country = selectedItem.Name;
                            model.CountryCode = selectedItem.CountryCode;
                        }
                    },

                    valueProperty: 'Name',
                    displayProperty: 'Name',
                }
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
                Property: 'StartDate',
                FieldSet: 5,
                FieldSetColumn: 1

            },
            <any>{
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Sluttdato',
                Property: 'EndDate',
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
