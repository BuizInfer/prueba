import * as THREE from '../threejs/three.module.js';
import { STLLoader } from '../threejs/STLLoader.js';
//import { OrbitControls } from '../threejs/OrbitControls.js';


function addShadowedLight(x, y, z, color, intensity, scene) {

    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z)
    scene.add(directionalLight);

    directionalLight.castShadow = true;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calcularCentroDelModelo(model) {
    var boundingBox = new THREE.Box3().setFromObject(model);
    var centro = new THREE.Vector3();
    boundingBox.getCenter(centro);
    return centro;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Definir loadSTL en el ámbito global o adjuntarlo al objeto window
let canvasCount = 1; // Contador para llevar un seguimiento del número de canvas renderizados
let bandera = 0;
let bandera_div = 0;
let bandera_table1 = 0;
let bandera_table2 = 0;
window.loadSTL = function () {
    // Obtener el input de archivo
    const fileInput = document.getElementById('stlFileInput');
    const enviar = document.getElementById("Button_files"); // Agregado para obtener el botón
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

            // Calcular el centro del modelo
            var centroDelModelo = calcularCentroDelModelo(newObject);

            // Posicionar el objeto en el centro del plano
            newObject.position.set(-centroDelModelo.x, -centroDelModelo.y, -centroDelModelo.z);

            //init();

            //window.addEventListener('wheel', onDocumentMouseWheel, false);
            window.addEventListener('keydown', onDocumentKeyDown, false);

            // Crear un nuevo contenedor para el renderer
            const container = document.createElement('div');
            container.id = `canvasContainer${canvasCount}`;
            document.body.appendChild(container);
            container.className = `Canvas${canvasCount}`;
            container.style.width = `260px`;
            container.style.height = `190px`;
            container.style.position = 'absolute';
            container.style.left = '30px';
            if ((canvasCount - 5) % 4 == 0 && canvasCount >= 5) {
                container.style.top = `${(365 + bandera_div) + (canvasCount-1) * 230}px`;
                bandera_div += 200;
            }else if((canvasCount - 5) % 4 != 0 && canvasCount > 5){
                container.style.top = `${(165 + bandera_div) + (canvasCount-1) * 230}px`;
            }else{
                container.style.top = `${165 + (canvasCount-1) * 230}px`;
            }            
            //container.style.top = `${165 + (canvasCount-1) * 230}px`;
            container.style.display = 'flex';
            container.style.alignItems = 'flex-end';
            container.style.justifyContent = 'center';

            const camera = new THREE.PerspectiveCamera(10, 10 / 10, 1, 15);
            camera.position.set(3, 0.5, 3);

            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0xffffff, 2, 15);
            scene.background = new THREE.Color(0xffffff);
            scene.add(new THREE.AmbientLight(0xffffff));
            addShadowedLight(1, 1, 1, 0xffffff, 1.35, scene);
            addShadowedLight(0.5, 1, -1, 0xffffff, 1, scene);

            const newRenderer = new THREE.WebGLRenderer();
            scene.add(newObject);

            // Animar el nuevo escenario
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

            const fileNameElement = document.createElement('p');
            const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, ""); // Obtener el nombre sin la extensión
            fileNameElement.textContent = fileNameWithoutExtension;
            fileNameElement.style.fontFamily = 'Roboto', 'sans-serif';
            container.appendChild(newRenderer.domElement);
            container.appendChild(fileNameElement);

            ///
            // Crear botones de control
            const controlsContainer = document.createElement('div');
            controlsContainer.style.display = 'flex';
            controlsContainer.style.marginTop = '10px'; // Ajusta el margen según sea necesario
            container.appendChild(controlsContainer);

            // Botón Guardar
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', openEditModal);
            controlsContainer.appendChild(editButton);

            ///

            const NrendererWidth = 250;
            const NrendererHeight = 190;
            newRenderer.setSize(NrendererWidth, NrendererHeight);
            newRenderer.domElement.style.position = 'absolute';
            newRenderer.domElement.style.left = '30px';
            if ((canvasCount - 5) % 4 == 0 && canvasCount >= 5) {
                newRenderer.domElement.style.top = `${(325 + bandera) + (canvasCount-1) * 230}px`;
                bandera += 200;
            }else if((canvasCount - 5) % 4 != 0 && canvasCount > 5){
                newRenderer.domElement.style.top = `${(125 + bandera) + (canvasCount-1) * 230}px`;
            }else{
                newRenderer.domElement.style.top = `${125 + (canvasCount-1) * 230}px`;
            }
            // newRenderer.domElement.style.top = `${125 + (canvasCount-1) * 230}px`;
            newRenderer.domElement.style.margin = '0';
            document.body.appendChild(newRenderer.domElement);

            // Función para abrir la ventana de edición
            function openEditModal() {
                // Guardar los valores originales
                originalFov = fov;
                originalMaterialColor = newObject.material.color.clone();

                const modalContainer = document.createElement('div');
                modalContainer.className = 'edit-modal-container';
                modalContainer.id = `canvasTable${tableDiv}`;
                modalContainer.style.position = 'fixed';
                modalContainer.style.top = `${230 + container.id * 230}px`;
                modalContainer.style.left = '320px';
                modalContainer.style.backgroundColor = '#fff'; // Puedes ajustar el color de fondo según sea necesario
                modalContainer.style.padding = '20px';
                modalContainer.style.border = '2px solid #000'; // Puedes ajustar el color del borde según sea necesario
                modalContainer.style.borderRadius = '8px';
                //modalContainer.style.userSelect = 'none';
                modalContainer.style.height = '6%';

                // Agregar nombre de la pieza en la parte superior izquierda
                const pieceNameElement = document.createElement('p');
                pieceNameElement.textContent = fileNameWithoutExtension;
                pieceNameElement.style.position = 'absolute';
                pieceNameElement.style.top = '-10px';
                pieceNameElement.style.left = '10px';
                //pieceNameElement.style.fontWeight = 'bold';
                pieceNameElement.style.fontFamily = 'Roboto', 'sans-serif';
                modalContainer.appendChild(pieceNameElement);

                // Permitir que el contenedor modal se pueda mover
                //let isDragging = false;
                //let offsetX, offsetY;

                //modalContainer.addEventListener('mousedown', startDrag);

                // function startDrag(e) {
                //     isDragging = true;
                //     offsetX = e.clientX - modalContainer.getBoundingClientRect().left;
                //     offsetY = e.clientY - modalContainer.getBoundingClientRect().top;

                //     window.addEventListener('mousemove', drag);
                //     window.addEventListener('mouseup', stopDrag);
                // }

                // function drag(e) {
                //     if (isDragging) {
                //         modalContainer.style.left = e.clientX - offsetX + 'px';
                //         modalContainer.style.top = e.clientY - offsetY + 'px';
                //     }
                // }

                // function stopDrag() {
                //     isDragging = false;
                //     window.removeEventListener('mousemove', drag);
                //     window.removeEventListener('mouseup', stopDrag);
                // }

                // Botones y elementos de la ventana de edición en la parte inferior
                const buttonsContainer = document.createElement('div');
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.justifyContent = 'space-between';
                modalContainer.appendChild(buttonsContainer);

                // Botones y elementos de la ventana de edición
                const zoomInButton = createButton('Alejar', () => changeFov(0.5));
                zoomInButton.style.position = 'relative';
                zoomInButton.style.top = '30%';
                const zoomOutButton = createButton('Acercar', () => changeFov(-0.5));
                zoomOutButton.style.position = 'relative';
                zoomOutButton.style.top = '30%';
                const colorPicker = createColorPicker();
                colorPicker.style.position = 'relative';
                colorPicker.style.top = '30%';
                const saveButton = createButton('Guardar', saveConfiguration);
                saveButton.style.position = 'relative';
                saveButton.style.top = '30%';
                const cancelButton = createButton('Cancelar', closeEditModal);
                cancelButton.style.position = 'relative';
                cancelButton.style.top = '30%';

                // Agregar elementos al contenedor modal
                modalContainer.appendChild(zoomInButton);
                modalContainer.appendChild(zoomOutButton);
                modalContainer.appendChild(colorPicker);
                modalContainer.appendChild(saveButton);
                modalContainer.appendChild(cancelButton);

                // Agregar el contenedor modal a la página
                document.body.appendChild(modalContainer);
            }
            
            // Incrementar el contador de canvas
            canvasCount++;

            // Después de realizar acciones necesarias con el archivo, limpiamos el input
            fileInput.value = "";
            // También deshabilitamos el botón nuevamente
            enviar.disabled = true;

            // Función para abrir la ventana de edición
            function openEditModal() {
                // Guardar los valores originales
                originalFov = fov;
                originalMaterialColor = newObject.material.color.clone();

                const modalContainer = document.createElement('div');
                modalContainer.className = 'edit-modal-container';
                modalContainer.style.position = 'fixed';
                modalContainer.style.top = '50%';
                modalContainer.style.left = '50%';
                modalContainer.style.transform = 'translate(-50%, -50%)'; // Centra el contenedor
                modalContainer.style.backgroundColor = '#fff'; // Puedes ajustar el color de fondo según sea necesario
                modalContainer.style.padding = '20px';
                modalContainer.style.border = '2px solid #000'; // Puedes ajustar el color del borde según sea necesario
                modalContainer.style.borderRadius = '8px';
                //modalContainer.style.userSelect = 'none';
                modalContainer.style.height = '6%';
                

                // Agregar nombre de la pieza en la parte superior izquierda
                const pieceNameElement = document.createElement('p');
                pieceNameElement.textContent = fileNameWithoutExtension;
                pieceNameElement.style.position = 'absolute';
                pieceNameElement.style.top = '-10px';
                pieceNameElement.style.left = '10px';
                //pieceNameElement.style.fontWeight = 'bold';
                pieceNameElement.style.fontFamily = 'Roboto', 'sans-serif';
                modalContainer.appendChild(pieceNameElement);

                // Permitir que el contenedor modal se pueda mover
                //let isDragging = false;
                //let offsetX, offsetY;

                //modalContainer.addEventListener('mousedown', startDrag);

                // function startDrag(e) {
                //     isDragging = true;
                //     offsetX = e.clientX - modalContainer.getBoundingClientRect().left;
                //     offsetY = e.clientY - modalContainer.getBoundingClientRect().top;

                //     window.addEventListener('mousemove', drag);
                //     window.addEventListener('mouseup', stopDrag);
                // }

                // function drag(e) {
                //     if (isDragging) {
                //         modalContainer.style.left = e.clientX - offsetX + 'px';
                //         modalContainer.style.top = e.clientY - offsetY + 'px';
                //     }
                // }

                // function stopDrag() {
                //     isDragging = false;
                //     window.removeEventListener('mousemove', drag);
                //     window.removeEventListener('mouseup', stopDrag);
                // }

                // Botones y elementos de la ventana de edición en la parte inferior
                const buttonsContainer = document.createElement('div');
                buttonsContainer.style.display = 'flex';
                buttonsContainer.style.justifyContent = 'space-between';
                modalContainer.appendChild(buttonsContainer);

                // Botones y elementos de la ventana de edición
                const zoomInButton = createButton('Alejar', () => changeFov(0.5));
                zoomInButton.style.position = 'relative';
                zoomInButton.style.top = '30%';
                const zoomOutButton = createButton('Acercar', () => changeFov(-0.5));
                zoomOutButton.style.position = 'relative';
                zoomOutButton.style.top = '30%';
                const colorPicker = createColorPicker();
                colorPicker.style.position = 'relative';
                colorPicker.style.top = '30%';
                const saveButton = createButton('Guardar', saveConfiguration);
                saveButton.style.position = 'relative';
                saveButton.style.top = '30%';
                const cancelButton = createButton('Cancelar', closeEditModal);
                cancelButton.style.position = 'relative';
                cancelButton.style.top = '30%';

                // Agregar elementos al contenedor modal
                modalContainer.appendChild(zoomInButton);
                modalContainer.appendChild(zoomOutButton);
                modalContainer.appendChild(colorPicker);
                modalContainer.appendChild(saveButton);
                modalContainer.appendChild(cancelButton);

                // Agregar el contenedor modal a la página
                document.body.appendChild(modalContainer);
            }

            // Función para guardar la configuración
            function saveConfiguration() {
                // Aquí puedes guardar la configuración según tus necesidades
                const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
                console.log('Configuración guardada:', fileNameWithoutExtension, ' - FOV:', fov);
                const modalContainer = document.querySelector('.edit-modal-container');
                if (modalContainer) {
                    modalContainer.remove();
                }
            }            

            // Función para cerrar la ventana de edición
            function closeEditModal() {
                const modalContainer = document.querySelector('.edit-modal-container');
                if (modalContainer) {
                    // Restaurar los valores originales al cerrar la ventana
                    changeFov(originalFov);
                    newObject.material.color.copy(originalMaterialColor);

                    modalContainer.remove();
                }
            }

            // Función para crear botones
            function createButton(text, onClick) {
                const button = document.createElement('button');
                button.textContent = text;
                button.addEventListener('click', onClick);
                return button;
            }

            // Función para cambiar el campo de visión
            function changeFov(delta) {
                // Cambiar el campo de visión basado en el delta
                fov += delta;

                // Limitar el rango del campo de visión
                fov = Math.max(0, Math.min(15, fov));

                // Actualizar la cámara con el nuevo campo de visión
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }

            // Función para crear un selector de color
            function createColorPicker() {
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = '#5e6160'; // Color predeterminado
                colorPicker.addEventListener('input', () => changeMeshColor(colorPicker.value));
                return colorPicker;
            }

            // Función para cambiar el color del renderizado del mesh
            function changeMeshColor(color) {
                newObject.material.color.set(color);
            }

            function onDocumentMouseWheel(event) {
                // Cambiar el campo de visión basado en el desplazamiento de la rueda del mouse
                fov += event.deltaY * 0.01;

                // Limitar el rango del campo de visión
                fov = Math.max(5, Math.min(15, fov));

                // Actualizar la cámara con el nuevo campo de visión
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }

            function onDocumentKeyDown(event) {
                // Cambiar el campo de visión basado en las teclas de flecha hacia arriba y hacia abajo
                switch (event.key) {
                    case 'ArrowLeft':
                        fov -= 1;
                        break;
                    case 'ArrowRight':
                        fov += 1;
                        break;
                }

                // Limitar el rango del campo de visión
                fov = Math.max(5, Math.min(15, fov));

                // Actualizar la cámara con el nuevo campo de visión
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        });
    }

    // ... (tu código existente) ...

    const tableContainer = document.getElementById('tableContainer');
    const tableContainer1 = document.getElementById('tableContainer1');

    // Crear un nuevo contenedor para la tabla responsiva
    const tableDiv = document.createElement('div');
    tableDiv.className = 'responsive-table'; // Puedes agregar estilos CSS según tus necesidades
    tableDiv.id = `canvasTable${tableDiv}`;
    document.body.appendChild(tableDiv);
    tableDiv.style.width = `250px`;
    tableDiv.style.height = `240px`; // Ajuste de la altura para dar espacio a los botones
    tableDiv.style.position = 'absolute';
    tableDiv.style.left = '450px';
    if ((canvasCount - 5) % 4 == 0 && canvasCount >= 5) {
        tableDiv.style.top = `${(325 + bandera_table1) + (canvasCount-1) * 230}px`;
        bandera_table1 += 200;
    }else if((canvasCount - 5) % 4 != 0 && canvasCount > 5){
        tableDiv.style.top = `${(125 + bandera_table1) + (canvasCount-1) * 230}px`;
    }else{
        tableDiv.style.top = `${125 + (canvasCount-1) * 230}px`;
    }    
    //tableDiv.style.top = `${125 + (canvasCount-1) * 230}px`;
    tableDiv.style.display = 'flex';
    tableDiv.style.flexDirection = 'column'; // Cambio a dirección de columna
    tableDiv.style.alignItems = 'center';
    tableDiv.style.justifyContent = 'center';

        // Crear un nuevo contenedor para la tabla responsiva
        const tableDiv1 = document.createElement('div');
        tableDiv1.className = 'responsive-table'; // Puedes agregar estilos CSS según tus necesidades
        tableDiv1.id = `canvasTable${tableDiv1}`;
        document.body.appendChild(tableDiv1);
        tableDiv1.style.width = `350px`;
        tableDiv1.style.height = `240px`; // Ajuste de la altura para dar espacio a los botones
        tableDiv1.style.position = 'absolute';
        tableDiv1.style.left = '950px';
        if ((canvasCount - 5) % 4 == 0 && canvasCount >= 5) {
            tableDiv1.style.top = `${(300 + bandera_table2) + (canvasCount-1) * 230}px`;
            bandera_table2 += 200;
        }else if((canvasCount - 5) % 4 != 0 && canvasCount > 5){
            tableDiv1.style.top = `${(100 + bandera_table2) + (canvasCount-1) * 230}px`;
        }else{
            tableDiv1.style.top = `${100 + (canvasCount-1) * 230}px`;
        }  
        //tableDiv1.style.top = `${100 + (canvasCount-1) * 230}px`;
        tableDiv1.style.display = 'flex';
        tableDiv1.style.flexDirection = 'column'; // Cambio a dirección de columna
        tableDiv1.style.alignItems = 'center';
        tableDiv1.style.justifyContent = 'center';

    // Crear la tabla
    const table = document.createElement('table');
    table.className = 'table'; // Puedes agregar estilos CSS según tus necesidades

        // Agregar el texto "Inventario" antes de la tabla
        const inventoryText = document.createElement('p');
        inventoryText.textContent = 'INVENTARIO';
        inventoryText.style.fontWeight = 'bold'; // Puedes ajustar el estilo según tus necesidades
        inventoryText.style.fontFamily = 'Roboto', 'sans-serif';
        tableDiv1.appendChild(inventoryText);

        const table1 = document.createElement('table');
        table.className = 'table1'; // Puedes agregar estilos CSS según tus necesidades

    // Crear la primera fila (encabezados)
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const fabricadoHeader = document.createElement('th');
    fabricadoHeader.textContent = 'FABRICADO';
    fabricadoHeader.style.fontFamily = 'Roboto', 'sans-serif';
    const embarcadoHeader = document.createElement('th');
    embarcadoHeader.textContent = 'EMBARCADO';
    embarcadoHeader.style.fontFamily = 'Roboto', 'sans-serif';


    
        // Crear la primera fila (encabezados)
        const thead1 = document.createElement('thead');
        const headerRow1 = document.createElement('tr');
        const fabricadoHeader1 = document.createElement('th');
        fabricadoHeader1.textContent = 'PINTADO';
        fabricadoHeader1.style.fontFamily = 'Roboto', 'sans-serif';
        const embarcadoHeader1 = document.createElement('th');
        embarcadoHeader1.textContent = 'POR PINTAR';
        embarcadoHeader1.style.fontFamily = 'Roboto', 'sans-serif';
    

    headerRow.appendChild(fabricadoHeader);
    headerRow.appendChild(embarcadoHeader);
    thead.appendChild(headerRow);

        headerRow1.appendChild(fabricadoHeader1);
        headerRow1.appendChild(embarcadoHeader1);
        thead1.appendChild(headerRow1);

    // Crear la segunda fila (datos)
    const tbody = document.createElement('tbody');
    const dataRow = document.createElement('tr');
    const fabricadoData = document.createElement('td');
    fabricadoData.textContent = '0'; // Puedes inicializarlo con el valor que desees
    const embarcadoData = document.createElement('td');
    embarcadoData.textContent = '0'; // Puedes inicializarlo con el valor que desees

        // Crear la segunda fila (datos)
        const tbody1 = document.createElement('tbody');
        const dataRow1 = document.createElement('tr');
        const fabricadoData1 = document.createElement('td');
        fabricadoData1.textContent = '0'; // Puedes inicializarlo con el valor que desees
        const embarcadoData1 = document.createElement('td');
        embarcadoData1.textContent = '0'; // Puedes inicializarlo con el valor que desees

    dataRow.appendChild(fabricadoData);
    dataRow.appendChild(embarcadoData);
    tbody.appendChild(dataRow);

        dataRow1.appendChild(fabricadoData1);
        dataRow1.appendChild(embarcadoData1);
        tbody1.appendChild(dataRow1);

    // Agregar la tabla al contenedor
    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    tableContainer.appendChild(tableDiv);

        // Agregar la tabla al contenedor
        table1.appendChild(thead1);
        table1.appendChild(tbody1);
        tableDiv1.appendChild(table1);
        tableContainer1.appendChild(tableDiv1);

    // Agregar botones de actualizar y guardar
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    tableDiv.appendChild(buttonContainer);

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Actualizar';
    updateButton.addEventListener('click', updateData);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.addEventListener('click', saveData);

    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(saveButton);

        // Agregar botones de actualizar y guardar
        const buttonContainer1 = document.createElement('div');
        buttonContainer1.style.display = 'flex';
        buttonContainer1.style.justifyContent = 'center';
        tableDiv1.appendChild(buttonContainer1);
    
        const updateButton1 = document.createElement('button');
        updateButton1.textContent = 'Actualizar';
        updateButton1.addEventListener('click', updateData1);
    
        const saveButton1 = document.createElement('button');
        saveButton1.textContent = 'Guardar';
        saveButton1.addEventListener('click', saveData1);
    
        buttonContainer1.appendChild(updateButton1);
        buttonContainer1.appendChild(saveButton1);

    function updateData() {
        // Permitir la edición de datos
        fabricadoData.contentEditable = true;
        embarcadoData.contentEditable = true;
    }

    // Función para guardar datos
    function saveData() {
        // Deshabilitar la edición de datos
        fabricadoData.contentEditable = false;
        embarcadoData.contentEditable = false;

        // Obtener los nuevos valores editados
        const nuevoFabricado = fabricadoData.textContent;
        const nuevoEmbarcado = embarcadoData.textContent;

        // Validar que los valores sean numéricos antes de actualizar la tabla
        if (!isNaN(nuevoFabricado) && !isNaN(nuevoEmbarcado)) {
            // Actualizar los datos en la tabla
            fabricadoData.textContent = nuevoFabricado;
            embarcadoData.textContent = nuevoEmbarcado;
        } else {
            alert('Por favor, ingresa valores numéricos válidos.');
        }
    }

    function updateData1() {
        // Permitir la edición de datos
        fabricadoData1.contentEditable = true;
        embarcadoData1.contentEditable = true;
    }

    // Función para guardar datos
    function saveData1() {
        // Deshabilitar la edición de datos
        fabricadoData1.contentEditable = false;
        embarcadoData1.contentEditable = false;

        // Obtener los nuevos valores editados
        const nuevoFabricado1 = fabricadoData1.textContent;
        const nuevoEmbarcado1 = embarcadoData1.textContent;

        // Validar que los valores sean numéricos antes de actualizar la tabla
        if (!isNaN(nuevoFabricado1) && !isNaN(nuevoEmbarcado1)) {
            // Actualizar los datos en la tabla
            fabricadoData1.textContent = nuevoFabricado1;
            embarcadoData1.textContent = nuevoEmbarcado1;
        } else {
            alert('Por favor, ingresa valores numéricos válidos.');
        }
    }

    // ... (tu código existente) ...

};

