import {Component} from 'angular2/core';
import {TabService} from '../navbar/tabstrip/tabService';
import {UniHttpService, UniHttpRequest} from '../../../framework/data/uniHttpService';

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
  directives: [],
  providers: [UniHttpService]
})
export class Dashboard {

    requests: UniHttpRequest;
    requests1: UniHttpRequest;
    requests2: UniHttpRequest;
    requestPut: UniHttpRequest;
    requestPost: UniHttpRequest;
    requestDelete: UniHttpRequest;

    constructor(private tabService: TabService, private uhs: UniHttpService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});

        this.requests = { resource: '/biz/companysettings/1', expand: 'Address,Emails,Phones' };
        this.requests1 = { resource: '/biz/companysettings/1', expand: 'Address,Emails,Phones' };
        this.requests2 = { resource: '/biz/companysettings/2', expand: 'Address,Emails,Phones' };

        this.testGet();
    }

    //Demo of how to use GET in UniHttpService
    testGet() {
        this.uhs.get(this.requests)
            .subscribe(
            (data) => { console.log(data); this.testGetMultiple(); this.testPut(data); },
            error => console.log(error)) 
    }

    //Demo of how to use several get in parallell in UniHttpService with Observable.forkJoin
    testGetMultiple() {
        this.uhs.getMultiple([this.requests1, this.requests2])
            .subscribe(
            (data) => { console.log(data);},
            error => console.log(error)) 
    }

    //Demo of how to use PUT in UniHttpService
    testPut(data) {

        //Dummy change to get different data
        data.CompanyName = 'Umbrella Corp';

        //Set up UniHttpRequest
        this.requestPut = { resource: '/biz/companysettings/', id: 1, body: data}

        //Call PUT in UniHttpService and subscribe to the response
        this.uhs.put(this.requestPut)
            .subscribe(
            (data) => { console.log(data); this.testPost(data); },
            error => console.log(error))
    }

    //Demo of how to use POST in UniHttpService
    testPost(data) {
    
        //Dummy data setup
        data.CompanyName = 'Umbrella Corp';
        data.CompanyRegistered = true;
        data.OrganizationNumber = '954622171';
        data.TaxMandatory = true;
        data.ID = 2;

        //Removes subarrays
        delete data['Emails'];
        delete data['Address'];
        delete data['Phones'];

        //Set up UniHttpRequest
        this.requestPost = { resource: '/biz/companysettings/', body: data }

        //Call POST in UniHttpService and subscribe to the response
        //this.uhs.post(this.requestPost)
        //    .subscribe(data => console.log(data));
    }

    testDelete() {
        //TODO
    }


  
}
