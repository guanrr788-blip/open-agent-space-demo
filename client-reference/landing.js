/* Landing page uses real controls; the orbital illustration is a separate asset. */
function renderLandingPage(){
  const building='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l10-4v20M14 6l6 4v11M2 21h20M7 7h3M7 11h3M7 15h3M17 12v2M17 17v1"/></svg>';
  $('main').innerHTML=`
    <section class="home-portal" aria-labelledby="home-heading" data-home-version="orbital-v2">
      <svg class="home-waves" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="home-ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".88"/><stop offset=".5" stop-color="#d1e7ff" stop-opacity=".17"/><stop offset="1" stop-color="#fff" stop-opacity=".94"/></linearGradient>
          <linearGradient id="home-ribbon-blue" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#a9d4ff" stop-opacity=".28"/><stop offset=".65" stop-color="#fff" stop-opacity=".66"/><stop offset="1" stop-color="#b7d9ff" stop-opacity=".1"/></linearGradient>
        </defs>
        <path d="M-140-90C270 60 380 260 910 270S1420 90 1700-5V140C1300 210 1360 470 800 375S210 65-140 30Z" fill="url(#home-ribbon)"/>
        <path d="M-80 485C240 570 375 340 850 470S1330 300 1690 252V420C1260 445 1330 620 810 535S240 660-80 545Z" fill="url(#home-ribbon)"/>
        <path d="M-100 610C240 340 650 690 1050 530S1430 370 1690 560V760C1360 510 1300 760 900 650S240 470-100 735Z" fill="url(#home-ribbon-blue)"/>
        <path d="M-140-90C270 60 380 260 910 270S1420 90 1700-5M-80 485C240 570 375 340 850 470S1330 300 1690 252M-100 610C240 340 650 690 1050 530S1430 370 1690 560" fill="none" stroke="#fff" stroke-opacity=".68" stroke-width="2"/>
      </svg>
      <div class="home-layout">
        <div class="home-hero">
          <div class="home-hero-copy">
            <h1 id="home-heading"><span>让想法，</span><span>开始行动。</span></h1>
            <p class="home-subtitle">从个人灵感到企业业务，开启智能体创造之旅。</p>
            <div class="home-capabilities" aria-label="平台能力入口">
              <div class="home-capability">
                <button class="home-capability-button" onclick="navigate('skills')" aria-describedby="home-communication-info"><span class="home-capability-icon">${I('radio')}</span><span>通信能力</span></button>
                <div class="home-capability-detail" id="home-communication-info"><span>连接通话、消息、云盘与邮箱</span><button onclick="navigate('skills')">了解能力 ${I('arrow-up-right')}</button></div>
              </div>
              <div class="home-capability">
                <button class="home-capability-button" onclick="navigate('identity')"><span class="home-capability-icon">${I('shield')}</span><span>智能体身份 IDaaS</span></button>
              </div>
            </div>
          </div>
          <img class="home-orbital" src="../assets/orbital-core.png" alt="蓝色玻璃核心与银白金属轨道组成的立体球体" fetchpriority="high" draggable="false">
        </div>
        <div class="home-start-choices">
          <article class="home-start-card"><span class="home-start-icon">${I('user')}</span><span class="home-start-divider" aria-hidden="true"></span><div class="home-start-copy"><h2>个人智能体</h2><p>打造你的专属智能助手</p></div><button class="home-start-action" onclick="openWizard()" aria-label="开始创建个人智能体">开始创建 ${I('arrow-right')}</button></article>
          <article class="home-start-card home-enterprise"><span class="home-start-icon">${building}</span><span class="home-start-divider" aria-hidden="true"></span><div class="home-start-copy"><div class="home-enterprise-title"><h2>企业智能体</h2><span class="home-enterprise-status" id="home-enterprise-status">敬请期待</span></div><p>让智能融入企业业务</p></div><button class="home-start-action" disabled aria-label="开始创建企业智能体" aria-describedby="home-enterprise-status">开始创建 ${I('arrow-right')}</button></article>
        </div>
      </div>
    </section>`;
}
