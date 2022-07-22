let domainUrl =
  "https://livejs-api.hexschool.io/api/livejs/v1/admin/alexlau9527";

let config = {
  headers: {
    authorization: "EJgbNLP1KJRhIhtCRuVP3t5Cv9T2",
  },
};

/*------------------------------------渲染--------------------------------------*/

/*
獲取order
@async
@returns {Object} order response 
*/
async function pullOrder() {
  let orderRes = await axios.get(`${domainUrl}/orders`, config).catch((err) => {
    console.log(err);
  });
  return orderRes;
}

/*
根據訂單res計算各商品總營收
@param orderRes {Object} order列表response
@returns pieChartData {Object} 各產品總營收 
*/
function calOrderSales(orderRes) {
  let orderData = orderRes["data"]["orders"];
  let wholeItemArr = orderData.map((item) => item["products"]).flat();

  let groupbyItemRes = [];
  wholeItemArr.reduce(function (res, value) {
    if (!res[value.title]) {
      res[value.title] = { title: value.title, price: 0 };
      groupbyItemRes.push(res[value.title]);
    }
    res[value.title].price += value.price;
    return res;
  }, {});

  let pieChartData = groupbyItemRes.map((item) => [
    item["title"],
    item["price"],
  ]);
  return pieChartData;
}

/*
產生n個紫色到白色的色階hex
@param num {Number} 色階數
@returns pieChartData {Array} hex矩陣
*/
function createColorSet(num) {
  let colorSet = [];
  scale = chroma.scale(["#EEEEEE", "#231955"]);
  for (let i = 1; i <= num; i++) {
    colorSet.push(scale(i / num).hex());
  }
  return colorSet;
}

/*
根據各產品營收, 產生圓餅圖
@param pieChartData {Object} 各產品營收
*/
function renderChart(pieChartData) {
  let productArr = pieChartData.map((item) => item[0]);
  let colorSetArr = createColorSet(pieChartData.length);
  let colorProductPairObj = Object.assign(
    ...productArr.map((k, i) => ({ [k]: colorSetArr[i] }))
  );

  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: pieChartData,
      colors: colorProductPairObj,
    },
  });
}

/*
根據order response產生tbody node array
@param orderRes {Object} order response 

@returns {Array} tbody node array
*/
function createWholeBodyNodeArr(orderRes) {
  let orderObjArr = orderRes["data"]["orders"];

  function createTbodyNode(orderObj) {
    let tbody = document.createElement("tbody");

    tbody.setAttribute("data-orderid", orderObj["id"]);
    tbody.setAttribute("data-orderstatus", orderObj["paid"]);

    let orderDate = new Date(orderObj["createdAt"] * 1000)
      .toISOString()
      .slice(0, 10)
      .replace("T", " ");
    let productCellHTML = orderObj["products"]
      .map((item) => `${item["title"]}<br>`)
      .join("\n");

    let rowHtml = `
    <td>${orderObj["createdAt"]}</td>
    <td> <span class="font-bold">${orderObj["user"]["name"]}</span> <br> ${
      orderObj["user"]["tel"]
    }</td>
    <td>${orderObj["user"]["address"]}</td>
    <td>${orderObj["user"]["email"]}</td>
    <td>${productCellHTML}</td>
    <td>${orderDate}</td>
    <td>
      <p class="orderProcess text-blue-500 cursor-pointer hover:font-bold text-center">
      ${orderObj["paid"] ? "已處理" : "未處理"}
      </p>
    
    </td>
    <td>
      <div class="deleteSingleOrder inline-block cursor-pointer bg-rose-600 text-white px-3 py-2 hover:font-bold">
        刪除
      </div>
    </td>
    `;
    tbody.innerHTML = rowHtml;

    return tbody;
  }

  let wholeBodyNodeArr = orderObjArr.map((item) => createTbodyNode(item));
  return wholeBodyNodeArr;
}

/*
根據tbodyNodeArr insert至table
@param tbodyNodeArr {Array}
*/
function renderOrderTable(tbodyNodeArr) {
  const orderTable = document.querySelector(".orderTable");

  let orgTbodyNodeArr = orderTable.querySelectorAll("tbody");
  if (orgTbodyNodeArr.length > 0) {
    orgTbodyNodeArr.forEach((item) => {
      orderTable.removeChild(item);
    });
  }
  // orderTable.removeChild();
  orderTable.append(...tbodyNodeArr);
}

function mainRender(orderRes) {
  let isOrderEmpty = orderRes["data"]["orders"].length === 0;

  if (isOrderEmpty) {
    orderTableSection = document.querySelector(".orderTableSection");
    orderTableSection.classList.add("hidden");

    orderManagement = document.querySelector(".orderManagement");
    noOrder = document.createElement("div");
    noOrder.classList.add("mx-auto", "text-3xl", "text-center");
    noOrder.textContent = `目前無訂單`;
    orderManagement.appendChild(noOrder);
  } else {
    let pieChartData = calOrderSales(orderRes);
    renderChart(pieChartData);

    let tbodyNodeArr = createWholeBodyNodeArr(orderRes);
    renderOrderTable(tbodyNodeArr);
  }
}

async function main() {
  let orderRes = await pullOrder();
  mainRender(orderRes);
}

/*------------------------------------功能與監聽--------------------------------------*/

async function deleteSingleOrder(orderID) {
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  let orderRes = await axios.delete(`${domainUrl}/orders/${orderID}`, config);
  document.querySelector(".fullSpinner").classList.toggle("hidden");

  mainRender(orderRes);
}

async function modOrderStatus(orderID, orderStatus) {
  let reqBody = {
    data: {
      id: orderID,
      paid: orderStatus,
    },
  };

  document.querySelector(".fullSpinner").classList.toggle("hidden");
  let orderRes = await axios.put(`${domainUrl}/orders`, reqBody, config);
  document.querySelector(".fullSpinner").classList.toggle("hidden");

  mainRender(orderRes);
}

async function deleteAllOrder() {
  document.querySelector(".fullSpinner").classList.toggle("hidden");
  let orderRes = await axios.delete(`${domainUrl}/orders/`, config);
  document.querySelector(".fullSpinner").classList.toggle("hidden");

  mainRender(orderRes);
}

function addClickDeleteSingleOrder() {
  const orderTable = document.querySelector(".orderTable");
  orderTable.addEventListener("click", function (e) {
    let current = e.target;
    if (current.classList.contains("deleteSingleOrder")) {
      let orderid = current.closest("tbody").getAttribute("data-orderid");
      deleteSingleOrder(orderid);
    }
  });
}

function addClickModOrderStatus() {
  const orderTable = document.querySelector(".orderTable");
  orderTable.addEventListener("click", function (e) {
    let current = e.target;
    if (current.classList.contains("orderProcess")) {
      let orderid = current.closest("tbody").getAttribute("data-orderid");
      let orderstatus =
        current.closest("tbody").getAttribute("data-orderstatus") === "true";
      orderstatus = !orderstatus;
      modOrderStatus(orderid, orderstatus);
    }
  });
}

function addClickDeleteAllOrder() {
  const orderTable = document.querySelector(".deleteAllOrder");
  orderTable.addEventListener("click", function (e) {
    deleteAllOrder();
  });
}

main();
addClickDeleteSingleOrder();
addClickModOrderStatus();
addClickDeleteAllOrder();
