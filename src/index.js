let domainUrl =
  "https://livejs-api.hexschool.io/api/livejs/v1/customer/alexlau9527";

//生成testimonial 單一item html
function createTestimonialItemHTML(
  itemUrl,
  avatarUrl,
  userName,
  purchasedItem,
  userComment
) {
  let testimonialItemHTML = ` 
        <li class="testimonialItem flex">
        <img src="../static/img/${itemUrl}" alt="" />
        <div class="w-72 bg-white py-3 pl-4">
            <div class="mb-2 flex items-center justify-start">
            <img src="../static/img/${avatarUrl}" alt="" class="h-12 w-12" />
            <div class="ml-2">
                <p>
                <span>${userName}</span>
                <br />
                <span class="text-purple-700">${purchasedItem}</span>
                </p>
            </div>
            </div>
            <p>${userComment}</p>
        </div>
        </li>
        `;
  return testimonialItemHTML;
}

/////////////////////////Testimonial////////////////////////////////////

/////////元件function///////////

// input: arr of obj
// process: 用arr進行map，生成item html，並進行整合
// return: 完整html testimonial元件
function createTestimonialListHTML(testimonialArr) {
  let testimonialHTMLArr = testimonialArr.map((item) => {
    ({ itemUrl, avatarUrl, userName, purchasedItem, userComment } = item);
    return createTestimonialItemHTML(
      itemUrl,
      avatarUrl,
      userName,
      purchasedItem,
      userComment
    );
  });
  let testimonialHTML = testimonialHTMLArr.join("\n");
  return testimonialHTML;
}

/////////渲染function///////////

// input: arr of obgj
// process: 用createTestimonialListHTML生成html進行畫面渲染
function renderTestimonial(testimonialArr) {
  let testimonialListDOM = Array.from(
    document.querySelectorAll(".testimonialList")
  );

  testimonialArrUpper = testimonialArr.slice(0, 5);
  testimonialArrLower = testimonialArr.slice(5, testimonialArr.length);

  testimonialListDOM[0].innerHTML =
    createTestimonialListHTML(testimonialArrUpper);
  testimonialListDOM[1].innerHTML =
    createTestimonialListHTML(testimonialArrLower);
}

renderTestimonial(testimonialArr);

/////////////////////////Product List////////////////////////////////////

/////////事件監聽function///////////

//加到購物車 eventListenr
//process:
//1. 加到購物車按鈕掛上事件監聽callback
//callback:
//  1. modSingleItem 接受被點擊productid 進行購物車數量增減
//  2. 接收api回傳結果，進行購物車重渲染 renderCartList
async function addEventClickAddCart() {
  const productList = document.querySelector(".productList");
  productList.addEventListener("click", async function (e) {
    if (e.target.classList.contains("addCart")) {
      let productID = e.target.closest("li");
      productID = productID.getAttribute("data-productid");
      let cartRes = await modSingleItem(productID, (quantityDelta = 1));
      pullCartList(cartRes);
    }
  });
}

async function addEventClickSelectCate() {
  const cateSelector = document.querySelector(".cateSelector");
  cateSelector.addEventListener("input", async function (e) {
    let productCate = e.target.value;
    pullProductList(productCate);
  });
}

/////////元件function///////////

//input product各屬性參數
//process: 根據參數生成單一產品列表html
function createProductItemHTML(
  productName,
  productImageUrl,
  productOrgPrice,
  productDisPrice,
  productID,
  productCate
) {
  productOrgPrice = productOrgPrice.toLocaleString();
  productDisPrice = productDisPrice.toLocaleString();

  let ProductItemHTML = `
          <li class="productItem w-full sm:w-1/2 lg:w-1/4 px-4" data-productid="${productID}" data-cate="${productCate}">
          <div class="relative">
              <img
              src="${productImageUrl}"
              alt=""
              class="min-h-[300px] w-full object-cover"
              />
              <p
              class="absolute top-0 right-0 bg-black py-2 px-5 text-center text-white"
              >
              新品
              </p>
              <div class="cursor-pointer addCart py-5 block bg-black md:py-2 text-center text-white hover:bg-gray-300">
              加入購物車
              </div>
              <h3 class="text-xl">${productName}</h3>
              <p class="text-xl line-through">NT${productOrgPrice}</p>
              <p class="text-2xl">NT${productDisPrice}</p>
          </li>
          </div>
          `;
  return ProductItemHTML;
}

/////////渲染function///////////

//process:
// input 產品類型
// 1. 抓取產品列表api 回傳arr
// 2. arr篩選產品類型
// 3. arr map createProductItemHTML
// 4. 渲染頁面
// 5. 綁 加入購物車監聽 addEventClickAddCart
async function pullProductList(productCate) {
  const productList = document.querySelector(".productList");

  const productRes = await axios.get(`${domainUrl}/products`).catch((err) => {
    console.log(err);
  });

  let productItemArr = productRes.data["products"];

  productItemArr =
    productCate === "全部"
      ? productItemArr
      : productItemArr.filter((item) => item["category"] === productCate);

  productItemHTMLArr = productItemArr.map((item) => {
    let {
      id: productID,
      title: productName,
      images: productImageUrl,
      origin_price: productOrgPrice,
      price: productDisPrice,
      category: productCate,
    } = item;

    return createProductItemHTML(
      productName,
      productImageUrl,
      productOrgPrice,
      productDisPrice,
      productID,
      productCate
    );
  });

  let productItemHTML = productItemHTMLArr.join("\n");

  productList.innerHTML = productItemHTML;
}

pullProductList("全部");
// 渲染後加入監聽
addEventClickAddCart();
addEventClickSelectCate();

/////////////////////////////Cart List////////////////////////////////////

/////////api操作function///////////

//process: api 刪除所有購物車商品
//return 最新購物車response
async function deleteAll() {
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  let cartRes = await axios.delete(`${domainUrl}/carts`).catch((err) => {
    console.log(err);
  });
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  return cartRes;
}

//process: api 刪除購物車單一商品
//return 最新購物車response
async function deleteSingleItem(cartID) {
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  let cartRes = await axios
    .delete(`${domainUrl}/carts/${cartID}`)
    .catch((err) => {
      console.log(err);
    });
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  return cartRes;
}

//input 產品id
//process: api 加入購物車/更改購物車商品數量
//return 最新購物車response
async function modSingleItem(productID, quantityDelta = 1) {
  const cartRes = await pullCartList((isRender = false));

  const cartArr = cartRes["data"]["carts"];
  const cartItem = cartArr.filter(
    (item) => item["product"]["id"] === productID
  );
  const isItemExisting = cartItem.length > 0;

  async function addNewCart() {
    let reqBody = {
      data: {
        productId: productID,
        quantity: 1,
      },
    };
    document.querySelector(".fullSpinner").classList.toggle("hidden");
    let cartRes = await axios
      .post(`${domainUrl}/carts`, reqBody)
      .catch((err) => {
        console.log(err);
      });
    document.querySelector(".fullSpinner").classList.toggle("hidden");

    return cartRes;
  }

  async function modExistingCart(quantityDelta) {
    let newQuantity = cartItem[0]["quantity"] + quantityDelta;
    let cartID = cartItem[0]["id"];
    let reqBody = {
      data: {
        id: cartID,
        quantity: newQuantity,
      },
    };
    document.querySelector(".fullSpinner").classList.toggle("hidden");
    let cartRes = await axios
      .patch(`${domainUrl}/carts`, reqBody)
      .catch((err) => {
        console.log(err);
      });
    document.querySelector(".fullSpinner").classList.toggle("hidden");
    return cartRes;
  }

  let newCartRes = isItemExisting
    ? await modExistingCart(quantityDelta)
    : await addNewCart();

  if (newCartRes["data"]["success"] === false) {
    let error = new Error("api fail");
    throw error;
  } else {
    return newCartRes;
  }
}

//process: api 獲取最新購物車
//return Response
async function pullCartList(isRender = true) {
  let cartRes = await axios.get(`${domainUrl}/carts`).catch((err) => {
    console.log(err);
  });

  if (isRender) {
    renderCartList(cartRes);
  }
  return cartRes;
}

//x = await modSingleItem("Mse8nPa1wU2raJNgsm4b",1)

/////////元件function///////////

//input 購物車各屬性參數
//process: 根據參數生成生成單一cart Item
function createCartItemHTML(
  productID,
  cartID,
  productImageUrl,
  productName,
  productDisPrice,
  productQuantity
) {
  let productTotalAmount = (productQuantity * productDisPrice).toLocaleString();
  productDisPrice = productDisPrice.toLocaleString();

  let cartItemHTML = `
        <tbody class = "cartItem"data-cartID="${cartID}"
        data-productID="${productID}">
        <tr
        class="border-b border-slate-300"
        
        >
        <td class="py-5">
        <div class="flex flex-row items-center pr-5">
            <img
            class="productImageUrl mr-3 w-24 h-24"
            src="${productImageUrl}"
            alt=""
            />
            <div class="flex flex-col">
            <p class="productName mb-3 md:mb-0 font-semibold md:font-normal">${productName}</p>
            <p class="productDisPrice md:hidden">NT\$ ${productDisPrice}</p>
            </div>
        </div>
        </td>

        <td class="productDisPrice hidden md:table-cell">NT\$ ${productDisPrice}</td>
        <td class="pl-5">
        <div
            class="inline-flex items-center rounded-full border border-black px-3"
        >
            <i class="addQuantity cursor-pointer grow text-center block fa-solid fa-plus hover:text-purple-500"></i>
            <div class="productQuantity grow px-3 text-center">${productQuantity}</div>
            <i class="minusQuantity cursor-pointer grow text-center block fa-solid fa-minus hover:text-purple-500"></i>
        </div>
        </td>
        <td class="productTotalAmount hidden pl-7 md:table-cell">
        NT\$ ${productTotalAmount}
        </td>
        <td class="hidden text-right md:table-cell">
        <i 
        class="removeThisProduct  cursor-pointer
         fa-solid fa-circle-xmark text-3xl hover:text-purple-500"
       ></i>
        </td>
        </tr>
        <tr data-cartID="${cartID}"
        data-productID="${productID}">
        <td colspan="2" class="py-3 text-right text-gray-600 md:hidden">
        <div class="flex justify-between">
        <i
        class="removeThisProduct  cursor-pointer
         fa-solid fa-circle-xmark text-3xl hover:text-purple-500"
       ></i>
            <p class="productTotalAmount">NT\$ ${productTotalAmount}</p>
        </div>
        </td>
        </tr>
        </tbody>
        
    `;
  return cartItemHTML;
}

//input 若購物車不為空 tbody傳入createCartItemHTML整合結果
//return 整個cart list
function createCartListHTML(isEmpty, tbody = "") {
  if (isEmpty) {
    return `<p class="text-2xl text-center py-5">購物車空空如也</p>`;
  } else {
    return `
      <table class="mx-auto w-full text-xl">
        <thead>
          <tr class="text-left">
            <th class="hidden md:table-cell md:w-[40%]">品項</th>
            <th class="w-[60%] md:hidden">品項/單價</th>
            <th class="hidden md:table-cell md:w-[15%]">單價</th>
            <th class="w-[25%] pl-5 md:w-[20%]">數量</th>
            <th class="hidden pl-7 md:table-cell md:w-[15%]">金額</th>
            <th class="hidden md:w-[10%]"></th>
          </tr>
        </thead>

        ${tbody}

        <tfoot>
          <td colspan="2" class="hidden pt-5 md:table-cell">
            <div
            class="removeAllCartProduct cursor-pointer inline-block rounded border border-black px-6 py-2 hover:bg-black hover:text-white"
            >
            刪除所有品項
            </div>
          </td>
          <td class="pt-5 md:hidden">
              <div
                class="removeAllCartProduct cursor-pointer inline-block rounded border border-black px-6 py-2 hover:bg-black hover:text-white"
              >
                刪除所有品項
              </div>
          </td>
          <td colspan="3" class="pt-5 text-right">
            總金額
            <p class="totalAmount text-right text-xl font-bold"></p>
          </td>
        </tfoot>
      </table>
      `;
  }
}

/////////渲染function///////////

// input api response obj
// process: cartlist html渲染
// 1. 若購物車為空 則渲染為空情況
// 2. 購物車有值 渲染完整購物車
function renderCartList(cartRes) {
  let cartListApiArr = cartRes.data["carts"];
  let cartTotalAmount = cartRes.data["finalTotal"];
  const cart = document.querySelector(".cart");

  //若購物車為空 則渲染為空情況
  if (cartListApiArr === undefined || cartListApiArr.length === 0) {
    cart.innerHTML = createCartListHTML((isEmpty = true));

    //購物車有值 渲染完整購物車
  } else {
    //map arr
    let cartItemHTMLArr = cartListApiArr.map((item) => {
      let { id: itemID, product: productObj, quantity: productQuantity } = item;
      let {
        id: productID,
        images: productImageUrl,
        price: productDisPrice,
        title: productName,
      } = productObj;

      return createCartItemHTML(
        productID,
        itemID,
        productImageUrl,
        productName,
        productDisPrice,
        productQuantity
      );
    });

    // 整合html arr
    let cartItemHTML = cartItemHTMLArr.join("\n");
    cart.innerHTML = createCartListHTML(
      (isEmpty = false),
      (tbody = cartItemHTML)
    );

    totalAmount = document.querySelector(".totalAmount");
    totalAmount.textContent = `NT \$ ${cartTotalAmount.toLocaleString()}`;
  }
}

function addEventClickDeleteSingleItem() {
  const cart = document.querySelector(".cart");
  cart.addEventListener("click", async function (e) {
    if (e.target.classList.contains("removeThisProduct")) {
      let cartID = e.target.closest("tbody").getAttribute("data-cartid");
      let cartRes = await deleteSingleItem(cartID);
      renderCartList(cartRes);
    }
  });
}

function addEventClickDeleteAll() {
  const cart = document.querySelector(".cart");
  cart.addEventListener("click", async function (e) {
    if (e.target.classList.contains("removeAllCartProduct")) {
      let cartRes = await deleteAll();
      renderCartList(cartRes);
    }
  });
}

function addEventClickMod() {
  const cart = document.querySelector(".cart");
  cart.addEventListener("click", async function (e) {
    if (e.target.classList.contains("addQuantity")) {
      let productID = e.target.closest("tbody").getAttribute("data-productid");
      let cartRes = await modSingleItem(productID, 1);
      renderCartList(cartRes);
    } else if (e.target.classList.contains("minusQuantity")) {
      let productID = e.target.closest("tbody").getAttribute("data-productid");
      let cartRes = await modSingleItem(productID, -1);
      renderCartList(cartRes);
    }
  });
}

pullCartList((isRender = true));
addEventClickDeleteSingleItem();
addEventClickDeleteAll();
addEventClickMod();
