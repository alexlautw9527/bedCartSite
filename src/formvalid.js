formValidObj = {
  customName: false,
  customCellphone: false,
  customEmail: false,
  customAddr: false,
  isCartExisting: false,
};



let customName = document.querySelector("#customName");
customName.addEventListener("input", function (e) {
  const value = this.value;
  if (value < 1) {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.remove("hidden");
    formValidObj["customName"] = false;
  } else {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.add("hidden");
    formValidObj["customName"] = true;
  }
});

let customCellphone = document.querySelector("#customCellphone");
customCellphone.addEventListener("input", function (e) {
  const value = this.value;
  const Regex =
    /(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})/;
  let = isInvalid = !Regex.test(value);
  if (isInvalid) {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.remove("hidden");
    warningText.textContent = "非電話格式";
    formValidObj["customCellphone"] = false;
  } else {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.add("hidden");
    formValidObj["customCellphone"] = true;
  }
});

let customEmail = document.querySelector("#customEmail");
customEmail.addEventListener("input", function (e) {
  const value = this.value;
  const Regex = /\S+@\S+\.\S+/;
  let = isInvalid = !Regex.test(value);
  if (isInvalid) {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.remove("hidden");
    warningText.textContent = "非Email格式";
    formValidObj["customEmail"] = false;
  } else {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.add("hidden");
    formValidObj["customEmail"] = true;
  }
});

let customAddr = document.querySelector("#customAddr");
customAddr.addEventListener("input", function (e) {
  const value = this.value;
  if (value < 1) {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.remove("hidden");
    formValidObj["customAddr"] = false;
  } else {
    let warningText = this.parentNode.querySelector("p");
    warningText.classList.add("hidden");
    formValidObj["customAddr"] = true;
  }
});

console.log(formValidObj);


let orderSubmit = document.querySelector(".orderSubmit");
orderSubmit.addEventListener("click", async function (e) {
    let cartRes = await pullCartList((isRender = false));
    let orderResText = document.querySelector('.orderResult')
    
    formValidObj['isCartExisting'] = cartRes['data']['carts'].length>0
   
    let isAllVaild = Object.values(formValidObj).filter(item=>item===false).length===0
    
    if(isAllVaild){
        let reqBody = {
            "data": {
              "user": {
                "name": customName.value,
                "tel": customCellphone.value,
                "email": customEmail.value,
                "address": customAddr.value,
                "payment": customPayment.value
              }
            }
          }



        document.querySelector(".fullSpinner").classList.toggle("hidden");
        let orderRes = await axios.post(`${domainUrl}/orders`,reqBody)
        .catch((err) => {
          console.log(err);
        });
        document.querySelector(".fullSpinner").classList.toggle("hidden");
        console.log(orderRes['data']['status']===true)
        if(orderRes['data']['status']===true){
            orderResText.textContent = "成功送出訂單"
            
        } else {
            orderResText.textContent = "訂單送出失敗" 
        }
        
        
         
        pullCartList((isRender = true))
        Array.from(document.querySelectorAll('input')).map(item=>item.value="")
        console.log('ff')
        
    } else if(formValidObj['isCartExisting']===false){
        orderResText.textContent = "購物車為空"
    } else {
        orderResText.textContent = "請確認填寫資料" 
    }

});

let dropdownButton = document.querySelector('.dropdownButton')
dropdownButton.addEventListener('click', function(e){
    console.log(e.target)
    let dropdownMenu = document.querySelector('.dropdownMenu')
    dropdownMenu.classList.toggle('hidden')
    
})