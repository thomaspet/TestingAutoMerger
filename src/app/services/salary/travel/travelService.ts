import { Injectable } from '@angular/core';
import {BizHttp, UniHttp, RequestMethod, IHttpCacheStore} from '@uni-framework/core/http';
import {
    Travel, FieldType, state, costtype, Employee, TypeOfIntegration, File, SalaryTransaction, SupplierInvoice, Supplier
} from '@uni-entities';
import {Observable, of} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {EmployeeService} from '../employee/employeeService';
import {ApiKeyService} from '../../common/apikeyService';
import {FileService} from '../../common/fileService';
import {SupplierService} from '@app/services/accounting/supplierService';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable()
export class TravelService extends BizHttp<Travel> {

    private emps$: BehaviorSubject<Employee[]> = new BehaviorSubject(null);
    private suppliers$: BehaviorSubject<Supplier[]> = new BehaviorSubject(null);
    private fileStore: IHttpCacheStore<File[]> = {};

    constructor(
        protected http: UniHttp,
        private employeeService: EmployeeService,
        private apiKeyService: ApiKeyService,
        private fileService: FileService,
        private supplierService: SupplierService,
    ) {
        super(http);
        this.entityType = Travel.EntityType;
        this.relativeURL = Travel.RelativeUrl;
    }

    public clear() {
        this.emps$.next(null);
        this.suppliers$.next(null);
    }

    public ttImport(): Observable<Travel[]> {
        return this.apiKeyService.getApiKey(TypeOfIntegration.TravelAndExpenses).pipe(
            switchMap(apiKey => super.PostAction(null, 'traveltext', `apikeyID=${apiKey.ID}`)),
            catchError(err => {
                console.error(err);
                return of([]);
            })
        );
    }

    public save(travel: Travel): Observable<Travel> {
        return travel.ID ? super.Put(travel.ID, travel) : super.Post(travel);
    }

    public statusText(status: state) {
        switch (status) {
            case state.Received:
                return 'Mottatt';
            case state.PartlyProcessed:
                return 'Delvis godkjent';
            case state.Processed:
                return 'Godkjent';
            case state.Rejected:
                return 'Avvist';
            default:
                return '';
        }
    }

    public typeText(type: costtype) {
        switch (type) {
            case costtype.Expense:
                return 'Utlegg';
            case costtype.Travel:
                return 'Reise';
            default:
                return 'Reise';
        }
    }

    private getEmps(filter: (emp: Employee) => boolean): Observable<Employee[]> {
        return this.emps$
            .take(1)
            .switchMap(emps => emps
                ? Observable.of(emps)
                : this.employeeService
                    .GetAll('', ['BusinessRelationInfo'])
                    .do(e => this.emps$.next(e)))
            .map(emps => emps.filter(emp => filter(emp)));
    }

    private getSuppliers(filter: (sup: Supplier) => boolean): Observable<Supplier[]> {
        return this.suppliers$
            .take(1)
            .switchMap(suppliers => suppliers
                ? Observable.of(suppliers)
                : this.supplierService
                    .GetAll('', ['Info'])
                    .do(s => this.suppliers$.next(s)))
            .map(suppliers => suppliers.filter(supplier => filter(supplier)));
    }

    private getEmpOptions(travel$: BehaviorSubject<Travel>) {
        let currTravel: Travel = null;
        return {
            getDefaultData: () => {
                return travel$
                    .take(1)
                    .filter(travel => !currTravel || currTravel.ID !== travel.ID)
                    .do(travel => currTravel = travel)
                    .switchMap(travel => this.getEmps(x => x.EmployeeNumber === travel.EmployeeNumber));
            },
            valueProperty: 'EmployeeNumber',
            template: (emp: Employee) => emp ? `${emp.EmployeeNumber} - ${emp.BusinessRelationInfo.Name}` : '',
            search: (query: string) => this.getEmps(emp =>
                emp.EmployeeNumber.toString().startsWith(query)
                || emp.BusinessRelationInfo.Name.toLowerCase().includes(query))
        };
    }

    private getSupplierOptions(travel$: BehaviorSubject<Travel>) {
        let currTravel: Travel = null;
        return {
            getDefaultData: () => {
                return travel$
                    .take(1)
                    .filter(travel => !currTravel || currTravel.ID !== travel.ID)
                    .do(travel => currTravel = travel)
                    .switchMap(travel => this.getSuppliers(x => x.ID === travel.SupplierID));
            },
            valueProperty: 'ID',
            template: (supplier: Supplier) => supplier ? `${supplier.SupplierNumber} - ${supplier.Info.Name}` : '',
            search: (query: string) => this.getSuppliers(supplier =>
                supplier.ID.toString().startsWith(query)
                || supplier.Info.Name.toLowerCase().includes(query))
        };
    }

    public getFiles(travel: Travel): Observable<File[]> {
        return this.fileService
            .getFilesOn('Travel', travel.ID)
            .switchMap(files => {
                if (!!files && !!files.length) {
                    return Observable.of(files);
                }
                return this.importPdf(travel);
            });
    }

    public importPdf(travel: Travel): Observable<File[]> {
        if (this.fileStore[travel.ID]) {
            return this.getFilesFromCache(travel);
        }
        const request = this.apiKeyService
            .getApiKey(TypeOfIntegration.TravelAndExpenses)
            .switchMap(key => key
                ? super.PutAction(null, 'ttpdf', `apikeyID=${key.ID}&ID=${travel.ID}`)
                    .map((file: File) => file ? [file] : [])
                : Observable.of([]))
            .publishReplay(1)
            .refCount();
        this.fileStore[travel.ID] = {
            data: request,
            timeout: null,
        };
        return request;
    }

    private getFilesFromCache(travel: Travel): Observable<File[]> {
        return this.fileStore[travel.ID]
                .data
                .pipe(
                    map(files => {
                        const fileList = [];
                        files.forEach(f => {
                            if (!Array.isArray(f)) {
                                fileList.push(f);
                                return;
                            }
                            fileList.concat(f);
                        });
                        return fileList;
                    })
                );
    }

    public createTransactions(travels: Travel[], runID: number): Observable<SalaryTransaction[]> {
        if (!travels || !travels.length || !runID) {
            return Observable.of([]);
        }
        return super.ActionWithBody(null, travels.map(t => t.ID), 'tosalary', RequestMethod.Put, `runID=${runID}`);
    }

    public createSupplierInvoices(travels: Travel[]): Observable<SupplierInvoice[]> {
        if (!travels || !travels.length) {
            return Observable.of([]);
        }
        return super.ActionWithBody(null, travels.map(t => t.ID), 'toinvoice');
    }

    public layout(travel$: BehaviorSubject<Travel>): Observable<any> {
        return Observable.from([
            {
                Name: 'travels',
                BaseEntity: 'Travel',
                Fields: [
                    {
                        EntityType: 'Travel',
                        Property: 'TravelIdentificator',
                        FieldType: FieldType.TEXT,
                        Label: 'Reiseid',
                        ReadOnly: true,
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'Name',
                        FieldType: FieldType.TEXT,
                        Label: 'Person',
                        ReadOnly: true,
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'Email',
                        FieldType: FieldType.TEXT,
                        Label: 'E-post',
                        ReadOnly: true,
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'EmployeeNumber',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Ansatt',
                        Options: this.getEmpOptions(travel$),
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'SupplierID',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Leverandør',
                        Options: this.getSupplierOptions(travel$),
                        classes: 'quarter-width'
                    },
                    {
                        EntityType: 'Travel',
                        Property: '_statusText',
                        FieldType: FieldType.TEXT,
                        Label: 'Status',
                        ReadOnly: true,
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: '_sum',
                        FieldType: FieldType.NUMERIC,
                        Options: {
                            format: 'money'
                        },
                        Label: 'Totalsum',
                        ReadOnly: true,
                        classes: 'quarter-width',
                    },
                    {
                        EntityType: 'Travel',
                        Property: '_fromDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Fra dato',
                        ReadOnly: true,
                    },
                    {
                        EntityType: 'Travel',
                        Property: '_toDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Til dato',
                        ReadOnly: true,
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'Description',
                        FieldType: FieldType.TEXTAREA,
                        Label: 'Beskrivelse',
                        ReadOnly: true,
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'Purpose',
                        FieldType: FieldType.TEXTAREA,
                        Label: 'Formål',
                        ReadOnly: true,
                    },
                    {
                        EntityType: 'Travel',
                        Property: 'Comment',
                        FieldType: FieldType.TEXTAREA,
                        Label: 'Kommentar',
                        ReadOnly: true,
                    }
                ]
            }
        ]);
    }
}
