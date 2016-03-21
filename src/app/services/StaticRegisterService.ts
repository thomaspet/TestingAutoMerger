import {BizHttp} from '../../framework/core/http/BizHttp';
import {StaticRegister} from '../unientities';
import {UniHttp} from '../../framework/core/http/http';
import {Injectable, Inject} from "angular2/core";

@Injectable()
export class StaticRegisterService extends BizHttp<StaticRegister> {
    
    constructor(http:UniHttp) {
        super(http);
    }
    
    public checkForStaticRegisterUpdate() {
        console.log("Logget inn, klar for sjekk av staticRegs");
        this.http.asGET()
        .usingBusinessDomain()
        .withEndPoint("staticregister")
        .send()
        .subscribe((response) => {
            console.log("staticregisters", response);
            response.forEach(entity => {
                console.log("statreg entity",entity);
                var localstorageStamp = localStorage.getItem(entity.Registry + "Stamp");
                console.log("localstoragestamp", localstorageStamp);
                console.log("entity", entity);
                entity.stamp = this.getTodayAsDate();
                console.log("entity med ny dato", entity);
                //if((localstorageStamp === undefined) || (localstorageStamp < entity.Stamp)) {
                //if(!localstorageStamp) {
                    console.log("ready for post to localstorage");
                    this.postStaticRegisterDataset(entity);
                //}
                console.log("STYRK dataset", localStorage.getItem("styrkData"));
            });
        });
         
    }
    
    private getTodayAsDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        
        if (dd < 10) {
            dd = '0' + dd;
        }
        
        if(mm < 10) {
            mm = '0' + mm;
        }
        
        //today = dd + "." + mm + "." + yyyy;
        
        return today;
    }
    
    public postStaticRegisterDataset(entity) {
        this.http.asGET()
        .usingBusinessDomain()
        .withEndPoint(entity.Registry)
        .send()
        .subscribe((response) => {
            console.log("response fra get",response);
            console.log("set localstorage");
            console.log("entity.Stamp", entity.stamp);
            localStorage.setItem(entity.Registry + "Data", response);
            localStorage.setItem(entity.Registry + "Stamp", entity.stamp);
            console.log("item set", localStorage.getItem(entity.Registry + "Data"));
        }); 
    }
    
    public getStaticRegisterDataset(registry:string) {
        console.log("dataset for " + registry, localStorage.getItem(registry + "Data"));
        return localStorage.getItem(registry + "Data");
    }
    
}