import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { BancoDadosProvider } from '../../providers/banco-dados/banco-dados';





@IonicPage()
@Component({
  selector: 'page-conf',
  templateUrl: 'conf.html',
})
export class ConfPage {


  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfPage');
  }



  public usuario =  new Array;


  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private bancoDados: BancoDadosProvider) {


    //cria dados iniciais de usuario

    let dado = { usuario: "Usuario não cadastrado", registro: "REGISTRO", email: "EMAIL", novo: true };
    this.usuario.push(dado);

    //pega dados de usuario gravados no storage-----------------------------


    this.bancoDados.listaStorage.getItem('DADOS')
      .then(
        data => this.usuario = data,
        error => console.error(error)
      );

  }

  //--------------------------------------------------------------------
  //--------------------------------------------------------------------
  public configura() {

    let tam: number = this.usuario.length;
    this.usuario.splice(0, tam);

    let alert = this.alertCtrl.create(
      {
        title: "Configuração de usuário",
        message: "Cadastra nome, registro e email",
        inputs: [
          {
            name: 'usuario',
            placeholder: 'Usuário',
            type: "text",
          },
          {
            name: 'registro',
            placeholder: 'Registro',
            type: "text",
          },
          {
            name: 'email',
            placeholder: 'Email',
            type: "text",
          }
        ],
        buttons: [
          //---botao 1
          {
            text: "CANCELA",
            role: 'calcel',
            handler: () => {

            }
          },
          //---botao 2
          {
            text: "CONFIRMAR ",
            role: 'calcel',
            handler: data => {

              let usuario_data: any = data.usuario;
              let registro_data: any = data.registro;
              let email_data: any = data.email;
              let dado = { usuario: usuario_data, registro: registro_data, email: email_data, novo: false};
              this.usuario.push(dado);

              //-----gravando alteração no storage----------------------------------------------------------
              this.bancoDados.listaStorage.setItem('DADOS', this.usuario)
                .then(
                  () => console.log('Stored item!'),

                );


            }
          }
        ]
      });
    alert.present();


  }




}
