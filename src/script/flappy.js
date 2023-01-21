const novoElemento = (element, className) => {
  const elemento = document.createElement(element);
  elemento.className = className;
  return elemento;
};

function Barreira(reversa = false) {
  this.elemento = novoElemento('div', 'barreira');

  const corpo = novoElemento('div', 'corpo');
  const borda = novoElemento('div', 'borda');
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = (altura) => {
    corpo.style.height = `${altura}px`;
  };
}

function ParBarreiras(altura, abertura, x) {
  this.elemento = novoElemento('div', 'par-de-barreiras');

  this.superior = new Barreira(true);
  this.inferior = new Barreira();

  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAltura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturaInferior = altura - abertura - alturaSuperior;

    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  this.getX = () => parseInt(this.elemento.style.left.split('px')[0], 10);
  this.setX = (sX) => {
    this.elemento.style.left = `${sX}px`;
  };
  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAltura();
  this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new ParBarreiras(altura, abertura, largura),
    new ParBarreiras(altura, abertura, largura + espaco),
    new ParBarreiras(altura, abertura, largura + espaco * 2),
    new ParBarreiras(altura, abertura, largura + espaco * 3),
  ];

  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach((parBarreira) => {
      parBarreira.setX(parBarreira.getX() - deslocamento);

      if (parBarreira.getX() < -parBarreira.getLargura()) {
        parBarreira.setX(parBarreira.getX() + espaco * this.pares.length);
        parBarreira.sortearAltura();
      }

      const meio = largura / 2;
      const cruzouMeio = parBarreira.getX() + deslocamento >= meio && parBarreira.getX() < meio;
      if (cruzouMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  let voando = false;

  this.elemento = novoElemento('img', 'passaro');
  this.elemento.src = './src/img/passaro.png';

  this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0], 10);
  this.setY = (y) => {
    this.elemento.style.bottom = `${y}px`;
  };

  window.onkeydown = () => {
    voando = true;
  };
  window.onkeyup = () => {
    voando = false;
  };

  this.animar = () => {
    const novoY = this.getY() + (voando ? 8 : -5);
    const altumaMaxima = alturaJogo - 40;

    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= altumaMaxima) {
      this.setY(altumaMaxima);
    } else {
      this.setY(novoY);
    }
  };

  this.setY(alturaJogo / 2);
}

function Progresso() {
  this.elemento = novoElemento('span', 'progresso');
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

function verificarSobreposicao(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colisao = false;
  barreiras.pares.forEach((parBarreira) => {
    if (!colisao) {
      const superior = parBarreira.superior.elemento;
      const inferior = parBarreira.inferior.elemento;
      colisao =
        verificarSobreposicao(passaro.elemento, superior) ||
        verificarSobreposicao(passaro.elemento, inferior);
    }
  });
  return colisao;
}

function FlappyBird() {
  let pontos = 0;

  const areaJogo = document.querySelector('[wm-flappy]');
  const alturaJogo = areaJogo.clientHeight;
  const larguraJogo = areaJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(alturaJogo, larguraJogo, 200, 400, () => {
    progresso.atualizarPontos((pontos += 1));
  });
  const passaro = new Passaro(alturaJogo);

  barreiras.pares.forEach((parBarreiras) => {
    areaJogo.appendChild(parBarreiras.elemento);
  });
  areaJogo.appendChild(progresso.elemento);
  areaJogo.appendChild(passaro.elemento);

  this.start = () => {
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 20);
  };
}

new FlappyBird().start();
