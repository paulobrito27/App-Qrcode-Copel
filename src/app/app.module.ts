import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ConfPage } from '../pages/conf/conf';
import { SeparaPage } from '../pages/separa/separa';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { EmailComposer } from '@ionic-native/email-composer';
import { NativeStorage } from '@ionic-native/native-storage';
import { RecebePage } from '../pages/recebe/recebe';
import { BancoDadosProvider } from '../providers/banco-dados/banco-dados';
import { InventarioPage } from '../pages/inventario/inventario';


@NgModule({
  declarations: [
    MyApp,
    ConfPage,
    SeparaPage,
    RecebePage,
    InventarioPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ConfPage,
    SeparaPage,
    RecebePage,
    InventarioPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    BarcodeScanner,
    File,
    FileChooser,
    EmailComposer,
    NativeStorage,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BancoDadosProvider
  ]
})
export class AppModule {}
