import * as THREE from '../threejs/three.module.js';
import { STLLoader } from '../threejs/STLLoader.js';
//import { OrbitControls } from '../threejs/OrbitControls.js';

let canvasCount = 0;
let camera;
let fov = 10;
let data;
let itemsPerPage = 3;
let currentPage = 1;
let intervalId;
let stlPaths = {};
let dataIndexs = {};

document.addEventListener("DOMContentLoaded", function () {
  data = [
    {
      part: '/Models/335853GX_Rev6.stl',
      name: '335853GX',
      view: 1.5,
      fabricated: 10,
      shipped: 11,
      inventoryToPaint: 12,
      PaintedInventory: 13,
      request: 100,
      delivered: 30
    },
    {
      part: '/Models/340010G1_G100_Rev91.stl',
      name: '340010G1_G100',
      view: 5,
      fabricated: 21,
      shipped: 22,
      inventoryToPaint: 23,
      PaintedInventory: 24,
      request: 50,
      delivered: 25
    },
    {
      part: '/Models/340749G3_ASM_Rev8 OK.stl',
      name: '340749G3_ASM',
      view: 4,
      fabricated: 31,
      shipped: 32,
      inventoryToPaint: 33,
      PaintedInventory: 34,
      request: 35,
      delivered: 10
    },
    {
      part: '/Models/345066G1_G100_ASM_Rev4.stl',
      name: '345066G1_G100',
      view: 4,
      fabricated: 41,
      shipped: 42,
      inventoryToPaint: 43,
      PaintedInventory: 44,
      request: 45,
      delivered: 20
    },
    {
      part: '/Models/example3.stl',
      name: '340010G1_G194',
      view: 4,
      fabricated: 51,
      shipped: 52,
      inventoryToPaint: 53,
      PaintedInventory: 54,
      request: 55,
      delivered: 50
    },
    {
      part: '/Models/example4.stl',
      name: '340410G1_G112',
      view: 4,
      fabricated: 51,
      shipped: 52,
      inventoryToPaint: 53,
      PaintedInventory: 54,
      request: 55,
      delivered: 50
    },
    {
      part: '/Models/example5.stl',
      name: '360020G1_G996',
      view: 4,
      fabricated: 51,
      shipped: 52,
      inventoryToPaint: 53,
      PaintedInventory: 54,
      request: 55,
      delivered: 50
    },
  ];

  data.forEach((item, index) => {
    if(index < itemsPerPage){
      loadSTL(item.part, index);
    }else{
      stlPaths[data[index].name] = item.part;
      dataIndexs[data[index].name] = index;
      emptyFiles(index);
    }
    //loadSTL(item.part, index);
  });
  updatePagination();
  startPaginationInterval();

});

window.loadSTL = function (stlPatch, dataIndex, view) {
  //console.log("orden normal: " + dataIndex);
  if (stlPatch) {
    let loader = new STLLoader();

    loader.load(stlPatch, (model) => {
      //console.log("orden alterado: " + dataIndex);
      const newObject = new THREE.Mesh(
        model,
        new THREE.MeshLambertMaterial({ color: 0x5e6160 })
      );
      console.log();
      newObject.scale.set(0.001, 0.001, 0.001);
      newObject.rotation.x = -Math.PI / 2;
      var centroDelModelo = calcularCentroDelModelo(newObject);
      newObject.position.set(-centroDelModelo.x, -centroDelModelo.y, -centroDelModelo.z);
      camera = new THREE.PerspectiveCamera(10, 10 / 10, 1, 15);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xffffff, 2, 15);
      scene.background = new THREE.Color(0xffffff);
      scene.add(new THREE.AmbientLight(0xffffff));
      addShadowedLight(1, 1, 1, 0xffffff, 1.35, scene);
      addShadowedLight(0.5, 1, -1, 0xffffff, 1, scene);

      const newRenderer = new THREE.WebGLRenderer();
      scene.add(newObject);

      function animateNew() {
        requestAnimationFrame(animateNew);
        newRenderer.render(scene, camera);

        function renderNew() {
          var timer = Date.now() * 0.0005;
          camera.position.x = Math.cos(timer) * 5;
          camera.position.z = Math.sin(timer) * 5;
          camera.lookAt(scene.position);
          newRenderer.render(scene, camera);
        }
        renderNew()
      }
      animateNew();

      const NrendererWidth = 355;
      const NrendererHeight = 295;
      newRenderer.setSize(NrendererWidth, NrendererHeight);
      agregarFilaATabla(newRenderer, dataIndex);
    });
  }
  stlPaths[data[dataIndex].name] = stlPatch;
  dataIndexs[data[dataIndex].name] = dataIndex;
}

window.agregarFilaATabla = function (newRenderer, dataIndex) {
  const tableBody = document.querySelector('tbody');
  const newRow = document.createElement('tr');
  newRow.setAttribute('data-name', data[dataIndex].name);
  let rendererCell;

  if (newRenderer) {
    rendererCell = document.createElement('td');
    rendererCell.classList.add('td_dat');
    rendererCell.appendChild(newRenderer.domElement);
    const nameElement = document.createElement('div');
    nameElement.textContent = data[dataIndex].name;
    nameElement.style.textAlign = 'center';
    nameElement.style.position = 'relative';
    nameElement.style.fontFamily = 'Lato, sans-serif';
    nameElement.style.fontSize = '30px';
    rendererCell.appendChild(nameElement);
    newRow.appendChild(rendererCell);

    const formData = {
      fabricated: data[dataIndex].fabricated,
      shipped: data[dataIndex].shipped,
      inventoryToPaint: data[dataIndex].inventoryToPaint,
      paintedInventory: data[dataIndex].PaintedInventory,
      request: data[dataIndex].request,
      delivered: data[dataIndex].delivered,
      advance: (data[dataIndex].request - data[dataIndex].delivered)
    };

    newRow.innerHTML = `
          <td class="td_dat">${formData.fabricated}</td>
          <td class="td_dat">${formData.shipped}</td>
          <td class="td_dat">${formData.inventoryToPaint}</td>
          <td class="td_dat">${formData.paintedInventory}</td>
          <td class="td_dat">${formData.request}</td>
          <td class="td_dat">${formData.delivered}</td>
          <td class="td_dat">
          <span style="display: flex; flex-direction: row; position: relative; justify-content: center; font-size: 25px;">${((formData.delivered * 100) / formData.request).toFixed(2)}%</span>
          <div class="progress" style="height:40px">
            <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="${formData.delivered}" aria-valuemin="0" aria-valuemax="${formData.request}" style="width:${(formData.delivered * 100) / formData.request}%"></div>
            <div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="${(formData.request - formData.delivered)}" aria-valuemin="0" aria-valuemax="${formData.request}" style="width:${(100 - ((formData.delivered * 100) / formData.request))}%;"></div>
          </div>
          </td>`;

    newRow.classList.add('paged-row'); // Agrega la clase 'paged-row' a la nueva fila
    newRow.setAttribute('id', `row${tableBody.children.length + 1}`); // Asigna un id único a la fila      
    newRow.insertBefore(rendererCell, newRow.firstChild);
    //console.log(newRow);
    tableBody.appendChild(newRow);
    updatePagination();
    sortTableByName();
  }
}

window.emptyFiles = function (dataIndex) {
  const tableBody = document.querySelector('tbody');
  const newRow = document.createElement('tr');
  newRow.setAttribute('data-name', data[dataIndex].name);
  let rendererCell;
  rendererCell = document.createElement('td');
  rendererCell.classList.add('td_dat');
  //rendererCell.appendChild(newRenderer.domElement);
  // const nameElement = document.createElement('div');
  // nameElement.textContent = data[dataIndex].name;
  // nameElement.style.textAlign = 'center';
  // nameElement.style.position = 'relative';
  // nameElement.style.fontFamily = 'Lato, sans-serif';
  // nameElement.style.fontSize = '30px';
  // rendererCell.appendChild(nameElement);
  // newRow.appendChild(rendererCell);

  const formData = {
    fabricated: data[dataIndex].fabricated,
    shipped: data[dataIndex].shipped,
    inventoryToPaint: data[dataIndex].inventoryToPaint,
    paintedInventory: data[dataIndex].PaintedInventory,
    request: data[dataIndex].request,
    delivered: data[dataIndex].delivered,
    advance: (data[dataIndex].request - data[dataIndex].delivered)
  };

  newRow.innerHTML = `
        <td class="td_dat">${formData.fabricated}</td>
        <td class="td_dat">${formData.shipped}</td>
        <td class="td_dat">${formData.inventoryToPaint}</td>
        <td class="td_dat">${formData.paintedInventory}</td>
        <td class="td_dat">${formData.request}</td>
        <td class="td_dat">${formData.delivered}</td>
        <td class="td_dat">
        <span style="display: flex; flex-direction: row; position: relative; justify-content: center; font-size: 25px;">${((formData.delivered * 100) / formData.request).toFixed(2)}%</span>
        <div class="progress" style="height:40px">
        <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="${formData.delivered}" aria-valuemin="0" aria-valuemax="${formData.request}" style="width:${(formData.delivered * 100) / formData.request}%"></div>
        <div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="${(formData.request - formData.delivered)}" aria-valuemin="0" aria-valuemax="${formData.request}" style="width:${(100 - ((formData.delivered * 100) / formData.request))}%;"></div>
        </div>
        </td>`;

  newRow.classList.add('paged-row'); // Agrega la clase 'paged-row' a la nueva fila
  newRow.setAttribute('id', `row${tableBody.children.length + 1}`); // Asigna un id único a la fila      
  newRow.insertBefore(rendererCell, newRow.firstChild);
  //console.log(newRow);
  tableBody.appendChild(newRow);
  updatePagination();
  sortTableByName();
}

window.openEditModal = function () {
  const modal = document.getElementById('editModal');
  modal.style.display = 'block';
  const fovInput = document.getElementById('fov');
  fovInput.addEventListener('input', function () {
    const newFov = parseFloat(fovInput.value);
    if (camera) {
      camera.fov = newFov;
      camera.updateProjectionMatrix();
    }
  });
}

window.closeEditModal = function () {
  const modal = document.getElementById('editModal');
  modal.style.display = 'none';
}

window.saveChanges = function () {
  const fovInput = document.getElementById('fov');
  const newFov = parseFloat(fovInput.value);
  if (camera) {
    camera.fov = newFov;
    camera.updateProjectionMatrix();
  }
  closeEditModal();
}

function addShadowedLight(x, y, z, color, intensity, scene) {
  var directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(x, y, z)
  scene.add(directionalLight);
  directionalLight.castShadow = true;
}

function calcularCentroDelModelo(model) {
  var boundingBox = new THREE.Box3().setFromObject(model);
  var centro = new THREE.Vector3();
  boundingBox.getCenter(centro);
  return centro;
}

function updatePagination() {
  const tableRows = document.querySelectorAll('.paged-row');
  const totalPages = Math.ceil(tableRows.length / itemsPerPage);
  const paginationContainer = document.querySelector('.pagination');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageDiv = document.createElement('div');
    pageDiv.textContent = i;
    pageDiv.addEventListener('click', () => changePage(i));
    //Evita colocar los botones en pantalla pero aun existen para el control de la pagination
    //paginationContainer.appendChild(pageDiv);
  }

  setTimeout(() => {
    showPage(currentPage);
  }, 1500); // Retraso de 1 segundo (1000 milisegundos)

}

function startPaginationInterval() {
  intervalId = setInterval(() => {
    const tableRows = document.querySelectorAll('.paged-row');
    const totalPages = Math.ceil(tableRows.length / itemsPerPage);

    // Si currentPage es el último, reinicia a la primera página, de lo contrario, avanza a la siguiente página
    if (currentPage === totalPages) {
      currentPage = 1;
      //location.reload();
    } else {
      currentPage++;
    }

    updatePagination();
  }, 10000); // Cambia de página cada 10 segundos
}

function stopPaginationInterval() {
  clearInterval(intervalId);
}

function changePage(page) {
  currentPage = page;
  updatePagination();
  stopPaginationInterval();
  showPage(currentPage); // Asegurarse de que se muestren las filas de la página actual
}

function showPage(page) {
  const tableRows = document.querySelectorAll('.paged-row');
  tableRows.forEach((row, index) => {
    if (index < itemsPerPage * (page - 1) || index >= itemsPerPage * page) {
      row.style.display = 'none';
      removeCanvasFromRow(row);
    } else {
      row.style.display = 'table-row';
      addCanvasToRow(row);
    }
  });

  if (page === 1) {
    const firstPageRows = Array.from(tableRows).slice(0, itemsPerPage);
    firstPageRows.forEach(row => (row.style.display = 'table-row'));
    //firstPageRows.forEach(row => addCanvasToRow(row));
  }
}

let stlPath;
let dtaIndex;

function createCanvasRenderer() {
  if (!stlPath) {
    return null; // Si no hay stlPath definido, devuelve null
  }

  const newRenderer = new THREE.WebGLRenderer();
  newRenderer.domElement.classList.add('canvas-hidden');
  const NrendererWidth = 355;
  const NrendererHeight = 295;

  let loader = new STLLoader();
  loader.load(stlPath, (model) => {
    const newObject = new THREE.Mesh(
      model,
      new THREE.MeshLambertMaterial({ color: 0x5e6160 })
    );
    newObject.scale.set(0.001, 0.001, 0.001);
    newObject.rotation.x = -Math.PI / 2;

    var centroDelModelo = calcularCentroDelModelo(newObject);
    newObject.position.set(-centroDelModelo.x, -centroDelModelo.y, -centroDelModelo.z);

    camera = new THREE.PerspectiveCamera(10, 10 / 10, 1, 15);
    camera.position.set(3, 0.5, 3);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 2, 15);
    scene.background = new THREE.Color(0xffffff);
    scene.add(new THREE.AmbientLight(0xffffff));
    addShadowedLight(1, 1, 1, 0xffffff, 1.35, scene);
    addShadowedLight(0.5, 1, -1, 0xffffff, 1, scene);

    scene.add(newObject);

    function animateNew() {
      requestAnimationFrame(animateNew);
      newRenderer.render(scene, camera);

      function renderNew() {
        var timer = Date.now() * 0.0005;
        camera.position.x = Math.cos(timer) * 5;
        camera.position.z = Math.sin(timer) * 5;
        camera.lookAt(scene.position);
        newRenderer.render(scene, camera);
      }
      renderNew()
    }
    animateNew();
    newRenderer.setSize(NrendererWidth, NrendererHeight);
    newRenderer.domElement.classList.remove('canvas-hidden');
  });

  return newRenderer;
}

function addCanvasToRow(row) {
  const canvasCell = row.querySelector('td canvas');
  if (!canvasCell) {
    //console.log(row);
    const rendererCell = row.querySelector('td:first-child');
    const partName = row.getAttribute('data-name');
    stlPath = stlPaths[partName];
    dtaIndex = dataIndexs[partName];
    
    const newRenderer = createCanvasRenderer();
    rendererCell.appendChild(newRenderer.domElement);
    const nameElement = document.createElement('div');
    nameElement.textContent = partName;
    nameElement.style.textAlign = 'center';
    nameElement.style.position = 'relative';
    nameElement.style.fontFamily = 'Lato, sans-serif';
    nameElement.style.fontSize = '30px';
    rendererCell.appendChild(nameElement);
    // Obtén el nombre de la pieza asociada a esta fila
    //console.log(stlPaths);
    // Carga y renderiza la pieza en el nuevo canvas
    //loadSTL1(stlPath);
  }
}

function removeCanvasFromRow(row) {
  const canvasCell = row.querySelector('td canvas');
  const divCell = row.querySelector('td div');
  if (canvasCell) {
    divCell.remove();
    canvasCell.remove();
  }
}

function sortTableByName() {
  const table = document.getElementById('myTable');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const nameA = a.getAttribute('data-name').toUpperCase();
    const nameB = b.getAttribute('data-name').toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  tbody.innerHTML = '';

  rows.forEach(row => {
    tbody.appendChild(row);
  });
}

updatePagination();
sortTableByName();
