import {BizHttp} from '../../framework/core/http/BizHttp';
import {StaticRegister} from '../unientities';
import {UniHttp} from '../../framework/core/http/http';

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
                if(localstorageStamp < entity.Stamp) {
                    //load staticregister
                    this.getStaticRegisterDataset(entity);
                }
            });
        });
         
    }
    
    public getStaticRegisterDataset(entity) {
        //hvis oppføringen i databasen kunne brukt routenavn som registrynavn kunne me 
        //spart oss for denne switchen og ting hadde blitt meir dynamisk når vi skal legge på
        //fleire småregister ein gang i frmatida - dersom denne sekvensen lever når den tid kjem.
        var endPointName = "";
        switch (entity.Registry) {
            case "styrk":
                endPointName = "styrk";
                break;
            case "post":
                endPointName = "???";
                break;
            case "country":
                endPointName = "countries";
                break;
            default:
                break;
        }
        
        if(endPointName !== "") {
            this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(endPointName)
            .send()
            .subscribe((response) => {
                //skal localStorage holde på registerne ?
                localStorage.setItem(entity.Registry + "Data", response);
                //set localstorageKey to entity stamp
                localStorage.setItem(entity.Registry + "Stamp", entity.Stamp);
            });
        }
    }
}