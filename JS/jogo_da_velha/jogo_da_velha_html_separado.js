class ComponenteJogoDaVelha extends React.Component{
  constructor(props){
    super(props);
    
    const elemento = document.getElementById("div_jogo_da_velha");
    
    this.state = {
      elemento_modelo: elemento.cloneNode(true),
      historico_de_turnos: [
        {
          numero: 1,
          jogada_anterior: null //Objeto que pode ter local e marca.
        }
      ],
      numero_do_turno_atual: 1,
      vencedor: null, //Nome do jogador que venceu.
      fim_de_jogo: false
    }
    
    elemento.remove();
  }
  
  render(){
    return this.html_para_react(this.state.elemento_modelo);
  }
  
  html_para_react(elemento){
    let nome_da_tag = elemento.tagName;
    
    let array_atributos = elemento.attributes;
    let array_melhorado = Array();
    if(typeof array_atributos !== "undefined"){
      for(let i = 0; i < array_atributos.length; i++){
        let atributo = array_atributos[i];
        array_melhorado[atributo.nodeName] = atributo.nodeValue;
      }
    }
    array_atributos = array_melhorado;
    
    let conteudo_dinamico = "";
    if(typeof array_atributos["id"] !== "undefined"){
      switch(array_atributos["id"]){
        case "span_turno_do_jogo_da_velha":
          conteudo_dinamico = this.mensagem_sobre_o_turno();
        break;
        case "span_instrucao_do_jogo_da_velha":
          conteudo_dinamico = this.mensagem_sobre_a_vez();
        break;
        case "div_painel_do_jogo_da_velha":
          conteudo_dinamico = this.mostrar_celulas_do_painel();
        break;
        case "div_opcoes_de_historico":
          array_atributos["class"] = this.mostrar_div_opcoes_de_historico();
        break;
        case "div_lista_de_opcoes_de_historico":
          conteudo_dinamico = this.mostrar_lista_de_opcoes_de_historico();
        break;
      }
    }
    
    let elemento_react;
    if(conteudo_dinamico !== ""){
      elemento_react = React.createElement(nome_da_tag, array_atributos, conteudo_dinamico);
    }else{
      let conteudos = Array();
      let tags_filhas = elemento.children;
      for(let i = 0; i < tags_filhas.length; i++){
        let tag = tags_filhas[i];
        conteudos.push(this.html_para_react(tag));
      }
      /* No HTML faça o texto ser sempre "filho único" de alguma tag, exemplo: <span>Texto</span> */
      if(conteudos.length === 0){
        conteudos = elemento.innerText;
      }
      
      elemento_react = React.createElement(nome_da_tag, array_atributos, conteudos);
    }
    
    return elemento_react;
  }
  
  mensagem_sobre_o_turno(){
    let mensagem = "Turno " + this.state.numero_do_turno_atual + ".";

    if(this.state.fim_de_jogo){
      if(this.state.vencedor !== null){
        mensagem = "O vencedor foi o jogador " + this.state.vencedor + ".";
      }else{
        mensagem = "Empate.";
      }
    }
    
    return mensagem;
  }
  
  mensagem_sobre_a_vez(){
    let mensagem = "";
    
    if(!this.state.fim_de_jogo){
      if(this.state.numero_do_turno_atual % 2 !== 0){
        mensagem = "Vez do jogador 1.";
      }else{
        mensagem = "Vez do jogador 2.";
      }
    }
    
    return mensagem;
  }
  
  mostrar_celulas_do_painel(){
    let celulas_do_painel = Array(9);
    
    for(let i = 1; i <= 9; i++){
      var elemento_react = React.createElement(
        "div", 
        {
          className: "celula_do_jogo_da_velha",
          onClick: () => this.realizar_jogada(i)
        }, 
        null
      );
      celulas_do_painel[i - 1] = elemento_react;
    }
    
    const turnos = this.state.historico_de_turnos.slice();
    
    //Começa do turno 2 (posição 1 do array), pois o turno 1 não tem jogada anterior.
    for(let i = 1; i < turnos.length; i++){
      const turno = turnos[i];
      
      if(i + 1 > this.state.numero_do_turno_atual){
        break;
      }
      
      switch(turno.jogada_anterior.marca){
        case "cruz":
          var elemento_react = React.createElement(
            "div", 
            {
              className: "celula_do_jogo_da_velha"
            }, 
            React.createElement(
              "div", 
              {
                className: "cruz_do_jogo_da_velha"
              }, 
              "X"
            )
          );
        break;
        case "círculo":
          var elemento_react = React.createElement(
            "div", 
            {
              className: "celula_do_jogo_da_velha"
            }, 
            React.createElement(
              "div", 
              {
                className: "circulo_do_jogo_da_velha"
              }, 
              "O"
            )
          );
        break;
      }
      
      celulas_do_painel[turno.jogada_anterior.local - 1] = elemento_react;
    }
    
    return celulas_do_painel;
  }
  
  realizar_jogada(local_da_jogada){
    /* Primeiro, por segurança, verifico no histórico se já não havia marca neste local. */
    let tentativa_de_trapaca = false;
    let jogadas_com_cruz_das_celulas = Array(0);
    let jogadas_com_circulos_das_celulas = Array(0);
    
    const turnos = this.state.historico_de_turnos.slice();
    
    //Começa do turno 2 (posição 1 do array), pois o turno 1 não tem jogada anterior.
    for(let i = 1; i < turnos.length; i++){
      const turno = turnos[i];
      
      if(i + 1 > this.state.numero_do_turno_atual){
        break;
      }
      
      if(turno.jogada_anterior.local !== local_da_jogada){
        switch(turno.jogada_anterior.marca){
          case "cruz":
            jogadas_com_cruz_das_celulas.push(turno.jogada_anterior.local);
            break;
          case "círculo":
            jogadas_com_circulos_das_celulas.push(turno.jogada_anterior.local);
            break;
        }
        continue;
      }
      
      if(turno.jogada_anterior.marca !== null){
        tentativa_de_trapaca = true;
      }
    }
    
    if(tentativa_de_trapaca || this.state.fim_de_jogo){
      return;
    }
    
    /* Segundo, utilizarei as informações da jogada para definir como começará o próximo turno. */
    let jogada_atual = {};
    jogada_atual["local"] = local_da_jogada;
    jogada_atual["marca"] = this.state.numero_do_turno_atual % 2 !== 0 ? "cruz" : "círculo";
    let proximo_turno = {};
    proximo_turno["numero"] = this.state.numero_do_turno_atual + 1;
    proximo_turno["jogada_anterior"] = jogada_atual;
    
    /* Terceiro, o estado inicial do próximo turno é salvo no histórico. */
    this.state.historico_de_turnos[proximo_turno.numero - 1] = proximo_turno;
    
    /* Quarto, verifico se houve um vencedor e em caso positivo atualizo o state. */
    let celulas_para_verificar = Array(0);
    if(jogada_atual.marca === "cruz"){
      celulas_para_verificar = jogadas_com_cruz_das_celulas.slice();
    }else if(jogada_atual.marca === "círculo"){
      celulas_para_verificar = jogadas_com_circulos_das_celulas.slice();
    }
    
    celulas_para_verificar.push(jogada_atual.local);
    
    let venceu_pela_linha = false;
    switch(jogada_atual.local){
      //Linha 1:
      case 1:
      case 2:
      case 3:
        venceu_pela_linha = 
        celulas_para_verificar.indexOf(1) >= 0 &&
        celulas_para_verificar.indexOf(2) >= 0 &&
        celulas_para_verificar.indexOf(3) >= 0;
      break;
      
      //Linha 2:
      case 4:
      case 5:
      case 6:
        venceu_pela_linha = 
        celulas_para_verificar.indexOf(4) >= 0 &&
        celulas_para_verificar.indexOf(5) >= 0 &&
        celulas_para_verificar.indexOf(6) >= 0;
      break;
      
      //Linha 3:
      case 7:
      case 8:
      case 9:
        venceu_pela_linha = 
        celulas_para_verificar.indexOf(7) >= 0 &&
        celulas_para_verificar.indexOf(8) >= 0 &&
        celulas_para_verificar.indexOf(9) >= 0;
      break;
    }
    
    let venceu_pela_coluna = false;
    switch(jogada_atual.local){
      //Coluna 1:
      case 1:
      case 4:
      case 7:
        venceu_pela_coluna = 
        celulas_para_verificar.indexOf(1) >= 0 &&
        celulas_para_verificar.indexOf(4) >= 0 &&
        celulas_para_verificar.indexOf(7) >= 0;
      break;
      
      //Coluna 2:
      case 2:
      case 5:
      case 8:
        venceu_pela_coluna = 
        celulas_para_verificar.indexOf(2) >= 0 &&
        celulas_para_verificar.indexOf(5) >= 0 &&
        celulas_para_verificar.indexOf(8) >= 0;
      break;
      
      //Coluna 3:
      case 3:
      case 6:
      case 9:
        venceu_pela_coluna = 
        celulas_para_verificar.indexOf(3) >= 0 &&
        celulas_para_verificar.indexOf(6) >= 0 &&
        celulas_para_verificar.indexOf(9) >= 0;
      break;
    }
    
    let venceu_pela_primeira_diagonal = false;
    switch(jogada_atual.local){
      //Diagonal canto superior esquerdo para canto inferior direito:
      case 1:
      case 5:
      case 9:
        venceu_pela_primeira_diagonal = 
        celulas_para_verificar.indexOf(1) >= 0 &&
        celulas_para_verificar.indexOf(5) >= 0 &&
        celulas_para_verificar.indexOf(9) >= 0;
      break;
    }
    
    let venceu_pela_segunda_diagonal = false;
    switch(jogada_atual.local){
      //Diagonal canto superior direito para canto inferior esquerdo:
      case 3:
      case 5:
      case 7:
        venceu_pela_segunda_diagonal = 
        celulas_para_verificar.indexOf(3) >= 0 &&
        celulas_para_verificar.indexOf(5) >= 0 &&
        celulas_para_verificar.indexOf(7) >= 0;
      break;
    }
    
    const venceu = venceu_pela_linha || venceu_pela_coluna || 
    venceu_pela_primeira_diagonal || venceu_pela_segunda_diagonal;
    if(venceu){
      //Depois posso fazer para guardar os nomes dos jogadores em state ao invés de serem 1 e 2.
      this.state.vencedor = this.state.numero_do_turno_atual % 2 !== 0 ? "1" : "2";
    }
    
    /* Quinto, atualizo o número do turno para o próximo turno e verifico se o jogo acabou. */
    this.state.numero_do_turno_atual++;
    this.state.fim_de_jogo = this.state.numero_do_turno_atual > 9 || venceu;
    
    /* Chamando o método setState para renderizar o componente novamente. */
    this.setState(
      {
        elemento_modelo: this.state.elemento_modelo,
        historico_de_turnos: this.state.historico_de_turnos,
        numero_do_turno_atual: this.state.numero_do_turno_atual,
        vencedor: this.state.vencedor,
        fim_de_jogo: this.state.fim_de_jogo
      }
    );
  }
  
  mostrar_div_opcoes_de_historico(){
    /* Se for o primeiro turno, a div_opcoes_de_historico fica oculta. */
    if(this.state.numero_do_turno_atual === 1){
      return "tag_oculta";
    }
    return "";
  }
  
  mostrar_lista_de_opcoes_de_historico(){
    let opcoes_de_historico = Array(0);
    
    /* Atualmente só mostro opções para turnos anteriores mas posso mudar. */
    for(let numero_do_turno = 1; numero_do_turno < this.state.numero_do_turno_atual; numero_do_turno++){
      const conteudo = "Turno " + numero_do_turno + ".";
      const elemento_react = React.createElement(
        "a",
        {
          className: "opcao_do_historico_do_jogo_da_velha",
          onClick: () => this.carregar_turno_do_historico(numero_do_turno)
        },
        conteudo
      )
      opcoes_de_historico[numero_do_turno - 1] = elemento_react;
    }
    
    return opcoes_de_historico;
  }
  
  carregar_turno_do_historico(numero_do_turno_alvo){
    /* Ao não deletar os turnos seguintes, depois posso fazer uma espécie de "refazer". */
    this.state.numero_do_turno_atual = numero_do_turno_alvo;
    this.state.vencedor = null;
    this.state.fim_de_jogo = false;
    
    /* Chamando o método setState para renderizar o componente novamente. */
    this.setState(
      {
        elemento_modelo: this.state.elemento_modelo,
        historico_de_turnos: this.state.historico_de_turnos,
        numero_do_turno_atual: this.state.numero_do_turno_atual,
        vencedor: this.state.vencedor,
        fim_de_jogo: this.state.fim_de_jogo
      }
    );
  }
  
}

ReactDOM.render(
  React.createElement(ComponenteJogoDaVelha, null, null),
  document.getElementById("div_componente_jogo_da_velha")
);
