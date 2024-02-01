import * as THREE from '../threejs/three.module.js';
import { STLLoader } from '../threejs/STLLoader.js';
//import { OrbitControls } from '../threejs/OrbitControls.js';

let canvasCount = 1;
let camera;
let fov = 10;
// let newRenderer;

window.loadSTL = function (onLoadCallback) {
  const fileInput = document.getElementById('fileInput');
  //const enviar = document.getElementById("Button_files");
  const selectedFile = fileInput.files[0];
  let fov = 10;
  let originalFov;
  let originalMaterialColor;

  if (selectedFile) {
    let loader = new STLLoader();
    loader.load(URL.createObjectURL(selectedFile), (model) => {
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

      const NrendererWidth = 250;
      const NrendererHeight = 190;
      newRenderer.setSize(NrendererWidth, NrendererHeight);

      const editButton = document.createElement('button');
      editButton.className = 'button_edit';
      editButton.textContent = '<i class="fa-solid fa-pen-to-square"></i>';

      //canvasCount++;
      fileInput.value = "";
      onLoadCallback(newRenderer, editButton);
    });
  }
}

window.agregarFilaATabla = function (formData) {
  const tableBody = document.querySelector('tbody');
  const newRow = document.createElement('tr');
  let rendererCell;

  loadSTL((newRenderer) => {
    if (newRenderer) {
      rendererCell = document.createElement('td');
      rendererCell.appendChild(newRenderer.domElement);
      const nameElement = document.createElement('div');
      nameElement.textContent = formData.name;
      nameElement.style.textAlign = 'center';
      rendererCell.appendChild(nameElement);
      newRow.appendChild(rendererCell);
    }

    newRow.innerHTML = `
        <td>${formData.name}</td>
        <td>${formData.fabricated}</td>
        <td>${formData.shipped}</td>
        <td>${formData.inventoryToPaint}</td>
        <td>${formData.paintedInventory}</td>
        <td>
            <button class="button_edit" onclick="openEditModal()"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="button_delet"><i class="fa-solid fa-trash"></i></button>
        </td>`;
    newRow.insertBefore(rendererCell, newRow.firstChild);
    tableBody.appendChild(newRow);
  });
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
