import {Component, NgZone} from '@angular/core';
import {AmplifyService} from 'aws-amplify-angular';

import {filter, flatMap, map} from 'rxjs/operators';
import {from, Observable, Subscriber} from 'rxjs';
import {ICredentials} from 'aws-amplify/lib/Common/types/types';
import {AuthState} from 'aws-amplify-angular/dist/src/providers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  signedIn: boolean;
  user: string;
  urlEncoded: string;
  consoleEncoded: string;
  awsLoginUrl: string;

  onClickLogout() {
    this.amplifyService.auth().signOut();
    this.signedIn = false;
  }

  constructor(
    private amplifyService: AmplifyService,
    private zone: NgZone,
  ) {
    this.urlEncoded = encodeURIComponent(`https://${window.location.hostname}`);
    this.consoleEncoded = encodeURIComponent('https://console.aws.amazon.com/');

    this.amplifyService.authStateChange$
      .pipe<AuthState, AuthState>(
        filter((authState: AuthState) => authState.user),
        map((authState: AuthState) => {
          this.zone.run(() => {
            this.signedIn = authState.state === 'signedIn';
          });
          this.user = null;

          return authState;
        })
      )
      .pipe<ICredentials>(
        flatMap<AuthState, Observable<ICredentials>>((authState: AuthState): Observable<ICredentials> => {
          this.zone.run(() => {
            this.user = authState.user.username;
          });

          return from<Observable<ICredentials>>(this.amplifyService.auth().currentUserCredentials());
        })
      )
      .pipe<any>(
        flatMap((credentials: ICredentials) => {
          const sessionId = credentials.accessKeyId;
          const sessionKey = credentials.secretAccessKey;
          const sessionToken = credentials.sessionToken;

          const credentialsJson = {
            sessionId,
            sessionKey,
            sessionToken,
          };
          const credentialsEncoded = encodeURIComponent(JSON.stringify(credentialsJson));
          const uri = `https://signin.aws.amazon.com/federation?Action=getSigninToken&SessionType=json&Session=${credentialsEncoded}`;

          const myInit = {
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              uri,
            },
          };
          return from(this.amplifyService.api().post('GetSigninTokenApi', '/api', myInit));
        })
      )
      .pipe<void>(
        flatMap((response: any): Observable<void> => {
          const {SigninToken: signinToken} = response;

          this.zone.run(() => {
            this.awsLoginUrl = `https://signin.aws.amazon.com/federation?Action=login&Issuer=${this.urlEncoded}&` +
              `Destination=${this.consoleEncoded}&SigninToken=${signinToken}`;
          });

          return new Observable<void>((observer: Subscriber<void>) => {
            setTimeout(() => observer.next(), 60000);
          });
        })
      )
      .subscribe(():void => {
        document.location.href = this.awsLoginUrl;
      });
  }
}
