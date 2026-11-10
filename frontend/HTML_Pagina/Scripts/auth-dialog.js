
const janelaLogin = document.querySelector('.janelalOGIN')
const btnLogin = document.querySelector('.buttonLogin')

btnLogin.addEventListener('click',()=>{
    janelaLogin.showModal()
})

document.addEventListener('click',(e)=>{
   if(e.target===janelaLogin){
       janelaLogin.close()
   }
})
