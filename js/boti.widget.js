(function(){"use strict";(function(){if(window.BotiWidget){console.warn("BOTI Widget ya está inicializado");return}const r={apiUrl:"https://susan-connection-caution-cities.trycloudflare.com",position:"bottom-right",primaryColor:"#1a202c",secondaryColor:"#2d3748",accentColor:"#e2e8f0",title:"Asistente Virtual UNA-Puno",subtitle:"Servicio de atención virtual",placeholder:"Escribe tu consulta aquí...",welcomeMessage:"¡Hola! Soy el asistente virtual de la Universidad Nacional del Altiplano. ¿En qué puedo ayudarte hoy?",logoUrl:"/images-boti/Logo_UNAP.png",robotIcon:"/images-boti/boti.webp",zIndex:9999,enableEncryption:!1,encryptionKey:"BOTI-SECRET-KEY-2024",lang:"es"};class c{constructor(e={}){this.config={...r,...e},this.isOpen=!1,this.sessionId=this.getOrCreateSessionId(),this.container=null,this.messagesContainer=null,this.inputElement=null,this.termsAccepted=this.checkTermsAcceptance()}getOrCreateSessionId(){let e=localStorage.getItem("boti_chat_session_id");return e||(e="session_"+Date.now()+"_"+Math.random().toString(36).substr(2,9),localStorage.setItem("boti_chat_session_id",e)),e}checkTermsAcceptance(){return localStorage.getItem("boti_terms_accepted")==="true"}acceptTerms(){localStorage.setItem("boti_terms_accepted","true"),this.termsAccepted=!0}rejectTerms(){localStorage.setItem("boti_terms_accepted","false"),this.termsAccepted=!1}init(){this.injectStyles(),this.createWidget(),this.attachEventListeners(),this.showWelcomeMessage(),console.log("BOTI Widget inicializado correctamente")}injectStyles(){const e="boti-widget-styles";if(document.getElementById(e))return;const t=document.createElement("style");t.id=e,t.textContent=this.getStyles(),document.head.appendChild(t)}getStyles(){const e=this.config.position==="bottom-left";return`
        /*
         * SISTEMA DE BREAKPOINTS SIMPLIFICADO - MOBILE FIRST
         * Evita ambigüedades y garantiza compatibilidad total
         *
         * MÓVIL:   0px - 767px    → Chat pantalla completa
         * DESKTOP: 768px+         → Chat ventana flotante
         *
         * Optimizado para: Infinix, Samsung, iPhone, tablets, desktop
         */

        /* Reset y viewport fix para el widget */
        .boti-widget-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        /* ==============================================
           MOBILE FIRST - Base styles (0px - 767px)
           Todos los móviles: Infinix, Samsung, iPhone, etc.
           ============================================== */

        /* Botón flotante - Base móvil */
        .boti-chat-button {
          position: fixed;
          bottom: max(1rem, env(safe-area-inset-bottom, 0) + 0.5rem);
          ${e?"left":"right"}: 1rem;
          width: 3.5rem; /* 56px */
          height: 3.5rem; /* 56px */
          background-color: ${this.config.primaryColor};
          border-radius: 50%;
          border: none;
          box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: ${this.config.zIndex};
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          touch-action: manipulation;
        }

        .boti-chat-button:active {
          transform: scale(0.95);
        }

        .boti-chat-button img {
          width: 1.875rem; /* 30px */
          height: 1.875rem; /* 30px */
          pointer-events: none;
          animation: spin 20s linear infinite; /* Giro continuo hacia la derecha en eje Y */
          transform-origin: center;
        }

        /* Contenedor del chat - Base móvil (pantalla completa) */
        .boti-chat-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100vh;
          max-width: 100vw;
          background-color: #ffffff;
          border-radius: 0;
          box-shadow: none;
          display: none;
          flex-direction: column;
          z-index: ${this.config.zIndex};
          overflow: hidden;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        .boti-chat-container.open {
          display: flex;
          transform: translateY(0);
        }

        /* Header del chat - Base móvil */
        .boti-chat-header {
          background: linear-gradient(135deg, ${this.config.primaryColor} 0%, ${this.config.secondaryColor} 100%);
          color: #ffffff;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .boti-chat-logo {
          width: 3rem; /* 48px - un poco más grande */
          height: 3rem; /* 48px - un poco más grande */
          object-fit: contain;
          /* Fondo transparente, sin background */
          flex-shrink: 0;
        }

        .boti-chat-header-text {
          flex: 1;
          min-width: 0;
        }

        .boti-chat-header-text h2 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .boti-chat-header-text p {
          font-size: 0.85rem;
          opacity: 0.95;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .boti-minimize-button {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
          flex-shrink: 0;
          touch-action: manipulation;
        }

        .boti-minimize-button:active {
          opacity: 0.6;
        }

        /* Mensajes - Base móvil */
        .boti-chat-messages {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.75rem;
          background-color: #f7fafc;
          display: flex;
          flex-direction: column;
          -webkit-overflow-scrolling: touch;
        }

        .boti-message {
          margin-bottom: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          max-width: 85%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .boti-message.user {
          background-color: ${this.config.primaryColor};
          color: #ffffff;
          align-self: flex-end;
          border-radius: 12px 12px 0 12px;
        }

        .boti-message.bot {
          background-color: ${this.config.accentColor};
          color: #2d3748;
          align-self: flex-start;
          border-radius: 12px 12px 12px 0;
        }

        .boti-message.loading {
          font-style: italic;
          color: #666;
        }

        /* Input - Base móvil */
        .boti-chat-input-container {
          position: sticky;
          bottom: 0;
          padding: 0.75rem;
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0));
          background-color: #ffffff;
          border-top: 1px solid ${this.config.accentColor};
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          z-index: 10;
        }

        .boti-chat-input {
          flex: 1;
          padding: 0.65rem 0.9rem;
          border: 1px solid ${this.config.accentColor};
          border-radius: 1.5rem; /* 24px en rem */
          font-size: 1rem; /* 16px - evita zoom en móvil */
          outline: none;
          transition: border-color 0.2s;
          min-width: 0;
          -webkit-appearance: none;
        }

        .boti-chat-input:focus {
          border-color: ${this.config.primaryColor};
        }

        .boti-send-button {
          background-color: ${this.config.primaryColor};
          color: #ffffff;
          border: none;
          width: 2.375rem; /* 38px */
          height: 2.375rem; /* 38px */
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          flex-shrink: 0;
          touch-action: manipulation;
        }

        .boti-send-button:active {
          background-color: ${this.config.secondaryColor};
          transform: scale(0.95);
        }

        .boti-send-button svg {
          width: 1.125rem; /* 18px */
          height: 1.125rem; /* 18px */
          fill: white;
        }

        /* Scrollbar personalizado */
        .boti-chat-messages::-webkit-scrollbar {
          width: 0.375rem; /* 6px */
        }

        .boti-chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .boti-chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 0.1875rem; /* 3px */
        }

        .boti-chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* ==============================================
           BREAKPOINT: 640px+ - Móviles grandes (landscape)
           Mejoras visuales para móviles grandes en horizontal
           SIGUE siendo pantalla completa
           ============================================== */
        @media (min-width: 40rem) and (max-width: 47.9375rem) {
          /* Botón ligeramente más grande */
          .boti-chat-button {
            width: 3.75rem; /* 60px */
            height: 3.75rem; /* 60px */
            bottom: max(1.25rem, env(safe-area-inset-bottom, 0) + 0.75rem);
            ${e?"left":"right"}: 1.25rem;
          }

          .boti-chat-button img {
            width: 2rem; /* 32px */
            height: 2rem; /* 32px */
          }

          /* Mensajes con más espacio */
          .boti-message {
            font-size: 0.95rem;
            padding: 0.75rem 1rem;
            max-width: 80%;
          }

          /* Input más cómodo */
          .boti-chat-input-container {
            padding: 1rem;
          }

          .boti-chat-input {
            padding: 0.75rem 1rem;
          }

          .boti-send-button {
            width: 40px;
            height: 40px;
          }

          .boti-send-button svg {
            width: 20px;
            height: 20px;
          }
        }

        /* ==============================================
           BREAKPOINT: 48rem (768px+) - DESKTOP MODE
           Chat cambia a ventana flotante pequeña
           NO más pantalla completa
           ============================================== */
        @media (min-width: 48rem) {
          /* Chat vuelve a modo ventana flotante */
          .boti-chat-container {
            position: fixed;
            top: auto;
            left: auto;
            right: auto;
            bottom: 20px;
            ${e?"left":"right"}: 20px;
            width: 360px;
            height: 560px;
            max-width: none;
            max-height: calc(100vh - 40px);
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            transform: none;
          }

          .boti-chat-container.open {
            transform: none;
          }

          /* Header normal */
          .boti-chat-header {
            padding: 1rem;
            gap: 1rem;
          }

          .boti-chat-logo {
            width: 40px;
            height: 40px;
          }

          .boti-chat-header-text h2 {
            font-size: 1.1rem;
          }

          .boti-chat-header-text p {
            font-size: 0.9rem;
          }

          /* Mensajes normales */
          .boti-chat-messages {
            padding: 1rem;
          }
        }

        /* ==============================================
           BREAKPOINT: lg (1024px+) - Desktop grande
           Tailwind equivalent: @media (min-width: 1024px)
           ============================================== */
        @media (min-width: 1024px) {
          .boti-chat-container {
            width: 380px;
            height: 600px;
          }
        }

        /* ==============================================
           BREAKPOINT: 2xl (1536px+) - Pantallas 4K
           Tailwind equivalent: @media (min-width: 1536px)
           ============================================== */
        @media (min-width: 1536px) {
          .boti-chat-container {
            width: 420px;
            height: 680px;
          }

          .boti-chat-button {
            width: 70px;
            height: 70px;
          }

          .boti-chat-button img {
            width: 36px;
            height: 36px;
          }

          .boti-message {
            font-size: 1rem;
            padding: 0.9rem 1.1rem;
          }

          .boti-chat-header-text h2 {
            font-size: 1.2rem;
          }

          .boti-chat-header-text p {
            font-size: 1rem;
          }
        }

        /* Móviles extra pequeños - Ajuste fino */
        @media (max-width: 360px) {
          .boti-message {
            font-size: 0.85rem;
            max-width: 90%;
          }
        }

        /* Scrollbar personalizado */
        .boti-chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .boti-chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .boti-chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
          transition: background 0.2s;
        }

        .boti-chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* Modal de Términos y Condiciones - Base móvil */
        .boti-terms-modal {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          width: auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          padding: 1rem;
          z-index: ${this.config.zIndex+1};
          display: none;
          border-top: 3px solid ${this.config.primaryColor};
        }

        .boti-terms-modal.show {
          display: block;
          animation: boti-slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes boti-slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .boti-terms-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .boti-terms-icon {
          font-size: 1.25rem;
        }

        .boti-terms-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .boti-terms-content {
          font-size: 0.85rem;
          color: #555;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .boti-terms-content p {
          margin: 0 0 0.5rem 0;
        }

        .boti-terms-content p:last-child {
          margin-bottom: 0;
        }

        .boti-terms-buttons {
          display: flex;
          flex-direction: column-reverse;
          gap: 0.5rem;
        }

        .boti-terms-btn {
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          width: 100%;
        }

        .boti-terms-btn-accept {
          background-color: ${this.config.primaryColor};
          color: #ffffff;
        }

        .boti-terms-btn-accept:hover {
          background-color: ${this.config.secondaryColor};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .boti-terms-btn-decline {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .boti-terms-btn-decline:hover {
          background-color: #cbd5e0;
        }

        /* Desktop - Modal términos */
        @media (min-width: 768px) {
          .boti-terms-modal {
            width: 360px;
            bottom: 2rem;
            ${e?"left":"right"}: 2rem;
            left: auto;
            right: auto;
            ${e?"left: 2rem;":"right: 2rem;"}
            padding: 1.25rem;
          }

          .boti-terms-buttons {
            flex-direction: row;
            justify-content: flex-end;
          }

          .boti-terms-btn {
            width: auto;
            padding: 0.75rem 1rem;
          }
        }

        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}createWidget(){const e=document.createElement("div");e.className="boti-widget-container",e.innerHTML=`
        <!-- Botón flotante -->
        <div class="boti-chat-button">
          <img src="${this.config.robotIcon}" alt="Chat" />
        </div>

        <!-- Ventana de chat -->
        <div class="boti-chat-container">
          <div class="boti-chat-header">
            ${this.config.logoUrl?`<img src="${this.config.logoUrl}" class="boti-chat-logo" alt="${this.config.title}">`:""}
            <div class="boti-chat-header-text">
              <h2>${this.config.title}</h2>
              <p>${this.config.subtitle}</p>
            </div>
            <button class="boti-minimize-button">−</button>
          </div>

          <div class="boti-chat-messages"></div>

          <div class="boti-chat-input-container">
            <input
              type="text"
              class="boti-chat-input"
              placeholder="${this.config.placeholder}"
              aria-label="Mensaje"
            />
            <button class="boti-send-button">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal de Términos y Condiciones -->
        <div class="boti-terms-modal">
          <div class="boti-terms-header">
            <span class="boti-terms-icon">📋</span>
            <h3 class="boti-terms-title">Términos de Uso del Chatbot</h3>
          </div>
          <div class="boti-terms-content">
            <p><strong>Antes de usar este servicio, por favor lee lo siguiente:</strong></p>
            <p>• Este chatbot utiliza inteligencia artificial para responder tus consultas.</p>
            <p>• Las conversaciones pueden ser utilizadas para mejorar el servicio.</p>
            <p>• No compartas información sensible o confidencial.</p>
            <p>• No nos hacemos responsables por decisiones basadas únicamente en las respuestas del chatbot.</p>
            <p style="font-size: 0.85rem; color: #777; margin-top: 8px;">Al aceptar, confirmas que has leído y comprendido estos términos.</p>
          </div>
          <div class="boti-terms-buttons">
            <button class="boti-terms-btn boti-terms-btn-decline">Rechazar</button>
            <button class="boti-terms-btn boti-terms-btn-accept">Aceptar</button>
          </div>
        </div>
      `,document.body.appendChild(e),this.container=e,this.messagesContainer=e.querySelector(".boti-chat-messages"),this.inputElement=e.querySelector(".boti-chat-input"),this.termsModal=e.querySelector(".boti-terms-modal")}attachEventListeners(){const e=this.container.querySelector(".boti-chat-button"),t=this.container.querySelector(".boti-minimize-button"),i=this.container.querySelector(".boti-send-button");this.container.querySelector(".boti-chat-container");const o=this.container.querySelector(".boti-terms-btn-accept"),s=this.container.querySelector(".boti-terms-btn-decline");e.addEventListener("click",()=>this.handleChatButtonClick()),t.addEventListener("click",()=>this.closeChat()),i.addEventListener("click",()=>this.sendMessage()),o.addEventListener("click",()=>this.handleAcceptTerms()),s.addEventListener("click",()=>this.handleDeclineTerms()),this.inputElement.addEventListener("keypress",a=>{a.key==="Enter"&&(a.preventDefault(),this.sendMessage())}),this.inputElement.addEventListener("focus",()=>{setTimeout(()=>this.scrollToBottom(),300)})}handleChatButtonClick(){this.termsAccepted?this.toggleChat():this.showTermsModal()}showTermsModal(){this.termsModal.classList.add("show")}hideTermsModal(){this.termsModal.classList.remove("show")}handleAcceptTerms(){this.acceptTerms(),this.hideTermsModal(),this.toggleChat()}handleDeclineTerms(){this.hideTermsModal(),alert("Debes aceptar los términos de uso para utilizar el chatbot.")}toggleChat(){const e=this.container.querySelector(".boti-chat-container");this.isOpen=!this.isOpen,this.isOpen?(e.classList.add("open"),window.innerWidth<768?(e.style.height=window.innerHeight+"px",this.handleKeyboardResize()):e.style.height="",setTimeout(()=>{this.inputElement.focus(),this.scrollToBottom()},300)):(e.classList.remove("open"),this.removeKeyboardListeners())}closeChat(){const e=this.container.querySelector(".boti-chat-container");this.isOpen=!1,e.classList.remove("open"),this.removeKeyboardListeners()}addMessage(e,t=!1,i=!1){const o=document.createElement("div");return o.className=`boti-message ${t?"user":"bot"} ${i?"loading":""}`,i?(o.id="boti-loading-message",o.innerHTML="<i>Escribiendo...</i>"):o.innerHTML=e,this.messagesContainer.appendChild(o),this.scrollToBottom(),o}scrollToBottom(){this.messagesContainer&&requestAnimationFrame(()=>{this.messagesContainer.scrollTop=this.messagesContainer.scrollHeight})}handleKeyboardResize(){if(window.innerWidth>=768)return;const e=this.container.querySelector(".boti-chat-container");window.visualViewport?(this.visualViewportHandler=()=>{if(!this.isOpen)return;const t=window.visualViewport;e.style.height=t.height+"px",setTimeout(()=>this.scrollToBottom(),100)},window.visualViewport.addEventListener("resize",this.visualViewportHandler),window.visualViewport.addEventListener("scroll",this.visualViewportHandler)):(this.windowResizeHandler=()=>{this.isOpen&&this.scrollToBottom()},window.addEventListener("resize",this.windowResizeHandler))}removeKeyboardListeners(){this.visualViewportHandler&&window.visualViewport&&(window.visualViewport.removeEventListener("resize",this.visualViewportHandler),window.visualViewport.removeEventListener("scroll",this.visualViewportHandler),this.visualViewportHandler=null),this.windowResizeHandler&&(window.removeEventListener("resize",this.windowResizeHandler),this.windowResizeHandler=null);const e=this.container.querySelector(".boti-chat-container");e&&window.innerWidth<768&&(e.style.height="")}showWelcomeMessage(){setTimeout(()=>{this.addMessage(this.config.welcomeMessage)},500)}async sendMessage(){const e=this.inputElement.value.trim();if(!e)return;this.addMessage(e,!0),this.inputElement.value="";const t=this.addMessage("",!1,!0);try{const i=await fetch(`${this.config.apiUrl}/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mensaje:e,session_id:this.sessionId,canal:"web",metadata_extra:{timestamp:Date.now()}})});if(t.remove(),!i.ok)throw new Error(`Error: ${i.status}`);let s=(await i.json()).respuesta;typeof marked<"u"&&(s=marked.parse(s)),this.addMessage(s)}catch(i){t.remove(),this.addMessage("Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",!1),console.error("Error en BOTI Widget:",i)}}destroy(){this.container&&this.container.remove();const e=document.getElementById("boti-widget-styles");e&&e.remove()}}window.BotiWidget={init:function(n){const e=new c(n);return e.init(),e},version:"1.0.0"}})()})();
