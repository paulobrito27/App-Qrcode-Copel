import { Component } from '@angular/core';
import { NavController, ToastController, ActionSheetController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FileChooser } from '@ionic-native/file-chooser';
import { EmailComposer } from '@ionic-native/email-composer';
import { NativeStorage } from '@ionic-native/native-storage';
import { IonicPage } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { BancoDadosProvider } from '../../providers/banco-dados/banco-dados';



@IonicPage()
@Component({
  selector: 'page-inventario',
  templateUrl: 'inventario.html',
})
export class InventarioPage {


  ionViewDidLoad() {
    console.log('ionViewDidLoad InventarioPage');
  }



  public deposito: string;
  public lista2 = new Array;
  public lista3 = new Array;
  public liberadoLeitura: Boolean = true;
  public texto: string;
  public materialSeries = new Array;
  public materialgediss = new Array;
  public series = new Array;
  public gediss = new Array;
  public mensagem = new Array;
  public usuario = new Array;
  public recontagem: boolean = false;


  constructor(
    public navCtrl: NavController,
    private barcodeScanner: BarcodeScanner,
    private toastCtrl: ToastController,
    public file: File,
    private fileChooser: FileChooser,
    private actionSheet: ActionSheetController,
    private emailComposer: EmailComposer,
    private alertCtrl: AlertController,
    private listaStorage: NativeStorage,
    private bancoDados: BancoDadosProvider

  ) {
    //RECEBE DADOS DO USUARIO DO PROVIDER
    this.bancoDados.listaStorage.getItem('DADOS')
      .then(
        data => this.usuario = data,
        error => console.error(error)
      );


  }


  public opcoes2() {
    let materialDivergente = new Array;
    let divergencia: string;
    let action = this.actionSheet.create(
      {
        title: 'OPÇÕES',
        buttons: [
          {
            text: 'CARREGA ARQUIVO ROMANEIO',
            icon: 'ios-download-outline',
            role: 'destructive',
            handler: () => {



              if (this.liberadoLeitura) {
                //escolhe arquivo e fornece endereço formato uri
                this.fileChooser.open().then(uri => {
                  //resolveLocalFilesystemUrl
                  //transforma do formato uri para url
                  this.file.resolveLocalFilesystemUrl(uri).then(url => {

                    //pega somente ao nome do arquivo
                    this.file.readAsText(this.file.externalRootDirectory, 'Download/' + url.name).then(value => {
                      this.texto = value;

                      //Acha o depósito
                      let de = this.texto;
                      let dep = de.split('sito');
                      let dep2 = dep[1].split('---------------');
                      let dep3 = dep2[0];
                      this.deposito = dep3;




                      ////Acha as linhas dos materiais
                      let novo: string = this.texto.replace(/\s/g, "#");
                      this.texto = novo;
                      let linha = this.texto.split('----##|');
                      let linha2 = linha[2];
                      let linha3 = linha2.split('|------');
                      let linha4 = linha3[0].split('|##|');


                      // neste ponto temos todos os materiais gravados na variavel ped3. Vamos continuar o tratamento.


                      linha4.forEach(element => {
                        let corrige = element.replace(/#/g, " ");
                        let corrigeLinha = corrige.split('|');
                        let corrigePonto = corrigeLinha[10].replace(".", "");
                        let corrige2: string[] = corrigePonto.split(",");

                        let linhaCorrigida: string;

                        if (corrige2.length == 1) {
                          linhaCorrigida = corrigePonto ;
                        } else {
                          let numero: any = (corrige2[0] + "." + corrige2[1])
                          linhaCorrigida = numero;
                        }

                        this.lista2.push({ codigo: corrigeLinha[0], nome: corrigeLinha[7], quantidade: linhaCorrigida, prateleira: corrigeLinha[9], qtd_contada: 0, lidoManual: false })
                      });

                      this.recontagem = false; //zera a recontagem para default.

                      //-----------------------------GRAVANDO LISTA NO STORAGE-----------------------------------------------------------------
                      this.listaStorage.setItem('LISTA3', this.lista2)
                        .then(
                          () => console.log('Stored item!'),
                          error => alert('Lista não gravada na memória interna -> ' + error)
                        );


                      this.listaStorage.setItem('DEPOSITO', this.deposito)
                        .then(
                          () => console.log('Stored item!'),
                          error => alert('Lista não gravada na memória interna -> ' + error)
                        );



                      this.liberadoLeitura = false;
                    }).catch(err => {
                      this.toastCtrl.create({
                        message: "NÃO FOI POSSIVEL LER O ARQUIVO!!!!",
                        duration: 2000,
                        position: 'top'
                      }).present()
                    });

                  });
                })

              }
            }
          },

          {
            text: 'ZERAR LISTA',
            icon: 'trash',
            role: 'destructive',
            handler: () => {
              //-----inicio do alert---
              let alert = this.alertCtrl.create(
                {
                  title: 'CONFIRMAÇÃO DE ZERAR LISTA',
                  message: 'Você tem certeza de que deseja zerar a listagem? Todos os materiais e a contagem serão perdidos permanentemente.',
                  buttons: [
                    //---botao 1
                    {
                      text: "CANCELAR",
                      role: 'calcel',
                      handler: () => {

                      }
                    },
                    //---botao 2
                    {
                      text: "CONFIRMAR",
                      role: 'calcel',
                      handler: () => {
                        let tamanho: number = this.lista2.length;
                        this.lista2.splice(0, tamanho);

                        this.liberadoLeitura = true;

                        let tam: number = this.materialSeries.length;
                        this.materialSeries.splice(0, tam);

                        let tama: number = this.materialgediss.length;
                        this.materialgediss.splice(0, tama);

                        this.recontagem = false; //zera a recontagem para default.

                        this.deposito = "";

                        //zera os Storages--------------------------------------------------------------
                        this.listaStorage.clear();

                      }
                    }

                  ]

                });
              alert.present();

            }
          },

          {
            text: 'ENVIAR CONTAGEM',
            icon: 'ios-send-outline',
            role: 'destructive',
            handler: () => {

              let contagemTerminada: boolean = true;


              this.lista2.forEach(element => {

                if (element.quantidade != element.qtd_contada) {
                  contagemTerminada = false;
                  materialDivergente.push(element);
                }
              });

              //trabalhando com a lista para enviar mensagem de todos materiais que tiveram divergencias
              materialDivergente.forEach(element => {

                this.mensagem.push('\n\n' + element.codigo + ' ; ');

              });
              //transforma um array em uma única string para ser enviado pelo email
              divergencia = this.mensagem.join(' ');
              //zera mensagem
              let tam: number = this.mensagem.length;
              this.mensagem.splice(0, tam);


              if (contagemTerminada) {

                //trabalhando com a promisse do materialSeries
                let temMatSerie: number = this.materialSeries.length;
                let mensagemNovaSeries: string;
                let temMatGedis: number = this.materialgediss.length;
                let mensagemNovaGedis: string;
                let mensagemMateriaisTotaisSeparados: string;
                let materiaisLidosManualmente: string;


                if (temMatSerie > 0) {
                  this.materialSeries.forEach(element => {
                    this.mensagem.push('\n------------SERIES-----------------\nCódigo: ' + element.codigo + ' .\n');
                    let mensagemSerie = element.series.split(',');
                    mensagemSerie.forEach(element2 => {
                      ;
                      this.mensagem.push(element2 + '\n');
                    });
                  });
                  //transforma um array em uma única string para ser enviado pelo email
                  mensagemNovaSeries = this.mensagem.join(' ');
                  //zera mensagem
                  let tam: number = this.mensagem.length;
                  this.mensagem.splice(0, tam);
                }


                //trabalhando com a promisse do materialGedis

                if (temMatGedis > 0) {

                  this.materialgediss.forEach(element => {
                    this.mensagem.push('\n------------GEDIS-----------------\nMATERIAL código: ' + element.codigo + ' .\n\n');
                    let mensGedis = element.gedis.split(',');
                    mensGedis.forEach((element2: string) => {
                      this.mensagem.push(element2 + '\n');
                    });
                  });
                  //transforma um array em uma única string para ser enviado pelo email
                  mensagemNovaGedis = this.mensagem.join(' ');
                  //zera mensagem
                  let tam: number = this.mensagem.length;
                  this.mensagem.splice(0, tam);
                }

                //trabalhando com a lista para enviar mensagem de todos materiais que foram separados e suas quantidades
                this.lista2.forEach(element => {
                  this.mensagem.push('\n\n' + element.codigo + ' ' + element.nome + '\n contados -> ' + element.qtd_contada);
                });
                //transforma um array em uma única string para ser enviado pelo email
                mensagemMateriaisTotaisSeparados = this.mensagem.join(' ');
                //zera mensagem
                let tam: number = this.mensagem.length;
                this.mensagem.splice(0, tam);


                //trabalhando com a lista para enviar mensagem de todos materiais que foram lidos manualmente
                this.lista2.forEach(element => {
                  if (element.lidoManual == true) {
                    this.mensagem.push('\n\n' + element.codigo + '  ' + element.nome + ' foi lido de maneira manual');
                  }
                });
                //transforma um array em uma única string para ser enviado pelo email
                materiaisLidosManualmente = this.mensagem.join(' ');
                //zera mensagem
                tam = this.mensagem.length;
                this.mensagem.splice(0, tam);


                //tratando gedis e series vazios
                if (mensagemNovaSeries == undefined) {
                  mensagemNovaSeries = '\nNão existem materiais que tenham n° de série'
                }
                if (mensagemNovaGedis == undefined) {
                  mensagemNovaGedis = '\nNão existem materiais que tenham n° de gedis'
                }
                if (materiaisLidosManualmente == undefined) {
                  materiaisLidosManualmente = "\n\nTodos os materiais foram lidos pelo QR-CODE."
                }


                //função de envio de email.....................................
                let email = {
                  to: this.usuario[0].email,
                  cc: '',
                  bcc: [],
                  attachments: [],
                  subject: 'Depósito ' + this.deposito + "  conferido com sucesso por " + "Colaborador: " + this.usuario[0].usuario + "\n" + "Registro: " + this.usuario[0].registro,
                  body: "Todos os materiais foram conferifos na sua totalidade com sucesso!!!!\n" +
                    "\n\n____________________________________________________________________________________________" +
                    "\n\n\n\nRelação de materiais contados:\n"
                    + mensagemMateriaisTotaisSeparados +
                    "\n\n---------------------------------------------------------------" +
                    "\n\n---------------------------------------------------------------" +
                    +"\n\n\nLista de Gedis/Series dos materiais contados: \n\n\n\n"
                    + mensagemNovaSeries + mensagemNovaGedis +
                    "\n\n\n\nMateriais lidos de forma manual:\n" + materiaisLidosManualmente,
                  isHtml: false,
                  app: 'Gmail'
                };
                this.emailComposer.open(email);
                //fim função email....................................................

                this.recontagem = false; //zera a recontagem para default.


              } else {

                ///INICIO ENVIO COM ERRO-----------------------------------------------------------
                //----------------------------- ENVIA EMAIL SEM TERMINO--------------------------------------------
                let alert1 = this.alertCtrl.create(
                  {
                    title: 'EXISTEM DIVERGÊNCIAS NO INVENTÁRIO, A PRIMEIRA RECONTAGEM É OBRIGATÓRIA!!',
                    message: 'MATERIAIS DIVERGENTES: ' + divergencia,
                    buttons: [
                      //---botao 1
                      {
                        text: "RECONTAR",
                        role: 'calcel',
                        handler: () => {


                          materialDivergente.forEach(codigoDivergente => {

                            //zerando a quantidade contada
                            this.lista2.forEach(element => {
                              if (element.codigo == codigoDivergente.codigo) {
                                element.qtd_contada = 0;
                                element.lidoManual = false;
                              }
                            });


                            //zerandoseries e gedis
                            let contador: number = 0;
                            this.materialSeries.forEach(elementS => {

                              if (elementS.codigo == codigoDivergente.codigo) {
                                this.materialSeries.splice(contador, 1);
                              }
                              contador = contador + 1;
                            });

                            let contador2: number = 0;
                            this.materialgediss.forEach(elementG => {
                              ;
                              if (elementG.codigo == codigoDivergente.codigo) {
                                this.materialgediss.splice(contador2, 1);
                              }
                              contador2 = contador2 + 1;;
                            });

                          });

                          //zerando series e gedis já contados no volatil
                          let tam: number = this.series.length;
                          this.series.splice(0, tam);
                          tam = this.gediss.length;
                          this.gediss.splice(0, tam);



                          // grava lista storage
                          this.listaStorage.setItem('LISTA3', this.lista2)
                            .then(
                              () => console.log('Stored item!'),
                            );

                          this.recontagem = true; //libera envio email co divergencias.

                        }
                      },
                      //---botao 2
                      {
                        text: "CONFIRMAR",
                        role: 'calcel',
                        handler: () => {


                          if (this.recontagem) {

                            //trabalhando com a promisse do materialSeries
                            let temMatSerie: number = this.materialSeries.length;
                            let mensagemNovaSeries: string;
                            let temMatGedis: number = this.materialgediss.length;
                            let mensagemNovaGedis: string;
                            let mensagemMateriaisTotaisSeparados: string;
                            let mensagemMateriaisComDivergencia: string;
                            let materiaisLidosManualmente: string;


                            if (temMatSerie > 0) {
                              this.materialSeries.forEach(element => {
                                this.mensagem.push('\n------------SERIES-----------------\n' + 'Código: ' + element.codigo + ' .\n');
                                let mensagemSerie = element.series.split(',');
                                mensagemSerie.forEach(element2 => {
                                  ;
                                  this.mensagem.push(element2 + '\n');
                                });
                              });
                              //transforma um array em uma única string para ser enviado pelo email
                              mensagemNovaSeries = this.mensagem.join(' ');
                              //zera mensagem
                              let tam: number = this.mensagem.length;
                              this.mensagem.splice(0, tam);
                            }


                            //trabalhando com a promisse do materialGedis

                            if (temMatGedis > 0) {

                              this.materialgediss.forEach(element => {
                                this.mensagem.push('\n------------GEDIS-----------------\nMATERIAL código: ' + element.codigo + ' .\n\n');
                                let mensGedis = element.gedis.split(',');
                                mensGedis.forEach((element2: string) => {
                                  this.mensagem.push(element2 + '\n');
                                });
                              });
                              //transforma um array em uma única string para ser enviado pelo email
                              mensagemNovaGedis = this.mensagem.join(' ');
                              //zera mensagem
                              let tam: number = this.mensagem.length;
                              this.mensagem.splice(0, tam);
                            }

                            //trabalhando com a lista para enviar mensagem de todos materiais que foram separados e suas quantidades
                            this.lista2.forEach(element => {
                              this.mensagem.push('\n\n' + element.codigo + ' ' + element.nome + '\n contados -> ' + element.qtd_contada);
                            });
                            //transforma um array em uma única string para ser enviado pelo email
                            mensagemMateriaisTotaisSeparados = this.mensagem.join(' ');
                            //zera mensagem
                            let tam: number = this.mensagem.length;
                            this.mensagem.splice(0, tam);


                            //trabalhando com a lista para enviar mensagem de todos materiais que tiveram divergencias
                            materialDivergente.forEach(element => {

                              this.mensagem.push('\n\n' + element.codigo + ' ' + element.nome + '\n contados -> ' + element.qtd_contada + '\n qtd documento -> ' + element.quantidade);

                            });
                            //transforma um array em uma única string para ser enviado pelo email
                            mensagemMateriaisComDivergencia = this.mensagem.join(' ');
                            //zera mensagem
                            tam = this.mensagem.length;
                            this.mensagem.splice(0, tam);


                            //trabalhando com a lista para enviar mensagem de todos materiais que foram lidos manualmente
                            this.lista2.forEach(element => {
                              if (element.lidoManual == true) {
                                this.mensagem.push('\n\n' + element.codigo + '  ' + element.nome + ' foi lido de maneira manual');
                              }
                            });
                            //transforma um array em uma única string para ser enviado pelo email
                            materiaisLidosManualmente = this.mensagem.join(' ');
                            //zera mensagem
                            tam = this.mensagem.length;
                            this.mensagem.splice(0, tam);


                            //tratando gedis e series vazios
                            if (mensagemNovaSeries == undefined) {
                              mensagemNovaSeries = '\nNão existem materiais que tenham n° de série'
                            }
                            if (mensagemNovaGedis == undefined) {
                              mensagemNovaGedis = '\nNão existem materiais que tenham n° de gedis'
                            }
                            if (materiaisLidosManualmente == undefined) {
                              materiaisLidosManualmente = "\n\nTodos os materiais foram lidos pelo QR-CODE."
                            }



                            //função de envio de email.....................................
                            let email = {
                              to: this.usuario[0].email,
                              cc: '',
                              bcc: [],
                              attachments: [],
                              subject: 'Depósito' + this.deposito + " contado com divergências. " + "Colaborador: " + this.usuario[0].usuario + "\n" + " Registro: " + this.usuario[0].registro,
                              body: "Lista de materiais separados:\n" + mensagemMateriaisTotaisSeparados +
                                "\n\n\n____________________________________________________________________________________________" +
                                "\n\nMATERIAIS COM DIVERGÊNCIA NA CONFERÊNCIA: \n\n" +
                                mensagemMateriaisComDivergencia +
                                "\n\n____________________________________________________________________________________________" +
                                "\n\n\nLista de Gedis/Series dos materiais separados: \n" +
                                mensagemNovaSeries + mensagemNovaGedis +
                                "\n\n\n\nMateriais lidos de forma manual:\n" + materiaisLidosManualmente,
                              isHtml: false,
                              app: 'Gmail'
                            };
                            this.emailComposer.open(email);
                            //fim função email....................................................

                            this.recontagem = false; //zera a recontagem para default.

                          } else {
                            this.recontagem = false; //zera a recontagem para default.
                            alert("A Primeira recontagem é obrigatória");
                          }






                          //-------------------------------------------------------------------------------------------

                        }
                      }

                    ]

                  });
                alert1.present();
                //---------------------------FIM ENVIA EMAIL SEM TERMINO-----------------------------------------





                ///-----------------------------------------------------------------------------------
              }


            }

          },

          {
            text: 'RECARREGA',
            icon: 'ios-refresh-outline',
            role: 'destructive',
            handler: () => {

              //-----------------------------------RECARREGA ÚLTIMA ATUALIZAÇÃO DA LISTA NO STORAGE---------------------------------------------------------
              this.listaStorage.getItem('LISTA3')
                .then(
                  data => this.lista2 = data,
                  error => console.error(error)
                );

              this.listaStorage.getItem('SERIE')
                .then(
                  data => this.materialSeries = data,
                  error => console.error(error)
                );

              this.listaStorage.getItem('GEDIS')
                .then(
                  data => this.materialgediss = data,
                  error => console.error(error)
                );

              this.listaStorage.getItem('DEPOSITO')
                .then(
                  data => this.deposito = data,
                  error => console.error(error)
                );



              //-----------------------------------------------FIM RECARREGA STORAGE-------------------------------------------------------
            }
          },


          {
            text: 'CANCELAR',
            role: 'cancel',
          },

        ]

      }

    );

    action.present();
  }


  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------


  public apaga(item) {
    let itemClicado = item;
    let codigoClicado = itemClicado.codigo;

    let alert = this.alertCtrl.create(
      {
        title: codigoClicado,
        message: "Deseja zerar contagem deste item?",
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
            handler: () => {


              //zerando a quantidade contada
              this.lista2.forEach(element => {
                if (element.codigo == codigoClicado) {
                  element.qtd_contada = 0;
                  element.lidoManual = false;
                }
              });

              //zerandoseries e gedis
              //zerandoseries e gedis
              let contador: number = 0;
              this.materialSeries.forEach(elementS => {

                if (elementS.codigo == codigoClicado) {
                  this.materialSeries.splice(contador, 1);
                }
                contador = contador + 1;
              });

              let contador2: number = 0;
              this.materialgediss.forEach(elementG => {

                if (elementG.codigo == codigoClicado) {
                  this.materialgediss.splice(contador2, 1);
                }
                contador2 = contador2 + 1;
              });



              //zerando series e gedis já contados no volatil
              let tam: number = this.series.length;
              this.series.splice(0, tam);
              tam = this.gediss.length;
              this.gediss.splice(0, tam);



              // grava lista storage
              this.listaStorage.setItem('LISTA3', this.lista2)
                .then(
                  () => console.log('Stored item!'),
                );
            }
          }
        ]
      });
    alert.present();

  }





  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------




 

  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  //-------------------------------------------------FUNÇÃO PARA LER OS QR-CODES--------------------------------
  //------------------------------------------------------------------------------------------------------------

  public lerQr2(item) {

    let itemClicado = item;
    let codigoClicado = itemClicado.codigo;


    let codigoQrcode: string;
    let qtdQrcode: number;
    let gedisQrcode: string;
    let serieQrcode: string;


    let temCodigo: boolean = false;
    let temSerie: boolean = false;
    let temGedis: boolean = false;
    let temQuantidade: boolean = false;

    let repete: boolean = true;

    //começo do scaner
    this.barcodeScanner.scan().then(barcodeData => {
      let lido: string = barcodeData.text;


      //pega apenas codigo
      let verificaCodigo: number = lido.indexOf('codigo:');
      if (verificaCodigo != -1) {
        let cod1: string[] = lido.split('odigo:"');
        let cod2: string = cod1[1];
        let cod3: string[] = cod2.split('",');
        let cod4: string = cod3[0];
        let cod: string = cod4.replace(/\s/g, "");
        codigoQrcode = cod; //Variavel que vai carregar o código lido no QrCode
        temCodigo = true;
      } else {
        temCodigo = false;
        alert('NÃO FOI POSSIVEL LER O CÓDIGO DO MATERIAL NESSE FORMATO DE QR CODE');
      }

      // pega apenas quantidade
      let verificaQuantidade: number = lido.indexOf('quantidade:');
      if (verificaQuantidade != -1) {
        let qtd1: string[] = lido.split('uantidade:"');
        let qtd2: string = qtd1[1];
        let qtd3: string[] = qtd2.split('"');
        let qtd4: string = qtd3[0];
        let qtdQr: string = qtd4.replace(/\s/g, "");
        qtdQrcode = parseFloat(qtdQr); //Variavel que vai carregar a quantidade lida no QrCode
        temQuantidade = true;
      } else {
        temQuantidade = false;
      }

      // pega apenas o n° de serie
      let verificaSerie: number = lido.indexOf('serie:');
      if (verificaSerie != -1) {
        let ser1: string[] = lido.split('erie:"');
        let ser2: string = ser1[1];
        let ser3: string[] = ser2.split('"');
        let ser4: string = ser3[0];
        let serieQr: string = ser4.replace(/\s/g, "");
        serieQrcode = serieQr; //Variavel que vai carregar o numero de serie lido no QrCode
        temSerie = true;
      } else {
        temSerie = false;
      }


      // pega apenas o n° do gedis
      let verificaGedis: number = lido.indexOf('gedis:');
      if (verificaGedis != -1) {
        let ged1: string[] = lido.split('edis:"');
        let ged2: string = ged1[1];
        let ged3: string[] = ged2.split('"');
        let ged4: string = ged3[0];
        let gedisQr: string = ged4.replace(/\s/g, "");
        gedisQrcode = gedisQr; //Variavel que vai carregar o numero do Gedis lido no QrCode
        temGedis = true;
      } else {
        temGedis = false;
      }


      ///---------------------------------------------------------------------------------------------------
      //verifica se o material lido é o que foi clicado na lista de materiais e se a quantidade ja foi pega



      if (temCodigo) {

        if (temQuantidade) {

          if (temSerie) {

            if (temGedis) {

              ///inicio do tem gedis--------------------------------------------------------------------------------------------------

              if (codigoClicado.replace(/\s/g, "") == codigoQrcode) {

                let gedisNovo: boolean = true;

                this.gediss.forEach(element => {
                  //verifica se existe um numero de gedis igual ja lido
                  if (element == gedisQrcode) {
                    gedisNovo = false;
                  }
                });

                if (gedisNovo) {
                  this.lista2.forEach(element => {

                    if (element.codigo.replace(/\s/g, "") == codigoQrcode) {

                      let valorNovo: number = element.qtd_contada + qtdQrcode;
                      element.qtd_contada = valorNovo;

                      this.gediss.push(gedisQrcode);

                      repete = false;
                      let alert = this.alertCtrl.create(
                        {
                          title: element.nome,
                          message: 'Foram contados ' + valorNovo + ' unidades',
                          buttons: [
                            //---botao 1
                            {
                              text: "GRAVAR E FINALIZAR",
                              role: 'calcel',
                              handler: () => {
                                ///grava todas os Gedis do mesmo material em materialGedis e  zera gediss
                                let codigo: string = element.codigo;
                                let gedisSTRING: string = this.gediss.join(',');
                                this.materialgediss.push({ 'codigo': codigo, 'gedis': gedisSTRING });
                                let tamanho: number = this.gediss.length;
                                this.gediss.splice(0, tamanho);

                                //impede que leia outro material com mesmo código
                                repete = false;


                                //-----gravando alteração no storage----------------------------------------------------------

                                this.listaStorage.setItem('LISTA3', this.lista2)
                                  .then(
                                    () => console.log('Stored item!'),

                                  );
                                //---------------------------------------------------------------------------------------------
                                //-----------------------------GRAVANDO MaterialGedis NO STORAGE--------------------------------
                                this.listaStorage.setItem('GEDIS', this.materialgediss)
                                  .then(
                                    () => console.log('Stored item!'),

                                  );
                                //fim teste storage----------------------------------------------------------------
                              }
                            },
                            //---botao 2
                            {
                              text: "CONTINUAR CONTAGEM",
                              role: 'calcel',
                              handler: () => {
                                repete = true;
                                if (repete) {
                                  this.lerQr2(item);
                                }
                              }
                            }

                          ]

                        });
                      alert.present();

                    }
                  });

                } else {
                  alert('NUMERO DO GEDIS JÁ FOI LIDO, MATERIAL NÃO CONTABILIZADO');
                  repete = false;
                }

                if (repete) {
                  this.lerQr2(item);
                }

              } else {
                alert('CODIGO LIDO NÃO CONFERE');
                repete = false;
              }


              ///fim do com gedis-------------------------------------------------------------------------------------------------

            } else {


              ///inicio do tem serie--------------------------------------------------------------------------------------------------

              if (codigoClicado.replace(/\s/g, "") == codigoQrcode) {

                let serieNovo: boolean = true;

                this.series.forEach(element => {
                  //verifica se existe um numero de gedis igual ja lido
                  if (element == serieQrcode) {
                    serieNovo = false;
                  }
                });

                if (serieNovo) {
                  this.lista2.forEach(element => {

                    if (element.codigo.replace(/\s/g, "") == codigoQrcode) {

                      let valorNovo: number = element.qtd_contada + qtdQrcode;
                      element.qtd_contada = valorNovo;

                      this.series.push(serieQrcode);

                      repete = false;
                      let alert = this.alertCtrl.create(
                        {
                          title: element.nome,
                          message: 'Foram contados ' + valorNovo + ' unidades',
                          buttons: [
                            //---botao 1
                            {
                              text: "GRAVAR E FINALIZAR",
                              role: 'calcel',
                              handler: () => {
                                ///grava todas os Gedis do mesmo material em materialGedis e  zera gediss
                                let codigo: string = element.codigo;
                                let serieSTRING: string = this.series.join(',');
                                this.materialSeries.push({ 'codigo': codigo, 'series': serieSTRING });
                                let tamanho: number = this.series.length;
                                this.series.splice(0, tamanho);

                                //impede que leia outro material com mesmo código
                                repete = false;


                                //-----gravando alteração no storage----------------------------------------------------------

                                this.listaStorage.setItem('LISTA3', this.lista2)
                                  .then(
                                    () => console.log('Stored item!'),

                                  );
                                //---------------------------------------------------------------------------------------------
                                //-----------------------------GRAVANDO MaterialGedis NO STORAGE--------------------------------
                                this.listaStorage.setItem('SERIE', this.materialSeries)
                                  .then(
                                    () => console.log('Stored item!'),

                                  );
                                //fim teste storage----------------------------------------------------------------
                              }
                            },
                            //---botao 2
                            {
                              text: "CONTINUAR CONTAGEM",
                              role: 'calcel',
                              handler: () => {
                                repete = true;
                                if (repete) {
                                  this.lerQr2(item);
                                }
                              }
                            }

                          ]

                        });
                      alert.present();

                    }
                  });

                } else {
                  alert('NUMERO DE SÉRIE JÁ FOI LIDO, MATERIAL NÃO CONTABILIZADO');
                  repete = false;
                }

                if (repete) {
                  this.lerQr2(item);
                }

              } else {
                alert('CODIGO LIDO NÃO CONFERE');
                repete = false;
              }


              ///fim do com serie-----------------------------------------------------------------
            }

          } else {
            ///tem apenas quantidade----------------------------------------------------------------

            if (codigoClicado.replace(/\s/g, "") == codigoQrcode) {


              this.lista2.forEach(element => {

                if (element.codigo.replace(/\s/g, "") == codigoQrcode) {

                  let valorNovo: number = element.qtd_contada + qtdQrcode;
                  element.qtd_contada = valorNovo;

                  repete = false;
                  let alert = this.alertCtrl.create(
                    {
                      title: element.nome,
                      message: 'Foram contados ' + valorNovo + ' unidades',
                      buttons: [
                        //---botao 1
                        {
                          text: "GRAVAR E FINALIZAR",
                          role: 'calcel',
                          handler: () => {
                            repete = false;
                            //-----gravando alteração no storage----------------------------------------------------------

                            this.listaStorage.setItem('LISTA3', this.lista2)
                              .then(
                                () => console.log('Stored item!'),

                              );
                            //---------------------------------------------------------------------------------------------
                            //fim teste storage----------------------------------------------------------------
                          }
                        },
                        //---botao 2
                        {
                          text: "CONTINUAR CONTAGEM",
                          role: 'calcel',
                          handler: () => {
                            repete = true;
                            if (repete) {
                              this.lerQr2(item);
                            }
                          }
                        }

                      ]

                    });
                  alert.present();

                }
              });

            }

            if (repete) {
              this.lerQr2(item);
            }


          }
        }









      }///fim função ler qrcode

    });
  }
}///fim página


