import {Component, Input} from '@angular/core';
import {UniHttp} from '../core/http/http';
import {AuthService} from '../core/authService';

declare var __moduleName: string;

export enum UniImageSize {
    small = 150,
    medium = 700,
    large = 1200
}

@Component({
    selector: 'uni-image',
    moduleId: __moduleName,
    templateUrl: './uniImage.html'
})
export class UniImage {
    @Input() imageId: number;
    @Input() size: UniImageSize;

    private pageCount: number = 1;
    private currentPage: number = 1;

    private imgUrl: string = '';
    private imgUrl2x: string = '';

    constructor(private authService: AuthService, private http: UniHttp) {}

    public ngOnChanges() {
        if (this.imageId) {
            this.updateImage();
        }
    }

    public ngAfterViewInit() {
        this.authService.authenticationStatus$.subscribe((isAuthenticated) => {
            if (isAuthenticated) {
                this.updateImage();
            } else {
                this.imgUrl = '';
                this.imgUrl2x = '';
            }
        });
    }

    private buildImgUrl(token: string, companyKey: string, width: number): string {
        let url = `https://uniimages.azurewebsites.net/?id=${this.imageId}&page=${this.currentPage}&key=${companyKey}&token=${token}`;
        if (width) {
            url += '&width=' + width;
        }

        return encodeURI(url);
    }

    private updateImage() {
        const token = 'Bearer ' + this.authService.getToken();
        const companyKey = this.authService.getActiveCompany()['Key'];

        // Get data about the file (pageCount etc)
        this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('files/' + this.imageId)
            .send()
            .subscribe((response) => {
                this.pageCount = response['PageCount'] || 1;
            });
        
        // Generate image urls
        this.imgUrl = this.buildImgUrl(token, companyKey, (this.size || undefined));
        this.imgUrl2x = this.buildImgUrl(token, companyKey, (this.size ? (this.size * 2) : undefined));
    }

    private next() {
        this.currentPage++;
        this.updateImage();
    }

    private prev() {
        this.currentPage--;
        this.updateImage();
    }

    
}