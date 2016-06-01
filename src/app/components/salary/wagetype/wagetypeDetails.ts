import {Component, ViewChild} from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import {WageTypeService} from '../../../services/services';
import {UniComponentLoader} from '../../../../framework/core';
import {UniForm} from '../../../../framework/uniForm';
import {WageType} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypedetails.html',
    providers: [WageTypeService],
    directives: [UniComponentLoader, UniForm, UniSave]
})
export class WagetypeDetail {
    private wageType: WageType;
    private wagetypeID: number;
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre lønnsart',
            action: this.saveWagetype.bind(this),
            main: true,
            disabled: true
        }
    ];
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    
    constructor(private routeparams: RouteParams, private router: Router, private wageService: WageTypeService) {
        this.config = {
            submitText: 'Lagre lønnsart'
        };
        this.wagetypeID = +this.routeparams.get('id');
        this.getLayoutAndData();
    }
    
    private getLayoutAndData() {
        Observable.forkJoin(
            this.wageService.getWageType(this.wagetypeID),
            this.wageService.layout('WagetypeDetails')
        ).subscribe(
            (response: any) => {
                let [wagetype, layout] = response;
                
                this.wageType = wagetype;
                if (this.wageType.ID === 0) {
                    this.wageType.WageTypeId = null;
                    this.wageType.AccountNumber = null;
                }
                
                this.fields = layout.Fields;
            }
        );
    }
    public ready(value) {
        console.log('form ready', value);
    }
    
    public change(value) {
        console.log('uniform changed', value);
        this.saveactions[0].disabled = false;
    }
    
    public saveWagetype(done) {
        done('Lagrer lønnsart');
        if (this.wageType.ID > 0) {
            this.wageService.Put(this.wageType.ID, this.wageType)
            .subscribe((wagetype) => {
                this.wageType = wagetype;
                done('Sist lagret: ');
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            },
            (err) => {
                console.log('Feil ved oppdatering av lønnsart', err);
            });
        } else {
            this.wageService.Post(this.wageType)
            .subscribe((wagetype) => {
                this.wageType = wagetype;
                done('Sist lagret: ');
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
