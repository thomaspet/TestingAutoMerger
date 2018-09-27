import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

const VIDEO_MAPPING_FILE = 'assets/educational-video-mapping.json';

type HashMap = { [key:string]:string; };

@Injectable()
export class VideoMappingService {
    private videoCache: HashMap;

    constructor(private http: Http) {
    }

    public getVideo(currentUrl: string): Promise<string|null> {
        const currentPath = this.getPathFromUrl(currentUrl);
        return this.getVideos().then(urls => urls[currentPath] || null);
    }

    private getVideos(): Promise<HashMap> {
        if (!this.videoCache) {
            return this.http.get(VIDEO_MAPPING_FILE)
                .toPromise()
                .then(response => response.json())
                .then(urls => this.videoCache = urls);
        } else {
            return Promise.resolve(this.videoCache);
        }
    }

    // input ex: https://dev.unieconomy.no/#/accounting/transquery?Account_AccountNumber=2710
    // output ex: /accounting/transquery/
    private getPathFromUrl(url: string): string {
        const match = url.match(/#([^?;&]+)/);
        if (match && match[1]) {
            return match[1].replace(/\d+/, '0');
        }
    }
}
