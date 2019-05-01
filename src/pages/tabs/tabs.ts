
import { Component } from '@angular/core';

import { ConfPage  } from '../conf/conf';
import { SeparaPage } from '../separa/separa';
import { RecebePage } from '../recebe/recebe';
import { InventarioPage } from '../inventario/inventario';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ConfPage;
  tab2Root= (SeparaPage);
  tab3Root = RecebePage;
  tab4Root = InventarioPage;
  
  

  constructor() {

  }
}
