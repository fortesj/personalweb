//Autor: Andrey Dias
//E-mail: andrey.m.dias@hotmail.com
//Twitter: @sr_mersemburger
//github: github.com/andreymdias/

var ScrollIt = function (obj) {

    'use strict';

    //PARAMETROS 

    //atalho para o global scope :)
    window.$ = this;

    //bug fix variables
    var obj = obj || {},
        change = true;

    // Parametros do usuário

    this.nav = obj.nav || false;
    this.position = 0;
    this.elem = document.querySelector(obj.elem) || document.body;
    this.time = obj.time || 200;
    this.delay = obj.delay || 0;
    this.pages = document.querySelectorAll('section[data-page]');
    this.anchors = document.querySelectorAll('a[data-link]');
    this.keyCodes = {
        previous: [33, 38, 37],
        next: [34, 39, 40]
    };

    // Lembrando qualquer um destes parametros pode ser modificado a qualquer momento, menos o obj (que só serve como bug fix caso não for passado nenhum parametro ao estanciar a classe).
    // O this serve como um prototype, ou seja, qualquer um destes parametros podem ser setados fora da classe
    // Por exemplo: ScrollIt.time = 1000; setarei o tempo de duração da animação do scroll
    // Explicação de cada parametro:

    // Boolean this.nav, seta se o há um controlador na esquerda, por default ele ficará TRUE e criará normalmente
    // Int this.position, serve para indicar a posição da pagina
    // Int this.time, onde é setado o tempo de duração da animação de scroll
    // Int this.delay, onde é setado o tempo de delay para começar a animação
    // DOM Element this.elem, onde fica o elemento 'container' que ficará as paginas do site
    // DOM Element this.anchors, onde fica os links com as ancôras(hashs)
    // DOM Elements this.pages, indica qual elemento será as paginas. Unico que não tem default, mas pode ser setado a qualquer momento.
    // Object this.keyCodes, são as teclas para scroll, divididas em 2 arrays, 'next' e 'previous'

    //    função para a pagina anterior
    this.previous = function () {
        this.position > 0 ? this.scroll(this.position - 1) : this.scroll(this.pages.length - 1);
    };
    //    função para a proxima pagina 
    this.next = function () {
        this.position < this.pages.length - 1 ? this.scroll(this.position + 1) : this.scroll(0);
    };

    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    this.scrollCtrl = {
        defaults: {
            anch: [],
            pos_height: []
        },
        determinate_value: function () {
            var def = $.scrollCtrl.defaults;

            for (var len = $.pages.length, a = 0, i = 0; i < len; i++) {
                // pos_height onde fica armazenado em qual posicionamento vai mudar de posição a pagina
                def.pos_height[i] = {
                    previous: (a - ($.pages[i].offsetHeight / 2)),
                    next: (a + $.pages[i].offsetHeight) - ($.pages[i].offsetHeight / 2)
                };
                // anch é uma array que controla as hashs
                def.anch[i] = $.pages[i].getAttribute('data-page');
                // incrementa a variavel a
                a += $.pages[i].offsetHeight;
            }
        },
        calcPosition : function (root) {

            var def = this.defaults.pos_height,
                scroll = window.pageYOffset;

            root || false;

            /* 
                    verifica a posição do scroll, se ele estiver fora dos limites da sessão atual ele continuará 
                    o argumento root se for TRUE desconsidera isso e faz o calculo normalmente
            */

            if (scroll >= def[$.position].next || scroll < def[$.position].previous || root === true) {
                // um for maroto para verificar a posição da pagina
                for (var i = 0, l = $.pages.length; i < l; i++) {
                    // achou, chama a função para setar a pagina e retorna
                    if (scroll < def[i].next && scroll >= def[i].previous) {
                        $.anchors && changeHash(i);
                        return i;
                    }
                }
                return false;
            }
        },
        // verifica a url e chama a função para scrollar
        verificaUrl: function () {
            var pos = window.location.hash.substring(1);
            var poSubstring = $.scrollCtrl.defaults.anch.indexOf(pos);
            if (change) {
                if (poSubstring !== -1) $.scroll(poSubstring);
            }
        },
        // chama a função de calculo da pagina
        verificaPos: function (root) {
            var pos = $.scrollCtrl.calcPosition(root || false);
            // após o retorno seta a posição
            if (pos || pos === 0) {
                setPosition(pos);
            }
        },
    };

    this.scrollCtrl.init = function () {
        // variaveis de atalho
        var defCtrl = $.scrollCtrl.defaults,
            ctrl = $.scrollCtrl;
        // faz o calculo de tamanho de elementos
        ctrl.determinate_value();
        // verifica a posição no scroll, com o parametro TRUE para especificar que é root
        ctrl.verificaPos(true);

        window.onkeydown = function (e) {
            e.preventDefault();
            // procura na array keyCodes se a tecla tocada correspondente
            if($.keyCodes.previous.indexOf(e.which) !== -1){
                $.previous();
            }else if($.keyCodes.next.indexOf(e.which) !== -1){
                $.next();
            }
        }

        // evento que especifica quando de resize na pagina, verificar os valores novamente
        window.addEventListener('resize', function () {
            ctrl.determinate_value();
            ctrl.verificaPos(true);
        }, true);

        // quando der scroll calcular a posição
        window.addEventListener('scroll', function () {
            ctrl.verificaPos();
        }, true);

        // evento de modificação de url
        window.addEventListener('popstate', ctrl.verificaUrl, true);
        window.addEventListener('hashchange', ctrl.verificaUrl, true);
    };

    //função para modificar url 
    var changeHash = function (pos) {
        var url = $.pages[pos].getAttribute('data-page');
        if (history.replaceState) {
            history.replaceState({}, url, "#" + url);
        } else {
            location.hash = url;
        }
    }

    this.scroll = function (pos,duration) {

        var sub = this.position > pos ? this.position - pos : pos - this.position,
            element = this.elem,
            perTick,
            duration = duration * sub || this.time * sub,
            to = this.pages[pos].offsetTop;

        // se for um device escolhi não colocar uma animação, devido a bugs e o péssimo desempenho dos navegadores que testei
        if (isMobile.any()){
            scrollTo(0,to);
            return;
        }

        // animação do scroll
        if (change) {
            change = false;
            // setTimeOut para especificar o delay
            setTimeout(function () {
                var animate = function () {

                    perTick = ((to - window.pageYOffset) / duration) * 10;
                    window.scrollTo(0, window.pageYOffset + perTick);

                    if (window.pageYOffset === to) {
                        change = true;
                        return;
                    }
                    duration = duration - 10;
                    setTimeout(animate, 10);

                };
                animate();

            }, $.delay);
        }

    };

    //  função responsável por setar o posicionamento da pagina
    var setPosition = function (position) {
        if ($.nav) {
            // remover a classe no elemento marcador da posição da tela
            document.querySelectorAll('.btnCtrl')[$.position].classList.remove('active');
            // adicionar um novo marcador com a nova posição
            document.querySelectorAll('.btnCtrl')[position].classList.add('active');
        }
        // informar a nova posição para a classe
        $.position = position; 
    };

    //  função para criar elementos
    var createElementInDOM = function (element,_class,append,pos) {
        // ARGUMENTOS
        //element = o elemento a ser criado
        //_class = uma class a elemento
        //append = onde ficará o elemento
        //pos = (opcional) posição referente a este elemento

        // cria o elemento
        var elem = document.createElement(element);
        //adiciona a classe ao elemento
        elem.classList.add(_class);
        //se o pos foi setado 
        if (pos !== undefined) {  
            // adiciona um evento click
            elem.addEventListener('click',function(){
                // chama a função de scroll até o elemento referenciado
                $.position !== pos && $.scroll(pos);
            },true);
        }
        // indica qual elemento deseja "ser salvo as informações"
        append = document.querySelector(append);
        // "salva :)"
        append.appendChild(elem);
    }
    var navOptions = function () {
        var link = $.anchors;
        if (link) {
            for (var i = 0, l = link.length;i < l;i++) {
                link[i].setAttribute('href',window.location.pathname + '#' + link[i].getAttribute("data-link"));
            }
        }
    }
    // função para adicionar o controller 
    var createController = function () {
        $.elem.setAttribute('data-scrollIt','main');
        createElementInDOM('nav','ctrlPage','*[data-scrollIt="main"]');
        for (var i = 0,l = $.pages.length; i < l;i++) {
            createElementInDOM('div','btnCtrl','nav.ctrlPage',i);
        }
        document.querySelector('.ctrlPage').setAttribute('style','height:' + 25 * l + 'px');
    };
    //    função inicial, inicia as funções essenciais da pagina
    this.init = function () {
        $.nav && createController();
        $.scrollCtrl.init();
        navOptions();
    };
    // Chamar a função inicial com SetTimeOut para poder adicionar valores posteriormente a sua instancia
    window.addEventListener('load', $.init);
}
// Pode ser ajustado de duas formas a biblioteca

// No momento de ser instanciada passando como parametro um objeto
// exemplo: var ScrollIt = new ScrollIt({time:600,delay:200,element:'.main',nav:false});

// Ou setando os valores, que particluamente acho melhor, além de ter uma maior gama de possibilidades, como adicionar funções e chamar algumas das funções internas;

// Por exemplo: Após ser instanciada;

/* 
    var ScrollIt = new ScrollIt();
    ScrollIt.time = 500;
    ScrollIt.nav = true;
    ScrollIt.keyCodes.push(11,32,54);

    e assim por diante :D
*/