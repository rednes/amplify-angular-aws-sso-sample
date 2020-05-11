import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { AmplifyService } from 'aws-amplify-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AmplifyUIAngularModule,
    BrowserModule,
  ],
  providers: [AmplifyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
