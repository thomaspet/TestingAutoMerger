import {Component, ViewChild, ComponentRef, OnInit} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {WageTypeService} from '../../../services/services';
import {UniComponentLoader} from '../../../../framework/core';
import {UniForm} from '../../../../framework/forms/uniForm';
import {UniFormBuilder, UniFormLayoutBuilder} from '../../../../framework/forms';
import {WageType} from '../../../unientities';

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [WageTypeService],
    directives: [UniComponentLoader, UniForm]
})
export class WagetypeDetail implements OnInit {
    private wageType: WageType;
    private layout: any;
    private form: UniFormBuilder = new UniFormBuilder();
    private whenFormInstance: Promise<UniForm>;
    private formInstance: UniForm;
    private lastSavedInfo: string;

    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;

    constructor(private routeparams: RouteParams, private router: Router, private wageService: WageTypeService) { }

    public ngOnInit() {
        let ID: number = +this.routeparams.get('id');
        
        this.wageService.getLayout('mock').subscribe((response: any) => {
            this.layout = response;
            this.wageService.getWageType(ID).subscribe((wagetypeResponse: WageType) => {
                this.wageType = wagetypeResponse;
                
                if (this.wageType.ID === 0) {
                    this.wageType.WageTypeId = null;
                    this.wageType.AccountNumber = null;
                }
                this.form = new UniFormLayoutBuilder().build(this.layout, this.wageType);
                if (this.wageType.ID === 0) {
                    this.form.find('WageTypeId').readonly = false;
                }
                this.loadForm();
            });
        });
    }
    
    private loadForm() {
        this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = this.form;
            this.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
            setTimeout(() => {
                this.formInstance = cmp.instance;
                this.formInstance.hideSubmitButton();
            });
        });
    }
    
    public saveWagetype(event: any) {
        this.formInstance.sync();
        this.lastSavedInfo = 'Lagrer lønnsart';
        if (this.wageType.ID > 0) {
            console.log('wagetype to update', this.wageType);
            this.wageService.Put(this.wageType.ID, this.wageType)
            .subscribe((wagetype) => {
                this.wageType = wagetype;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            },
            (err) => {
                console.log('Feil ved oppdatering av lønnsart', err);
            });
        } else {
            console.log('wagetype to save', this.wageType);
            this.wageService.Post(this.wageType)
            .subscribe((wagetype) => {
                this.wageType = wagetype;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            },
            (err) => {
                console.log('Feil ved lagring av lønnsart', err);
            });
        }
    }
    
    public previousWagetype() {
        this.wageService.getPrevious(this.wageType.ID)
        .subscribe((response) => {
            if (response) {
                this.wageType = response;
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            }
        });
    }
    
    public nextWagetype() {
        this.wageService.getNext(this.wageType.ID)
        .subscribe((response) => {
            if (response) {
                this.wageType = response;
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            }
        });
    }
}
