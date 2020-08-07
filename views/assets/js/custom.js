var listBusStop = []
var listBus = []
var tempListBus = []
var updateTrackingInterval = null
var selectStop = false
var pathMarker = []
var pathMarkerWithRoutID = {}
var isLoading = false

fetch('assets/others/response.json')
    .then(response => {
        return response.text()
    })
    .then(data => {
        listBusStop = JSON.parse(data)
        showBusIcon(stopIconSmall)
    });


var map = L.map('map').setView([10.773248480023952, 106.70059204101564], 16);
var lsMarker = []

L.tileLayer('https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}.png?key=ZjnF5DtrJH6EhRRFG4WN', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var stopIcon = L.icon({
    iconUrl: '/assets/images/busIcon.png',
    // shadowUrl: 'leaf-shadow.png',
    
    iconSize:     [30, 30], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


var stopIconSmall = L.icon({
    iconUrl: '/assets/images/busIcon.png',
    iconSize:     [10, 10], 
    iconAnchor:   [22, 22],
    popupAnchor:  [-3, -76]
});

function drawBusIcon (lat, lng, StopId, iconType) {
    var marker = L.marker([lat, lng], {icon: iconType})
    
    marker.addTo(map).on('click', function() {
        makePredict(StopId)
    })

    lsMarker.push(marker)
}

function showBusIcon(iconType) {
    listBusStop.forEach(element => {
        drawBusIcon(element.Lat, element.Lng, element.StopId, iconType)
    });
}

function clearAllMarker() {
    lsMarker.forEach(p=> {
        map.removeLayer(p)
    })
}


function openInfoTab() {
    var classInfo = document.querySelector('.info').classList
    document.querySelector('.close-btn').classList.add('active')
    if (classInfo.value.indexOf('active') === -1)
        classInfo.add('active')
}

function makePredict(busId) {
    openInfoTab()

    if (updateTrackingInterval) clearInterval(updateTrackingInterval)

    getPredict(busId)
    updateTrackingInterval = setInterval(function() {
        getPredict(busId)
    }, 30000)
}


function closeInfoTab() {
    document.querySelector('.info').classList.remove('active')
    document.querySelector('.close-btn').classList.remove('active')

}


function getPredict(stopId) {
    selectStop = true
    viewWaitingTime()

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", stopId);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("/getStopInfo", requestOptions)
    .then(response => response.text())
    .then(result => {
        showResult(JSON.parse(result))
    })
    .catch(error => console.log('error', error));
}


function showResult(data) {
    document.querySelector('.table-body').innerHTML = ''
    

    data.forEach(p => {
        // console.log(p)
        var upNext = null
        var next = null

        var busId = p.rNo;
        var destination = p.rN;


        if (p.arrs[0]) {
            upNext = {
                min: Math.floor(p.arrs[0].t/60),
                len: Math.floor(p.arrs[0].d),
                v: Math.floor(p.arrs[0].s)
            }
        } 
    
        if (p.arrs[1]) {
            next = {
                min: Math.floor(p.arrs[1].t/60),
                len: Math.floor(p.arrs[1].d),
                v: Math.floor(p.arrs[1].s)
            }
        } 
        
        var routeInforHTML = document.createElement('div')
        routeInforHTML.setAttribute('class', 'w-50')
        routeInforHTML.innerHTML = `
            <div class="info-body-value-main">${busId}</div>
            <span>${destination}</span>
        `

        var upNextHTML = document.createElement('div')
        upNextHTML.setAttribute('class', 'w-25 text-center')
        upNextHTML.innerHTML = `
            <div class="info-body-value-main">${upNext?(upNext.min < 1?'<1':upNext.min) + ' phut':'-'}</div>
            <div>
                <span>${upNext?upNext.len + 'm':'-'}</span>
                <span>${upNext?upNext.v + 'km/h':'-'}</span>
            </div>
        `

        var nextHTML = document.createElement('div')
        nextHTML.setAttribute('class', 'w-25 text-center')
        nextHTML.innerHTML = `
            <div class="info-body-value-main">${next?(next.min < 1? '<1':next.min) + ' phut':'-'}</div>
            <div>
                <span>${next?next.len + 'm':'-'}</span>
                <span>${next?next.v + 'km/h':'-'}</span>
            </div>
        `

        var aRowValue = document.createElement('div')
        aRowValue.classList.add('predict-item')
        aRowValue.appendChild(routeInforHTML)
        aRowValue.appendChild(upNextHTML)
        aRowValue.appendChild(nextHTML)

        document.querySelector('.table-body').appendChild(aRowValue)


        document.querySelector('.status').innerHTML = 'Vua cap nhat'
        document.querySelector('.status').classList.remove('loading')

        setTimeout(function() {
            document.querySelector('.status').innerHTML = 'Xin cho...'
            document.querySelector('.status').classList.add('loading')
        }, 5000)
    })
}

function getListBus() {
    if (updateTrackingInterval) clearInterval(updateTrackingInterval)

    document.querySelector('.navs-content.active').classList.remove('active')
    document.querySelector('#bus-list').classList.add('active')
    document.querySelector('.navs-title.active').classList.remove('active')
    document.querySelectorAll('.navs-title')[0].classList.add('active')


    if (listBus.length > 0) 
        return

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
    fetch("/getListBus", requestOptions)
    .then(response => response.text())
    .then(result => {
        listBus = JSON.parse(result)
        showListBus(listBus)
    })
    .catch(error => console.log('error', error));
    
}

function showListBus (listBusss) {

    var list = document.querySelector('.list-bus')
    list.innerHTML = ""

    listBusss.forEach(p=>{
        var div = document.createElement('div')
        div.innerHTML = `
            <div id="busId-${p.RouteId}" class="list-bus-item" onclick="openRouteOnMap(event)">
                <div class="item-circle">
                    ${p.RouteNo}
                </div>
                <div class="item-name">
                    ${p.RouteName}
                </div>
            </div>
        `
        list.appendChild(div)
    })
}

function viewWaitingTime() {
    if (!selectStop) {
        document.querySelector('.status.loading').innerText = 'Chon tram de xem'
    }
    else {
        document.querySelector('.predict-table').classList.add('active')
    }
    document.querySelector('.navs-content.active').classList.remove('active')
    document.querySelector('.navs-title.active').classList.remove('active')
    document.querySelectorAll('.navs-title')[1].classList.add('active')
    document.querySelector('#predict-waiting').classList.add('active')
}

function openRouteOnMap(event) {
    if(isLoading) return
    isLoading = true

    var node = event.currentTarget.parentNode
    var routeID = event.currentTarget.id.split('-')[1]
    if (node.children.length > 1) {

        if (node.children[1].className.indexOf('active') > - 1) {
            node.children[1].classList.remove('active')
            node.children[1].style.height = "0px"
            clearPath(routeID,'go')
            clearPath(routeID,'back')
        }
        else {
            node.children[1].classList.add('active')
            node.children[1].style.height = node.children[1].firstElementChild.clientHeight + 30 + 'px'
            drawPath(routeID, pathMarkerWithRoutID[routeID+'go'][1], 'go')
            drawPath(routeID, pathMarkerWithRoutID[routeID+'back'][1], 'back')
        }

        isLoading = false
        return
    }


    getRouteInfo(routeID, node)
    drawRouteOnMap(routeID)
}

function getRouteInfo(RouteId, node) {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", RouteId);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("/getRouteInfo", requestOptions)
    .then(response => response.text())
    .then(result => {
        makeInfoHTML(JSON.parse(result), node)
    })
    .catch(error => console.log('error', error));
}

function makeInfoHTML (result, node) {
    var routeInfo = `
        <div class="route-info active">
            <div class="route-detail">
                <span class="text-comfor">Lượt đi:</span> ${result.OutBoundDescription}
                <div class="route-go"></div>
                <span class="text-comfor">Lượt về:</span> ${result.InBoundDescription}
                <div class="route-back"></div>
                <span class="text-comfor">Thoi gian hoat dong:</span> ${result.OperationTime}
                <br>
                <span class="text-comfor">So chuyen:</span> ${result.TimeOfTrip}
                <br>
                <span class="text-comfor">Gia ve:</span> ${result.Tickets}
                <br>
                <span class="text-comfor">So ghe ngoi:</span> ${result.NumOfSeats}
            </div>
        </div>
    `
   
    var div = document.createElement('div')
    div.innerHTML = routeInfo
    div = div.firstElementChild
    node.appendChild(div)

    setTimeout(function () {
        div.style.height = div.firstElementChild.clientHeight + 30 + 'px'
        isLoading = false
    }, 1)
}

function drawRouteOnMap(routeID) {
    getVarsByRoute(routeID)
}

function getVarsByRoute(routeID) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", routeID);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("/getVarsByRoute", requestOptions)
    .then(response => response.text())
    .then(result => {
        hanldProcessVars(routeID, JSON.parse(result))
    })
    .catch(error => console.log('error', error));
    
}

function hanldProcessVars(routeID, result) {
    getPathsByVar(routeID, result[0].RouteVarId, 'go')
    getPathsByVar(routeID, result[1].RouteVarId, 'back')
}

function getPathsByVar(routeID, vars, type) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", routeID);
    urlencoded.append("var", vars);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("/getPathsByVar", requestOptions)
    .then(response => response.text())
    .then(result => {
        // console.log(result)
        processLatsLngs(routeID, JSON.parse(result), type)
    })
    .catch(error => console.log('error', error));

}

function processLatsLngs(routeID, result, type) {
    var len = result.lat.length
    var latlngs = []
    for (i = 0; i < len; i++) {
        latlngs.push([result.lat[i], result.lng[i]])
    }

    drawPath(routeID, latlngs, type)
}

function drawPath(routeID, latlngs, type) {
    var polyline = L.polyline(latlngs, {color: `${type === 'go'? 'red':'blue'}`})
    polyline.addTo(map)
    // pathMarker.push(polyline)
    pathMarkerWithRoutID[routeID + type] = [polyline, latlngs]
}

function clearAllPath() {
    pathMarker.forEach(p=> {
        map.removeLayer(p)
    })
}

function clearPath(routeID, type) {
    map.removeLayer(pathMarkerWithRoutID[routeID + type][0])
}

function filtBus() {
    busNo = document.querySelector('#search-bus-id').value
    if (busNo === "") {
        showListBus(listBus)
        return
    }
    tempListBus = []
    listBus.forEach (p=> {
        if (p.RouteNo.includes(busNo))
            tempListBus.push(p)
    })

    showListBus(tempListBus)
}


getListBus()

map.on('zoom', function() {
    if (map.getZoom() > 15) {
        clearAllMarker()
        showBusIcon(stopIcon)
    }
    else {
        clearAllMarker()
        showBusIcon(stopIconSmall)

    }
})



// map.on('click', function(e) {
//     console.log(e.latlng.lat,e.latlng.lng);
// })