import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@app/authService';
import { environment } from 'src/environments/environment';
import { PushMessage } from '@app/models';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {

    userToken: string;
    userGlobalIdentity: string;
    currentCompanyKey: string;
    notifications: string[] = [];
    pushMessage$: BehaviorSubject<PushMessage> = new BehaviorSubject(null);

    retryConnectionCounter = 0;

    public hubConnection: signalR.HubConnection;

    constructor(private authService: AuthService) {
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.userToken = auth.token;
                this.userGlobalIdentity = auth.user.GlobalIdentity;
                this.currentCompanyKey = auth.activeCompany.Key;
                if (this.hubConnection) {
                    this.hubConnection.stop();
                }
                this.startConnection();

            } else if (this.hubConnection) {
                this.hubConnection.stop();
                delete this.hubConnection;
            }
        });
    }

    addGlobalListener() {
        this.hubConnection.on('Notify', (message: PushMessage) => {
            if (message) {
                if (Array.isArray(message)) {
                    message = message[message.length - 1];
                }
                this.pushMessage$.next(message);
            }
        });
    }

    /*   addBroadcastDataListener = () => {
        this.hubConnection.on('SendMessage', () => {

        });
    }

    broadcastData() {
        this.hubConnection.invoke('SendMessage')
        .catch(err => console.error(err));
    } */

    startConnection() {
        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(
            environment.SIGNALR_PUSHHUB_URL,
            { accessTokenFactory: () => this.userToken }
            )
            .build();
            this.start();
        }

    async start() {
        await this.hubConnection.start()
            .then(() => {
                console.log('SignalR connection started');
                this.addGlobalListener();
            })
            .catch(err => {
                console.log('Error while starting SignalR connection: ' + this.userToken);
                if (this.retryConnectionCounter < 5) {
                    console.log('DEBUG:: attempting to reconnect, attempt nr: ' + this.retryConnectionCounter);
                    setTimeout(() => this.start(), 5000);
                    this.retryConnectionCounter++;
                } else {
                    console.log('Tried to reconnect too many times');
                    delete this.hubConnection;
                }
        });
    }
}
