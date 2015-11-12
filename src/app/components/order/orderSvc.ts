import {Http} from 'angular2/http';
import {Inject} from 'angular2/angular2';

export class OrderSvc {

    constructor(@Inject(Http)public http:Http) {

    }
    getOrder(id:string|number) {
        return this.http.get('http://devapi.unieconomy.no/api/biz/orders/'+id,{
            headers: <any>{
                "Client":"client1"
            }
        }).map((res:any) => res.json())
    }
}
