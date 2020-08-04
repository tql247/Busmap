var listBusStop = []
var updateTrackingInterval = null

fetch('assets/others/response.json')
    .then(response => {
        return response.text()
    })
    .then(data => {
        listBusStop = JSON.parse(data)
        listBusStop.forEach(element => {
            drawBusIcon(element.Lat, element.Lng, element.StopId)
        });
    });


var map = L.map('map').setView([10.771254010200892, 106.6937255859375], 15);


L.tileLayer('https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}.png?key=ZjnF5DtrJH6EhRRFG4WN', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var busICon = L.icon({
    iconUrl: '/assets/images/busIcon.png',
    // shadowUrl: 'leaf-shadow.png',
    
    iconSize:     [30, 30], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


function drawBusIcon (lat, lng, busId) {
    L.marker([lat, lng], {icon: busICon}).addTo(map).on('click', function() {
        openInfoTab(busId)
    })
}


function openInfoTab(busId) {
    var classInfo = document.querySelector('.info').classList
    if (classInfo.value.indexOf('active') > -1)
        classInfo.add('active')
    
    getPredict(busId)
    setInterval(function() {
        getPredict(busId)
    }, 5000)
}


function closeInfoTab() {
    var classInfo = document.querySelector('.info').classList
    classInfo.remove('active')

}


function getPredict(idStop) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("id", idStop);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("/getRoute", requestOptions)
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
        
        var routeInforHTML = document.createElement('td')
        routeInforHTML.innerHTML = `
            <td class="info-body-value">
                <div class="info-body-value-main">${busId}</div>
                <span>${destination}</span>
            </td>
        `

        var upNextHTML = document.createElement('td')
        upNextHTML.setAttribute('class', 'info-body-value text-center')
        upNextHTML.innerHTML = `
            <div class="info-body-value-main">${upNext?(upNext.min < 1?'<1':upNext.min) + ' phut':'-'}</div>
            <div>
                <span>${upNext?upNext.len:'-'}m</span>
                <span>${upNext?upNext.v:'-'}km/h</span>
            </div>
        `

        var nextHTML = document.createElement('td')
        nextHTML.setAttribute('class', 'info-body-value text-center')
        nextHTML.innerHTML = `
            <div class="info-body-value-main">${next?(next.min < 1? '<1':next.min) + ' phut':'-'}</div>
            <div>
                <span>${next?next.len + ' m':'-'}</span>
                <span>${next?next.v + ' km/h':'-'}</span>
            </div>
        `

        var aRowValue = document.createElement('tr')
        aRowValue.appendChild(routeInforHTML)
        aRowValue.appendChild(upNextHTML)
        aRowValue.appendChild(nextHTML)

        document.querySelector('.table-body').appendChild(aRowValue)


        document.querySelector('.status').innerHTML = 'Vua cap nhat'
        document.querySelector('.status').classList.remove('loading')

        setTimeout(function() {
            document.querySelector('.status').innerHTML = 'Loading...'
            document.querySelector('.status').classList.add('loading')
        }, 2000)
    })
}

// map.on('click', function(e) {
//     console.log(e.latlng.lat,e.latlng.lng);
// })