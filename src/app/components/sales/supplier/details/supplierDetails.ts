import {Component, ComponentRef, Input, Output, ViewChild, SimpleChange, EventEmitter} from "angular2/core";
import {Router, RouteParams, RouterLink} from "angular2/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {DepartementService, ProjectService, SupplierService} from "../../../../services/services";
import {ExternalSearch, SearchResultItem} from '../../../common/externalSearch/externalSearch';

import {FieldType, FieldLayout, ComponentLayout, Supplier, BusinessRelation} from "../../../../unientities";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFormLayoutBuilder} from "../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UniFieldBuilder} from "../../../../../framework/forms/builders/uniFieldBuilder";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

/*
import {AddressModal} from "../modals/address/address";
import {EmailModal} from "../modals/email/email";
import {PhoneModal} from "../modals/phone/phone";
*/
@Component({
    selector: "supplier-details",
    templateUrl: "app/components/sales/supplier/details/supplierDetails.html",    
    directives: [UniComponentLoader, RouterLink, ExternalSearch], //, AddressModal, EmailModal, PhoneModal],
    providers: [DepartementService, ProjectService, SupplierService]
})
export class SupplierDetails {
            
    @Input() SupplierNo: any;
                  
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;    

    FormConfig: UniFormBuilder;
    formInstance: UniForm;
    DropdownData: any;
    Supplier: Supplier;
    LastSavedInfo: string;
    searchText: string;
    
    whenFormInstance: Promise<UniForm>;

    constructor(private departementService: DepartementService,
                private projectService: ProjectService,
                private supplierService: SupplierService,
                private router: Router,
                private params: RouteParams
                ) {
                
        this.SupplierNo = params.get("id");        
    }
    
    /*
    nextSupplier() {
        this.supplierService.NextSupplier(this.Supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/customer/details/' + data.ID);
            });
    }
    
    previousSupplier() {
        this.supplierService.PreviousSupplier(this.Supplier.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/customer/details/' + data.ID);
            });        
    }*/
    
    createSupplier() {   
        var c = new Supplier();
        c.Info = new BusinessRelation(); 
        
        this.supplierService.Post(c)
            .subscribe(
                (data) => {
                    this.router.navigateByUrl('/supplier/details/' + data.ID);        
                },
                (err) => console.log('Error creating supplier: ', err)
            );      

        /* Using GetNewEntity not working        
        this.customerService.setRelativeUrl("customer"); // TODO: remove when its fixed
        this.customerService.GetNewEntity(["Info"]).subscribe((c)=> {
            this.customerService.Post(c)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/customer/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating customer: ', err)
                );        
        });
        */
    }
    
    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }
          
    ngOnInit() {
        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.supplierService.Get(this.SupplierNo, ["Info"])
        ).subscribe(response => {
            this.DropdownData = [response[0], response[1]];
            this.Supplier = response[2];
            
            //TODO: Copy based on customerdetails                          
            //this.createFormConfig();
            //this.extendFormConfig();
            //this.loadForm();                  
        });       
    }
    
    addSearchInfo(selectedSearchInfo: SearchResultItem) {
        //TODO 
    }
    
    saveSupplierManual(event: any) {        
        this.saveSupplier(false);
    }

    saveSupplier(autosave: boolean) {
        this.formInstance.updateModel();
                        
        if (!autosave) {            
            if (this.Supplier.StatusCode == null) {
                //set status if it is a draft
                this.Supplier.StatusCode = 1;
            }            
            this.LastSavedInfo = 'Lagrer informasjon...';                
        } else {
           this.LastSavedInfo = 'Autolagrer informasjon...';
        }                
                            
        this.supplierService.Put(this.Supplier.ID, this.Supplier)
            .subscribe(
                (updatedValue) => {                    
                    if (autosave) {
                        this.LastSavedInfo = "Sist autolagret: " + (new Date()).toLocaleTimeString();
                    } else {
                        //redirect back to list?
                        this.LastSavedInfo = "Sist lagret: " + (new Date()).toLocaleTimeString();                         
                    }                                       
                },
                (err) => console.log('Feil oppsto ved lagring', err)
            );
    }
}